# TRAE x PixVerse Video Generation Project

This project is a Marketing/E-commerce web application built for the TRAE x PixVerse Video Generation Track. It features an interactive video shopping experience powered by PixVerse AI-generated videos.

## Project Structure

```text
trae-video-generation-track/
├── BE/                     # PixVerse Core Services & Skills
│   └── pixverse-service/
│       └── pixverse-skills/
│           ├── skills/     # AI Capabilities & Workflows
│           └── README.md   # PixVerse integration guide
├── backend/                # Express.js Backend (Custom API)
│   ├── src/
│   │   ├── configs/       # DB and service configurations
│   │   ├── middleware/    # Error handling & Security
│   │   ├── services/      # Cloudinary & Google Drive integrations
│   │   ├── app.js         # Express configuration
│   │   └── server.js      # Entry point
│   ├── .env.development
│   ├── .env.staging
│   └── .env.production
├── frontend/               # React (Vite) Frontend
│   ├── src/
│   │   ├── components/    # PixVerse Interactive Video component
│   │   ├── App.jsx        # Marketing landing page
│   │   └── index.css      # Tailwind CSS entry
│   ├── .env.development
│   ├── .env.staging
│   └── .env.production
└── README.md
```

## Core Features

- **Interactive PixVerse Video**: Minimum 30s AI-generated video with interactive hotspots.
- **PixVerse Skills Integration**: Leveraging core capabilities from the `BE/` directory for advanced video production and post-processing.
- **In-Video Purchase Triggers**: Direct links to product pages from within the video.
- **User Engagement Analytics**: Real-time tracking of user interactions with video elements.
- **Multi-Environment Setup**: Dedicated configurations for Development, Staging, and Production.
- **Cloudinary Integration**: Managed storage for product images and media.
- **Google Drive Integration**: Secure file management and backup for e-commerce workflows.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- Cloudinary Account
- Google Cloud Project (for Drive API)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.development`:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `CLOUDINARY_*`: Your Cloudinary credentials.
   - `GOOGLE_DRIVE_*`: Your Google Drive API credentials.
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
cd backend
npm run start
```
This runs the server using `.env.production` configurations.

## Security & Best Practices

- **CORS**: Configured in the Express backend to allow specific origins.
- **Security Middleware**: `helmet` is implemented for basic security headers.
- **Error Handling**: Standardized error response structure across all API endpoints.
- **Environment Isolation**: Sensitive credentials are never hardcoded and vary by environment.
