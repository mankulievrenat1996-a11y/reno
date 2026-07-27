# Deploys the site to the Timeweb VPS over SSH (no GitHub, no S3 - the
# site is served straight from the VPS by nginx). Runs locally, triggered
# automatically by the git pre-push hook, or by hand any time with:
#   powershell -File .claude\deploy-timeweb.ps1
#
# Connection settings live outside this repo, in a plain file at
# %USERPROFILE%\.rpd-deploy\timeweb.env (never committed), with three lines:
#   DEPLOY_HOST=...
#   DEPLOY_USER=...
#   DEPLOY_REMOTE_PATH=...
# Auth is a dedicated SSH key at %USERPROFILE%\.ssh\id_ed25519_rpd_deploy
# (public half authorized on the server, private half never leaves this
# machine, no password involved).

$root = Split-Path -Parent $PSScriptRoot
$sshKey = Join-Path $env:USERPROFILE '.ssh\id_ed25519_rpd_deploy'
$configFile = Join-Path $env:USERPROFILE '.rpd-deploy\timeweb.env'

if (-not (Test-Path $sshKey)) {
  Write-Host "Timeweb deploy skipped: SSH key not found at $sshKey"
  exit 0
}
if (-not (Test-Path $configFile)) {
  Write-Host "Timeweb deploy skipped: config not found at $configFile"
  exit 0
}

Get-Content $configFile | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
    Set-Variable -Name $matches[1] -Value $matches[2]
  }
}

if (-not $DEPLOY_HOST -or -not $DEPLOY_USER -or -not $DEPLOY_REMOTE_PATH) {
  Write-Host "Timeweb deploy skipped: incomplete config in $configFile"
  exit 0
}

$sshTarget = "$DEPLOY_USER@$DEPLOY_HOST"
$remoteLive = $DEPLOY_REMOTE_PATH
$remoteNew = "$DEPLOY_REMOTE_PATH`_new"
$remoteOld = "$DEPLOY_REMOTE_PATH`_old"

$localArchive = Join-Path $env:TEMP 'rpd-deploy.tar.gz'
$remoteArchive = '/tmp/rpd-deploy.tar.gz'

Push-Location $root
try {
  if (Test-Path $localArchive) { Remove-Item $localArchive -Force }
  tar czf $localArchive --exclude=".git" --exclude=".claude" --exclude=".superpowers" --exclude=".github" --exclude="docs" --exclude="_site" --exclude="*.md" --exclude=".gitignore" .
  if ($LASTEXITCODE -ne 0) { Write-Host "Timeweb deploy: FAILED (tar failed)."; exit 0 }

  scp -i $sshKey -o BatchMode=yes $localArchive "${sshTarget}:${remoteArchive}"
  if ($LASTEXITCODE -ne 0) { Write-Host "Timeweb deploy: FAILED (upload failed)."; exit 0 }

  ssh -i $sshKey -o BatchMode=yes $sshTarget "rm -rf $remoteNew && mkdir -p $remoteNew && tar xzf $remoteArchive -C $remoteNew && rm -f $remoteArchive && find $remoteNew -type d -exec chmod 755 {} + && find $remoteNew -type f -exec chmod 644 {} + && rm -rf $remoteOld && mv $remoteLive $remoteOld && mv $remoteNew $remoteLive && rm -rf $remoteOld && chown -R www-data:www-data $remoteLive"
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Timeweb deploy: done."
  } else {
    Write-Host "Timeweb deploy: FAILED (remote extract/swap failed)."
  }
} finally {
  if (Test-Path $localArchive) { Remove-Item $localArchive -Force }
  Pop-Location
}
