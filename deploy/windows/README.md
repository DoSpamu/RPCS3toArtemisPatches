# PSXPlace scraper — Windows background runner

Runs the monitor on a real Windows desktop instead of the headless NUC container.
A real desktop presents Cloudflare with hardware WebGL, a genuine OS TLS
fingerprint and a residential IP, so it clears the Turnstile challenge that a
headless Linux container cannot (see `../nuc-runner/README.md` and the project
memory for the full diagnosis). The scraper runs hidden in the background a
couple of minutes after you log in, at most once per day, and pushes any new
patches straight to `master` — the same commit step the old GitHub Action did.

## Prerequisites

- **Node.js 22+** and **git** on PATH.
- **Git push auth to this repo** working non-interactively. Easiest: sign in once
  with Git Credential Manager (`git push` from the clone and complete the browser
  prompt) so the credential is cached, or use a PAT in the remote URL.
- A **dedicated clone** (kept separate from any dev copy so it can hard-reset to
  master without touching your work):

  ```powershell
  git clone https://github.com/DoSpamu/RPCS3toArtemisPatches.git C:\psxplace-scraper
  cd C:\psxplace-scraper
  npm ci
  npx camoufox fetch      # downloads the Camoufox browser (~200 MB, one-time)
  ```

## Install the scheduled task

From the clone, run once (no admin needed — it's a per-user logon task):

```powershell
cd C:\psxplace-scraper
.\deploy\windows\register-task.ps1 -RepoPath C:\psxplace-scraper
```

That registers a **hidden** task `PSXPlaceScrape` triggered **at logon** (2 min
delay for the network to come up). It runs whenever you log into your profile.

## Verify it works

```powershell
Start-ScheduledTask -TaskName PSXPlaceScrape      # run it now
Get-Content C:\psxplace-scraper\scrape.log -Wait  # watch progress
```

A healthy run logs `synced to origin/master`, `running scraper…`, then either
`no new patches` or `pushed new patches to master`.

## Behaviour notes

- **Once per day:** a `.last-scrape-date` marker skips re-runs on the same day.
  Force an extra run with `run-scrape.ps1 -RepoPath C:\psxplace-scraper -Force`.
- **Self-healing data:** the run hard-resets the clone to `origin/master` before
  scraping, so it always works against current data and pushes fast-forward.
- **Failures are quiet:** a Cloudflare block / empty scrape / crash is logged and
  nothing is committed (never pushes partial/garbage data).

## Manage / remove

```powershell
Get-ScheduledTask -TaskName PSXPlaceScrape                       # status
Unregister-ScheduledTask -TaskName PSXPlaceScrape -Confirm:$false # remove
```

The GitHub Actions workflow (`.github/workflows/check-psxplace.yml`) is now
superseded by this task for the daily run; `workflow_dispatch` is still there for
manual/GitHub-hosted attempts.
