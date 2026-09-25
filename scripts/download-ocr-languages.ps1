$ErrorActionPreference = 'Stop'
$destination = Join-Path $PSScriptRoot '..\tessdata'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$base = 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main'
foreach ($language in @('eng', 'sin', 'tam')) {
  $target = Join-Path $destination "$language.traineddata"
  Invoke-WebRequest -Uri "$base/$language.traineddata" -OutFile $target
  Write-Host "Installed OCR language: $language"
}
Write-Host "OCR data is ready in $destination"
