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

if (-not (Test-Path -LiteralPath $envFile)) { throw '.env.local was not found.' }
$settings = Read-DotEnv $envFile
$supabaseUrl = $settings['NEXT_PUBLIC_SUPABASE_URL'].TrimEnd('/')
$serviceKey = $settings['SUPABASE_SERVICE_ROLE_KEY']
$databaseUrl = $settings['SUPABASE_DB_URL']
if (-not $supabaseUrl -or -not $serviceKey -or -not $databaseUrl) { throw 'Supabase URL, service-role key, or SUPABASE_DB_URL is missing from .env.local.' }

Assert-Command 'node.exe'
$rcloneCommand = Get-Command 'rclone.exe' -ErrorAction SilentlyContinue
if (-not $rcloneCommand) {
  $wingetPackages = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
  $rcloneCommand = Get-ChildItem -LiteralPath $wingetPackages -Filter 'rclone.exe' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $rcloneCommand) { throw "Required command 'rclone.exe' was not found." }
}
$pgDumpCommand = Get-Command 'pg_dump.exe' -ErrorAction SilentlyContinue
if (-not $pgDumpCommand) {
  $defaultPgDump = 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe'
  if (Test-Path -LiteralPath $defaultPgDump) { $pgDumpCommand = Get-Item -LiteralPath $defaultPgDump }
  else { throw "Required command 'pg_dump.exe' was not found." }
}
New-Item -ItemType Directory -Path $storageDirectory -Force | Out-Null

Write-Host "Creating database backup $stamp..."
$dumpPath = Join-Path $runDirectory 'database.dump'
& $pgDumpCommand.FullName --dbname=$databaseUrl --file=$dumpPath --format=custom --compress=9 --no-owner --no-privileges
if ($LASTEXITCODE -ne 0) { throw 'Database dump failed.' }

Write-Host 'Downloading private Storage objects...'
$env:SUPABASE_BACKUP_URL = $supabaseUrl
$env:SUPABASE_BACKUP_SERVICE_KEY = $serviceKey
try {
  & node.exe (Join-Path $PSScriptRoot 'backup-storage.mjs') $storageDirectory
  if ($LASTEXITCODE -ne 0) { throw 'Private Storage backup failed.' }
} finally {
  Remove-Item Env:SUPABASE_BACKUP_URL -ErrorAction SilentlyContinue
  Remove-Item Env:SUPABASE_BACKUP_SERVICE_KEY -ErrorAction SilentlyContinue
}
$manifestPath = Join-Path $runDirectory 'manifest.sha256'
Get-ChildItem -LiteralPath $runDirectory -File -Recurse | Where-Object FullName -ne $manifestPath | ForEach-Object {
  $relative = $_.FullName.Substring($runDirectory.Length).TrimStart([char[]]'\/').Replace('\', '/')
  $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $relative"
} | Set-Content -LiteralPath $manifestPath -Encoding utf8

$destinationRemote = "$Remote/$stamp"
Write-Host "Uploading encrypted backup to $destinationRemote..."
& $rcloneCommand.FullName copy $runDirectory $destinationRemote --size-only --create-empty-src-dirs
if ($LASTEXITCODE -ne 0) { throw 'Encrypted upload failed; the local backup has been retained.' }
& $rcloneCommand.FullName check $runDirectory $destinationRemote --one-way --size-only
if ($LASTEXITCODE -ne 0) { throw 'Backup verification failed; the local backup has been retained.' }
Write-Host "Backup uploaded and verified: $destinationRemote"
if (-not $KeepLocal) {
  Remove-Item -LiteralPath $runDirectory -Recurse -Force
  Write-Host 'Removed the temporary local backup after successful verification.'
}
