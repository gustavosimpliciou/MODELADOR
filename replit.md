# Nativos 3D — Multi-Service App

## Project overview

Three services that run together:

| Service | Port | Tech | Description |
|---|---|---|---|
| **Frontend** | 5000 | React + Vite | Lampshade design studio (3D mesh editor, auth via Supabase) |
| **Backend API** | 8000 | FastAPI (Python) | REST API — auth helpers, project storage, Kiwify webhook |
| **Cortes 3D** | 3001 | Next.js | 3D cutting tool — SmartCut + Placa de Limitação |

The Frontend Vite dev server proxies `/api` → `localhost:8000` and `/cortes` → `localhost:3001`, so the user sees everything through port 5000.

## How to run

All three workflows are configured and start automatically:

- **Start application** — `cd frontend && yarn dev` (port 5000)
- **Backend API** — `cd backend && python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload`
- **Cortes 3D** — `cd cortes && pnpm exec next dev --webpack -p 3001`

## Environment secrets needed

| Variable | Where | Where to get it |
|---|---|---|
| `SUPABASE_URL` | env var (shared) | Supabase → Settings → API → Project URL |
| `SUPABASE_KEY` | **Secret** (service_role) | Supabase → Settings → API → **service_role** key (`eyJ…`) — **not** the anon/publishable key |
| `SESSION_SECRET` | Secret | Any long random string |
| `KIWIFY_WEBHOOK_TOKEN` | Secret | Kiwify dashboard → Webhooks → shared token |

> **Important:** `SUPABASE_KEY` must be the **service_role** key (a JWT starting with `eyJ…`), stored as a Replit Secret — never as a plain env var and never the anon/publishable key. The service_role key bypasses RLS so the backend can read all users and run admin operations.

The frontend has Supabase credentials in `frontend/src/lib/supabase.js` (anon key — safe to commit).

## Architecture notes

- Frontend auth talks directly to Supabase (not through the Python backend).
- The backend uses a **fresh Supabase client per `.auth.*` call** to avoid session mutation — see `new_auth_client()` in `backend/server.py`.
- Cortes 3D must run in **Webpack mode** (`--webpack`) because the imported Turbopack cache can crash on startup.
- The Cortes 3D app has `basePath: '/cortes'` — its pages are at `/cortes/`, not `/`.

## User preferences

- Keep the Placa de Limitação as a SmartCut barrier (not a cutter) — the `plateCut` algorithm in `cortes/lib/plate-cut.ts` is retained for geometry math only.
