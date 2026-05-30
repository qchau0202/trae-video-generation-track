# TRAE x PixVerse Video Generation Project (Liquid)

This project is a Marketing/E-commerce web application built for the TRAE x PixVerse Video Generation Track.

Liquid is a “guardrailed ad creative appliance” for merchants:
- Save brand rules once (Brand Vault)
- Pick a conversion framework (Hook Splitter / Mega Sale / Feature–Benefit)
- Provide product assets + offer
- Generate 30s+ campaign videos via PixVerse
- Compare variants, collect votes/comments, and export a bundle (9:16 + 1:1)

## Core Features

- **Brand Vault (CRUD)**: Brand profiles (logo/colors/style) reused across campaigns
- **Conversion Frameworks**: System templates are auto-seeded on server start
- **Campaign Generator**: Async PixVerse job pipeline (submit → status → assets)
- **Beyond playback**: Variant compare, feedback (vote/comment), share links, export bundles
- **Multi-format output**: 9:16 and 1:1
- **RBAC**: Workspace membership roles (owner/admin/member/viewer)

## Getting Started
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
