# Deployment Guide

This document describes how to deploy the HandyCraft project: backend to Render and frontend to Vercel, and how to verify the production flow.

## Backend — Render

1. Create a new Web Service on Render:
   - Connect your GitHub/GitLab repository containing this project.
   - Select the `handycraft-fullstack` repository.
   - Set the Root Directory to `/` (the repo root).
   - Set the Build Command to: `npm install`
   - Set the Start Command to: `npm start`
   - Set the Environment to: `Node`

2. Add Environment Variables (Render Dashboard > Environment > Add):
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = `<Your MongoDB Atlas connection string>`
   - `CLOUDINARY_CLOUD_NAME` = dq4nahc6j
   - `CLOUDINARY_API_KEY` = 219572579726584
   - `CLOUDINARY_API_SECRET` = Qh_WhW0lS_3KSmT43wAwF4t7Vs8
   - 
   - `API_BASE_URL` = `https://<your-render-service>.onrender.com/api`
   - `ADMIN_PASSWORD` = `<strong-password>`
   - `JWT_SECRET` = `<strong-random-secret>`
   - `ALLOWED_ORIGINS` = `https://<your-vercel-domain>.vercel.app` (or comma-separated list)

3. Optionally, add `render.yaml` to repo (already provided) to allow Render's `render` CLI or Git-based detection to configure the service.

4. Deploy and wait for the service to become healthy.

## Frontend — Vercel

1. Create a new project on Vercel and import the repository.
2. Set the Project Root to `/`.
3. For Environment Variables (Vercel > Project Settings > Environment Variables):
   - `API_BASE_URL` = `https://<your-render-service>.onrender.com/api`
   - (Optional) `NODE_ENV` = `production`
4. Ensure the `vercel.json` file (included) is present at repo root.
5. Deploy.

## Post-Deployment Verification

1. Visit `https://<your-render-service>.onrender.com/api/health` — should return `{ success: true }`.
2. Visit `https://<your-render-service>.onrender.com/api/config` — should return `API_BASE_URL` set to the render URL.
3. Visit your frontend site (Vercel URL). Open the browser console and ensure the frontend fetches `/api/config` and sets the base URL correctly.
4. Create a test order from the frontend (use a product with simple payload) and verify the backend receives it and stores it in MongoDB. If Cloudinary is configured, uploaded images should be stored and appear as `secure_url` in saved orders.
5. Log in to the admin UI (`/admin-login.html`) using the `ADMIN_PASSWORD` you set — ensure you can view orders.

## Testing Notes

- The backend requires valid `MONGODB_URI` and Cloudinary credentials to fully process image uploads and persist orders.
- For quick smoke tests without Cloudinary, you can temporarily set the Cloudinary env variables to dummy values and the server will error on upload attempts; instead, test order creation using payloads without `images` or `receiptImage`.

## Rollback & Tips

- Keep the previous working commit available to roll back quickly.
- Use strong values for `ADMIN_PASSWORD` and `JWT_SECRET` and rotate them if compromised.
- Set `ALLOWED_ORIGINS` to exact production frontend origin(s).

## CI / GitHub Actions (optional)

You can add a simple GitHub Action to run lint/tests and deploy on push to `main` using Render's deploy or Vercel's integration.

---

If you want, I can:
- Create a GitHub Action workflow for auto-deploy.
- Create a small `scripts/verify-deploy.js` script to run smoke checks against deployed endpoints.
- Walk through connecting a Render service step-by-step and setting env vars interactively.

## GitHub Secrets & automation

Add the following secrets to GitHub (Settings → Secrets → Actions) so the CI/workflow and deploy scripts can run:

- `MONGODB_URI` — MongoDB Atlas connection string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
- `API_BASE_URL` — e.g. `https://<your-render-service>.onrender.com/api`
- `ADMIN_PASSWORD` — admin login password
- `JWT_SECRET` — secret for signing JWT tokens
- `ALLOWED_ORIGINS` — comma-separated allowed frontend origins
- Optional: `RENDER_API_KEY`, `RENDER_SERVICE_ID`, `VERCEL_TOKEN` for automated deploy steps

I added helper scripts in `scripts/`:

- `scripts/render-deploy.sh` — trigger a Render deploy using `RENDER_API_KEY` and `RENDER_SERVICE_ID`.
- `scripts/vercel-deploy.sh` — deploy the frontend via the `vercel` CLI (requires `VERCEL_TOKEN`).
- `scripts/verify-deploy.js` — smoke-checks the API endpoints (already added).

CI workflow `.github/workflows/ci.yml` runs the smoke checks and can trigger Render using the `RENDER_API_KEY` + `RENDER_SERVICE_ID` secrets.

Usage examples

Run render deploy locally (CI should provide secrets):
```bash
export RENDER_API_KEY=xxxxx
export RENDER_SERVICE_ID=svc_xxxxx
./scripts/render-deploy.sh
```

Run vercel deploy locally:
```bash
export VERCEL_TOKEN=xxxx
./scripts/vercel-deploy.sh
```

If you'd like, I can also add a PowerShell variant of the deploy scripts for Windows.
