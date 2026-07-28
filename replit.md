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

The backend reads these from environment variables — add them in the Secrets panel:

| Secret | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `SUPABASE_KEY` | Supabase project → Settings → API → **service_role** key |
| `KIWIFY_WEBHOOK_TOKEN` | Kiwify dashboard → Webhooks → shared token |

The frontend has Supabase credentials hardcoded in `frontend/src/lib/supabase.js` (anon/publishable key — safe to commit).

## Architecture notes

- Frontend auth talks directly to Supabase (not through the Python backend).
- The backend uses a **fresh Supabase client per `.auth.*` call** to avoid session mutation — see `new_auth_client()` in `backend/server.py`.
- Cortes 3D must run in **Webpack mode** (`--webpack`) because the imported Turbopack cache can crash on startup.
- The Cortes 3D app has `basePath: '/cortes'` — its pages are at `/cortes/`, not `/`.

## User preferences

- Keep the Placa de Limitação as a SmartCut barrier (not a cutter) — the `plateCut` algorithm in `cortes/lib/plate-cut.ts` is retained for geometry math only.
