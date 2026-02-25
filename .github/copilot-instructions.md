# Copilot Instructions for EduLattice

## Overview

EduLattice is a full-stack MERN (MongoDB, Express, React, Node.js) platform for sharing educational resources. It features robust file upload (Cloudinary), user roles (student/admin), analytics, and strong security. The codebase is split into `backend/` (API, DB, file handling) and `frontend/` (React app, UI, state management).

## Architecture & Data Flow

- **Backend**: Express API, MongoDB (Mongoose), JWT auth, Multer for uploads, Cloudinary for storage. Key files:
  - `server.js`: Entry point, sets up Express, DB, routes, middleware.
  - `controllers/`: Business logic (auth, resource management, analytics).
  - `middleware/`: Auth (JWT), file upload, error handling.
  - `models/`: Mongoose schemas for User and Resource (see README for schema details).
  - `services/cloudinary.js`: Cloudinary integration for file storage and deletion.
  - `routes/`: API endpoints for auth and resources.
- **Frontend**: React (Vite), Context API for auth, React Router, Tailwind CSS. Key files:
  - `src/pages/`: Main views (Dashboard, Upload, AdminPanel, etc.)
  - `src/components/`: UI elements (Navbar, ResourceTable, modals, etc.)
  - `src/context/AuthContext.jsx`: Auth state and logic.
  - `src/utils/api.js`: Axios instance with interceptors for auth.
  - `src/constants/`: Centralized config (subjects, error messages, upload limits).

## Developer Workflows

- **Install**: `npm install` in both `backend/` and `frontend/`.
- **Run (dev)**: `npm run dev` in each folder (backend: port 5000, frontend: port 5173).
- **Build (prod)**: `npm run build` (frontend), `npm start` (backend).
- **Environment**: Copy `.env.example` to `.env` in both backend and frontend, fill in secrets (see README).
- **Testing**: Manual via test accounts (see README for credentials and test scenarios).
- **Deployment**: Render.com for both backend and frontend; MongoDB Atlas and Cloudinary for data and files.

## Project-Specific Patterns & Conventions

- **File Uploads**: Use Multer (in-memory) + Cloudinary. Images can be grouped (max 5) with a shared `imageGroupId` (see `Resource` model and upload logic).
- **Resource Analytics**: Views and downloads are tracked per resource (incremented via API calls, not on user's own uploads).
- **Security**: Strict file type/size validation (see `middleware/upload.js` and `constants/uploadLimits.js`). Dangerous files/extensions are blocked with descriptive errors.
- **Role-Based Access**: Use `PrivateRoute.jsx` and `AdminRoute.jsx` for protected frontend routes. Backend uses JWT middleware and role checks.
- **Error Handling**: Centralized error messages in `constants/errorMessages.js` (frontend) and descriptive backend responses.
- **API Usage**: All API calls go through `/api/` endpoints. Use `api.js` for HTTP requests with auth token handling.
- **Archival**: Resources are archived (not deleted) for soft-deletion; only admins can hard-delete.

## Integration Points

- **Cloudinary**: All files stored and managed via Cloudinary (see `services/cloudinary.js`).
- **MongoDB Atlas**: Cloud-hosted DB, connection via `config/db.js`.
- **Render.com**: Deployment for both backend and frontend.

## Examples

- **Upload resource**: POST `/api/resources` (see README for payload and grouping logic).
- **Track view/download**: POST `/api/resources/:id/view`, GET `/api/resources/:id/download` (increments counters).
- **Admin analytics**: GET `/api/resources/stats/overview`.

## Key Files & Directories

- `backend/controllers/resourceController.js`: Resource logic, analytics, grouping
- `backend/middleware/upload.js`: File validation, Multer config
- `frontend/src/pages/Upload.jsx`: Upload form and validation
- `frontend/src/constants/uploadLimits.js`: File size/count rules
- `frontend/src/utils/api.js`: Axios config for API calls

## Notes

- Follow the patterns in existing controllers and components for new features.
- Always validate file types and sizes on both client and server.
- Use centralized error messages for consistency.
- See README for full API docs, test scenarios, and schema details.
