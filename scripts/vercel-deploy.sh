#!/usr/bin/env bash
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "VERCEL_TOKEN environment variable is required."
  echo "Set it in CI or run: export VERCEL_TOKEN=your_token"
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

echo "Deploying to Vercel (production)..."
vercel --token "$VERCEL_TOKEN" --prod

echo "Vercel deploy command finished. Check Vercel dashboard for deployment status."