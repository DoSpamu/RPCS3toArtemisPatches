# Registers a Scheduled Task that runs the PSXPlace scraper hidden in the
# background shortly after you log in. Run this ONCE (normal user, no admin
# needed for a per-user logon task). Re-run to update the task.
#
# Usage:  .\register-task.ps1 -RepoPath C:\psxplace-scraper
param(
  [string]$RepoPath = "$env:USERPROFILE\psxplace-scraper",
  [string]$TaskName = "PSXPlaceScrape",
  [int]$DelayMinutes = 2   # wait after logon so the network/VPN is up
)

$ErrorActionPreference = 'Stop'
$script = Join-Path $RepoPath 'deploy\windows\run-scrape.ps1'
if (-not (Test-Path $script)) { throw "run-scrape.ps1 not found at $script — check -RepoPath." }

# -WindowStyle Hidden + -NonInteractive = no visible console; the task itself is
# also set to run hidden. ExecutionPolicy Bypass so it runs regardless of policy.
$psArgs = "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`" -RepoPath `"$RepoPath`""
$action  = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $psArgs

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$trigger.Delay = "PT${DelayMinutes}M"   # ISO-8601 duration, e.g. PT2M

# Run only when this user is logged on (needs the desktop session for the real
# GPU/WebGL). Hidden, don't stop on battery, allow start on battery.
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
$settings  = New-ScheduledTaskSettingsSet -Hidden -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null

Write-Host "Registered scheduled task '$TaskName':"
Write-Host "  runs hidden $DelayMinutes min after you log on, from $RepoPath"
Write-Host "  test it now with:  Start-ScheduledTask -TaskName $TaskName"
Write-Host "  watch the log:     Get-Content '$RepoPath\scrape.log' -Wait"
Write-Host "  remove it later:   Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
