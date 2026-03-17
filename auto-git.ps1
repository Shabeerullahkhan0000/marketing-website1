$ErrorActionPreference = "Stop"

function Write-Info([string] $msg) {
  $ts = (Get-Date).ToString("HH:mm:ss")
  Write-Host "[$ts] $msg"
}

function Has-Tracked-Changes {
  # Only consider tracked file modifications/deletions (not new untracked files)
  $out = git status --porcelain --untracked-files=no 2>$null
  return -not [string]::IsNullOrWhiteSpace($out)
}

function Sync-If-Needed {
  if (-not (Has-Tracked-Changes)) { return }

  Write-Info "Changes detected. Staging tracked files…"
  git add -u

  if (-not (Has-Tracked-Changes)) { return }

  $msg = "auto: update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  Write-Info "Committing…"
  git commit -m $msg | Out-Null

  Write-Info "Pushing…"
  git push | Out-Null

  Write-Info "Done."
}

function Start-Watcher {
  $root = (Get-Location).Path
  Write-Info "Watching: $root"
  Write-Info "Auto-commit + push is ON (tracked changes only). Press Ctrl+C to stop."

  # If you already had edits before starting the watcher, sync them once.
  Sync-If-Needed

  $watcher = New-Object System.IO.FileSystemWatcher
  $watcher.Path = $root
  $watcher.IncludeSubdirectories = $true
  $watcher.Filter = "*.*"
  $watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, Size, DirectoryName'
  $watcher.EnableRaisingEvents = $true

  $script:lastEventAt = Get-Date
  $script:pending = $false
  $debounceMs = 900

  $handler = {
    param($sender, $eventArgs)

    # Ignore .git and common noisy folders
    if ($eventArgs.FullPath -match "\\\.git(\\|$)") { return }
    if ($eventArgs.FullPath -match "\\\\node_modules(\\|$)") { return }
    if ($eventArgs.FullPath -match "\\\\\.vercel(\\|$)") { return }

    $script:lastEventAt = Get-Date
    $script:pending = $true
  }

  $created = Register-ObjectEvent $watcher Created -Action $handler
  $changed = Register-ObjectEvent $watcher Changed -Action $handler
  $renamed = Register-ObjectEvent $watcher Renamed -Action $handler
  $deleted = Register-ObjectEvent $watcher Deleted -Action $handler

  try {
    while ($true) {
      Start-Sleep -Milliseconds 300
      if (-not $script:pending) { continue }

      $elapsed = (New-TimeSpan -Start $script:lastEventAt -End (Get-Date)).TotalMilliseconds
      if ($elapsed -lt $debounceMs) { continue }

      $script:pending = $false
      Sync-If-Needed
    }
  } finally {
    Unregister-Event -SourceIdentifier $created.Name -ErrorAction SilentlyContinue
    Unregister-Event -SourceIdentifier $changed.Name -ErrorAction SilentlyContinue
    Unregister-Event -SourceIdentifier $renamed.Name -ErrorAction SilentlyContinue
    Unregister-Event -SourceIdentifier $deleted.Name -ErrorAction SilentlyContinue
    $watcher.Dispose()
  }
}

# Basic checks
git rev-parse --is-inside-work-tree | Out-Null
git remote get-url origin | Out-Null

Start-Watcher

