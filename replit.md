# Nativos Studio Pro — Lampshade & 3D Cut Tool

## Project Overview

A professional 3D design platform with two tools:

1. **Modelador 3D** (`/`) — Parametric lampshade designer using Three.js. Design, customize, and export 3D lamp shades and luminaires.
2. **Cortes 3D** (`/cortes`) — Smart 3D mesh cutting tool (STL/OBJ/PLY/GLB/GLTF). Uses SmartCut algorithm for intelligent model splitting.

## Architecture — Three Services

| Service | Directory | Port | Stack |
|---|---|---|---|
| Frontend (main) | `frontend/` | 5000 | React 18 + Vite + Three.js + Zustand |
| Backend API | `backend/` | 8000 | FastAPI + Supabase + Python 3.12 |
| Cortes 3D | `cortes/` | 3001 | Next.js 16 + React Three Fiber |

The Vite frontend proxies `/api` → port 8000 and `/cortes` → port 3001, so users only ever access port **5000**.

## How to Run (All Three Services)

Each service has its own Replit workflow. Start all three:

- **Start application** — `cd frontend && yarn dev` (port 5000)
- **Backend API** — `cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload` (port 8000)
- **Cortes 3D** — `cd cortes && npm run dev` (port 3001)

## User Flow

1. Login / Register → Supabase Auth (handled directly on the frontend)
2. Tool Selector → choose Modelador 3D or Cortes 3D
3. Modelador 3D → design parametric lampshades, export STL/OBJ
4. Cortes 3D → load any 3D file, use SmartCut to split into parts, export

## Authentication

- Supabase Auth (client-side via `@supabase/supabase-js`)
- Frontend anon key: hardcoded in `frontend/src/lib/supabase.js`
- Backend reads `SUPABASE_URL` and `SUPABASE_KEY` from `backend/.env`
- `SESSION_SECRET` — stored as a Replit Secret (already configured)

## Backend — Environment Variables Needed

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase service-role key (for backend admin ops) |
| `SESSION_SECRET` | Yes | JWT signing secret — set in Replit Secrets |
| `KIWIFY_WEBHOOK_TOKEN` | Optional | Kiwify payment webhook token |

> ⚠️ The backend `.env` currently uses the anon key. Replace `SUPABASE_KEY` with the **service-role key** from your Supabase Dashboard → Settings → API for full functionality (user creation, RLS bypass for projects).

## Installing Dependencies

```bash
# Frontend
cd frontend && yarn install

# Backend
cd backend && pip install -r requirements.txt

# Cortes
cd cortes && npm install --legacy-peer-deps
```

## Credits / Monetization

- Free plan: 1 free export
- Paid plans via Kiwify: Easy (200 credits), Medium (565), Premium (1500)
- Each export costs 40 credits
- Webhook endpoint: `POST /api/webhook/kiwify?token=YOUR_TOKEN`

## User Preferences

- Keep existing project structure and stack intact
- Do not restructure or migrate to a different database or framework
