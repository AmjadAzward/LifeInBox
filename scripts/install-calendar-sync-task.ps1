$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'run-calendar-sync.ps1'
$action = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$script`""
schtasks.exe /Create /TN 'LifeInbox Google Calendar Sync' /TR $action /SC HOURLY /MO 1 /F | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Unable to create the calendar synchronization task.' }
Write-Host 'Installed hourly task: LifeInbox Google Calendar Sync'
