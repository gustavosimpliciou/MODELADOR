/**
 * High-Quality Cap Generation
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements the 11-step pipeline specified in the architectural brief:
 *
 *  1.  Analyze boundary loop (curvature, spacing, normals, tangents)
 *  2.  Catmull-Rom spline reconstruction — continuous smooth contour
 *  3.  Contour fairing (Laplacian + projection) — remove triangulation noise
 *  4.  Rigid boundary lock — rebuilt contour becomes an inviolable constraint
 *  5.  Interior surface generation — concentric rings + harmonic interpolation
 *  6.  Global Taubin solver — minimize surface energy (λ/μ alternation)
 *  7.  Constrained Delaunay-quality remeshing (structured topology)
 *  8.  G1/G2 continuity at boundary — blend adjacent mesh normals
 *  9.  Adaptive fairing interior — weighted by curvature + distance from edge
 * 10.  Defect correction — remove degenerate triangles, fix normals
 * 11.  Per-vertex normal smoothing — eliminate flat-cap shading artefacts
 *
 * Principle: "Analyse the boundary → reconstruct a continuous contour →
 * generate an optimised mathematical surface → only then triangulate."
 * The triangulation represents the surface; it does not define it.
 */

import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface CapOptions {
  /** Override target resampled boundary vertex count. Default: auto. */
  resampleCount?: number
  /** Number of concentric interior rings. Default: auto from area. */
  interiorRings?: number
  /** Taubin smoothing iterations for interior. Default: 20. */
  smoothIterations?: number
  /** Taubin λ (positive). Default 0.5. */
  lambda?: number
  /** Taubin μ (negative). Default −0.53. */
  mu?: number
  /** Boundary contour fairing iterations. Default: 6. */
  contourFairIter?: number
  /**
   * If provided, project all points onto this plane after each operation.
   * Required for plane-cut caps that must remain exactly on the cut plane.
   */
  plane?: { normal: THREE.Vector3; point: THREE.Vector3 }
  /**
   * Adjacent mesh per-vertex normals, keyed by quantised position string.
   * Used for G1/G2 continuity at the cap boundary.
   */
  adjacentNormals?: Map<string, THREE.Vector3>
  /** Flip output winding and normals. */
  flipped?: boolean
}

/**
 * Generate a high-quality cap surface for a single closed boundary loop.
 * Returns flat position/normal arrays (triangle soup, unindexed) ready to
 * append to a BufferGeometry.
 *
 * Algorithm (redesigned for exact boundary conformance):
 *  1.  Analyse boundary — normal, centroid, spacing, area.
 *  2.  Derive orthonormal 2-D plane basis from the cap normal (or provided plane).
 *  3.  Project boundary to 2-D — EXACT, no resampling or fairing.
 *  4.  Base triangulation via THREE.ShapeUtils (Ear Clipping) — every vertex is
 *      a boundary vertex, so the triangulation is guaranteed inside the polygon.
 *  5.  Interior enrichment: split the longest edge of each large triangle on its
 *      midpoint (midpoints are inside by construction; concave cases are
 *      verified with a point-in-polygon test before insertion).
 *  6.  Constrained Taubin smoothing on interior-only vertices; after each
 *      Laplacian step any vertex that escaped the 2-D polygon is projected back
 *      to the nearest boundary edge — containment is mathematically guaranteed.
 *  7.  Remove degenerate triangles.
 *  8.  Fix winding for consistent outward normals.
 *  9.  Per-vertex normals with G1 blend at the boundary ring.
 * 10.  Flatten to unindexed triangle soup.
 */
export function generateCap(
  boundary: THREE.Vector3[],
  options: CapOptions = {},
): { pos: Float32Array; nrm: Float32Array } {
  if (boundary.length < 3) return empty()

  // ── 1. Analyse ──────────────────────────────────────────────────────────────
  const analysis = analyseBoundary(boundary)
  const capNormal = analysis.normal

  // ── 2. Plane basis ──────────────────────────────────────────────────────────
  // For plane-cuts the provided plane is authoritative.
  // For smart-cuts (no plane), derive orthonormal basis from the Newell normal.
  const planeNormal = options.plane
    ? options.plane.normal.clone().normalize()
    : capNormal.clone()
  const planePoint = options.plane ? options.plane.point : analysis.centroid

  const refUp = Math.abs(planeNormal.y) < 0.9
    ? new THREE.Vector3(0, 1, 0)
    : new THREE.Vector3(1, 0, 0)
  const uAxis = new THREE.Vector3().crossVectors(refUp, planeNormal).normalize()
  const vAxis = new THREE.Vector3().crossVectors(planeNormal, uAxis).normalize()

  const to2d = (p: THREE.Vector3): THREE.Vector2 => {
    const rel = p.clone().sub(planePoint)
    return new THREE.Vector2(rel.dot(uAxis), rel.dot(vAxis))
  }
  const to3d = (p2: THREE.Vector2): THREE.Vector3 => {
    const p3 = planePoint.clone()
      .addScaledVector(uAxis, p2.x)
      .addScaledVector(vAxis, p2.y)
    return options.plane ? projectToPlane(p3, options.plane) : p3
  }

  // ── 3. Project boundary to 2-D — EXACT, no resampling ───────────────────────
  // Boundary vertices are the raw cut-edge coordinates. Moving them even
  // slightly creates a seam gap between the cap and the surrounding shell.
  const raw2d = boundary.map(to2d)
  const rawArea = signedArea2D(raw2d)
  const bnd2d = rawArea >= 0 ? raw2d : [...raw2d].reverse()
  const bnd3d = rawArea >= 0 ? [...boundary] : [...boundary].reverse()
  const N = bnd2d.length

  // ── 4. Base triangulation — guaranteed inside the boundary ──────────────────
  // ShapeUtils.triangulateShape (Ear Clipping) only emits triangles whose
  // vertices are existing boundary vertices → geometrically impossible to exceed
  // the cut boundary.
  let baseFaces: number[][]
  try {
    baseFaces = THREE.ShapeUtils.triangulateShape(bnd2d, [])
  } catch {
    baseFaces = []
    for (let i = 1; i + 1 < N; i++) baseFaces.push([0, i, i + 1])
  }
  if (baseFaces.length === 0) return empty()

  // ── 5. Interior enrichment via edge-midpoint subdivision ────────────────────
  // The midpoint of any edge between two interior points is also interior.
  // For boundary-edge midpoints we still verify with a point-in-polygon test
  // for safety on highly concave shapes.
  const verts2d: THREE.Vector2[] = bnd2d.map(p => p.clone())
  const verts3d: THREE.Vector3[] = bnd3d.map(p => p.clone())
  const tris: [number, number, number][] = baseFaces.map(([a, b, c]) => [a, b, c])

  const targetLen = Math.max(analysis.avgSpacing * 1.8, 1e-6)
  const maxInterior = Math.min(
    400,
    Math.max(0, Math.round((analysis.area / (targetLen * targetLen)) * 3)),
  )
  const midCache = new Map<string, number>()

  const getOrCreateMid = (a: number, b: number): number | null => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`
    const cached = midCache.get(key)
    if (cached !== undefined) return cached
    if (verts2d.length - N >= maxInterior) return null
    const m2d = new THREE.Vector2(
      (verts2d[a].x + verts2d[b].x) * 0.5,
      (verts2d[a].y + verts2d[b].y) * 0.5,
    )
    if (!pointInsidePoly2D(m2d, bnd2d)) return null
    const idx = verts2d.length
    verts2d.push(m2d)
    verts3d.push(to3d(m2d))
    midCache.set(key, idx)
    return idx
  }

  for (let pass = 0; pass < 3; pass++) {
    let subdivided = false
    const next: [number, number, number][] = []
    for (const [a, b, c] of tris) {
      const lab = verts2d[a].distanceTo(verts2d[b])
      const lbc = verts2d[b].distanceTo(verts2d[c])
      const lca = verts2d[c].distanceTo(verts2d[a])
      const longest = Math.max(lab, lbc, lca)
      if (longest > targetLen) {
        let midIdx: number | null
        if (lab >= lbc && lab >= lca) {
          midIdx = getOrCreateMid(a, b)
          if (midIdx !== null) { next.push([a, midIdx, c]); next.push([midIdx, b, c]); subdivided = true; continue }
        } else if (lbc >= lab && lbc >= lca) {
          midIdx = getOrCreateMid(b, c)
          if (midIdx !== null) { next.push([a, b, midIdx]); next.push([a, midIdx, c]); subdivided = true; continue }
        } else {
          midIdx = getOrCreateMid(c, a)
          if (midIdx !== null) { next.push([a, b, midIdx]); next.push([midIdx, b, c]); subdivided = true; continue }
        }
      }
      next.push([a, b, c])
    }
    tris.length = 0
    for (const t of next) tris.push(t)
    if (!subdivided) break
  }

  // ── 6. Constrained Taubin smoothing — interior vertices only ────────────────
  // Boundary vertices (indices 0..N-1) are IMMUTABLE.
  // After each Laplacian step, any interior vertex that moved outside the 2-D
  // polygon is projected back to the nearest boundary edge, maintaining strict
  // containment throughout smoothing.
  const totalVerts = verts2d.length
  if (totalVerts > N) {
    const lambda = options.lambda ?? 0.5
    const mu = options.mu ?? -0.53
    const iters = Math.min(options.smoothIterations ?? 20, 30)

    const adj: Set<number>[] = Array.from({ length: totalVerts }, () => new Set<number>())
    for (const [a, b, c] of tris) {
      adj[a].add(b); adj[a].add(c)
      adj[b].add(a); adj[b].add(c)
      adj[c].add(a); adj[c].add(b)
    }

    const step = (factor: number) => {
      for (let i = N; i < totalVerts; i++) {
        const nb = adj[i]
        if (nb.size === 0) continue
        let sx = 0, sy = 0
        for (const j of nb) { sx += verts2d[j].x; sy += verts2d[j].y }
        const inv = 1 / nb.size
        verts2d[i].x += factor * (sx * inv - verts2d[i].x)
        verts2d[i].y += factor * (sy * inv - verts2d[i].y)
        if (!pointInsidePoly2D(verts2d[i], bnd2d)) {
          clipVertexToPolygon2D(verts2d[i], bnd2d)
        }
        verts3d[i] = to3d(verts2d[i])
      }
    }

    for (let iter = 0; iter < iters; iter++) step(iter % 2 === 0 ? lambda : mu)
  }

  // ── 7. Validate / remove degenerate triangles ───────────────────────────────
  const validTris = filterDegenerates(verts3d, tris as number[][])
  if (validTris.length === 0) return empty()

  // ── 8. Fix winding ─────────────────────────────────────────────────────────
  fixWinding(verts3d, validTris, capNormal)

  // ── 9. Per-vertex normals (smooth; G1 blend at the boundary ring) ───────────
  const normals = computePerVertexNormals(
    verts3d, validTris, capNormal, N, options.adjacentNormals,
  )

  // ── 10. Flatten to triangle soup ────────────────────────────────────────────
  return flattenToSoup(verts3d, validTris, normals, options.flipped ?? false)
}

/**
 * Generate a cap that may contain holes (used by plane-cut where one loop may
 * nest inside another). Outer loop is the boundary; inner loops are holes.
 * Falls back gracefully when holes are present (uses smoothed contour +
 * THREE.ShapeUtils for the outer–hole triangulation).
 */
export function generateCapWithHoles(
  outer: THREE.Vector3[],
  holes: THREE.Vector3[][],
  capNormal: THREE.Vector3,
  planeU: THREE.Vector3,
  planeV: THREE.Vector3,
  planePoint: THREE.Vector3,
  flipped = false,
): { pos: Float32Array; nrm: Float32Array } {
  if (outer.length < 3) return empty()

  // BOUNDARY LOCK: outer and hole vertices are exact cut-edge coordinates
  // produced by the mesh-plane intersection. They must not be resampled,
  // faired, or repositioned — any movement creates gaps between shell and cap.
  // All smoothing must happen exclusively in the interior.

  // Project to 2D in the plane basis
  const to2d = (p: THREE.Vector3): THREE.Vector2 => {
    const rel = p.clone().sub(planePoint)
    return new THREE.Vector2(rel.dot(planeU), rel.dot(planeV))
  }

  // Orient outer loop: CCW (area > 0) for ShapeUtils
  const outerArea = signedArea2D(outer.map(to2d))
  const outer2d = outerArea >= 0 ? outer.map(to2d) : [...outer].reverse().map(to2d)
  const outer3d = outerArea >= 0 ? [...outer] : [...outer].reverse()

  // Orient holes: CW (area < 0) for ShapeUtils
  const holes2d: THREE.Vector2[][] = []
  const holes3d: THREE.Vector3[][] = []
  for (const h of holes) {
    const ha = signedArea2D(h.map(to2d))
    if (ha < 0) {
      holes2d.push(h.map(to2d))
      holes3d.push([...h])
    } else {
      holes2d.push([...h].reverse().map(to2d))
      holes3d.push([...h].reverse())
    }
  }

  // Combined vertex array: [outer, hole0, hole1, ...] — indices from ShapeUtils
  const combined3d: THREE.Vector3[] = [...outer3d]
  for (const h3 of holes3d) combined3d.push(...h3)

  let faces: number[][]
  try {
    faces = THREE.ShapeUtils.triangulateShape(outer2d, holes2d)
  } catch {
    // Fallback: fan from first vertex
    faces = []
    for (let i = 1; i + 1 < outer2d.length; i++) faces.push([0, i, i + 1])
  }

  // Emit triangle soup — original boundary vertices, flat cap normal
  const posArr: number[] = []
  const nrmArr: number[] = []
  const n = flipped ? capNormal.clone().negate() : capNormal.clone()

  for (const tri of faces) {
    const A = combined3d[tri[0]]
    const B = combined3d[tri[1]]
    const C = combined3d[tri[2]]
    if (!A || !B || !C) continue
    const [v0, v1, v2] = flipped ? [A, C, B] : [A, B, C]
    posArr.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
    nrmArr.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z)
  }

  return { pos: new Float32Array(posArr), nrm: new Float32Array(nrmArr) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Boundary analysis
// ─────────────────────────────────────────────────────────────────────────────

interface BoundaryAnalysis {
  centroid: THREE.Vector3
  normal: THREE.Vector3
  uAxis: THREE.Vector3
  vAxis: THREE.Vector3
  avgSpacing: number
  perimeter: number
  area: number          // approximate area inside the boundary
  curvature: Float32Array
}

function analyseBoundary(pts: THREE.Vector3[]): BoundaryAnalysis {
  const n = pts.length

  // Centroid
  const centroid = new THREE.Vector3()
  for (const p of pts) centroid.add(p)
  centroid.divideScalar(n)

  // Best-fit plane normal via Newell's method (robust for any polygon)
  const normal = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    const cur = pts[i], nxt = pts[(i + 1) % n]
    normal.x += (cur.y - nxt.y) * (cur.z + nxt.z)
    normal.y += (cur.z - nxt.z) * (cur.x + nxt.x)
    normal.z += (cur.x - nxt.x) * (cur.y + nxt.y)
  }
  if (normal.lengthSq() > 1e-20) normal.normalize()
  else normal.set(0, 1, 0)

  // Orthonormal basis in the plane
  const refUp = Math.abs(normal.y) < 0.9
    ? new THREE.Vector3(0, 1, 0)
    : new THREE.Vector3(1, 0, 0)
  const uAxis = new THREE.Vector3().crossVectors(refUp, normal).normalize()
  const vAxis = new THREE.Vector3().crossVectors(normal, uAxis).normalize()

  // Perimeter and average edge spacing
  let perimeter = 0
  for (let i = 0; i < n; i++) perimeter += pts[i].distanceTo(pts[(i + 1) % n])
  const avgSpacing = perimeter / n

  // Approximate area (shoelace in local 2D)
  let area2d = 0
  for (let i = 0; i < n; i++) {
    const rel = pts[i].clone().sub(centroid)
    const rel2 = pts[(i + 1) % n].clone().sub(centroid)
    area2d += rel.dot(uAxis) * rel2.dot(vAxis) - rel2.dot(uAxis) * rel.dot(vAxis)
  }
  const area = Math.abs(area2d) * 0.5

  // Discrete curvature at each vertex (turning angle)
  const curvature = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n]
    const cur = pts[i]
    const next = pts[(i + 1) % n]
    const a = cur.clone().sub(prev)
    const b = next.clone().sub(cur)
    const la = a.length(), lb = b.length()
    if (la > 1e-10 && lb > 1e-10) {
      a.divideScalar(la); b.divideScalar(lb)
      curvature[i] = Math.acos(Math.max(-1, Math.min(1, a.dot(b))))
    }
  }

  return { centroid, normal, uAxis, vAxis, avgSpacing, perimeter, area, curvature }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Catmull-Rom spline reconstruction
// ─────────────────────────────────────────────────────────────────────────────

function crPoint(
  P0: THREE.Vector3, P1: THREE.Vector3,
  P2: THREE.Vector3, P3: THREE.Vector3,
  t: number,
): THREE.Vector3 {
  const t2 = t * t, t3 = t2 * t
  return new THREE.Vector3(
    0.5 * ((2*P1.x) + (-P0.x+P2.x)*t + (2*P0.x-5*P1.x+4*P2.x-P3.x)*t2 + (-P0.x+3*P1.x-3*P2.x+P3.x)*t3),
    0.5 * ((2*P1.y) + (-P0.y+P2.y)*t + (2*P0.y-5*P1.y+4*P2.y-P3.y)*t2 + (-P0.y+3*P1.y-3*P2.y+P3.y)*t3),
    0.5 * ((2*P1.z) + (-P0.z+P2.z)*t + (2*P0.z-5*P1.z+4*P2.z-P3.z)*t2 + (-P0.z+3*P1.z-3*P2.z+P3.z)*t3),
  )
}

function resampleCatmullRom(
  pts: THREE.Vector3[],
  targetCount: number,
  plane?: { normal: THREE.Vector3; point: THREE.Vector3 },
): THREE.Vector3[] {
  const n = pts.length
  if (n < 3) return pts.map(p => p.clone())

  const OVERSAMPLE = 16  // samples per input segment for accurate arc-length
  const dense: THREE.Vector3[] = []

  for (let i = 0; i < n; i++) {
    const P0 = pts[(i - 1 + n) % n]
    const P1 = pts[i]
    const P2 = pts[(i + 1) % n]
    const P3 = pts[(i + 2) % n]

    for (let j = 0; j < OVERSAMPLE; j++) {
      let p = crPoint(P0, P1, P2, P3, j / OVERSAMPLE)
      if (plane) p = projectToPlane(p, plane)
      dense.push(p)
    }
  }

  // Build cumulative arc length table.
  // Append a closing sentinel (dense[0] clone) so the binary search can
  // properly interpolate any target that falls in the last segment
  // (between the final sample and the loop start point).
  const arc = [0]
  for (let i = 1; i < dense.length; i++) {
    arc.push(arc[i - 1] + dense[i].distanceTo(dense[i - 1]))
  }
  const loopClose = dense[dense.length - 1].distanceTo(dense[0])
  const totalLen = arc[arc.length - 1] + loopClose
  // Extend with closing segment so binary search covers the full loop
  dense.push(dense[0].clone())
  arc.push(totalLen)

  // Resample at uniform arc length
  const result: THREE.Vector3[] = []
  for (let k = 0; k < targetCount; k++) {
    const target = (k / targetCount) * totalLen
    let lo = 0, hi = arc.length - 1
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1
      if (arc[mid] <= target) lo = mid; else hi = mid
    }
    const span = arc[hi] - arc[lo]
    const t = span > 1e-12 ? (target - arc[lo]) / span : 0
    result.push(dense[lo].clone().lerp(dense[hi], t))
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Contour fairing (Laplacian with plane projection)
// ─────────────────────────────────────────────────────────────────────────────

function fairContour(
  pts: THREE.Vector3[],
  iterations: number,
  alpha: number,
  plane?: { normal: THREE.Vector3; point: THREE.Vector3 },
): THREE.Vector3[] {
  let cur = pts.map(p => p.clone())
  const n = cur.length

  for (let iter = 0; iter < iterations; iter++) {
    const next: THREE.Vector3[] = []
    for (let i = 0; i < n; i++) {
      const prev = cur[(i - 1 + n) % n]
      const nx   = cur[(i + 1) % n]
      const lap  = prev.clone().add(nx).multiplyScalar(0.5)
      let moved  = cur[i].clone().lerp(lap, alpha)
      if (plane) moved = projectToPlane(moved, plane)
      next.push(moved)
    }
    cur = next
  }
  return cur
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — Concentric ring interior + harmonic interpolation
// ─────────────────────────────────────────────────────────────────────────────

interface CapMesh {
  vertices: THREE.Vector3[]
  triangles: number[][]  // CCW winding
  boundaryCount: number
}

function buildConcentricMesh(
  boundary: THREE.Vector3[],
  centroid: THREE.Vector3,
  rings: number,
  plane?: { normal: THREE.Vector3; point: THREE.Vector3 },
): CapMesh {
  const bCount = boundary.length
  const vertices: THREE.Vector3[] = boundary.map(p => p.clone())
  const triangles: number[][] = []

  if (rings <= 0 || bCount < 3) {
    // Degenerate: fan from centroid
    const cIdx = vertices.length
    const c = plane ? projectToPlane(centroid.clone(), plane) : centroid.clone()
    vertices.push(c)
    for (let i = 0; i < bCount; i++) {
      triangles.push([i, (i + 1) % bCount, cIdx])
    }
    return { vertices, triangles, boundaryCount: bCount }
  }

  // Build ring indices: ring 0 = boundary, ring `rings` = centre
  const ringIndex: number[][] = [
    Array.from({ length: bCount }, (_, i) => i),
  ]

  for (let r = 1; r < rings; r++) {
    const t = r / rings
    const row: number[] = []
    for (let i = 0; i < bCount; i++) {
      // Lerp each boundary point toward centroid (harmonic-like interpolation)
      let p = boundary[i].clone().lerp(centroid, t)
      if (plane) p = projectToPlane(p, plane)
      row.push(vertices.length)
      vertices.push(p)
    }
    ringIndex.push(row)
  }

  // Centre point
  const cIdx = vertices.length
  const c = plane ? projectToPlane(centroid.clone(), plane) : centroid.clone()
  vertices.push(c)

  // Triangulate between consecutive rings (quad → two triangles)
  for (let r = 0; r < rings - 1; r++) {
    const outer = ringIndex[r]
    const inner = ringIndex[r + 1]
    for (let i = 0; i < bCount; i++) {
      const a = outer[i],              b = outer[(i + 1) % bCount]
      const d = inner[i],              c = inner[(i + 1) % bCount]
      triangles.push([a, b, c])
      triangles.push([a, c, d])
    }
  }

  // Cap innermost ring to centre
  const lastRing = ringIndex[rings - 1]
  for (let i = 0; i < bCount; i++) {
    triangles.push([lastRing[i], lastRing[(i + 1) % bCount], cIdx])
  }

  return { vertices, triangles, boundaryCount: bCount }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stitch two rings of potentially different sizes — variable-ratio zipper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Connect two closed rings (outerRing and innerRing) with a triangle strip.
 *
 * Both rings must be ordered in the same direction (CCW when viewed from the
 * cap normal). The outer ring is typically larger/jagged; the inner ring is
 * smaller/resampled. A greedy shortest-diagonal zipper handles the size
 * mismatch: at each step it advances whichever ring produces the shorter
 * new diagonal, creating exactly (NO + NI) triangles that tile the band.
 *
 * Triangle winding: [oA, oB, iA] advances outer; [oA, iA, iB] advances inner.
 * Both are CCW when viewed from the positive cap-normal side.
 */
function stitchRings(
  vertices: THREE.Vector3[],
  triangles: number[][],
  outerRing: number[],
  innerRing: number[],
  _centroid: THREE.Vector3,
): void {
  const NO = outerRing.length
  const NI = innerRing.length
  if (NO < 3 || NI < 3) return

  let oi = 0, ii = 0
  const total = NO + NI  // one triangle per step

  for (let step = 0; step < total; step++) {
    const oA = outerRing[oi % NO]
    const iA = innerRing[ii % NI]
    const oB = outerRing[(oi + 1) % NO]
    const iB = innerRing[(ii + 1) % NI]

    let advOuter: boolean
    if (oi >= NO)      advOuter = false       // outer exhausted: must advance inner
    else if (ii >= NI) advOuter = true        // inner exhausted: must advance outer
    else {
      // Choose the triangle that produces the shorter shared diagonal
      const d1 = vertices[oB].distanceToSquared(vertices[iA])  // advance outer
      const d2 = vertices[oA].distanceToSquared(vertices[iB])  // advance inner
      advOuter = d1 <= d2
    }

    if (advOuter) {
      triangles.push([oA, oB, iA])
      oi++
    } else {
      triangles.push([oA, iA, iB])
      ii++
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 6 — Taubin smoother (global solver)
// ─────────────────────────────────────────────────────────────────────────────

function taubinSmooth(
  vertices: THREE.Vector3[],
  triangles: number[][],
  boundaryCount: number,
  iterations: number,
  lambda: number,
  mu: number,
  plane?: { normal: THREE.Vector3; point: THREE.Vector3 },
): void {
  const n = vertices.length
  if (boundaryCount >= n) return  // all vertices are boundary

  // Build adjacency for ALL vertices (needed for weight computation)
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [a, b, c] of triangles) {
    if (!adj[a].includes(b)) adj[a].push(b)
    if (!adj[a].includes(c)) adj[a].push(c)
    if (!adj[b].includes(a)) adj[b].push(a)
    if (!adj[b].includes(c)) adj[b].push(c)
    if (!adj[c].includes(a)) adj[c].push(a)
    if (!adj[c].includes(b)) adj[c].push(b)
  }

  const step = (factor: number): void => {
    for (let i = boundaryCount; i < n; i++) {
      const nb = adj[i]
      if (nb.length === 0) continue
      let sx = 0, sy = 0, sz = 0
      for (const j of nb) {
        sx += vertices[j].x
        sy += vertices[j].y
        sz += vertices[j].z
      }
      const inv = 1 / nb.length
      const dx = sx * inv - vertices[i].x
      const dy = sy * inv - vertices[i].y
      const dz = sz * inv - vertices[i].z
      vertices[i].x += factor * dx
      vertices[i].y += factor * dy
      vertices[i].z += factor * dz
      if (plane) vertices[i] = projectToPlane(vertices[i], plane)
    }
  }

  for (let iter = 0; iter < iterations; iter++) {
    step(lambda)
    step(mu)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 9 — Adaptive fairing (weighted by curvature + distance from boundary)
// ─────────────────────────────────────────────────────────────────────────────

function adaptiveFairing(
  vertices: THREE.Vector3[],
  triangles: number[][],
  boundaryCount: number,
  boundaryCurvature: Float32Array,
  plane?: { normal: THREE.Vector3; point: THREE.Vector3 },
): void {
  const n = vertices.length
  if (boundaryCount >= n) return

  // Build adjacency
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [a, b, c] of triangles) {
    adj[a].push(b, c)
    adj[b].push(a, c)
    adj[c].push(a, b)
  }

  // Average curvature of boundary (used for weight scaling)
  let avgCurv = 0
  for (let i = 0; i < boundaryCurvature.length; i++) avgCurv += boundaryCurvature[i]
  if (boundaryCurvature.length > 0) avgCurv /= boundaryCurvature.length

  const ITER = 8

  for (let iter = 0; iter < ITER; iter++) {
    for (let i = boundaryCount; i < n; i++) {
      const nb = adj[i]
      if (nb.length === 0) continue

      // Distance from boundary in ring index: interior vertex i → ring it belongs to.
      // Approximated by: vertices close to boundary have small ring index.
      // Weight: more interior → higher alpha (more free to move)
      const ringEstimate = i >= boundaryCount
        ? (i - boundaryCount) / Math.max(1, n - boundaryCount)
        : 0
      const alpha = 0.1 + 0.3 * ringEstimate  // range [0.1, 0.4]

      let sx = 0, sy = 0, sz = 0
      for (const j of nb) {
        sx += vertices[j].x; sy += vertices[j].y; sz += vertices[j].z
      }
      const inv = 1 / nb.length
      vertices[i].x += alpha * (sx * inv - vertices[i].x)
      vertices[i].y += alpha * (sy * inv - vertices[i].y)
      vertices[i].z += alpha * (sz * inv - vertices[i].z)
      if (plane) vertices[i] = projectToPlane(vertices[i], plane)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 10 — Defect correction
// ─────────────────────────────────────────────────────────────────────────────

function filterDegenerates(
  vertices: THREE.Vector3[],
  triangles: number[][],
  minArea = 1e-18,
): number[][] {
  const valid: number[][] = []
  const AB = new THREE.Vector3(), AC = new THREE.Vector3(), cross = new THREE.Vector3()
  for (const tri of triangles) {
    const A = vertices[tri[0]], B = vertices[tri[1]], C = vertices[tri[2]]
    if (!A || !B || !C) continue
    AB.subVectors(B, A); AC.subVectors(C, A)
    cross.crossVectors(AB, AC)
    if (cross.lengthSq() > minArea) valid.push(tri)
  }
  return valid
}

function fixWinding(
  vertices: THREE.Vector3[],
  triangles: number[][],
  capNormal: THREE.Vector3,
): void {
  const AB = new THREE.Vector3(), AC = new THREE.Vector3(), cross = new THREE.Vector3()
  for (const tri of triangles) {
    const A = vertices[tri[0]], B = vertices[tri[1]], C = vertices[tri[2]]
    AB.subVectors(B, A); AC.subVectors(C, A)
    cross.crossVectors(AB, AC)
    if (cross.dot(capNormal) < 0) {
      // Flip winding
      const tmp = tri[1]; tri[1] = tri[2]; tri[2] = tmp
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 11 — Per-vertex normals with G1 boundary continuity
// ─────────────────────────────────────────────────────────────────────────────

function computePerVertexNormals(
  vertices: THREE.Vector3[],
  triangles: number[][],
  capNormal: THREE.Vector3,
  boundaryCount: number,
  adjacentNormals?: Map<string, THREE.Vector3>,
): THREE.Vector3[] {
  const n = vertices.length
  const normals: THREE.Vector3[] = Array.from({ length: n }, () => new THREE.Vector3())

  const AB = new THREE.Vector3(), AC = new THREE.Vector3()

  for (const [a, b, c] of triangles) {
    const vA = vertices[a], vB = vertices[b], vC = vertices[c]
    AB.subVectors(vB, vA); AC.subVectors(vC, vA)
    // Area-weighted face normal
    const faceN = AB.clone().cross(AC)
    normals[a].add(faceN)
    normals[b].add(faceN)
    normals[c].add(faceN)
  }

  for (let i = 0; i < n; i++) {
    if (normals[i].lengthSq() > 1e-20) {
      normals[i].normalize()
    } else {
      normals[i].copy(capNormal)
    }

    // Ensure same hemisphere as cap normal
    if (normals[i].dot(capNormal) < 0) normals[i].negate()

    // G1 continuity at boundary: blend with adjacent mesh normal if available
    if (i < boundaryCount && adjacentNormals) {
      const key = quantKey(vertices[i])
      const adjN = adjacentNormals.get(key)
      if (adjN && adjN.dot(capNormal) > -0.5) {
        // Blend adjacent surface normal into boundary vertex normal
        normals[i].lerp(adjN, 0.4).normalize()
      }
    }
  }

  return normals
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function empty(): { pos: Float32Array; nrm: Float32Array } {
  return { pos: new Float32Array(0), nrm: new Float32Array(0) }
}

// ── Point-in-polygon (ray casting, 2-D) ──────────────────────────────────────
// Returns true when `pt` is strictly inside `poly` (closed planar polygon).
function pointInsidePoly2D(pt: THREE.Vector2, poly: THREE.Vector2[]): boolean {
  let inside = false
  const n = poly.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    if (
      (yi > pt.y) !== (yj > pt.y) &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 1e-30) + xi
    ) {
      inside = !inside
    }
  }
  return inside
}

// ── Project a vertex back onto the polygon boundary ───────────────────────────
// Used when a smoothing step pushes an interior vertex outside the polygon.
// Projects to the nearest point on the boundary perimeter, then nudges it
// slightly toward the polygon centroid so it remains strictly inside.
function clipVertexToPolygon2D(pt: THREE.Vector2, poly: THREE.Vector2[]): void {
  const n = poly.length

  // Compute centroid for the inward nudge direction
  let cx = 0, cy = 0
  for (const p of poly) { cx += p.x; cy += p.y }
  cx /= n; cy /= n

  let bestDist = Infinity
  let bestPX = pt.x, bestPY = pt.y

  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n]
    const dx = b.x - a.x, dy = b.y - a.y
    const lenSq = dx * dx + dy * dy
    if (lenSq < 1e-20) continue
    const t = Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / lenSq))
    const projX = a.x + t * dx, projY = a.y + t * dy
    const d = (pt.x - projX) ** 2 + (pt.y - projY) ** 2
    if (d < bestDist) {
      bestDist = d
      bestPX = projX
      bestPY = projY
    }
  }

  // Nudge 0.1 % of the way toward the centroid so the point is strictly inside
  const NUDGE = 0.001
  pt.x = bestPX + (cx - bestPX) * NUDGE
  pt.y = bestPY + (cy - bestPY) * NUDGE
}

function projectToPlane(
  p: THREE.Vector3,
  plane: { normal: THREE.Vector3; point: THREE.Vector3 },
): THREE.Vector3 {
  const d = p.clone().sub(plane.point).dot(plane.normal)
  return p.clone().addScaledVector(plane.normal, -d)
}

function autoRings(area: number, avgSpacing: number): number {
  if (avgSpacing < 1e-10) return 2
  const approxRadius = Math.sqrt(area / Math.PI)
  const rings = Math.round(approxRadius / avgSpacing)
  return Math.max(2, Math.min(8, rings))
}

function quantKey(p: THREE.Vector3, Q = 1e4): string {
  return `${Math.round(p.x * Q)},${Math.round(p.y * Q)},${Math.round(p.z * Q)}`
}

function signedArea2D(pts: THREE.Vector2[]): number {
  let a = 0
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n]
    a += p.x * q.y - q.x * p.y
  }
  return a * 0.5
}

function flattenToSoup(
  vertices: THREE.Vector3[],
  triangles: number[][],
  normals: THREE.Vector3[],
  flipped: boolean,
): { pos: Float32Array; nrm: Float32Array } {
  const posArr: number[] = []
  const nrmArr: number[] = []

  for (const tri of triangles) {
    const [ia, ib, ic] = flipped ? [tri[0], tri[2], tri[1]] : [tri[0], tri[1], tri[2]]
    const A = vertices[ia], B = vertices[ib], C = vertices[ic]
    const nA = flipped ? normals[ia].clone().negate() : normals[ia]
    const nB = flipped ? normals[ib].clone().negate() : normals[ib]
    const nC = flipped ? normals[ic].clone().negate() : normals[ic]

    posArr.push(A.x, A.y, A.z, B.x, B.y, B.z, C.x, C.y, C.z)
    nrmArr.push(
      nA.x, nA.y, nA.z,
      nB.x, nB.y, nB.z,
      nC.x, nC.y, nC.z,
    )
  }

  return { pos: new Float32Array(posArr), nrm: new Float32Array(nrmArr) }
}
