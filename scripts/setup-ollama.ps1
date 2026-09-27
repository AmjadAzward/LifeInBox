$ErrorActionPreference = 'Stop'
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  winget install --exact --id Ollama.Ollama --accept-package-agreements --accept-source-agreements
  $machinePath = [Environment]::GetEnvironmentVariable('Path','Machine')
  $userPath = [Environment]::GetEnvironmentVariable('Path','User')
  $env:Path = "$machinePath;$userPath"
}
ollama pull qwen2.5:0.5b
$environmentFile = Join-Path $PSScriptRoot '..\.env.local'
$lines = [Collections.Generic.List[string]](Get-Content $environmentFile)
foreach ($entry in @{'OLLAMA_BASE_URL'='http://127.0.0.1:11434';'OLLAMA_MODEL'='qwen2.5:0.5b'}.GetEnumerator()) {
  $found = $false
  for ($index = 0; $index -lt $lines.Count; $index++) {
    if ($lines[$index] -match "^$($entry.Key)=") { $lines[$index] = "$($entry.Key)=$($entry.Value)"; $found = $true; break }
  }
  if (-not $found) { $lines.Add("$($entry.Key)=$($entry.Value)") }
}
[IO.File]::WriteAllLines($environmentFile,$lines,[Text.UTF8Encoding]::new($false))
Write-Host 'Ollama and qwen2.5:0.5b are configured for free local extraction.'
