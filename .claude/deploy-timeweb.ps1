# Syncs the site to the Timeweb Cloud S3 bucket. Runs locally (no GitHub
# involved) - triggered automatically by the git pre-push hook, or run by
# hand any time with: powershell -File .claude\deploy-timeweb.ps1
#
# Credentials come from .claude\timeweb.env (gitignored, never committed).
# That file must define three lines:
#   AWS_ACCESS_KEY_ID=...
#   AWS_SECRET_ACCESS_KEY=...
#   TIMEWEB_S3_BUCKET=...

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $PSScriptRoot 'timeweb.env'

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
      [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
  }
}

if (-not $env:AWS_ACCESS_KEY_ID -or -not $env:AWS_SECRET_ACCESS_KEY -or -not $env:TIMEWEB_S3_BUCKET) {
  Write-Host "Timeweb deploy skipped: missing credentials."
  Write-Host "Create .claude\timeweb.env with AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, TIMEWEB_S3_BUCKET."
  exit 0
}

$env:AWS_DEFAULT_REGION = 'ru-1'
$bucket = $env:TIMEWEB_S3_BUCKET

Push-Location $root
try {
  py -m awscli --endpoint-url https://s3.twcstorage.ru s3 sync . "s3://$bucket" `
    --delete `
    --exclude ".git/*" `
    --exclude ".claude/*" `
    --exclude ".superpowers/*" `
    --exclude "docs/*" `
    --exclude "_site/*" `
    --exclude "*.md"

  if ($LASTEXITCODE -eq 0) {
    Write-Host "Timeweb deploy: done."
  } else {
    Write-Host "Timeweb deploy: FAILED (exit code $LASTEXITCODE)."
  }
} finally {
  Pop-Location
}
