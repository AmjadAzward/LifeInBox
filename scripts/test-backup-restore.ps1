[CmdletBinding()]
param([string]$Remote = 'lifeinbox-backup:backups', [switch]$KeepFiles)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$testRoot = Join-Path $projectRoot '.restore-tests'
$pgRestore = Get-Command 'pg_restore.exe' -ErrorAction SilentlyContinue
if (-not $pgRestore) {
  $default = 'C:\Program Files\PostgreSQL\17\bin\pg_restore.exe'
  if (Test-Path -LiteralPath $default) { $pgRestore = Get-Item -LiteralPath $default }
  else { throw "Required command 'pg_restore.exe' was not found." }
}
if (-not (Get-Command 'rclone' -ErrorAction SilentlyContinue)) { throw "Required command 'rclone' was not found." }

$backupNames = @(& rclone lsf $Remote --dirs-only)
if ($LASTEXITCODE -ne 0 -or $backupNames.Count -eq 0) { throw 'No encrypted remote backups were found.' }
$latest = ($backupNames | ForEach-Object { $_.TrimEnd('/') } | Where-Object { $_ } | Sort-Object | Select-Object -Last 1)
$restoreDirectory = Join-Path $testRoot $latest
New-Item -ItemType Directory -Path $restoreDirectory -Force | Out-Null

Write-Host "Downloading and decrypting backup $latest..."
& rclone copy "$Remote/$latest" $restoreDirectory --size-only
if ($LASTEXITCODE -ne 0) { throw 'Unable to download the encrypted backup.' }

$manifestPath = Join-Path $restoreDirectory 'manifest.sha256'
$dumpPath = Join-Path $restoreDirectory 'database.dump'
if (-not (Test-Path -LiteralPath $manifestPath) -or -not (Test-Path -LiteralPath $dumpPath)) { throw 'The backup is missing its manifest or database dump.' }

$verified = 0
foreach ($line in Get-Content -LiteralPath $manifestPath) {
  if ($line -notmatch '^([a-fA-F0-9]{64})\s{2}(.+)$') { continue }
  $expected = $matches[1].ToLowerInvariant()
  $relative = $matches[2].Replace('/', [IO.Path]::DirectorySeparatorChar)
  $filePath = [IO.Path]::GetFullPath((Join-Path $restoreDirectory $relative))
  $safeRoot = [IO.Path]::GetFullPath($restoreDirectory) + [IO.Path]::DirectorySeparatorChar
  if (-not $filePath.StartsWith($safeRoot, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath)) { throw "Manifest file missing or unsafe: $relative" }
  $actual = (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $expected) { throw "Integrity verification failed: $relative" }
  $verified++
}
if ($verified -eq 0) { throw 'The backup manifest contained no verifiable files.' }

& $pgRestore.FullName --list $dumpPath | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'The PostgreSQL archive is not readable by pg_restore.' }
Write-Host "Restore test passed for $latest: $verified file(s) verified and database archive readable."

if (-not $KeepFiles) {
  Remove-Item -LiteralPath $restoreDirectory -Recurse -Force
  Write-Host 'Removed temporary restored files after successful verification.'
}
