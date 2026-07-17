# Renames form field name-attributes to the Russian labels from labels.txt,
# so form submissions arrive with Russian column names.
# ASCII-only script; Russian text lives in labels.txt (read as UTF-8).
$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
$map = @{}
foreach ($line in [System.IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'labels.txt'), [System.Text.Encoding]::UTF8)) {
  if ($line -match '^(.*?)=(.*)$') { $map[$Matches[1]] = $Matches[2] }
}
Get-ChildItem -Path $root -Filter *.html | ForEach-Object {
  $h = [System.IO.File]::ReadAllText($_.FullName)
  foreach ($k in $map.Keys) {
    $h = $h.Replace('name="' + $k + '"', 'name="' + $map[$k] + '"')
  }
  [System.IO.File]::WriteAllText($_.FullName, $h, $utf8)
  Write-Host ("updated: " + $_.Name)
}
Write-Host "Done."
