# PSXPlace scraper - Windows background runner.
# Runs the Camoufox scraper on a real desktop (hardware WebGL + residential IP +
# genuine TLS stack), which passes Cloudflare where the headless NUC container
# could not. Triggered at logon by a hidden Scheduled Task (see register-task.ps1).
#
# What it does: sync a DEDICATED clone to origin/master, run the scraper, and if
# it found new patches (pr_body.txt), regenerate the README and push to master -
# mirroring the old GitHub Actions commit step. Once-per-day guard so multiple
# logons in a day don't re-scrape. All output is appended to a log file.
#
# Usage: run-scrape.ps1 -RepoPath C:\psxplace-scraper
param(
  [string]$RepoPath = "$env:USERPROFILE\psxplace-scraper",
  [switch]$Force  # ignore the once-per-day guard
)

$ErrorActionPreference = 'Stop'
$log = Join-Path $RepoPath 'scrape.log'

function Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
  Write-Output $line
  try { Add-Content -Path $log -Value $line -Encoding utf8 } catch {}
}

try {
  if (-not (Test-Path $RepoPath)) { throw "Repo not found at $RepoPath - clone it there first (see README)." }
  Set-Location $RepoPath

  # Once-per-day guard: skip if the last successful run was already today.
  $stamp = Join-Path $RepoPath '.last-scrape-date'
  $today = Get-Date -Format 'yyyy-MM-dd'
  if (-not $Force -and (Test-Path $stamp) -and ((Get-Content $stamp -Raw).Trim() -eq $today)) {
    Log "Already scraped today ($today) - skipping. Use -Force to override."
    return
  }

  Log "=== scrape start ==="

  # Sync the dedicated clone to the latest master (discard any local drift so the
  # scraper always prepends onto current data and the push fast-forwards cleanly).
  git fetch origin master 2>&1 | Out-Null
  git checkout master 2>&1 | Out-Null
  git reset --hard origin/master 2>&1 | Out-Null
  Log "synced to origin/master @ $(git rev-parse --short HEAD)"

  # Ensure deps + the Camoufox browser are present (no-op once installed).
  if (-not (Test-Path (Join-Path $RepoPath 'node_modules\camoufox'))) {
    Log "installing npm deps..."; npm ci --no-audit --no-fund 2>&1 | Out-Null
  }
  npx camoufox fetch 2>&1 | Out-Null

  # Run the scraper. On Windows it uses headless:true (real GPU) - the mode that
  # clears Cloudflare. Non-zero exit = CF block / empty / crash; we log and stop.
  Log "running scraper..."
  node scripts/check_psxplace.js 2>&1 | ForEach-Object { Log "  $_" }
  if ($LASTEXITCODE -ne 0) { throw "scraper exited $LASTEXITCODE (CF block / empty / crash) - nothing committed." }

  if (-not (Test-Path (Join-Path $RepoPath 'pr_body.txt'))) {
    Log "no new patches - nothing to commit."
    Set-Content -Path $stamp -Value $today -Encoding ascii
    Log "=== scrape done (no changes) ==="
    return
  }

  # New patches found -> regenerate README/badges and push to master.
  node scripts/update_readme.js 2>&1 | ForEach-Object { Log "  $_" }
  git add known_posts.json new_patches_raw/ "PSXPlace Confirmed/" USERLIST/ README.md banner.svg 2>$null
  $staged = git diff --cached --name-only
  if (-not $staged) { Log "nothing staged after scrape."; Set-Content -Path $stamp -Value $today -Encoding ascii; return }

  git commit -m "[Auto] PSXPlace new patches $today" 2>&1 | Out-Null
  git push origin master 2>&1 | ForEach-Object { Log "  $_" }
  Set-Content -Path $stamp -Value $today -Encoding ascii
  Log "=== pushed new patches to master ==="
}
catch {
  Log "ERROR: $($_.Exception.Message)"
  exit 1
}
