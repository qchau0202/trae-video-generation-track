# TRAE x PixVerse Video Generation Project

This project is a Marketing/E-commerce web application built for the TRAE x PixVerse Video Generation Track. It features an interactive video shopping experience powered by PixVerse AI-generated videos.

## Core Features

- **Interactive PixVerse Video**: Minimum 30s AI-generated video with interactive hotspots.
- **PixVerse Skills Integration**: Leveraging core capabilities from the `BE/` directory for advanced video production and post-processing.
- **In-Video Purchase Triggers**: Direct links to product pages from within the video.
- **User Engagement Analytics**: Real-time tracking of user interactions with video elements.
- **Multi-Environment Setup**: Dedicated configurations for Development, Staging, and Production.
- **Cloudinary Integration**: Managed storage for product images and media.
- **Google Drive Integration**: Secure file management and backup for e-commerce workflows.

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