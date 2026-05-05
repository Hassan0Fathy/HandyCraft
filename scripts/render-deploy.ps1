<#
Triggers a deploy for a Render service using API key and service ID.
Usage (PowerShell):
  $env:RENDER_API_KEY = '...'
  $env:RENDER_SERVICE_ID = '...'
  ./scripts/render-deploy.ps1
#>

param(
  [string]$RenderApiKey = $env:RENDER_API_KEY,
  [string]$RenderServiceId = $env:RENDER_SERVICE_ID
)

if (-not $RenderApiKey -or -not $RenderServiceId) {
  Write-Error "RENDER_API_KEY and RENDER_SERVICE_ID are required (set as env vars)."
  exit 1
}

$headers = @{ Authorization = "Bearer $RenderApiKey"; "Content-Type" = "application/json" }

try {
  $resp = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$RenderServiceId/deploys" -Method Post -Headers $headers -Body "{}"
  Write-Host "Deploy triggered. Response:" ($resp | ConvertTo-Json -Depth 5)
} catch {
  Write-Error "Failed to trigger deploy: $_"
  exit 1
}
