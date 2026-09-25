$ErrorActionPreference = 'Stop'
$environmentFile = Join-Path $PSScriptRoot '..\.env.local'
if (-not (Test-Path $environmentFile)) { throw '.env.local was not found.' }
$lines = [Collections.Generic.List[string]](Get-Content $environmentFile)
$hasSecret = $false
for ($index = 0; $index -lt $lines.Count; $index++) {
  if ($lines[$index] -match '^CRON_SECRET=(.+)$') { $hasSecret = -not [string]::IsNullOrWhiteSpace($matches[1]); break }
}
if (-not $hasSecret) {
  $bytes = New-Object byte[] 32
  $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
  $secret = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
  $replaced = $false
  for ($index = 0; $index -lt $lines.Count; $index++) {
    if ($lines[$index] -match '^CRON_SECRET=') { $lines[$index] = "CRON_SECRET=$secret"; $replaced = $true; break }
  }
  if (-not $replaced) { $lines.Add("CRON_SECRET=$secret") }
  [IO.File]::WriteAllLines($environmentFile,$lines,[Text.UTF8Encoding]::new($false))
  Write-Host 'Generated CRON_SECRET in .env.local (value intentionally hidden).'
}
& (Join-Path $PSScriptRoot 'install-calendar-sync-task.ps1')
Write-Host 'Restart the LifeInbox server once so it loads the new CRON_SECRET.'
