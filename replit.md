# Nativos Studio Pro — 3D Mesh Designer

A browser-based parametric 3D lampshade designer with a React/Three.js frontend and a FastAPI backend.

## Stack

- **Frontend**: React 18 + Vite, Three.js / React Three Fiber, Zustand, Supabase JS client
- **Backend**: FastAPI (Python), Supabase (auth + database)
- **Auth & DB**: Supabase (users, projects tables)

## Running the project

Two workflows must both be running:

| Workflow | Command | Port |
|---|---|---|
| Start application | `cd frontend && yarn dev` | 5000 |
| Backend API | `cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload` | 8000 |

The Vite dev server proxies `/api/*` requests to the backend on port 8000, so the frontend never needs to know the backend's URL directly.

## Environment variables / secrets

| Key | Where | Notes |
|---|---|---|
| `SUPABASE_URL` | Replit env var (shared) | Set to `https://blqvsglspdayrznnbzzf.supabase.co` |
| `SUPABASE_KEY` | Replit Secret | Service role key — backend only |
| `SESSION_SECRET` | Replit Secret | JWT signing key |

The frontend anon key is currently hardcoded in `frontend/src/lib/supabase.js`. See Task #3 to move it to an env var.

## Project structure

```
frontend/   React/Vite app
  src/
    api/        Supabase-direct API calls (auth, projects)
    components/ UI + 3D editor components
    lib/        supabase.js client
backend/    FastAPI app
  server.py   Main API + auth endpoints
api/
  webhook/    Kiwify webhook handler (Node.js)
docs/       Texture & mesh system specification
```

## User preferences

- Keep existing project structure and stack — do not restructure or migrate.
