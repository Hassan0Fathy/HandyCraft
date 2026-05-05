<#
PowerShell helper to run the `vercel` CLI for a production deploy.
Usage:
  $env:VERCEL_TOKEN = '...'
  ./scripts/vercel-deploy.ps1
#>

param(
  [string]$VercelToken = $env:VERCEL_TOKEN
)

if (-not $VercelToken) {
  Write-Error "VERCEL_TOKEN environment variable is required."
  exit 1
}

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Error "vercel CLI not found. Install with: npm i -g vercel"
  exit 1
}

# Run vercel CLI
& vercel --token $VercelToken --prod

if ($LASTEXITCODE -ne 0) {
  Write-Error "vercel CLI returned exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}
