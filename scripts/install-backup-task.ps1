[CmdletBinding()]
param([string]$Time = '02:00')

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backupScript = Join-Path $PSScriptRoot 'backup.ps1'
if (-not (Test-Path -LiteralPath $backupScript)) { throw 'backup.ps1 was not found.' }
if ($Time -notmatch '^(?:[01]\d|2[0-3]):[0-5]\d$') { throw 'Time must use 24-hour HH:mm format.' }

$taskName = 'LifeInbox Encrypted Backup'
$action = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$backupScript`""
& schtasks.exe /Create /TN $taskName /TR $action /SC DAILY /ST $Time /F
if ($LASTEXITCODE -ne 0) { throw 'Unable to create the Windows scheduled task. Try running PowerShell as Administrator.' }
Write-Host "Scheduled '$taskName' every day at $Time. The user must be signed in and the computer must be awake."
