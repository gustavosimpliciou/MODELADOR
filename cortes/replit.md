# Nativos CUT — SmartCut 3D Model Splitter

## Project overview

A professional Next.js web app for splitting 3D models (STL / OBJ / PLY / GLB / GLTF) into print-ready parts.  
Built for miniature and figurine artists who need clean, watertight cuts with optional alignment pins.

### Key capabilities
- **SmartCut** — Dijkstra/BFS face-selection on the model; select a region by clicking and dragging
- **AutoCut V2** — mathematical isocontour pipeline: field diffusion → marching-triangles → edge relax → cap generation
- **Plane Cut** — axis-aligned watertight plane slice with cap auto-generation
- **Auto Split** — detects natural "neck" sections, suggests cuts automatically
- **Shell Cut** — extracts a selection as a hollow wig/shell with configurable wall thickness
- **Cap generation** — 11-step high-quality capping: locked boundary + smooth inner transition ring + concentric mesh + Taubin smooth + adaptive fairing + per-vertex normals
- **Alignment connectors** — cylindrical, conical, rectangular, oval, keyed — drilled via CSG (three-bvh-csg)
- **Export** — STL / OBJ / GLB per part

### Tech stack
- Next.js 15 (App Router, Turbopack)
- React 19
- Three.js + React Three Fiber
- three-bvh-csg (for connector hole booleans)
- Zustand (state management)
- Tailwind CSS v4

## Running the project

```bash
pnpm dev        # starts Next.js dev server on port 5000
pnpm build      # production build
pnpm start      # production server
```

The dev workflow (`pnpm dev`) is pre-configured in Replit and auto-starts.

## Architecture

| Path | Role |
|---|---|
| `app/page.tsx` | Root layout — wires all panels and the 3D viewport |
| `components/viewport/viewport-3d.tsx` | Three.js canvas, SmartCut hover/click/Dijkstra interaction |
| `components/layout/top-bar.tsx` | File open (STL/OBJ/PLY/GLB/GLTF), view toggles |
| `components/layout/left-panel.tsx` | Tool selection, simple cut actions |
| `components/layout/smart-autocut-panel.tsx` | AutoCut V2 full pipeline UI (configure → shells → caps → apply) |
| `components/layout/plane-cut-panel.tsx` | Plane cut controls |
| `components/layout/right-panel.tsx` | Model info, selection stats, parts list |
| `lib/model-loader.ts` | Loads STL/OBJ/PLY/GLB, merges verts, centers geometry |
| `lib/smart-cut.ts` | Dijkstra selection, `buildCap`, `extractSubMesh`, `removeSubMesh` |
| `lib/cap-generation.ts` | 11-step high-quality cap pipeline (`generateCap`) |
| `lib/smartcut-pipeline.ts` | V2 pipeline: `computeOpenCut`, `generateCaps`, `addCapsToShell` |
| `lib/quality-cut.ts` | Isocontour marching-triangles cutter with Taubin diffusion |
| `lib/solid-plane-cut.ts` | Watertight plane cut with loop detection and cap generation |
| `lib/shell-cut.ts` | Shell/wig extraction with inner offset surface + boundary walls |
| `lib/auto-split.ts` | Neck-detection and automatic split planning |
| `lib/smart-autocut.ts` | Selection analysis, PCA plane fit, connector planning |
| `lib/store.ts` | Zustand store — all app state, dispose helpers |
| `lib/parts-manager.ts` | Part CRUD (add, remove, rename, visibility, lock) |

## User preferences

- Cap generation approach: **lock original boundary vertices exactly (watertight outer edge) + add smooth internal transition ring** so the interior triangulation is clean without gaps — this is already implemented in `lib/cap-generation.ts`.
- Language: Portuguese (UI) / English (code and comments).
