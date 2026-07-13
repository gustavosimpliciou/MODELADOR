---
name: Procedural over/under weave & open-area control
description: Technique for making bump-map mesh/texture patterns match manufacturing-style specs (checkerboard over/under weave, hex-grid holes, duty-cycle % open area).
---

For the Nativos Studio Pro mesh/texture library (`frontend/src/data/meshes.js`, `frontend/src/data/textures.js`), patterns are pure displacement functions `fn(angle, heightNorm, params) -> height`, not real separate strands — there's no true geometric interleaving.

Techniques that make bump-map weaves read as authentic when specs demand "alternating over/under", specific % open area, or true hex grids:

- **Over/under weave illusion**: bucket `(a,h)` into grid cells, use `(cellU + cellV) % 2` as a checkerboard bit to decide which of two perpendicular bands gets full height in that cell and which gets a partial/recessed height (e.g. 0.4-0.6× as tall). This reads as plausible basket-weave without real geometry.
- **% open area control**: for a 1D triangular wave `tri(t)` (range 0..1, symmetric peak), the fraction of the domain where `tri(t) > τ` is `(1-τ)`. So `smoothstep(τ-ε, τ+ε, tri(t))` directly targets a duty cycle — pick `τ = 1 - desiredOpenFraction` for the plateau width.
- **True hex grid**: reuse the `hexCell(x,y)` distance-to-nearest-hex-center helper (already defined in meshes.js) rather than faking hexagons with 3-direction sine sums — those sine hacks tend to invert (holes at cell centers vs walls at boundaries) if you don't carefully check which side of the threshold is "wall" vs "hole".

**Why:** the source spec files for this project (Portuguese manufacturing-style texture prompts) describe precise physical properties (ribbon width, % vazado, no visible nodes/knots, no crossings) that plain sine/noise functions don't naturally satisfy; the checkerboard-bit and duty-cycle-threshold tricks above get close without needing true multi-strand geometry.

**How to apply:** when asked to refine or add a new weave/perforated mesh or texture pattern to match a written spec, check the spec for (1) explicit % open/vazado target → map via the duty-cycle formula, (2) "alterna sobre/sob" → use the checkerboard-bit technique, (3) explicit "hexagonal" grid → use `hexCell`, not a sine-sum approximation.
