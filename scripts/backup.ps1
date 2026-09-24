[CmdletBinding()]
param([string]$Remote = 'lifeinbox-backup:backups', [switch]$KeepLocal)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.local'
$backupRoot = Join-Path $projectRoot '.backups'
$stamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH-mm-ssZ')
$runDirectory = Join-Path $backupRoot $stamp
$storageDirectory = Join-Path $runDirectory 'storage\documents'

function Read-DotEnv([string]$Path) {
  $values = @{}
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
      $value = $matches[2].Trim()
      if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) { $value = $value.Substring(1, $value.Length - 2) }
      $values[$matches[1]] = $value
    }
  }
  return $values
}

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { throw "Required command '$Name' was not found." }
}

function Encode-StoragePath([string]$Path) {
  return (($Path -split '/') | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/'
}

if (-not (Test-Path -LiteralPath $envFile)) { throw '.env.local was not found.' }
$settings = Read-DotEnv $envFile
$supabaseUrl = $settings['NEXT_PUBLIC_SUPABASE_URL'].TrimEnd('/')
$serviceKey = $settings['SUPABASE_SERVICE_ROLE_KEY']
if (-not $supabaseUrl -or -not $serviceKey) { throw 'Supabase URL or service-role key is missing from .env.local.' }

Assert-Command 'npx.cmd'
Assert-Command 'rclone'
New-Item -ItemType Directory -Path $storageDirectory -Force | Out-Null

Write-Host "Creating database backup $stamp..."
Push-Location $projectRoot
try {
  & npx.cmd supabase db dump --linked --file (Join-Path $runDirectory 'roles.sql') --role-only
  if ($LASTEXITCODE -ne 0) { throw 'Role dump failed.' }
  & npx.cmd supabase db dump --linked --file (Join-Path $runDirectory 'schema.sql')
  if ($LASTEXITCODE -ne 0) { throw 'Schema dump failed.' }
  & npx.cmd supabase db dump --linked --file (Join-Path $runDirectory 'data.sql') --data-only --use-copy
  if ($LASTEXITCODE -ne 0) { throw 'Data dump failed.' }
} finally { Pop-Location }

$headers = @{ Authorization = "Bearer $serviceKey"; apikey = $serviceKey }
function Backup-StoragePrefix([string]$Prefix) {
  $offset = 0
  do {
    $body = @{ prefix = $Prefix; limit = 100; offset = $offset; sortBy = @{ column = 'name'; order = 'asc' } } | ConvertTo-Json -Depth 4
    $entries = @(Invoke-RestMethod -Method Post -Uri "$supabaseUrl/storage/v1/object/list/documents" -Headers $headers -ContentType 'application/json' -Body $body)
    foreach ($entry in $entries) {
      $objectPath = if ($Prefix) { "$Prefix/$($entry.name)" } else { $entry.name }
      if ($null -eq $entry.id) { Backup-StoragePrefix $objectPath; continue }
      $relativePath = $objectPath.Replace('/', [IO.Path]::DirectorySeparatorChar)
      $destination = [IO.Path]::GetFullPath((Join-Path $storageDirectory $relativePath))
      $safeRoot = [IO.Path]::GetFullPath($storageDirectory) + [IO.Path]::DirectorySeparatorChar
      if (-not $destination.StartsWith($safeRoot, [StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe storage path rejected: $objectPath" }
      New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
      Invoke-WebRequest -Uri "$supabaseUrl/storage/v1/object/authenticated/documents/$(Encode-StoragePath $objectPath)" -Headers $headers -OutFile $destination
    }
    $offset += $entries.Count
  } while ($entries.Count -eq 100)
}

Write-Host 'Downloading private Storage objects...'
Backup-StoragePrefix ''
$manifestPath = Join-Path $runDirectory 'manifest.sha256'
Get-ChildItem -LiteralPath $runDirectory -File -Recurse | Where-Object FullName -ne $manifestPath | ForEach-Object {
  $relative = $_.FullName.Substring($runDirectory.Length).TrimStart([char[]]'\/').Replace('\', '/')
  $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $relative"
} | Set-Content -LiteralPath $manifestPath -Encoding utf8

$destinationRemote = "$Remote/$stamp"
Write-Host "Uploading encrypted backup to $destinationRemote..."
& rclone copy $runDirectory $destinationRemote --checksum --create-empty-src-dirs
if ($LASTEXITCODE -ne 0) { throw 'Encrypted upload failed; the local backup has been retained.' }
& rclone check $runDirectory $destinationRemote --one-way --size-only
if ($LASTEXITCODE -ne 0) { throw 'Backup verification failed; the local backup has been retained.' }
Write-Host "Backup uploaded and verified: $destinationRemote"
if (-not $KeepLocal) {
  Remove-Item -LiteralPath $runDirectory -Recurse -Force
  Write-Host 'Removed the temporary local backup after successful verification.'
}
