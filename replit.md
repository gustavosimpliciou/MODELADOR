# Nativos Studio Pro

A browser-based 3D lampshade / mesh designer built with React 18, Vite, Three.js (react-three-fiber + drei), and Zustand. Multilingual: PT / EN / ES. Mobile devices get a locked screen — the app requires a desktop/tablet viewport (≥ 900 px wide).

## Stack

| Layer    | Tech                                          |
|----------|-----------------------------------------------|
| Frontend | React 18, Vite 5, Three.js, @react-three/fiber, @react-three/drei, Zustand |
| Backend  | FastAPI, Uvicorn, Supabase (auth + Postgres)   |
| Database | Supabase Postgres (optional — server starts without it, auth disabled) |

Note: the backend code (`backend/server.py`) actually uses **Supabase**, not MongoDB — `pymongo`/`motor` are present in `requirements.txt` but unused. `backend/.env` still has leftover `MONGO_URL`/`DB_NAME` vars from an earlier template; they have no effect.

## Running

Two workflows are configured:

- **Start application** — `cd frontend && yarn dev` → serves on port 5000 (webview)
- **Backend API** — `cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload` → console on port 8000

Dependencies (frontend `yarn install`, backend Python packages incl. `supabase`) are installed via `.pythonlibs`/`node_modules`.

The frontend is fully self-contained and renders/works without the backend. The backend exposes `/api/` endpoints for auth and data; without `SUPABASE_URL`/`SUPABASE_KEY` set, it starts fine but logs "auth disabled" and any DB-backed route (e.g. login) returns a 503.

## Secrets / env vars

| Key             | Where  | Notes                                              |
|-----------------|--------|----------------------------------------------------|
| `SUPABASE_URL`  | Secret | Set. Points to the linked Supabase project.        |
| `SUPABASE_KEY`  | Secret | Set. Must be the **Secret key** (`sb_secret_...`) — the Publishable key is not enough since the backend uses admin auth operations. |
| `SESSION_SECRET`| Secret | JWT signing key for session tokens. Already set.   |

## Key files

- `frontend/src/App.jsx` — root component (splash → studio)
- `frontend/src/i18n/` — PT/EN/ES translation dictionaries + `useT()` hook
- `frontend/src/store/useStore.js` — Zustand store (language persisted to localStorage)
- `frontend/src/components/MobileBlock.jsx` — locked screen for < 900 px
- `backend/server.py` — FastAPI app with optional Supabase (auth + Postgres)

## User preferences

<!-- Add any preferences the user asks you to remember here -->
