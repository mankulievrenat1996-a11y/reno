# Inlines css/styles.css and js/main.js into every .html file so the site
# opens by double-click without depending on sibling files.
# Sources stay in css/ and js/ - edit them, then run this script.
$root = Split-Path -Parent $PSScriptRoot
$css = [System.IO.File]::ReadAllText((Join-Path $root 'css\styles.css'))
$js  = [System.IO.File]::ReadAllText((Join-Path $root 'js\main.js'))

$cssBlock = "<!--CSS--><style>`n$css`n</style><!--/CSS-->"
$jsBlock  = "<!--JS--><script>`n$js`n</script><!--/JS-->"

$cssPattern = '(?s)<!--CSS-->.*?<!--/CSS-->|<link rel="stylesheet" href="css/styles\.css">'
$jsPattern  = '(?s)<!--JS-->.*?<!--/JS-->|<script src="js/main\.js"></script>'

$utf8 = New-Object System.Text.UTF8Encoding($false)

Get-ChildItem -Path $root -Filter *.html | ForEach-Object {
  $h = [System.IO.File]::ReadAllText($_.FullName)
  $h = [regex]::Replace($h, $cssPattern, { $cssBlock })
  $h = [regex]::Replace($h, $jsPattern,  { $jsBlock })
  [System.IO.File]::WriteAllText($_.FullName, $h, $utf8)
  Write-Host "inlined: $($_.Name)"
}
Write-Host "Done. All pages are now self-contained."
