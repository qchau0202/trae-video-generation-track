# Liquid Service (API)

## Environment variables

- `PORT` (default: 5000)
- `MONGODB_URI` (required)
- `PIXVERSE_MOCK` (optional; `true` to use mock generation)
- `PIXVERSE_MOCK_DELAY_MS` (optional; default: 1500)
- `PIXVERSE_MOCK_VIDEO_URL` (optional; default: Cloudinary sample video)
- `PIXVERSE_API_KEY` (required if `PIXVERSE_MOCK=false`)
- `PIXVERSE_API_BASE_URL` (required if `PIXVERSE_MOCK=false`)
- `JOB_PROCESSOR_INTERVAL_MS` (optional; default: 1500)
- `JOB_PROCESSOR_MAX_PER_TICK` (optional; default: 3)
- `GENERATION_MAX_ATTEMPTS` (optional; default: 3)

## Run

```bash
npm install
npm run dev
```

## Auth + Workspace

- Register/login returns `{ token, user, workspace }`
- For authenticated requests:
  - `Authorization: Bearer <token>`
  - `x-workspace-id: <workspaceId>`

## Core endpoints (v1)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/framework-templates`
- `POST /api/v1/campaigns`
- `POST /api/v1/campaigns/:id/generate`
- `GET /api/v1/campaigns/:id` (includes variants, jobs, videoAssets)
- `POST /api/v1/share-links`
- `GET /api/v1/share/:token`
- `POST /api/v1/share/:token/feedback`

