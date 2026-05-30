# TRAE x PixVerse Video Generation Project (Liquid)

This project is a Marketing/E-commerce web application built for the TRAE x PixVerse Video Generation Track.

Liquid is a “guardrailed ad creative appliance” for merchants:
- Save brand rules once (Brand Vault)
- Pick a conversion framework (Hook Splitter / Mega Sale / Feature–Benefit)
- Provide product assets + offer
- Generate 30s+ campaign videos via PixVerse
- Compare variants, collect votes/comments, and export a bundle (9:16 + 1:1)

## Project Structure

```text
trae-video-generation-track/
├── backend/
│   ├── liquid-service/     # Express.js + MongoDB API for Liquid
│   │   └── src/
│   │       ├── controllers/
│   │       ├── middleware/
│   │       ├── models/
│   │       ├── routes/
│   │       └── services/
│   └── pixverse-service/   # PixVerse skills reference (track materials)
├── frontend/               # React (Vite) Frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── lib/
│   │   └── pages/
│   ├── .env.development
│   ├── .env.staging
│   └── .env.production
└── README.md
```

## Core Features

- **Brand Vault (CRUD)**: Brand profiles (logo/colors/style) reused across campaigns
- **Conversion Frameworks**: System templates are auto-seeded on server start
- **Campaign Generator**: Async PixVerse job pipeline (submit → status → assets)
- **Beyond playback**: Variant compare, feedback (vote/comment), share links, export bundles
- **Multi-format output**: 9:16 and 1:1
- **RBAC**: Workspace membership roles (owner/admin/member/viewer)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/liquid-service
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.development`:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `PIXVERSE_MOCK`: Set to `true` to run without PixVerse credentials (default behavior if no API key is set)
   - `PIXVERSE_API_KEY`: PixVerse API key (if using real PixVerse endpoint)
   - `PIXVERSE_API_BASE_URL`: PixVerse API base URL (if using real PixVerse endpoint)
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.development`:
   - `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api/v1).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Build & Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```
The optimized bundle will be in `frontend/dist`.

**Backend:**
```bash
cd backend/liquid-service
npm start
```
This runs the server using `.env.production` configurations (if present).

## Security & Best Practices

- **CORS**: Enabled on the API server.
- **Security Middleware**: `helmet` is implemented for basic security headers.
- **Error Handling**: Standardized error response structure across all API endpoints.
- **Environment Isolation**: Sensitive credentials are never hardcoded and vary by environment.
