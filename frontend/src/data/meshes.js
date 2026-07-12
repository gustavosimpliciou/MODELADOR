// ─────────────────────────────────────────────────────────────────
// Premium mesh library — 60 procedurally-generated relief patterns.
//
// Each pattern is a pure function:
//   fn(angle, heightNorm, params) → displacement (scene units)
//
// Displacement is added to the outer wall radius in lampshadeGeometry.js.
// Amplitude budget: 0.015 .. 0.06 SU (≈ 3 – 12 mm at 250 mm profile).
//
// Design principles:
//  • Zero hard if/return discontinuities — every function is C0-continuous
//  • Power / smoothstep shaping → crisp, jewel-quality edges
//  • Height envelopes on tall patterns (sin(h·π)) for clean top/bottom
//  • Layered detail: base shape + fine accent at higher frequency
//  • 100 % procedural — no bitmaps, no UV maps, print-ready
// ─────────────────────────────────────────────────────────────────

export const MESH_CATEGORIES = [
  'ALL',
  'Diamond', 'Hexagonal', 'Voronoi', 'Spiral',
  'Vertical', 'Organic', 'Luxury', 'Minimal', 'Geometric',
  'Nature', 'Weave', 'Architectural',
]

const baseParams = (overrides = {}) => ({
  density:       1.0,
  rotation:      0,
  lineThickness: 1.0,
  ...overrides,
})

// ─── Shared math helpers ──────────────────────────────────────────
const TWO_PI    = Math.PI * 2
const clamp     = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const sat       = (v) => clamp(v, 0, 1)
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
const tri    = (t) => 1 - Math.abs(((t % 1) + 1) % 1 * 2 - 1)
const punch  = (v, k) => Math.sign(v) * Math.pow(Math.abs(v), k)
const hash11 = (n) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s) }
const hash22 = (x, y) => hash11(x * 127.1 + y * 311.7)

// Value noise (smooth)
const vnoise = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash22(xi, yi), b = hash22(xi + 1, yi)
  const c = hash22(xi, yi + 1), d = hash22(xi + 1, yi + 1)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

// Fractal Brownian Motion (3 octaves — controlled, not chaotic)
const fbm3 = (x, y) => {
  let f = 0, amp = 0.5, freq = 1
  for (let i = 0; i < 3; i++) { f += amp * vnoise(x * freq, y * freq); freq *= 2.1; amp *= 0.5 }
  return f
}

// Worley cellular — returns [F1, F2]
const worley = (x, y, scale) => {
  const gx = Math.floor(x * scale), gy = Math.floor(y * scale)
  let f1 = 99, f2 = 99
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = gx + dx, cy = gy + dy
      const px = cx + hash22(cx, cy), py = cy + hash22(cy + 5, cx + 7)
      const d = Math.hypot(x * scale - px, y * scale - py)
      if (d < f1) { f2 = f1; f1 = d } else if (d < f2) f2 = d
    }
  }
  return [f1, f2]
}

// True hexagonal cell distance
const hexCell = (x, y) => {
  const s = 1.7320508
  const q = x * 2 / 3, r = (-x / 3 + y / s)
  const rq = Math.round(q), rr = Math.round(r), rs = Math.round(-q - r)
  let dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs + q + r)
  let cq = rq, cr = rr
  if (dq > dr && dq > ds) cq = -rr - rs
  else if (dr > ds) cr = -rq - rs
  return Math.hypot(x - cq * 3 / 2, y - (cq / 2 + cr) * s)
}

// ─── Pattern functions ────────────────────────────────────────────
const patterns = {

  // ══════════════════ DIAMOND — gem-quality faceted cuts ══════════════════

  // True diamond lattice: product of two diagonal families, power-sharpened
  diamondClassic: (a, h, p) => {
    const f = p.density * 6
    const s1 = Math.sin(a * f + h * f * Math.PI * 0.5)
    const s2 = Math.sin(a * f - h * f * Math.PI * 0.5)
    return sat(punch(s1 * s2, 0.5)) * 0.055 * p.lineThickness
  },

  // Deep X ridges — symmetrical crisscross with clean valleys
  diamondCrisscross: (a, h, p) => {
    const f = p.density * 8
    const d1 = Math.abs(Math.sin(a * f + h * f * Math.PI))
    const d2 = Math.abs(Math.sin(a * f - h * f * Math.PI))
    return punch(Math.max(d1, d2), 0.5) * 0.05 * p.lineThickness
  },

  // Six-point star per cell — sharpened with proper cell normalization
  diamondStar: (a, h, p) => {
    const f = p.density * 4
    const u = ((a * f) % 1 + 1) % 1 - 0.5
    const v = ((h * f * 1.5) % 1 + 1) % 1 - 0.5
    const r = Math.hypot(u, v) * 2
    const ang = Math.atan2(v, u)
    const starR = 0.28 + 0.22 * Math.cos(ang * 6)
    return sat(1 - smoothstep(starR - 0.04, starR + 0.12, r)) * 0.055 * p.lineThickness
  },

  // Lapidated jewel: 4 clean stepped facet levels
  diamondFaceted: (a, h, p) => {
    const f = p.density * 5
    const wave = Math.sin(a * f + h * f * Math.PI * 0.4) * 0.5 + 0.5
    const steps = 4
    return (Math.floor(wave * steps) / steps) * 0.055 * p.lineThickness
  },

  // Raised diamond grid edges with recessed flat cells
  diamondLattice: (a, h, p) => {
    const f = p.density * 6
    const u = 2 * (((a * f) % 1 + 1) % 1) - 1
    const v = 2 * (((h * f * 1.5) % 1 + 1) % 1) - 1
    const du = Math.abs(u + v) * 0.5, dv = Math.abs(u - v) * 0.5
    return smoothstep(0.72, 0.92, Math.max(du, dv)) * 0.06 * p.lineThickness
  },

  // Chiselled prism — triangular wave min gives deep V-cuts between ridges
  diamondPrism: (a, h, p) => {
    const f = p.density * 4
    const t1 = tri(a * f + h * f * 0.5)
    const t2 = tri(a * f - h * f * 0.5)
    return Math.pow(Math.min(t1, t2), 0.65) * 0.055 * p.lineThickness
  },

  // ══════════════════ HEXAGONAL — true tessellation ══════════════════

  // Flat-topped hexagonal cells with crisp raised walls
  hexHoneycomb: (a, h, p) => {
    const f = p.density * 3
    const d = hexCell(a * f * 1.6, h * f * 2.4)
    return (1 - smoothstep(0.22, 0.38, d)) * 0.055 * p.lineThickness
  },

  // Six-point stars overlaid on hex grid with raised center domes
  hexStar: (a, h, p) => {
    const f = p.density * 2.8
    const px = a * f * 1.6, py = h * f * 2.4
    const d = hexCell(px, py)
    const lx = ((px % 1) + 1) % 1 - 0.5, ly = ((py % 1) + 1) % 1 - 0.5
    const ang = Math.atan2(ly, lx)
    const dome = sat(1 - d * 1.8)
    const ray  = 0.5 + 0.5 * Math.cos(ang * 6)
    return (dome * 0.55 + ray * sat(1 - d * 2.5) * 0.45) * 0.055 * p.lineThickness
  },

  // Triangular tiling — three 120° directions interlocked
  hexTriangle: (a, h, p) => {
    const f = p.density * 3.2, s = 1.7320508
    const t1 = Math.sin(a * f)
    const t2 = Math.sin(a * f * -0.5 + h * f * s * 0.5)
    const t3 = Math.sin(a * f * -0.5 - h * f * s * 0.5)
    return punch(sat(Math.max(t1, t2, t3)), 0.55) * 0.05 * p.lineThickness
  },

  // Hex woven: cell dome + fine accent grid
  hexWeave: (a, h, p) => {
    const f = p.density * 3.5
    const d = hexCell(a * f * 1.6, h * f * 2.4)
    const dome = sat(1 - d * 1.6)
    const accent = sat(1 - Math.abs(Math.sin(a * f * 4)) * 0.7 - Math.abs(Math.sin(h * f * 5)) * 0.3)
    return (dome * 0.7 + accent * 0.3) * 0.05 * p.lineThickness
  },

  // ══════════════════ VORONOI — cellular noise ══════════════════

  // Smooth cell domes — organic but regular
  voronoiOrganic: (a, h, p) => {
    const f = p.density * 2.8
    const [f1] = worley(a, h * 0.9, f)
    return Math.pow(sat(1 - f1 * 1.4), 1.2) * 0.055 * p.lineThickness
  },

  // Crisp raised borders between Voronoi cells
  voronoiCells: (a, h, p) => {
    const f = p.density * 3
    const [f1, f2] = worley(a, h * 0.9, f)
    const ridge = smoothstep(0.0, 0.12, f2 - f1)
    return ridge * 0.06 * p.lineThickness
  },

  // Cracked glaze — deep fissures, smooth plateaus
  voronoiCracked: (a, h, p) => {
    const f = p.density * 4
    const [f1, f2] = worley(a, h, f)
    const wall = 1 - smoothstep(0.0, 0.06, f2 - f1)
    return wall * 0.05 * p.lineThickness
  },

  // Dragon scales — anisotropic cells overlap like reptile skin
  voronoiScale: (a, h, p) => {
    const f = p.density * 3.5
    const [f1] = worley(a * 1.4, h * 0.55, f)
    return Math.pow(sat(1 - f1 * 1.25), 0.45) * 0.055 * p.lineThickness
  },

  // ══════════════════ SPIRAL — helical ribbons ══════════════════

  // Single continuous helical rib — clean sinusoidal cross-section
  spiralHelix: (a, h, p) => {
    const f = p.density * 6
    const t = a * 2 + h * f
    return punch(Math.sin(t), 0.45) * 0.055 * p.lineThickness
  },

  // Two interlocked counter-rotating helices
  spiralDouble: (a, h, p) => {
    const f = p.density * 5
    const s1 = Math.sin(a * 3 + h * f)
    const s2 = Math.sin(a * 3 - h * f)
    return punch(Math.max(s1, s2), 0.45) * 0.055 * p.lineThickness
  },

  // Wide flat ribbon — smooth plateau, sharp edges
  spiralRibbon: (a, h, p) => {
    const f = p.density * 4
    const v = Math.sin(a * 2 + h * f)
    return smoothstep(-0.25, 0.5, v) * 0.055 * p.lineThickness
  },

  // Accelerating spiral — frequency ramps toward top
  spiralTornado: (a, h, p) => {
    const f = p.density * 4
    const t = a * 4 + h * (f + h * 7)
    return punch(Math.sin(t), 0.55) * 0.055 * p.lineThickness
  },

  // DNA double helix with cross-rungs
  spiralDNA: (a, h, p) => {
    const f = p.density * 5.5
    const s1 = punch(Math.sin(a * 4 + h * f), 0.5)
    const s2 = punch(Math.sin(a * 4 + h * f + Math.PI), 0.5)
    const rung = smoothstep(0.8, 1.0, Math.abs(Math.sin(h * f * 4)))
    return (Math.max(sat(s1), sat(s2)) * 0.6 + rung * 0.4) * 0.055 * p.lineThickness
  },

  // ══════════════════ VERTICAL — architectural fluting ══════════════════

  // Classic architectural flutes — round-bottomed grooves
  verticalFlutes: (a, h, p) => {
    const v = Math.sin(a * p.density * 12)
    return (v * 0.5 + 0.5) * 0.05 * p.lineThickness
  },

  // Positive reeds — raised semi-circular columns
  verticalReeds: (a, h, p) => {
    const v = Math.sin(a * p.density * 10)
    return Math.pow(sat(v), 0.4) * 0.055 * p.lineThickness
  },

  // Crisp square-wave stripes with soft transition
  verticalStripes: (a, h, p) => {
    const v = Math.sin(a * p.density * 14)
    return smoothstep(-0.15, 0.2, v) * 0.045 * p.lineThickness
  },

  // Deep grooves between flat plateaus — smooth transition (no hard step)
  verticalGrooves: (a, h, p) => {
    const v = Math.sin(a * p.density * 8)
    return smoothstep(-0.1, 0.25, v) * 0.05 * p.lineThickness
  },

  // Reeds modulated by a slow horizontal sine wave
  verticalWaves: (a, h, p) => {
    const env = 0.65 + 0.35 * Math.cos(h * 5)
    const v   = Math.sin(a * p.density * 8) * env
    return Math.pow(sat(v), 0.45) * 0.055 * p.lineThickness
  },

  // ══════════════════ ORGANIC — natural flowing forms ══════════════════

  // Concentric ripples — properly centered, smooth amplitude
  organicRipples: (a, h, p) => {
    const d = Math.hypot(a - Math.PI, (h - 0.5) * TWO_PI)
    const wave = Math.sin(d * p.density * 5)
    return (wave * 0.5 + 0.5) * 0.045 * p.lineThickness
  },

  // Long ocean rollers modulated by gentle angular drift
  organicWaves: (a, h, p) => {
    const w = Math.sin(h * p.density * 5 + Math.sin(a * 1.5) * 0.7)
    return (w * 0.5 + 0.5) * 0.05 * p.lineThickness
  },

  // Organic cell field via 2-octave vnoise — controlled, not chaotic
  organicBlobs: (a, h, p) => {
    const n = vnoise(a * p.density * 2.2, h * p.density * 3.3) * 0.65
             + vnoise(a * p.density * 5,   h * p.density * 7)   * 0.35
    return smoothstep(0.38, 0.72, n) * 0.055 * p.lineThickness
  },

  // Branching ridges — directional vnoise bias gives tree-like structure
  organicCoral: (a, h, p) => {
    const n = fbm3(a * p.density * 2.5 + h * 1.5, h * p.density * 3.5)
    return Math.pow(sat(n * 1.4 - 0.1), 0.55) * 0.05 * p.lineThickness
  },

  // Petals in staggered radial rows with height-modulated envelope
  organicPetals: (a, h, p) => {
    const row   = Math.floor(h * p.density * 3) + 1
    const petal = Math.abs(Math.sin(a * row * 4))
    const env   = sat(Math.sin(h * p.density * 6 * Math.PI))
    return Math.pow(petal, 0.45) * env * 0.05 * p.lineThickness
  },

  // ══════════════════ LUXURY — ornate decoratives ══════════════════

  // Brocade fabric — interlocking ovals with gentle phase shift
  luxuryBrocade: (a, h, p) => {
    const f = p.density * 4
    const u = a * f + Math.sin(h * f * 1.5) * 0.4
    const v = h * f * 1.5
    const cell = punch(Math.abs(Math.sin(u)), 0.4) * punch(Math.abs(Math.sin(v)), 0.4)
    return cell * 0.05 * p.lineThickness
  },

  // Damask — large diamond frame with fine inner ornament
  luxuryDamask: (a, h, p) => {
    const f = p.density * 3
    const outer = sat(Math.abs(Math.sin(a * f)) + Math.abs(Math.sin(h * f * 2)) - 0.5) * 0.6
    const inner = punch(Math.abs(Math.sin(a * f * 3) * Math.sin(h * f * 4)), 0.5) * 0.4
    return (outer + inner) * 0.055 * p.lineThickness
  },

  // Floral rosette — 6-petal per cell with sharp petal boundary
  luxuryFloral: (a, h, p) => {
    const f = p.density * 2.5
    const u = tri(a * f * 1.5) - 0.5, v = tri(h * f * 1.5) - 0.5
    const r   = Math.hypot(u, v) * 2
    const ang = Math.atan2(v, u)
    const petals = 0.35 + 0.35 * Math.cos(ang * 6 + Math.PI)
    return sat(1 - smoothstep(petals - 0.05, petals + 0.12, r)) * 0.055 * p.lineThickness
  },

  // Medallion — double concentric rings per cell
  luxuryMedallion: (a, h, p) => {
    const f = p.density * 1.8
    const u = tri(a * f) - 0.5, v = tri(h * f * 1.5) - 0.5
    const r = Math.hypot(u, v) * 2
    const ring1 = sat(1 - Math.abs(r - 0.32) * 5)
    const ring2 = sat(1 - Math.abs(r - 0.68) * 5) * 0.55
    const center = sat(1 - r * 4) * 0.4
    return (ring1 + ring2 + center) * 0.055 * p.lineThickness
  },

  // Art Déco fans — chevrons expanding from waist, height-enveloped
  luxuryArtDeco: (a, h, p) => {
    const f  = p.density * 4
    const angle = a * f + h * 2
    const fan   = Math.abs(Math.sin(angle))
    const env   = sat(1.4 - Math.abs(h - 0.5) * 2.5)
    return Math.pow(sat(fan * env), 0.45) * 0.055 * p.lineThickness
  },

  // Peacock feather eyes — iris ring + dome per cell
  peacock: (a, h, p) => {
    const f = p.density * 2.5
    const u = tri(a * f * 1.2) - 0.5, v = tri(h * f) - 0.5
    const r   = Math.hypot(u, v) * 2
    const dome = sat(1 - r * 1.4)
    const iris = sat(1 - Math.abs(r - 0.38) * 7) * 0.45
    return (dome * 0.65 + iris) * 0.055 * p.lineThickness
  },

  // Moroccan 8-pointed star tiles — precise geometric tiling
  moroccanStar: (a, h, p) => {
    const f = p.density * 3
    const u = ((a * f) % 1 + 1) % 1 - 0.5
    const v = ((h * f * 1.5) % 1 + 1) % 1 - 0.5
    const r   = Math.hypot(u, v) * 2
    const ang = Math.atan2(v, u)
    // 8-pointed star radius varies with angle
    const starR = 0.28 + 0.22 * Math.abs(Math.cos(ang * 4))
    const body  = sat(1 - smoothstep(starR - 0.04, starR + 0.1, r))
    // Fine interlocking cross between tiles
    const cross = smoothstep(0.88, 1.0, 1 - Math.min(Math.abs(u) * 2.1, Math.abs(v) * 2.1))
    return sat(body + cross * 0.35) * 0.055 * p.lineThickness
  },

  // Asanoha — Japanese hemp leaf: 6-fold star-of-triangles
  asanoha: (a, h, p) => {
    const f = p.density * 3.2, s = 1.7320508
    const u = a * f, v = h * f * s
    // Three families of parallel lines in 60° steps create the 6-pointed star mesh
    const t1 = Math.abs(Math.sin(u * Math.PI))
    const t2 = Math.abs(Math.sin((u * 0.5 + v * 0.5) * Math.PI))
    const t3 = Math.abs(Math.sin((u * 0.5 - v * 0.5) * Math.PI))
    return Math.pow(Math.min(t1, t2, t3), 0.35) * 0.055 * p.lineThickness
  },

  // ══════════════════ MINIMAL — refined subtlety ══════════════════

  // Ultra-fine vertical hairlines — barely-there texture
  minimalLines: (a, h, p) => {
    const v = Math.sin(a * p.density * 20)
    return (v * 0.5 + 0.5) * 0.018 * p.lineThickness
  },

  // Hemisphere bump lattice — crisp small domes on a regular grid
  minimalDots: (a, h, p) => {
    const f = p.density * 5
    const u = tri(a * f) - 0.5, v = tri(h * f * 1.5) - 0.5
    const r = Math.hypot(u, v) * 2
    return sat(1 - smoothstep(0.28, 0.5, r)) * 0.03 * p.lineThickness
  },

  // Horizontal rings — evenly spaced, smooth cross-section
  minimalRings: (a, h, p) => {
    const v = Math.sin(h * p.density * 12 * Math.PI)
    return (v * 0.5 + 0.5) * 0.025 * p.lineThickness
  },

  // Micro grid — very discreet raised crosshatch
  minimalGrid: (a, h, p) => {
    const f = p.density * 6
    const u = tri(a * f), v = tri(h * f * 1.5)
    const edge = Math.max(Math.abs(u - 0.5), Math.abs(v - 0.5))
    return smoothstep(0.40, 0.50, edge) * 0.02 * p.lineThickness
  },

  // Corrugated — industrial fine sine ribbing
  corrugated: (a, h, p) => {
    const v = Math.sin(a * p.density * 24)
    return (v * 0.5 + 0.5) * 0.025 * p.lineThickness
  },

  // ══════════════════ GEOMETRIC — bold clean forms ══════════════════

  // Sharp upward-pointing chevrons
  geoChevron: (a, h, p) => {
    const t = a * p.density * 4 + Math.abs(h - 0.5) * p.density * 8
    return punch(Math.sin(t) * 0.5 + 0.5, 0.5) * 0.05 * p.lineThickness
  },

  // Triangular tile facets — smooth ramp within each tile
  geoTriangles: (a, h, p) => {
    const f = p.density * 4
    const u = tri(a * f + h * 0.5)
    return smoothstep(0.25, 0.75, u) * 0.048 * p.lineThickness
  },

  // Sawtooth zigzag — crisp diagonal bands
  geoZigzag: (a, h, p) => {
    const f = p.density * 5
    const t = tri(a * f + h * f * 0.5)
    return Math.pow(t, 0.7) * 0.048 * p.lineThickness
  },

  // Accordion pleats with height-modulated envelope
  geoPleats: (a, h, p) => {
    const v   = Math.abs(Math.sin(a * p.density * 10))
    const env = Math.pow(Math.sin(h * Math.PI), 0.6)
    return Math.pow(v, 0.3) * env * 0.055 * p.lineThickness
  },

  // Quantised triangular origami facets — 3 clean depth levels
  geoOrigami: (a, h, p) => {
    const f   = p.density * 3
    const t   = tri(a * f * 2 + h * f)
    const lvl = Math.floor(t * 3) / 3
    return lvl * 0.055 * p.lineThickness
  },

  // Crystalline shards — Voronoi F2-F1 raised ridges, sharp
  geoCrystalline: (a, h, p) => {
    const f = p.density * 3
    const [f1, f2] = worley(a * 1.4, h, f)
    return smoothstep(0.0, 0.14, f2 - f1) * 0.055 * p.lineThickness
  },

  // Celtic interlaced bands — alternating over/under weave
  celticKnot: (a, h, p) => {
    const f    = p.density * 3
    const b1   = Math.abs(Math.sin(a * f + h * f * Math.PI))
    const b2   = Math.abs(Math.sin(a * f - h * f * Math.PI))
    const over = Math.floor(a * f + h * f) & 1
    return smoothstep(0.52, 0.82, over ? b1 : b2) * 0.055 * p.lineThickness
  },

  // Carbon fiber — diagonal interlocking over/under weave
  carbonFiber: (a, h, p) => {
    const f  = p.density * 12
    const b1 = Math.pow(Math.abs(Math.sin((a + h * Math.PI) * f)), 0.5)
    const b2 = Math.pow(Math.abs(Math.sin((a - h * Math.PI) * f)), 0.5)
    const checker = (Math.floor(a * f * 0.5) + Math.floor(h * f * 0.5)) & 1
    const top = checker ? b1 : b2, bot = checker ? b2 : b1
    return (top * 0.75 + bot * 0.2) * 0.038 * p.lineThickness
  },

  // ══════════════════ NATURE — natural world ══════════════════

  // Cactus ribs — thick vertical semi-round columns
  cactusRibs: (a, h, p) => {
    const v = Math.sin(a * p.density * 6)
    return Math.pow(sat(v), 0.35) * 0.06 * p.lineThickness
  },

  // Fish scales — overlapping arc tiles, smooth dome (no hard cutoff)
  fishScale: (a, h, p) => {
    const rows   = Math.floor(h * p.density * 8)
    const offset = (rows & 1) * 0.5
    const u = tri(a * p.density * 10 + offset) - 0.5
    const v = ((h * p.density * 8) % 1 + 1) % 1 - 0.5
    const d = Math.hypot(u, v + 0.28)
    return Math.pow(sat(1 - d * 2.1), 0.55) * 0.055 * p.lineThickness
  },

  // Bamboo — vertical striations + horizontal node joints, balanced amplitude
  bamboo: (a, h, p) => {
    const strip = Math.pow(Math.abs(Math.sin(a * p.density * 8)), 0.4)
    const joint = Math.pow(Math.abs(Math.sin(h * p.density * 6 * Math.PI)), 7)
    return (strip * 0.65 + joint * 0.35) * 0.055 * p.lineThickness
  },

  // Tree bark — vertical vnoise bands give plank-like cracks without fbm chaos
  bark: (a, h, p) => {
    const n1 = vnoise(a * p.density * 3, h * p.density * 8)
    const n2 = vnoise(a * p.density * 7, h * p.density * 18) * 0.35
    return smoothstep(0.32, 0.65, n1 + n2 - 0.12) * 0.055 * p.lineThickness
  },

  // Ammonite fossil — logarithmic spiral concentric rings
  fossil: (a, h, p) => {
    const t    = a + h * 6
    const rings = Math.abs(Math.sin(t * p.density * 3.5))
    return Math.pow(rings, 0.5) * 0.048 * p.lineThickness
  },

  // Pinecone — Fibonacci phyllotaxis: two counter-rotating spiral families
  pinecone: (a, h, p) => {
    const s1  = Math.sin(a * p.density * 13 + h * 8 * Math.PI)
    const s2  = Math.sin(a * p.density * 21 - h * 8 * Math.PI)
    const env = Math.pow(Math.sin(h * Math.PI), 0.4)
    return punch(Math.max(s1, s2), 0.6) * env * 0.048 * p.lineThickness
  },

  // ══════════════════ WEAVE — interlaced structures ══════════════════

  // Basket weave — alternating over/under strips
  basketWeave: (a, h, p) => {
    const f     = p.density * 6
    const uCell = Math.floor(a * f * 2)
    const vCell = Math.floor(h * f * 3)
    const swap  = (uCell + vCell) & 1
    const strip = swap
      ? Math.abs(Math.sin(a * f * 2 * Math.PI))
      : Math.abs(Math.sin(h * f * 3 * Math.PI))
    return Math.pow(strip, 0.45) * 0.05 * p.lineThickness
  },

  // Rope — three braided helical strands
  rope: (a, h, p) => {
    const strands = 3
    let m = 0
    for (let k = 0; k < strands; k++) {
      const t = a * strands + h * p.density * 8 + (k * TWO_PI / strands)
      m = Math.max(m, Math.sin(t))
    }
    return Math.pow(sat(m), 0.4) * 0.055 * p.lineThickness
  },

  // Chainmail — two offset grids of interlocked rings
  chainmail: (a, h, p) => {
    const f   = p.density * 5
    const cx1 = tri(a * f) - 0.5,        cy1 = tri(h * f * 1.5) - 0.5
    const cx2 = tri(a * f + 0.5) - 0.5,  cy2 = tri(h * f * 1.5 + 0.5) - 0.5
    const r1  = Math.hypot(cx1, cy1) * 2, r2 = Math.hypot(cx2, cy2) * 2
    const ring1 = sat(1 - Math.abs(r1 - 0.58) * 7)
    const ring2 = sat(1 - Math.abs(r2 - 0.58) * 7)
    return Math.max(ring1, ring2) * 0.05 * p.lineThickness
  },

  // ══════════════════ ARCHITECTURAL — sculptural forms ══════════════════

  // Big sculptural horizontal waves — bold and bold
  bigWave: (a, h, p) => {
    const w = Math.sin(h * p.density * 4 + Math.sin(a * 2.5) * 1.1)
    return (w * 0.5 + 0.5) * 0.06 * p.lineThickness
  },

  // Standing wave interference — two source points, crisp rings
  interference: (a, h, p) => {
    const src1 = Math.hypot(a - Math.PI * 0.8, h * 3 - 0.6)
    const src2 = Math.hypot(a - Math.PI * 1.2, h * 3 - 2.4)
    const wave = Math.sin(src1 * p.density * 6) + Math.sin(src2 * p.density * 6)
    return sat(wave * 0.5 + 0.5) * 0.048 * p.lineThickness
  },

  // Isometric cubes — three-direction grid creates 3D cube illusion
  isoCubes: (a, h, p) => {
    const f  = p.density * 5, s = 1.7320508
    const l1 = Math.abs(Math.sin(h * f * 2))
    const l2 = Math.abs(Math.sin((a * s + h) * f))
    const l3 = Math.abs(Math.sin((a * s - h) * f))
    const base = Math.min(l1, l2, l3)
    const grid = smoothstep(0.65, 0.92, base)
    return grid * 0.055 * p.lineThickness
  },

  // Topographic — contour lines over gentle vnoise terrain
  topographic: (a, h, p) => {
    const f = p.density * 2
    const n = vnoise(a * f * 2.5, h * f * 3.5) * 0.7 + vnoise(a * f * 6, h * f * 9) * 0.3
    const levels  = 5
    const contour = ((n * levels) % 1 + 1) % 1
    return smoothstep(0.82, 0.97, contour) * 0.038 * p.lineThickness
  },
}

// ─── Mesh catalogue ───────────────────────────────────────────────
export const MESHES = [

  // ── DIAMOND ─────────────────────────────────────────────────────
  { id: 'diamond-classic',    name: 'Diamond Classic',    category: 'Diamond', pattern: 'diamondClassic',
    params: baseParams({ density: 1.2 }), printDiff: 'Medium', printTime: '4h 30m', lightTransp: 62, filament: '14g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Grade diagonal com facetas de gema lapidada.' },

  { id: 'diamond-crisscross', name: 'Crisscross Diamond', category: 'Diamond', pattern: 'diamondCrisscross',
    params: baseParams({ density: 1.0 }), printDiff: 'Medium', printTime: '5h 10m', lightTransp: 55, filament: '16g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Cristas em X profundas com vales simétricos.' },

  { id: 'diamond-star',       name: 'Star Diamond',       category: 'Diamond', pattern: 'diamondStar',
    params: baseParams({ density: 0.9 }), printDiff: 'Hard',   printTime: '6h 20m', lightTransp: 48, filament: '19g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Estrelas de seis pontas com bordas nítidas.' },

  { id: 'diamond-faceted',    name: 'Faceted Diamond',    category: 'Diamond', pattern: 'diamondFaceted',
    params: baseParams({ density: 1.4 }), printDiff: 'Hard',   printTime: '5h 45m', lightTransp: 50, filament: '18g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Cortes escalonados em 4 níveis — joia lapidada.' },

  { id: 'diamond-lattice',    name: 'Lattice Diamond',    category: 'Diamond', pattern: 'diamondLattice',
    params: baseParams({ density: 1.2 }), printDiff: 'Expert', printTime: '7h 15m', lightTransp: 44, filament: '22g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Arestas elevadas com células profundamente rebaixadas.' },

  { id: 'diamond-prism',      name: 'Prism Diamond',      category: 'Diamond', pattern: 'diamondPrism',
    params: baseParams({ density: 0.9 }), printDiff: 'Medium', printTime: '4h 50m', lightTransp: 58, filament: '15g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Prismas diagonais com corte em V escultórico.' },

  // ── HEXAGONAL ───────────────────────────────────────────────────
  { id: 'hex-honeycomb',      name: 'Honeycomb',          category: 'Hexagonal', pattern: 'hexHoneycomb',
    params: baseParams({ density: 1.0 }), printDiff: 'Easy',   printTime: '3h 40m', lightTransp: 68, filament: '12g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Colmeia real com paredes elevadas e interior plano.' },

  { id: 'hex-star',           name: 'Hex Star',           category: 'Hexagonal', pattern: 'hexStar',
    params: baseParams({ density: 0.9 }), printDiff: 'Medium', printTime: '4h 20m', lightTransp: 60, filament: '14g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Estrelas de seis pontas sobre grade hexagonal.' },

  { id: 'hex-triangle',       name: 'Hex Triangle',       category: 'Hexagonal', pattern: 'hexTriangle',
    params: baseParams({ density: 1.1 }), printDiff: 'Medium', printTime: '4h 45m', lightTransp: 56, filament: '15g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Tessellação triangular com três direções em 120°.' },

  { id: 'hex-weave',          name: 'Hex Weave',          category: 'Hexagonal', pattern: 'hexWeave',
    params: baseParams({ density: 1.1 }), printDiff: 'Hard',   printTime: '5h 30m', lightTransp: 52, filament: '17g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Hexágonos com domo central e grade fina de acento.' },

  // ── VORONOI ─────────────────────────────────────────────────────
  { id: 'voronoi-organic',    name: 'Voronoi Organic',    category: 'Voronoi', pattern: 'voronoiOrganic',
    params: baseParams({ density: 1.0 }), printDiff: 'Hard',   printTime: '6h 00m', lightTransp: 54, filament: '18g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Células Voronoi suaves com centros elevados.' },

  { id: 'voronoi-cells',      name: 'Voronoi Cells',      category: 'Voronoi', pattern: 'voronoiCells',
    params: baseParams({ density: 1.0 }), printDiff: 'Expert', printTime: '7h 30m', lightTransp: 46, filament: '21g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Bordas Voronoi em cristas afiadas entre células.' },

  { id: 'voronoi-cracked',    name: 'Cracked Voronoi',    category: 'Voronoi', pattern: 'voronoiCracked',
    params: baseParams({ density: 1.3 }), printDiff: 'Expert', printTime: '8h 00m', lightTransp: 40, filament: '24g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Esmalte rachado com fissuras Voronoi finas.' },

  { id: 'voronoi-scale',      name: 'Dragon Scale',       category: 'Voronoi', pattern: 'voronoiScale',
    params: baseParams({ density: 1.2 }), printDiff: 'Hard',   printTime: '6h 45m', lightTransp: 48, filament: '20g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Escamas anisotrópicas sobrepostas como réptil.' },

  // ── SPIRAL ──────────────────────────────────────────────────────
  { id: 'spiral-helix',       name: 'Helix Spiral',       category: 'Spiral', pattern: 'spiralHelix',
    params: baseParams({ density: 1.0 }), printDiff: 'Easy',   printTime: '3h 50m', lightTransp: 64, filament: '13g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Costela helicoidal contínua de secção sinusoidal.' },

  { id: 'spiral-double',      name: 'Double Helix',       category: 'Spiral', pattern: 'spiralDouble',
    params: baseParams({ density: 0.9 }), printDiff: 'Medium', printTime: '4h 30m', lightTransp: 58, filament: '15g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Dupla hélice com cruzamento em X limpo.' },

  { id: 'spiral-ribbon',      name: 'Ribbon Spiral',      category: 'Spiral', pattern: 'spiralRibbon',
    params: baseParams({ density: 1.0 }), printDiff: 'Medium', printTime: '5h 00m', lightTransp: 55, filament: '16g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Fita larga com platô plano e bordas suaves.' },

  { id: 'spiral-tornado',     name: 'Tornado',            category: 'Spiral', pattern: 'spiralTornado',
    params: baseParams({ density: 1.2 }), printDiff: 'Hard',   printTime: '6h 10m', lightTransp: 50, filament: '19g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Espiral com frequência crescente — efeito turbilhão.' },

  { id: 'spiral-dna',         name: 'DNA Spiral',         category: 'Spiral', pattern: 'spiralDNA',
    params: baseParams({ density: 1.2 }), printDiff: 'Hard',   printTime: '6h 30m', lightTransp: 48, filament: '20g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Dupla hélice com degraus transversais estilo DNA.' },

  // ── VERTICAL ────────────────────────────────────────────────────
  { id: 'vertical-flutes',    name: 'Fluted',             category: 'Vertical', pattern: 'verticalFlutes',
    params: baseParams({ density: 1.0 }), printDiff: 'Very Easy', printTime: '2h 50m', lightTransp: 72, filament: '10g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Estrias arquitetônicas com fundo redondo.' },

  { id: 'vertical-reeds',     name: 'Reeded',             category: 'Vertical', pattern: 'verticalReeds',
    params: baseParams({ density: 0.9 }), printDiff: 'Very Easy', printTime: '3h 00m', lightTransp: 70, filament: '11g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Junco em relevo positivo com topo arredondado.' },

  { id: 'vertical-stripes',   name: 'Striped',            category: 'Vertical', pattern: 'verticalStripes',
    params: baseParams({ density: 1.2 }), printDiff: 'Easy',   printTime: '3h 15m', lightTransp: 66, filament: '12g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Listras verticais com transição nítida.' },

  { id: 'vertical-grooves',   name: 'Grooved',            category: 'Vertical', pattern: 'verticalGrooves',
    params: baseParams({ density: 0.8 }), printDiff: 'Easy',   printTime: '3h 30m', lightTransp: 64, filament: '13g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Sulcos entre platôs planos sem descontinuidades.' },

  { id: 'vertical-waves',     name: 'Wave Stripes',       category: 'Vertical', pattern: 'verticalWaves',
    params: baseParams({ density: 1.0 }), printDiff: 'Medium', printTime: '4h 10m', lightTransp: 60, filament: '14g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Estrias moduladas por onda horizontal — efeito cesto.' },

  // ── ORGANIC ─────────────────────────────────────────────────────
  { id: 'organic-ripples',    name: 'Ripples',            category: 'Organic', pattern: 'organicRipples',
    params: baseParams({ density: 1.0 }), printDiff: 'Medium', printTime: '4h 50m', lightTransp: 56, filament: '16g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Ondas concêntricas saindo de um centro — gota n\'água.' },

  { id: 'organic-waves',      name: 'Ocean Waves',        category: 'Organic', pattern: 'organicWaves',
    params: baseParams({ density: 0.9 }), printDiff: 'Medium', printTime: '5h 00m', lightTransp: 54, filament: '17g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Ondas do mar com modulação angular suave.' },

  { id: 'organic-blobs',      name: 'Blob Organic',       category: 'Organic', pattern: 'organicBlobs',
    params: baseParams({ density: 0.9 }), printDiff: 'Hard',   printTime: '6h 00m', lightTransp: 50, filament: '18g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Células orgânicas em relevo — vnoise de 2 oitavas.' },

  { id: 'organic-coral',      name: 'Coral',              category: 'Organic', pattern: 'organicCoral',
    params: baseParams({ density: 1.1 }), printDiff: 'Expert', printTime: '7h 45m', lightTransp: 42, filament: '23g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Ramificações de coral em cristas diagonais.' },

  { id: 'organic-petals',     name: 'Petals',             category: 'Organic', pattern: 'organicPetals',
    params: baseParams({ density: 0.9 }), printDiff: 'Hard',   printTime: '6h 20m', lightTransp: 48, filament: '19g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Fileiras de pétalas com envelope de altura.' },

  // ── LUXURY ──────────────────────────────────────────────────────
  { id: 'luxury-brocade',     name: 'Brocade',            category: 'Luxury', pattern: 'luxuryBrocade',
    params: baseParams({ density: 1.0, rotation: 30 }), printDiff: 'Hard', printTime: '6h 50m', lightTransp: 46, filament: '21g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Brocado entalhado com ovaes entrelaçados.' },

  { id: 'luxury-damask',      name: 'Damask',             category: 'Luxury', pattern: 'luxuryDamask',
    params: baseParams({ density: 0.9 }), printDiff: 'Hard',   printTime: '7h 00m', lightTransp: 44, filament: '22g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Damasco clássico: moldura losangular + ornamento fino.' },

  { id: 'luxury-floral',      name: 'Floral Luxury',      category: 'Luxury', pattern: 'luxuryFloral',
    params: baseParams({ density: 0.9 }), printDiff: 'Expert', printTime: '8h 15m', lightTransp: 38, filament: '25g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Rosetas de seis pétalas com borda precisa.' },

  { id: 'luxury-medallion',   name: 'Medallion',          category: 'Luxury', pattern: 'luxuryMedallion',
    params: baseParams({ density: 0.8 }), printDiff: 'Expert', printTime: '8h 30m', lightTransp: 36, filament: '26g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Medalhões com dois anéis concêntricos e núcleo elevado.' },

  { id: 'luxury-artdeco',     name: 'Art Deco',           category: 'Luxury', pattern: 'luxuryArtDeco',
    params: baseParams({ density: 1.1 }), printDiff: 'Hard',   printTime: '6h 40m', lightTransp: 48, filament: '20g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Leques Art Déco com envelope de altura preciso.' },

  { id: 'luxury-peacock',     name: 'Peacock',            category: 'Luxury', pattern: 'peacock',
    params: baseParams({ density: 1.0 }), printDiff: 'Expert', printTime: '8h 45m', lightTransp: 40, filament: '25g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Olhos de pena de pavão com anel de íris.' },

  { id: 'luxury-moroccan',    name: 'Moroccan Star',      category: 'Luxury', pattern: 'moroccanStar',
    params: baseParams({ density: 0.9 }), printDiff: 'Expert', printTime: '9h 00m', lightTransp: 38, filament: '27g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Azulejo marroquino: estrela de 8 pontas com cruz entrelaçada.' },

  { id: 'luxury-asanoha',     name: 'Asanoha',            category: 'Luxury', pattern: 'asanoha',
    params: baseParams({ density: 1.0 }), printDiff: 'Expert', printTime: '8h 20m', lightTransp: 42, filament: '24g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Folha de cânhamo japonesa — malha triangular de 6 direções.' },

  // ── MINIMAL ─────────────────────────────────────────────────────
  { id: 'minimal-lines',      name: 'Fine Lines',         category: 'Minimal', pattern: 'minimalLines',
    params: baseParams({ density: 1.0 }), printDiff: 'Very Easy', printTime: '2h 40m', lightTransp: 74, filament: '10g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Linhas verticais ultrafinas — textura quase invisível.' },

  { id: 'minimal-dots',       name: 'Dot Grid',           category: 'Minimal', pattern: 'minimalDots',
    params: baseParams({ density: 1.0 }), printDiff: 'Easy',   printTime: '3h 20m', lightTransp: 68, filament: '12g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Grade regular de domos hemisféricos pequenos.' },

  { id: 'minimal-rings',      name: 'Rings',              category: 'Minimal', pattern: 'minimalRings',
    params: baseParams({ density: 0.9 }), printDiff: 'Easy',   printTime: '3h 10m', lightTransp: 70, filament: '11g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Anéis horizontais igualmente espaçados.' },

  { id: 'minimal-grid',       name: 'Micro Grid',         category: 'Minimal', pattern: 'minimalGrid',
    params: baseParams({ density: 1.0 }), printDiff: 'Easy',   printTime: '3h 35m', lightTransp: 66, filament: '12g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Malha cruzada fina e muito discreta.' },

  { id: 'minimal-corrugated', name: 'Corrugated',         category: 'Minimal', pattern: 'corrugated',
    params: baseParams({ density: 1.0 }), printDiff: 'Very Easy', printTime: '2h 55m', lightTransp: 70, filament: '10g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Ondulado industrial fino — estilo aço corrugado.' },

  // ── GEOMETRIC ───────────────────────────────────────────────────
  { id: 'geo-chevron',        name: 'Chevron',            category: 'Geometric', pattern: 'geoChevron',
    params: baseParams({ density: 1.0 }), printDiff: 'Medium', printTime: '4h 40m', lightTransp: 58, filament: '15g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'V apontando para cima em bandas repetidas e limpas.' },

  { id: 'geo-triangles',      name: 'Triangle Tile',      category: 'Geometric', pattern: 'geoTriangles',
    params: baseParams({ density: 1.1 }), printDiff: 'Medium', printTime: '5h 05m', lightTransp: 54, filament: '16g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Tessellação triangular com rampas suaves.' },

  { id: 'geo-zigzag',         name: 'Zigzag',             category: 'Geometric', pattern: 'geoZigzag',
    params: baseParams({ density: 1.3 }), printDiff: 'Medium', printTime: '4h 55m', lightTransp: 56, filament: '15g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Dentes de serra diagonais com cristas nítidas.' },

  { id: 'geo-pleats',         name: 'Pleats',             category: 'Geometric', pattern: 'geoPleats',
    params: baseParams({ density: 1.0 }), printDiff: 'Easy',   printTime: '3h 50m', lightTransp: 62, filament: '13g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Pregas sanfonadas que desvanecem topo e base.' },

  { id: 'geo-origami',        name: 'Origami',            category: 'Geometric', pattern: 'geoOrigami',
    params: baseParams({ density: 0.9 }), printDiff: 'Hard',   printTime: '6h 15m', lightTransp: 50, filament: '19g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Facetas triangulares em 3 níveis de profundidade.' },

  { id: 'geo-crystalline',    name: 'Crystalline',        category: 'Geometric', pattern: 'geoCrystalline',
    params: baseParams({ density: 1.0 }), printDiff: 'Hard',   printTime: '6h 00m', lightTransp: 52, filament: '18g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Cacos cristalinos com arestas Voronoi afiadas.' },

  { id: 'geo-celtic',         name: 'Celtic Knot',        category: 'Geometric', pattern: 'celticKnot',
    params: baseParams({ density: 1.0 }), printDiff: 'Hard',   printTime: '6h 30m', lightTransp: 50, filament: '19g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Nó celta com bandas alternantes sobre/sob.' },

  { id: 'geo-carbon',         name: 'Carbon Fiber',       category: 'Geometric', pattern: 'carbonFiber',
    params: baseParams({ density: 0.9 }), printDiff: 'Medium', printTime: '4h 20m', lightTransp: 60, filament: '14g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Trama diagonal de fibra de carbono — tech premium.' },

  { id: 'geo-isocubes',       name: 'Iso Cubes',          category: 'Geometric', pattern: 'isoCubes',
    params: baseParams({ density: 0.8 }), printDiff: 'Hard',   printTime: '5h 40m', lightTransp: 55, filament: '17g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Grade isométrica com ilusão de cubos em 3D.' },

  // ── NATURE ──────────────────────────────────────────────────────
  { id: 'nature-cactus',      name: 'Cactus Ribs',        category: 'Nature', pattern: 'cactusRibs',
    params: baseParams({ density: 1.0 }), printDiff: 'Very Easy', printTime: '2h 45m', lightTransp: 72, filament: '10g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Costelas verticais arredondadas inspiradas em cactos.' },

  { id: 'nature-fishscale',   name: 'Fish Scale',         category: 'Nature', pattern: 'fishScale',
    params: baseParams({ density: 1.0 }), printDiff: 'Hard',   printTime: '6h 40m', lightTransp: 50, filament: '19g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Escamas de peixe sobrepostas — domo suave, sem cortes.' },

  { id: 'nature-bamboo',      name: 'Bamboo',             category: 'Nature', pattern: 'bamboo',
    params: baseParams({ density: 1.0 }), printDiff: 'Easy',   printTime: '3h 30m', lightTransp: 64, filament: '13g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Estrias de bambu com nós horizontais equilibrados.' },

  { id: 'nature-bark',        name: 'Tree Bark',          category: 'Nature', pattern: 'bark',
    params: baseParams({ density: 1.0 }), printDiff: 'Expert', printTime: '7h 50m', lightTransp: 40, filament: '24g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Placas de casca com fissuras verticais controladas.' },

  { id: 'nature-fossil',      name: 'Ammonite',           category: 'Nature', pattern: 'fossil',
    params: baseParams({ density: 1.0 }), printDiff: 'Medium', printTime: '4h 40m', lightTransp: 58, filament: '15g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Anéis logarítmicos helicoidais — fóssil de amonita.' },

  { id: 'nature-pinecone',    name: 'Pinecone',           category: 'Nature', pattern: 'pinecone',
    params: baseParams({ density: 1.0 }), printDiff: 'Hard',   printTime: '6h 00m', lightTransp: 50, filament: '18g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Phyllotaxis de Fibonacci — duas espirais cruzadas.' },

  // ── WEAVE ───────────────────────────────────────────────────────
  { id: 'weave-basket',       name: 'Basket Weave',       category: 'Weave', pattern: 'basketWeave',
    params: baseParams({ density: 1.0 }), printDiff: 'Hard',   printTime: '6h 15m', lightTransp: 48, filament: '19g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Tiras alternadas sobre/sob — cesta artesanal.' },

  { id: 'weave-rope',         name: 'Rope Twist',         category: 'Weave', pattern: 'rope',
    params: baseParams({ density: 1.0 }), printDiff: 'Medium', printTime: '4h 55m', lightTransp: 56, filament: '16g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Três fios helicoidais trançados em corda.' },

  { id: 'weave-chainmail',    name: 'Chainmail',          category: 'Weave', pattern: 'chainmail',
    params: baseParams({ density: 1.1 }), printDiff: 'Expert', printTime: '8h 00m', lightTransp: 42, filament: '23g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Cota de malha com dois sistemas de anéis desfasados.' },

  // ── ARCHITECTURAL ────────────────────────────────────────────────
  { id: 'arch-bigwave',       name: 'Big Wave',           category: 'Architectural', pattern: 'bigWave',
    params: baseParams({ density: 0.8 }), printDiff: 'Medium', printTime: '4h 30m', lightTransp: 60, filament: '15g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Ondas esculturais largas com modulação angular.' },

  { id: 'arch-interference',  name: 'Interference',       category: 'Architectural', pattern: 'interference',
    params: baseParams({ density: 1.0 }), printDiff: 'Hard',   printTime: '5h 45m', lightTransp: 54, filament: '18g',
    vaseModeCompat: false, stdPrintCompat: true,  description: 'Interferência de duas fontes de onda concêntrica.' },

  { id: 'arch-topographic',   name: 'Topographic',        category: 'Architectural', pattern: 'topographic',
    params: baseParams({ density: 0.9 }), printDiff: 'Medium', printTime: '4h 10m', lightTransp: 62, filament: '14g',
    vaseModeCompat: true,  stdPrintCompat: true,  description: 'Curvas de nível sobre terreno vnoise — mapa topográfico.' },
]

export function getPattern(name) {
  return patterns[name] || null
}
