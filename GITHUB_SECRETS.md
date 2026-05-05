# GitHub Secrets (for CI / Actions)

This repository's CI and deployment steps require a few secrets. Add them in GitHub → Settings → Secrets → Actions.

Required secrets
- `MONGODB_URI` — MongoDB Atlas connection string.
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name.
- `CLOUDINARY_API_KEY` — Cloudinary API key.
- `CLOUDINARY_API_SECRET` — Cloudinary API secret.
- `API_BASE_URL` — e.g. `https://<your-render-service>.onrender.com/api` (used by verify script and frontend config).
- `ADMIN_PASSWORD` — strong admin password used for `POST /api/auth/login`.
- `JWT_SECRET` — strong random secret for signing admin JWTs.

Optional / CI-only secrets
- `RENDER_API_KEY` — Render API key (used to trigger a deploy from GitHub Actions).
- `RENDER_SERVICE_ID` — Render service ID to target for deploys.
- `VERCEL_TOKEN` — Vercel token to trigger vercel CLI deploys from CI (if you prefer script deploys).

Notes
- Keep `MONGODB_URI`, `CLOUDINARY_*`, `ADMIN_PASSWORD`, and `JWT_SECRET` secret and rotate them if compromised.
- `API_BASE_URL` can be set publicly, but keeping it as a secret in CI prevents accidental exposure in build logs.

Example: GitHub Action usage
```yaml
env:
  API_BASE_URL: ${{ secrets.API_BASE_URL }}
  RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
  RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

Security tip
- Use `ALLOWED_ORIGINS` environment variable in your backend to restrict origins to your production frontend domain(s).

If you'd like, I can create a small script that validates the presence of these secrets in the repo's Actions environment and fails early in CI.