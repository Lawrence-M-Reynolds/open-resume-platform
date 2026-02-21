# Open Resume Platform — Frontend

React + Vite + Tailwind frontend for the Open Resume Platform. Lists resumes, create/edit flows, and DOCX download.

## Prerequisites

- Node.js 18+
- Backend (resume-builder-portal) running and reachable at the API URL below

## Setup

```bash
npm install
```

## Environment

Optional: create a `.env` file (see `.env.example`).

| Variable       | Description                          | Default              |
|----------------|--------------------------------------|----------------------|
| `VITE_API_URL` | Base URL of the resume API (no slash) | `http://localhost:8081` |

With Docker Compose the portal often runs on port 8081, so you may need:

```bash
VITE_API_URL=http://localhost:8081
```

## Scripts

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start dev server (default: http://localhost:5173) |
| `npm run build` | Production build to `dist/`   |
| `npm run preview` | Serve `dist/` locally (after build) |

## Run locally

```bash
npm run dev
```

Then open http://localhost:5173. Ensure the backend is running and CORS allows this origin (e.g. portal configured for `http://localhost:5173`).
