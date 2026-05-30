# Liquid - Work Tracking

## Project Overview
MVP UI for Liquid - helps e-commerce SMEs generate on-brand short ad videos with consistent branding

## Tech Stack
- React
- React Router
- Tailwind CSS
- Lucide React
- localStorage for persistence
- jszip + file-saver for export

## Completed Tasks

### ✅ Project Structure & Data Store
- Created `AppContext.jsx` for state management
- Implemented localStorage persistence for vault and campaigns
- Added storyboard generation logic

### ✅ Routing & Pages
- Dashboard (/)
- Vault Setup (/vault)
- New Campaign (/campaign/new)
- Storyboard (/campaign/:id/storyboard)
- Clips & Assembly (/campaign/:id/clips)
- Preview & Export (/campaign/:id/preview)

### ✅ End-to-End Flow
- Brand vault creation with logo, colors, keywords, product images
- Campaign creation with type, objective, offer
- Auto-generated 6-shot storyboard
- Clip upload/URL
- Preview page with on-brand check
- Export ZIP functionality

### ✅ Export Package Contents
- brand-vault.json
- campaign.json
- storyboard.json
- prompts.txt
- final.mp4 (if exists)

## To Do (Backend Integration Later)
- Backend API integration
- Video stitching
- Real PixVerse API integration
- Google Drive integration
- Multi-brand support

## Run Instructions
1. `cd frontend`
2. `npm install`
3. `npm run dev`
