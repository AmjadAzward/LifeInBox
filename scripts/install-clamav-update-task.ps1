[CmdletBinding()]
param([string]$Time='01:00')
$ErrorActionPreference='Stop'
if($Time -notmatch '^(?:[01]\d|2[0-3]):[0-5]\d$'){throw 'Time must use 24-hour HH:mm format.'}
$updateScript=Join-Path $PSScriptRoot 'update-clamav.ps1';if(-not(Test-Path -LiteralPath $updateScript)){throw 'update-clamav.ps1 was not found.'}
$taskName='LifeInbox ClamAV Definitions';$action="powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$updateScript`"";
& schtasks.exe /Create /TN $taskName /TR $action /SC DAILY /ST $Time /F
if($LASTEXITCODE -ne 0){throw 'Unable to create the ClamAV update task.'}
Write-Host "Scheduled '$taskName' every day at $Time."
