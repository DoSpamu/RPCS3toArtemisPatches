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

# IMPORTANT: 'Continue', not 'Stop'. git/npm/node write normal progress to
# stderr; under 'Stop' PowerShell 5.1 turns each stderr line into a terminating
# error. We drive native tools explicitly and check $LASTEXITCODE instead.
$ErrorActionPreference = 'Continue'
$log = Join-Path $RepoPath 'scrape.log'

function Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
  Write-Output $line
  try { Add-Content -Path $log -Value $line -Encoding utf8 -ErrorAction SilentlyContinue } catch {}
}

# Run a native command, capture merged output, return exit code + text. Never
# throws on stderr; the caller decides based on .Code.
function Exec([string]$File, [string[]]$CmdArgs) {
  $out = & $File @CmdArgs 2>&1 | Out-String
  return [pscustomobject]@{ Code = $LASTEXITCODE; Out = $out.Trim() }
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
  $r = Exec git @('fetch','origin','master');            if ($r.Code) { throw "git fetch failed: $($r.Out)" }
  $r = Exec git @('checkout','master');                  if ($r.Code) { throw "git checkout failed: $($r.Out)" }
  $r = Exec git @('reset','--hard','origin/master');     if ($r.Code) { throw "git reset failed: $($r.Out)" }
  $head = (Exec git @('rev-parse','--short','HEAD')).Out
  Log "synced to origin/master @ $head"

  # Commit identity for this clone (fresh clones inherit none) - mirrors the old
  # GitHub Action's bot identity.
  (Exec git @('config','user.name','psxplace-scraper')) | Out-Null
  (Exec git @('config','user.email','psxplace-scraper@users.noreply.github.com')) | Out-Null

  # Ensure deps + the Camoufox browser are present (no-op once installed).
  if (-not (Test-Path (Join-Path $RepoPath 'node_modules\camoufox'))) {
    Log "installing npm deps..."; (Exec npm @('ci','--no-audit','--no-fund')) | Out-Null
  }
  (Exec npx @('camoufox','fetch')) | Out-Null

  # Run the scraper. On Windows it uses headless:true (real GPU) - the mode that
  # clears Cloudflare. Non-zero exit = CF block / empty / crash; log and stop.
  Log "running scraper..."
  $s = Exec node @('scripts/check_psxplace.js')
  foreach ($ln in ($s.Out -split "`r?`n")) { if ($ln.Trim()) { Log "  $ln" } }
  if ($s.Code -ne 0) { throw "scraper exited $($s.Code) (CF block / empty / crash) - nothing committed." }

  if (-not (Test-Path (Join-Path $RepoPath 'pr_body.txt'))) {
    Log "no new patches - nothing to commit."
    Set-Content -Path $stamp -Value $today -Encoding ascii
    Log "=== scrape done (no changes) ==="
    return
  }

  # New patches found -> regenerate README/badges and push to master.
  (Exec node @('scripts/update_readme.js')) | Out-Null
  (Exec git @('add','known_posts.json','new_patches_raw/','PSXPlace Confirmed/','USERLIST/','README.md','banner.svg')) | Out-Null
  $staged = (Exec git @('diff','--cached','--name-only')).Out
  if (-not $staged) { Log "nothing staged after scrape."; Set-Content -Path $stamp -Value $today -Encoding ascii; return }

  $r = Exec git @('commit','-m',"[Auto] PSXPlace new patches $today"); if ($r.Code) { throw "git commit failed: $($r.Out)" }
  $r = Exec git @('push','origin','master')
  Log ("push: " + ($r.Out -replace "`r?`n"," | "))
  if ($r.Code) { throw "git push failed (check credentials): $($r.Out)" }
  Set-Content -Path $stamp -Value $today -Encoding ascii
  Log "=== pushed new patches to master ==="
}
catch {
  Log "ERROR: $($_.Exception.Message)"
  exit 1
}
