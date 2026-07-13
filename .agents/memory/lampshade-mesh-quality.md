---
name: Lampshade mesh displacement quality
description: Why generated lampshade meshes could look "amateur"/deformed and how the fix is structured — relevant to any future work on frontend/src/lib/lampshadeGeometry.js or mesh/texture parameter ranges.
---

Displacement from mesh patterns (`frontend/src/data/meshes.js`) is applied as `pattern_base(~0.05-0.06 SU) * lineThickness * amplitude`, then `* scale`. With the original slider ranges (amplitude/scale up to 3x, bellCurve up to 8), these multipliers could compound to make displacement exceed the model's own radius, producing self-intersecting/spiky "amateur" geometry — this, not the pattern math itself, was the root cause of user reports that models looked "amador, deformados demais".

**Why:** slider ranges allowed reachable combinations (not just theoretical extremes) where displacement > radius; also the old high-frequency noise term (`sin(angle*47+...)`) added jittery aliasing rather than an organic look.

**How to apply:** `buildLampshadeGeometry` now soft-clamps total displacement to a fraction (0.35×) of the local base radius via a tanh-based `softClamp`, and enforces a minimum residual wall gap so the outer wall can never puncture the inner shell. Mesh pattern noise uses a smoother two-octave function instead of a single raw high-frequency sine product. Slider ceilings for amplitude/scale/bellCurve were also tightened (see `RightPanel.jsx`/`LeftPanel.jsx`). When adding new mesh/texture params or patterns, verify displacement stays proportional to local radius rather than relying on users to avoid extreme slider combos.
