#!/usr/bin/env bash
set -euo pipefail

if [ -z "${RENDER_API_KEY:-}" ] || [ -z "${RENDER_SERVICE_ID:-}" ]; then
  echo "RENDER_API_KEY and RENDER_SERVICE_ID environment variables are required."
  echo "Set them in your CI or export locally before running this script."
  exit 1
fi

echo "Triggering Render deploy for service ${RENDER_SERVICE_ID}..."
resp=$(curl -s -o /dev/stderr -w "%{http_code}" -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}')

if [[ "$resp" =~ ^2 ]]; then
  echo "Render deploy triggered successfully (HTTP $resp)."
else
  echo "Failed to trigger deploy (HTTP $resp). Check RENDER_API_KEY and RENDER_SERVICE_ID." >&2
  exit 1
fi

echo "Done. Monitor the Render dashboard for deploy status."