$ErrorActionPreference = 'Stop'
$environmentFile = Join-Path $PSScriptRoot '..\.env.local'
if (-not (Test-Path $environmentFile)) { throw '.env.local was not found.' }
$values = @{}
Get-Content $environmentFile | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { $values[$matches[1].Trim()] = $matches[2].Trim().Trim('"') } }
if (-not $values.CRON_SECRET) { throw 'CRON_SECRET is missing from .env.local.' }
$baseUrl = if ($values.NEXT_PUBLIC_APP_URL) { $values.NEXT_PUBLIC_APP_URL.TrimEnd('/') } else { 'http://localhost:3000' }
Invoke-RestMethod -Method Post -Uri "$baseUrl/api/cron/calendar-sync" -Headers @{ Authorization = "Bearer $($values.CRON_SECRET)" } | Out-Null
Write-Host 'Google Calendar background synchronization completed.'
