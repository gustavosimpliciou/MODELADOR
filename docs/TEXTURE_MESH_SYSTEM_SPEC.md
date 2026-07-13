# Nativos Studio Pro — Texture & Mesh System Specification

**Status:** Living document, reflects the system as implemented in this repo.
**Scope:** Parametric shade geometry, procedural mesh patterns, procedural surface
textures, their parameter model, and the quality/safety rules that keep generated
models printable. This is the reference to update whenever the geometry pipeline
changes — treat it as the source of truth, not the code comments scattered across
`frontend/src/lib` and `frontend/src/data`.

---

## 1. Project Overview

Nativos Studio Pro is a browser-based parametric designer for 3D-printable lamp
shades. A user picks a **base profile** (silhouette), sets its **dimensions**,
optionally applies one **mesh pattern** (a perforated/relief lattice cut into the
wall) or one **surface texture** (a shallow emboss over the wall), tunes a small
set of numeric parameters, and exports a watertight solid mesh (STL/OBJ/3MF/GLB/
STEP) ready to slice and print.

The system is deliberately **not** a general-purpose CAD tool. Every control maps
to a bounded, physically-meaningful parameter (mm, degrees, or a unitless 0–N
multiplier), and the geometry builder is responsible for guaranteeing the result
is manifold and printable regardless of what combination of sliders the user
chooses. The UI never exposes a raw mesh editor — creativity is expressed
through parameters, not vertex manipulation.

## 2. System Architecture

```
LeftPanel.jsx / RightPanel.jsx        → parameter UI (dimensions, mesh, texture)
        │  (patches)
useStore.js (Zustand)                 → single source of truth: lampshade,
        │                                meshParams, textureParams, activeMesh,
        │                                activeTexture, bottomCap, handle
        ▼
lampshadeGeometry.js                  → buildLampshadeGeometry(lampshade,
        │                                meshParams, activeMesh, activeTexture,
        │                                textureParams) → THREE.BufferGeometry
        ├─ profileRadius() / bezierBase()   (silhouette math per profile)
        ├─ LatheGeometry (revolve profile → shell of `wall` thickness)
        ├─ mesh pattern displacement pass   (data/meshes.js, 60 patterns)
        ├─ texture emboss displacement pass (data/textures.js, 10 patterns)
        └─ normal recomputation after each displacement pass
        ▼
Viewport.jsx (React Three Fiber)      → live render, flat/smooth shading,
                                          bottom-cap + handle sub-geometries
        ▼
exporters.js                          → STL / OBJ / 3MF / GLB / STEP output
```

Mesh patterns and surface textures are **mutually exclusive** on the wall: a
shade has at most one `activeMesh` OR one `activeTexture` at a time (the bottom
cap has its own independent pattern system, `bottomCapPatterns.js`, out of scope
for this document).

## 3. Design Philosophy

1. **Parameters over presets.** The mesh/texture library is a *starting point*
   (frequency, amplitude, direction defaults), not a fixed catalog of finished
   looks — every pattern is a pure function `(angle, heightNormalized, params)
   → displacement`, re-evaluated per vertex, per frame of interaction.
2. **The slider range is the contract.** A parameter's min/max in the UI is not
   just an interaction affordance — it is the primary guarantee that the
   resulting geometry stays printable. Any new parameter must have its range
   chosen with the worst-case combination (all sliders at max simultaneously)
   in mind, not just its typical value.
3. **Geometry integrity is enforced in the builder, not the UI.** Even with
   correct slider ranges, users will discover reachable combinations that
   stack multiplicatively. `buildLampshadeGeometry` is the last line of
   defense and must independently guarantee a manifold, non-self-intersecting
   result — see §9.
4. **No silent fallbacks.** If a pattern function or profile is unknown, the
   geometry builder should fail loudly during development, not quietly
   degrade to a default shape.

## 4. Base Geometry (Profiles)

Profiles are silhouette functions `profileRadius(t, lampshade)` for `t ∈ [0,1]`
(bottom → top), revolved with `THREE.LatheGeometry` and then thickened into a
real wall shell (outer surface = profile radius, inner surface = profile radius
− `wallThickness`).

| Profile id  | Shape description                                      |
|-------------|---------------------------------------------------------|
| `cone`      | Straight taper, top ≠ bottom diameter                   |
| `cylinder`  | Constant radius (top = middle = bottom)                 |
| `drum`      | Straight sides, flat top/bottom (classic drum shade)    |
| `bell`      | Bulge at `middleDiameter`, controlled by `bellCurve`     |
| `flare`     | Outward flare near the bottom, angle via `flareAngle`    |
| `globe`     | Spherical bulge, symmetric top/bottom taper              |
| `empire`    | Bell-like bulge with a narrower waist near the top       |
| `torchiere` | Wide flare, narrow neck — upward-facing shade profile    |

Shared dimension parameters (`frontend/src/components/LeftPanel.jsx`):

| Parameter        | Range         | Unit | Notes |
|------------------|---------------|------|-------|
| `height`         | 80 – 400      | mm   | |
| `topDiameter`    | 20 – 350      | mm   | |
| `middleDiameter` | 20 – 400      | mm   | used by bulge profiles |
| `bottomDiameter` | 40 – 350      | mm   | |
| `wallThickness`  | 0.8 – 10      | mm   | drives printability & the min-wall guard (§9) |
| `bellCurve`      | 0 – 2.5       | —    | bulge intensity for `bell`/`empire`/`globe` |
| `segments`       | 32 – 200      | —    | radial resolution (facets around the shade) |
| `smoothing`      | 0 – 4         | —    | ≥ a threshold ⇒ smooth normals, else flat shading |
| `flareAngle`     | 0 – 45        | °    | outward flare for `flare`/`torchiere` |

`bellCurve`'s ceiling was deliberately lowered from an earlier 0–8 range: values
above ~2.5 multiplied against `(bottomDiameter − topDiameter)` produced
silhouettes that ballooned past any sane furniture-scale shade — see §9 for the
underlying reasoning.

## 5. Mesh Pattern Library (60 patterns)

Location: `frontend/src/data/meshes.js`. Each entry is
`{ id, name, category, pattern, defaults, baseParams }`, where `pattern` maps to
a pure function in the shared `patterns` table:

```js
patterns[key] = (angle, heightNorm, p) => displacement   // signed, scene units
```

`p` carries `density * frequency` (angular/vertical repetition), `rotation`,
and `lineThickness * amplitude` (the pattern's own amplitude multiplier). Each
pattern function owns a small internal "amplitude budget" (empirically ~0.015
–0.06 scene units, i.e. roughly 3–12 mm at typical shade scale) that keeps a
*single* pattern looking intentional at its defaults; the multipliers layered
on top by the user are what the clamp in §9 exists to bound.

Categories and counts (60 total):

| Category       | Count | Examples |
|----------------|------:|----------|
| Geometric      | 9     | Triangle Tile, Zigzag, Pleats, Origami, Crystalline, Carbon Fiber, Iso Cubes |
| Luxury         | 8     | (art-deco / faceted, high-end finishes) |
| Diamond        | 6     | Lattice, faceted diamond variants |
| Nature         | 6     | Cactus Ribs, Fish Scale, Bamboo, Tree Bark, Ammonite, Pinecone |
| Spiral         | 5     | Helical / twisted repetition patterns |
| Vertical       | 5     | Vertical rib / slat families |
| Organic        | 5     | Free-form, non-repeating relief |
| Minimal        | 5     | Low-amplitude, restrained perforation |
| Hexagonal      | 4     | Honeycomb-family lattices |
| Voronoi        | 4     | Cellular/organic tessellation |
| Architectural  | 3     | Big Wave, Interference, Topographic |
| Weave          | 3     | Basket Weave, Rope Twist, Chainmail |

Mesh parameters (`frontend/src/components/RightPanel.jsx`,
`useStore.js: meshParams`):

| Parameter        | Range        | Default | Role |
|-------------------|-------------|---------|------|
| `lineThickness`   | 0.2 – 3.0   | 1.2     | multiplies the pattern's amplitude budget |
| `openingWidth`    | 0.5 – 20    | 5.0     | perforation gap, pattern-dependent |
| `depth`           | 0 – 5       | 1.0     | relief depth, pattern-dependent |
| `density`         | 0.2 – 4     | 1.0     | repetition count multiplier |
| `rotation`        | 0 – 360°    | 0       | pattern rotation |
| `tilt`            | −45 – 45°   | 0       | diagonal skew |
| `amplitude`       | 0 – 2       | 1.5     | displacement multiplier (tightened from 0–3, see §9) |
| `frequency`       | 0.5 – 6     | 1.0     | angular/vertical frequency multiplier (tightened from 0.5–10) |
| `scale`           | 0.1 – 2     | 1.0     | final displacement scale (tightened from 0.1–3) |
| `noise`           | 0 – 1       | 0       | adds organic micro-variation (see §9 for the smoothing fix) |
| `randomization`   | 0 – 1       | 0       | per-cell jitter, pattern-dependent |
| `symmetry`        | 1 – 16      | 1       | radial symmetry fold count |
| `gradient`        | 0 – 1       | 0       | fades amplitude along height |
| `curvature`       | −1 – 1      | 0       | biases displacement direction along height |

## 6. Texture Library (10 patterns)

Location: `frontend/src/data/textures.js`. Unlike mesh patterns, every texture
function returns a **normalized** displacement in `[0, 1]`:

```js
textures[key] = (angle, heightNorm, params) => value ∈ [0, 1]
```

`lampshadeGeometry.js` is the single place that converts this normalized value
into real mm via `intensity`, so no texture function can independently exceed
the configured relief depth. Textures are shallow surface embosses (fabric,
wood-grain, concrete, honeycomb, etc.), not structural perforations — they never
carve through the wall the way a mesh pattern's `depth` can.

Catalog: Linho (linen weave), Diamante 3D, Ondulado (wave), Espiral (spiral),
Linhas Finas (fine lines), Favo de Mel (honeycomb), Origami, Mosaico (mosaic),
Madeira (wood grain), Concreto (concrete).

Texture parameters (`useStore.js: textureParams`):

| Parameter    | Range        | Default | Unit |
|--------------|-------------|---------|------|
| `intensity`  | 0 – 3       | 0.8     | mm — real relief depth, pattern-independent |
| `scale`      | 0.2 – 3     | 1.0     | pattern frequency multiplier |
| `rotation`   | 0 – 360     | 0       | ° |
| `direction`  | enum        | pattern default | vertical / horizontal / diagonal / radial / helicoidal |
| `repetition` | 2 – 120     | pattern default | angular repeat count |
| `smooth`     | 0 – 1       | pattern default | 0 = hard edges, 1 = soft |
| `offset`     | 0 – 360     | 0       | ° |

Because `intensity` is bounded in real mm (0–3mm) and pre-multiplies a
normalized `[0,1]` value, the texture path has never needed the displacement
clamp described in §9 — it is safe by construction. Any *new* texture
parameter that could multiply `intensity` (e.g. a future "double relief"
toggle) must preserve this invariant.

## 7. Algorithms — Displacement Pipeline

For each vertex of the lathed shell, per active layer:

1. Compute `angle = atan2(z, x)` and `heightNorm = (y − yMin) / (yMax − yMin)`.
2. **Mesh pattern pass** (if `activeMesh`): evaluate the pattern function,
   add the smoothed noise term (§9), multiply by `scale`, then **soft-clamp**
   the result (§9) before adding it to the local radius.
3. **Texture pass** (if `activeTexture`): evaluate the texture function,
   multiply by `intensity` (already mm-bounded), add to the local radius.
4. Recompute vertex normals after each pass (`geometry.computeVertexNormals()`)
   so lighting reflects the final displaced surface, not the base lathe.

Because `atan2`-based angular functions are evaluated identically at the seam's
first and last ring (which share coordinates), the pipeline is seam-safe by
construction — no special-casing is needed for the wrap-around edge.

## 8. Parameter System — Cross-Cutting Rules

- All dimension/parameter state lives in one Zustand store (`useStore.js`);
  the geometry builder is a pure function of that state plus the active
  mesh/texture definition — no hidden mutable geometry state.
- Every slider's `{min, max, step}` is declared once, in the panel component,
  and must be treated as a safety-relevant constant, not just a UX default.
- Resetting a mesh/texture (`resetMeshParams`/`resetTextureParams`) restores
  the pattern's own tuned `defaults`, not a global default — each pattern
  ships defaults chosen to look correct at `scale = 1, amplitude = 1`.

## 9. Geometry & Mesh Validation Rules (Quality Requirements)

These rules exist because early parameter ranges allowed users to reach
combinations that produced self-intersecting, spiky, "amateur-looking" shades
even though each individual slider was within its documented range
(displacement from a mesh pattern could reach `pattern_base × lineThickness ×
amplitude × scale`, which at old maxima could exceed the shade's own radius).
The fixes below are structural, not just tuning:

1. **Proportional displacement clamp.** Mesh-pattern displacement is passed
   through a `tanh`-based soft clamp (`softClamp(v, baseRadius * 0.35)`)
   before being applied. This bounds displacement to ±35% of the local base
   radius with a smooth shoulder (no flat "melted" plateaus at the limit),
   so no reachable slider combination can blow the silhouette apart.
2. **Minimum wall guard.** The outer wall radius is floored at
   `innerShellRadius + wallThickness * 0.3`, so strong inward displacement
   (e.g. high `noise` on a thin `wallThickness`) can never let the outer
   surface collapse through the inner shell — a real self-intersection that
   breaks slicers.
3. **Smoothed noise.** The `noise` parameter blends two moderate-frequency
   sine/cosine octaves rather than one raw high-frequency product; this reads
   as organic micro-texture instead of jittery aliasing at high `noise`
   values.
4. **Texture path is bounded by construction** (see §6) — normalized `[0,1]`
   output × mm-bounded `intensity`, no clamp required.
5. **Watertight / manifold.** The shell always has an explicit inner and outer
   surface plus cap geometry (top opening, bottom cap when enabled) — no
   pattern is allowed to fully sever a ring of the lathe (patterns modulate
   radius, they don't delete geometry), which keeps the mesh watertight for
   slicing.
6. **No self-intersection.** Guaranteed jointly by rules 1–2: outer radius is
   always `> ` inner shell radius at every vertex, for every reachable
   parameter combination.
7. **Printability.** Minimum practical `wallThickness` is 0.8mm (UI floor);
   patterns with a `depth`/`openingWidth` concept should keep the thinnest
   printed feature above common FDM nozzle limits (~0.4mm) — this is
   currently advisory (UI ranges keep typical outputs safe) rather than an
   enforced check, and is a good candidate for an explicit validator (§14).

Any new mesh pattern, texture, or parameter must be evaluated against rules
1–6 with a worst-case (all related sliders at max) test before shipping —
see §13 for the verification method used to validate this document's rules.

## 10. Performance Requirements

- Interactive dragging of a slider must re-run `buildLampshadeGeometry`
  every frame without noticeable stutter at the UI's max `segments` (200)
  and default vertical step count — the builder is pure per-vertex math with
  no allocation beyond the buffer itself, which keeps this cheap.
- Pattern/texture functions must remain O(1) per vertex (no nested loops
  over other vertices) so total cost stays `O(segments × steps)`.
- Normal recomputation happens at most twice per rebuild (once per active
  displacement layer), not per-parameter-change extra passes.

## 11. UX/UI Summary

- **LeftPanel** — profile choice, dimensions, fitter type.
- **RightPanel** — mesh library / texture library (mutually exclusive tabs),
  their parameter sliders, export format selection.
- **Viewport** — live Three.js preview; `smoothing` parameter drives
  flat-vs-smooth shading; view modes include solid/wireframe (`viewMode`),
  grid toggle, orbit controls.
- Sliders always show the physical unit (mm, °, x) next to the value so users
  reason about real-world scale, not abstract numbers.

## 12. Workflow

1. Choose a base profile and set dimensions.
2. Optionally choose one mesh pattern (perforated lattice) *or* one surface
   texture (shallow emboss) — not both.
3. Tune pattern/texture parameters; the viewport updates live.
4. Optionally configure the bottom cap and/or handle.
5. Export to STL/OBJ/3MF/GLB/STEP for slicing.

## 13. Verification Method

Because the studio is gated behind login, geometry-quality regressions are
verified **headlessly**, not via screenshots: a small Node/esbuild script
imports `buildLampshadeGeometry` directly, builds representative and
worst-case parameter sets (all mesh sliders at max, thin wall + max noise,
extreme `bellCurve`), and asserts:

- no `NaN`/`Infinity` vertex coordinates,
- `max(|displacement|) / baseRadius` stays under the §9 clamp ratio,
- `min(outerRadius − innerShellRadius) ≥ 0` (no puncture) across the mesh.

This is the required regression check for any change to §7–§9.

## 14. Acceptance Criteria

- [ ] Every mesh/texture pattern produces a watertight, non-self-intersecting
      shell at its default parameters.
- [ ] Every mesh/texture pattern remains non-self-intersecting at the
      worst-case combination of its own sliders at max.
- [ ] No slider range change ships without re-running the §13 verification
      script.
- [ ] `wallThickness` floor and the §9 minimum wall guard stay consistent —
      lowering the UI floor requires re-checking guard rule 2.
- [ ] Export (STL/OBJ/3MF/GLB/STEP) succeeds for every profile × pattern
      combination without slicer-reported non-manifold errors (advisory,
      not yet automated — see Roadmap).

## 15. Roadmap / Future Evolution

- Automate an "explicit thin-feature" printability validator (rule 7 in §9)
  rather than relying on UI ranges alone.
- Extend the §13 headless check into a CI-style validation step
  (`validation` skill) that runs automatically before merging pattern/range
  changes.
- Consider exposing the §9 clamp ratio (currently a fixed 0.35) as a
  documented constant if future patterns need a different safe envelope,
  rather than a hidden magic number in `lampshadeGeometry.js`.
- Bottom-cap patterns (`bottomCapPatterns.js`) currently have an independent,
  undocumented parameter system — worth folding into this spec once audited
  against the same §9 rules.
