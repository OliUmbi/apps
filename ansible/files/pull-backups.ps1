# Runs on the Windows workstation: pulls the backup copies over WireGuard and
# keeps a week of them locally. Schedule it (Task Scheduler) or run it
# manually. The server never holds credentials for the workstation -- that is
# why the copy is pulled, not pushed. (POSIX variant: pull-backups.sh for
# WSL / Git Bash.)
#
#   .\pull-backups.ps1 [-Server deploy@10.8.0.1] [-LocalDir D:\backups\oliumbi-apps]

param(
    [string]$Server = "deploy@10.8.0.1",
    [string]$RemoteDir = "/var/backups/apps",
    [string]$LocalDir = "$HOME\backups\oliumbi-apps",
    [int]$LocalKeep = 7
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $LocalDir | Out-Null
scp -r "${Server}:${RemoteDir}/*" $LocalDir
if ($LASTEXITCODE -ne 0) { throw "scp failed" }

$newest = Get-ChildItem "$LocalDir\apps-*.age" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
if (-not $newest) { throw "no backups found in $LocalDir" }

$ageDays = ((Get-Date) - $newest.LastWriteTime).TotalDays
if ($ageDays -gt 1) {
    Write-Warning "newest backup is $([int]$ageDays) days old ($($newest.Name))"
}

Get-ChildItem "$LocalDir\apps-*.age" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip $LocalKeep |
    Remove-Item

Write-Host "pull-backups: ok ($($newest.Name))"
