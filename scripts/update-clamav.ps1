[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$databaseDirectory = Join-Path $projectRoot '.clamav\db'
$configPath = Join-Path $projectRoot '.clamav\freshclam.conf'
$freshclam = 'C:\Program Files\ClamAV\freshclam.exe'
if (-not (Test-Path -LiteralPath $freshclam)) { throw 'freshclam.exe was not found. Install Cisco.ClamAV first.' }
New-Item -ItemType Directory -Path $databaseDirectory -Force | Out-Null
[IO.File]::WriteAllLines($configPath, @(
  "DatabaseDirectory $databaseDirectory",
  'DatabaseMirror database.clamav.net',
  'Checks 12'
))
& $freshclam --config-file=$configPath --datadir=$databaseDirectory
if ($LASTEXITCODE -ne 0) { throw 'ClamAV definition update failed.' }
Write-Host "ClamAV definitions updated in $databaseDirectory"
