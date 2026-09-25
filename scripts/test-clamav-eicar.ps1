$ErrorActionPreference = 'Stop'
$scanner = 'C:\Program Files\ClamAV\clamscan.exe'
$database = Join-Path $PSScriptRoot '..\.clamav\db'
if (-not (Test-Path $scanner)) { throw 'ClamAV is not installed.' }
$temporary = Join-Path ([IO.Path]::GetTempPath()) ("lifeinbox-eicar-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $temporary | Out-Null
$sample = Join-Path $temporary 'eicar.com.txt'
try {
  # Build the harmless industry-standard antivirus test pattern at runtime.
  $part1 = 'X5O!P%@AP[4\PZX54(P^)7CC)7}'
  $part2 = '$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
  [IO.File]::WriteAllText($sample, $part1 + $part2, [Text.Encoding]::ASCII)
  & $scanner '--database' $database '--no-summary' $sample
  $code = $LASTEXITCODE
  if ($code -ne 1) { throw "Expected ClamAV detection exit code 1, received $code." }
  Write-Host 'PASS: ClamAV safely detected the EICAR antivirus test file.'
} finally {
  Remove-Item -LiteralPath $temporary -Recurse -Force -ErrorAction SilentlyContinue
}
