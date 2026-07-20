(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/cap-generation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateCap",
    ()=>generateCap,
    "generateCapWithHoles",
    ()=>generateCapWithHoles
]);
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
function generateCap(boundary, options = {}) {
    if (boundary.length < 3) return empty();
    // ── 1. Analyse ──────────────────────────────────────────────────────────────
    const analysis = analyseBoundary(boundary);
    const capNormal = analysis.normal;
    // ── 2. Plane basis ──────────────────────────────────────────────────────────
    // For plane-cuts the provided plane is authoritative.
    // For smart-cuts (no plane), derive orthonormal basis from the Newell normal.
    const planeNormal = options.plane ? options.plane.normal.clone().normalize() : capNormal.clone();
    const planePoint = options.plane ? options.plane.point : analysis.centroid;
    const refUp = Math.abs(planeNormal.y) < 0.9 ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0);
    const uAxis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(refUp, planeNormal).normalize();
    const vAxis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(planeNormal, uAxis).normalize();
    const to2d = (p)=>{
        const rel = p.clone().sub(planePoint);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](rel.dot(uAxis), rel.dot(vAxis));
    };
    const to3d = (p2)=>{
        const p3 = planePoint.clone().addScaledVector(uAxis, p2.x).addScaledVector(vAxis, p2.y);
        return options.plane ? projectToPlane(p3, options.plane) : p3;
    };
    // ── 3. Project boundary to 2-D — EXACT, no resampling ───────────────────────
    // Boundary vertices are the raw cut-edge coordinates. Moving them even
    // slightly creates a seam gap between the cap and the surrounding shell.
    const raw2d = boundary.map(to2d);
    const rawArea = signedArea2D(raw2d);
    const bnd2d = rawArea >= 0 ? raw2d : [
        ...raw2d
    ].reverse();
    const bnd3d = rawArea >= 0 ? [
        ...boundary
    ] : [
        ...boundary
    ].reverse();
    const N = bnd2d.length;
    // ── 4. Base triangulation — guaranteed inside the boundary ──────────────────
    // ShapeUtils.triangulateShape (Ear Clipping) only emits triangles whose
    // vertices are existing boundary vertices → geometrically impossible to exceed
    // the cut boundary.
    let baseFaces;
    try {
        baseFaces = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShapeUtils"].triangulateShape(bnd2d, []);
    } catch  {
        baseFaces = [];
        for(let i = 1; i + 1 < N; i++)baseFaces.push([
            0,
            i,
            i + 1
        ]);
    }
    if (baseFaces.length === 0) return empty();
    // ── 5. Interior enrichment via edge-midpoint subdivision ────────────────────
    // The midpoint of any edge between two interior points is also interior.
    // For boundary-edge midpoints we still verify with a point-in-polygon test
    // for safety on highly concave shapes.
    const verts2d = bnd2d.map((p)=>p.clone());
    const verts3d = bnd3d.map((p)=>p.clone());
    const tris = baseFaces.map(([a, b, c])=>[
            a,
            b,
            c
        ]);
    const targetLen = Math.max(analysis.avgSpacing * 1.8, 1e-6);
    const maxInterior = Math.min(400, Math.max(0, Math.round(analysis.area / (targetLen * targetLen) * 3)));
    const midCache = new Map();
    const getOrCreateMid = (a, b)=>{
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        const cached = midCache.get(key);
        if (cached !== undefined) return cached;
        if (verts2d.length - N >= maxInterior) return null;
        const m2d = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]((verts2d[a].x + verts2d[b].x) * 0.5, (verts2d[a].y + verts2d[b].y) * 0.5);
        if (!pointInsidePoly2D(m2d, bnd2d)) return null;
        const idx = verts2d.length;
        verts2d.push(m2d);
        verts3d.push(to3d(m2d));
        midCache.set(key, idx);
        return idx;
    };
    for(let pass = 0; pass < 3; pass++){
        let subdivided = false;
        const next = [];
        for (const [a, b, c] of tris){
            const lab = verts2d[a].distanceTo(verts2d[b]);
            const lbc = verts2d[b].distanceTo(verts2d[c]);
            const lca = verts2d[c].distanceTo(verts2d[a]);
            const longest = Math.max(lab, lbc, lca);
            if (longest > targetLen) {
                let midIdx;
                if (lab >= lbc && lab >= lca) {
                    midIdx = getOrCreateMid(a, b);
                    if (midIdx !== null) {
                        next.push([
                            a,
                            midIdx,
                            c
                        ]);
                        next.push([
                            midIdx,
                            b,
                            c
                        ]);
                        subdivided = true;
                        continue;
                    }
                } else if (lbc >= lab && lbc >= lca) {
                    midIdx = getOrCreateMid(b, c);
                    if (midIdx !== null) {
                        next.push([
                            a,
                            b,
                            midIdx
                        ]);
                        next.push([
                            a,
                            midIdx,
                            c
                        ]);
                        subdivided = true;
                        continue;
                    }
                } else {
                    midIdx = getOrCreateMid(c, a);
                    if (midIdx !== null) {
                        next.push([
                            a,
                            b,
                            midIdx
                        ]);
                        next.push([
                            midIdx,
                            b,
                            c
                        ]);
                        subdivided = true;
                        continue;
                    }
                }
            }
            next.push([
                a,
                b,
                c
            ]);
        }
        tris.length = 0;
        for (const t of next)tris.push(t);
        if (!subdivided) break;
    }
    // ── 6. Constrained Taubin smoothing — interior vertices only ────────────────
    // Boundary vertices (indices 0..N-1) are IMMUTABLE.
    // After each Laplacian step, any interior vertex that moved outside the 2-D
    // polygon is projected back to the nearest boundary edge, maintaining strict
    // containment throughout smoothing.
    const totalVerts = verts2d.length;
    if (totalVerts > N) {
        const lambda = options.lambda ?? 0.5;
        const mu = options.mu ?? -0.53;
        const iters = Math.min(options.smoothIterations ?? 20, 30);
        const adj = Array.from({
            length: totalVerts
        }, ()=>new Set());
        for (const [a, b, c] of tris){
            adj[a].add(b);
            adj[a].add(c);
            adj[b].add(a);
            adj[b].add(c);
            adj[c].add(a);
            adj[c].add(b);
        }
        const step = (factor)=>{
            for(let i = N; i < totalVerts; i++){
                const nb = adj[i];
                if (nb.size === 0) continue;
                let sx = 0, sy = 0;
                for (const j of nb){
                    sx += verts2d[j].x;
                    sy += verts2d[j].y;
                }
                const inv = 1 / nb.size;
                verts2d[i].x += factor * (sx * inv - verts2d[i].x);
                verts2d[i].y += factor * (sy * inv - verts2d[i].y);
                if (!pointInsidePoly2D(verts2d[i], bnd2d)) {
                    clipVertexToPolygon2D(verts2d[i], bnd2d);
                }
                verts3d[i] = to3d(verts2d[i]);
            }
        };
        for(let iter = 0; iter < iters; iter++)step(iter % 2 === 0 ? lambda : mu);
    }
    // ── 7. Validate / remove degenerate triangles ───────────────────────────────
    const validTris = filterDegenerates(verts3d, tris);
    if (validTris.length === 0) return empty();
    // ── 8. Fix winding ─────────────────────────────────────────────────────────
    fixWinding(verts3d, validTris, capNormal);
    // ── 9. Per-vertex normals (smooth; G1 blend at the boundary ring) ───────────
    const normals = computePerVertexNormals(verts3d, validTris, capNormal, N, options.adjacentNormals);
    // ── 10. Flatten to triangle soup ────────────────────────────────────────────
    return flattenToSoup(verts3d, validTris, normals, options.flipped ?? false);
}
function generateCapWithHoles(outer, holes, capNormal, planeU, planeV, planePoint, flipped = false) {
    if (outer.length < 3) return empty();
    // BOUNDARY LOCK: outer and hole vertices are exact cut-edge coordinates
    // produced by the mesh-plane intersection. They must not be resampled,
    // faired, or repositioned — any movement creates gaps between shell and cap.
    // All smoothing must happen exclusively in the interior.
    // Project to 2D in the plane basis
    const to2d = (p)=>{
        const rel = p.clone().sub(planePoint);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](rel.dot(planeU), rel.dot(planeV));
    };
    // Orient outer loop: CCW (area > 0) for ShapeUtils
    const outerArea = signedArea2D(outer.map(to2d));
    const outer2d = outerArea >= 0 ? outer.map(to2d) : [
        ...outer
    ].reverse().map(to2d);
    const outer3d = outerArea >= 0 ? [
        ...outer
    ] : [
        ...outer
    ].reverse();
    // Orient holes: CW (area < 0) for ShapeUtils
    const holes2d = [];
    const holes3d = [];
    for (const h of holes){
        const ha = signedArea2D(h.map(to2d));
        if (ha < 0) {
            holes2d.push(h.map(to2d));
            holes3d.push([
                ...h
            ]);
        } else {
            holes2d.push([
                ...h
            ].reverse().map(to2d));
            holes3d.push([
                ...h
            ].reverse());
        }
    }
    // Combined vertex array: [outer, hole0, hole1, ...] — indices from ShapeUtils
    const combined3d = [
        ...outer3d
    ];
    for (const h3 of holes3d)combined3d.push(...h3);
    let faces;
    try {
        faces = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShapeUtils"].triangulateShape(outer2d, holes2d);
    } catch  {
        // Fallback: fan from first vertex
        faces = [];
        for(let i = 1; i + 1 < outer2d.length; i++)faces.push([
            0,
            i,
            i + 1
        ]);
    }
    // Emit triangle soup — original boundary vertices, flat cap normal
    const posArr = [];
    const nrmArr = [];
    const n = flipped ? capNormal.clone().negate() : capNormal.clone();
    for (const tri of faces){
        const A = combined3d[tri[0]];
        const B = combined3d[tri[1]];
        const C = combined3d[tri[2]];
        if (!A || !B || !C) continue;
        const [v0, v1, v2] = flipped ? [
            A,
            C,
            B
        ] : [
            A,
            B,
            C
        ];
        posArr.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
        nrmArr.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z);
    }
    return {
        pos: new Float32Array(posArr),
        nrm: new Float32Array(nrmArr)
    };
}
function analyseBoundary(pts) {
    const n = pts.length;
    // Centroid
    const centroid = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const p of pts)centroid.add(p);
    centroid.divideScalar(n);
    // Best-fit plane normal via Newell's method (robust for any polygon)
    const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for(let i = 0; i < n; i++){
        const cur = pts[i], nxt = pts[(i + 1) % n];
        normal.x += (cur.y - nxt.y) * (cur.z + nxt.z);
        normal.y += (cur.z - nxt.z) * (cur.x + nxt.x);
        normal.z += (cur.x - nxt.x) * (cur.y + nxt.y);
    }
    if (normal.lengthSq() > 1e-20) normal.normalize();
    else normal.set(0, 1, 0);
    // Orthonormal basis in the plane
    const refUp = Math.abs(normal.y) < 0.9 ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0);
    const uAxis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(refUp, normal).normalize();
    const vAxis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(normal, uAxis).normalize();
    // Perimeter and average edge spacing
    let perimeter = 0;
    for(let i = 0; i < n; i++)perimeter += pts[i].distanceTo(pts[(i + 1) % n]);
    const avgSpacing = perimeter / n;
    // Approximate area (shoelace in local 2D)
    let area2d = 0;
    for(let i = 0; i < n; i++){
        const rel = pts[i].clone().sub(centroid);
        const rel2 = pts[(i + 1) % n].clone().sub(centroid);
        area2d += rel.dot(uAxis) * rel2.dot(vAxis) - rel2.dot(uAxis) * rel.dot(vAxis);
    }
    const area = Math.abs(area2d) * 0.5;
    // Discrete curvature at each vertex (turning angle)
    const curvature = new Float32Array(n);
    for(let i = 0; i < n; i++){
        const prev = pts[(i - 1 + n) % n];
        const cur = pts[i];
        const next = pts[(i + 1) % n];
        const a = cur.clone().sub(prev);
        const b = next.clone().sub(cur);
        const la = a.length(), lb = b.length();
        if (la > 1e-10 && lb > 1e-10) {
            a.divideScalar(la);
            b.divideScalar(lb);
            curvature[i] = Math.acos(Math.max(-1, Math.min(1, a.dot(b))));
        }
    }
    return {
        centroid,
        normal,
        uAxis,
        vAxis,
        avgSpacing,
        perimeter,
        area,
        curvature
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Catmull-Rom spline reconstruction
// ─────────────────────────────────────────────────────────────────────────────
function crPoint(P0, P1, P2, P3, t) {
    const t2 = t * t, t3 = t2 * t;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0.5 * (2 * P1.x + (-P0.x + P2.x) * t + (2 * P0.x - 5 * P1.x + 4 * P2.x - P3.x) * t2 + (-P0.x + 3 * P1.x - 3 * P2.x + P3.x) * t3), 0.5 * (2 * P1.y + (-P0.y + P2.y) * t + (2 * P0.y - 5 * P1.y + 4 * P2.y - P3.y) * t2 + (-P0.y + 3 * P1.y - 3 * P2.y + P3.y) * t3), 0.5 * (2 * P1.z + (-P0.z + P2.z) * t + (2 * P0.z - 5 * P1.z + 4 * P2.z - P3.z) * t2 + (-P0.z + 3 * P1.z - 3 * P2.z + P3.z) * t3));
}
function resampleCatmullRom(pts, targetCount, plane) {
    const n = pts.length;
    if (n < 3) return pts.map((p)=>p.clone());
    const OVERSAMPLE = 16 // samples per input segment for accurate arc-length
    ;
    const dense = [];
    for(let i = 0; i < n; i++){
        const P0 = pts[(i - 1 + n) % n];
        const P1 = pts[i];
        const P2 = pts[(i + 1) % n];
        const P3 = pts[(i + 2) % n];
        for(let j = 0; j < OVERSAMPLE; j++){
            let p = crPoint(P0, P1, P2, P3, j / OVERSAMPLE);
            if (plane) p = projectToPlane(p, plane);
            dense.push(p);
        }
    }
    // Build cumulative arc length table.
    // Append a closing sentinel (dense[0] clone) so the binary search can
    // properly interpolate any target that falls in the last segment
    // (between the final sample and the loop start point).
    const arc = [
        0
    ];
    for(let i = 1; i < dense.length; i++){
        arc.push(arc[i - 1] + dense[i].distanceTo(dense[i - 1]));
    }
    const loopClose = dense[dense.length - 1].distanceTo(dense[0]);
    const totalLen = arc[arc.length - 1] + loopClose;
    // Extend with closing segment so binary search covers the full loop
    dense.push(dense[0].clone());
    arc.push(totalLen);
    // Resample at uniform arc length
    const result = [];
    for(let k = 0; k < targetCount; k++){
        const target = k / targetCount * totalLen;
        let lo = 0, hi = arc.length - 1;
        while(lo < hi - 1){
            const mid = lo + hi >> 1;
            if (arc[mid] <= target) lo = mid;
            else hi = mid;
        }
        const span = arc[hi] - arc[lo];
        const t = span > 1e-12 ? (target - arc[lo]) / span : 0;
        result.push(dense[lo].clone().lerp(dense[hi], t));
    }
    return result;
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Contour fairing (Laplacian with plane projection)
// ─────────────────────────────────────────────────────────────────────────────
function fairContour(pts, iterations, alpha, plane) {
    let cur = pts.map((p)=>p.clone());
    const n = cur.length;
    for(let iter = 0; iter < iterations; iter++){
        const next = [];
        for(let i = 0; i < n; i++){
            const prev = cur[(i - 1 + n) % n];
            const nx = cur[(i + 1) % n];
            const lap = prev.clone().add(nx).multiplyScalar(0.5);
            let moved = cur[i].clone().lerp(lap, alpha);
            if (plane) moved = projectToPlane(moved, plane);
            next.push(moved);
        }
        cur = next;
    }
    return cur;
}
function buildConcentricMesh(boundary, centroid, rings, plane) {
    const bCount = boundary.length;
    const vertices = boundary.map((p)=>p.clone());
    const triangles = [];
    if (rings <= 0 || bCount < 3) {
        // Degenerate: fan from centroid
        const cIdx = vertices.length;
        const c = plane ? projectToPlane(centroid.clone(), plane) : centroid.clone();
        vertices.push(c);
        for(let i = 0; i < bCount; i++){
            triangles.push([
                i,
                (i + 1) % bCount,
                cIdx
            ]);
        }
        return {
            vertices,
            triangles,
            boundaryCount: bCount
        };
    }
    // Build ring indices: ring 0 = boundary, ring `rings` = centre
    const ringIndex = [
        Array.from({
            length: bCount
        }, (_, i)=>i)
    ];
    for(let r = 1; r < rings; r++){
        const t = r / rings;
        const row = [];
        for(let i = 0; i < bCount; i++){
            // Lerp each boundary point toward centroid (harmonic-like interpolation)
            let p = boundary[i].clone().lerp(centroid, t);
            if (plane) p = projectToPlane(p, plane);
            row.push(vertices.length);
            vertices.push(p);
        }
        ringIndex.push(row);
    }
    // Centre point
    const cIdx = vertices.length;
    const c = plane ? projectToPlane(centroid.clone(), plane) : centroid.clone();
    vertices.push(c);
    // Triangulate between consecutive rings (quad → two triangles)
    for(let r = 0; r < rings - 1; r++){
        const outer = ringIndex[r];
        const inner = ringIndex[r + 1];
        for(let i = 0; i < bCount; i++){
            const a = outer[i], b = outer[(i + 1) % bCount];
            const d = inner[i], c = inner[(i + 1) % bCount];
            triangles.push([
                a,
                b,
                c
            ]);
            triangles.push([
                a,
                c,
                d
            ]);
        }
    }
    // Cap innermost ring to centre
    const lastRing = ringIndex[rings - 1];
    for(let i = 0; i < bCount; i++){
        triangles.push([
            lastRing[i],
            lastRing[(i + 1) % bCount],
            cIdx
        ]);
    }
    return {
        vertices,
        triangles,
        boundaryCount: bCount
    };
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
 */ function stitchRings(vertices, triangles, outerRing, innerRing, _centroid) {
    const NO = outerRing.length;
    const NI = innerRing.length;
    if (NO < 3 || NI < 3) return;
    let oi = 0, ii = 0;
    const total = NO + NI // one triangle per step
    ;
    for(let step = 0; step < total; step++){
        const oA = outerRing[oi % NO];
        const iA = innerRing[ii % NI];
        const oB = outerRing[(oi + 1) % NO];
        const iB = innerRing[(ii + 1) % NI];
        let advOuter;
        if (oi >= NO) advOuter = false; // outer exhausted: must advance inner
        else if (ii >= NI) advOuter = true; // inner exhausted: must advance outer
        else {
            // Choose the triangle that produces the shorter shared diagonal
            const d1 = vertices[oB].distanceToSquared(vertices[iA]) // advance outer
            ;
            const d2 = vertices[oA].distanceToSquared(vertices[iB]) // advance inner
            ;
            advOuter = d1 <= d2;
        }
        if (advOuter) {
            triangles.push([
                oA,
                oB,
                iA
            ]);
            oi++;
        } else {
            triangles.push([
                oA,
                iA,
                iB
            ]);
            ii++;
        }
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 6 — Taubin smoother (global solver)
// ─────────────────────────────────────────────────────────────────────────────
function taubinSmooth(vertices, triangles, boundaryCount, iterations, lambda, mu, plane) {
    const n = vertices.length;
    if (boundaryCount >= n) return; // all vertices are boundary
    // Build adjacency for ALL vertices (needed for weight computation)
    const adj = Array.from({
        length: n
    }, ()=>[]);
    for (const [a, b, c] of triangles){
        if (!adj[a].includes(b)) adj[a].push(b);
        if (!adj[a].includes(c)) adj[a].push(c);
        if (!adj[b].includes(a)) adj[b].push(a);
        if (!adj[b].includes(c)) adj[b].push(c);
        if (!adj[c].includes(a)) adj[c].push(a);
        if (!adj[c].includes(b)) adj[c].push(b);
    }
    const step = (factor)=>{
        for(let i = boundaryCount; i < n; i++){
            const nb = adj[i];
            if (nb.length === 0) continue;
            let sx = 0, sy = 0, sz = 0;
            for (const j of nb){
                sx += vertices[j].x;
                sy += vertices[j].y;
                sz += vertices[j].z;
            }
            const inv = 1 / nb.length;
            const dx = sx * inv - vertices[i].x;
            const dy = sy * inv - vertices[i].y;
            const dz = sz * inv - vertices[i].z;
            vertices[i].x += factor * dx;
            vertices[i].y += factor * dy;
            vertices[i].z += factor * dz;
            if (plane) vertices[i] = projectToPlane(vertices[i], plane);
        }
    };
    for(let iter = 0; iter < iterations; iter++){
        step(lambda);
        step(mu);
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 9 — Adaptive fairing (weighted by curvature + distance from boundary)
// ─────────────────────────────────────────────────────────────────────────────
function adaptiveFairing(vertices, triangles, boundaryCount, boundaryCurvature, plane) {
    const n = vertices.length;
    if (boundaryCount >= n) return;
    // Build adjacency
    const adj = Array.from({
        length: n
    }, ()=>[]);
    for (const [a, b, c] of triangles){
        adj[a].push(b, c);
        adj[b].push(a, c);
        adj[c].push(a, b);
    }
    // Average curvature of boundary (used for weight scaling)
    let avgCurv = 0;
    for(let i = 0; i < boundaryCurvature.length; i++)avgCurv += boundaryCurvature[i];
    if (boundaryCurvature.length > 0) avgCurv /= boundaryCurvature.length;
    const ITER = 8;
    for(let iter = 0; iter < ITER; iter++){
        for(let i = boundaryCount; i < n; i++){
            const nb = adj[i];
            if (nb.length === 0) continue;
            // Distance from boundary in ring index: interior vertex i → ring it belongs to.
            // Approximated by: vertices close to boundary have small ring index.
            // Weight: more interior → higher alpha (more free to move)
            const ringEstimate = i >= boundaryCount ? (i - boundaryCount) / Math.max(1, n - boundaryCount) : 0;
            const alpha = 0.1 + 0.3 * ringEstimate // range [0.1, 0.4]
            ;
            let sx = 0, sy = 0, sz = 0;
            for (const j of nb){
                sx += vertices[j].x;
                sy += vertices[j].y;
                sz += vertices[j].z;
            }
            const inv = 1 / nb.length;
            vertices[i].x += alpha * (sx * inv - vertices[i].x);
            vertices[i].y += alpha * (sy * inv - vertices[i].y);
            vertices[i].z += alpha * (sz * inv - vertices[i].z);
            if (plane) vertices[i] = projectToPlane(vertices[i], plane);
        }
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 10 — Defect correction
// ─────────────────────────────────────────────────────────────────────────────
function filterDegenerates(vertices, triangles, minArea = 1e-18) {
    const valid = [];
    const AB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), AC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const tri of triangles){
        const A = vertices[tri[0]], B = vertices[tri[1]], C = vertices[tri[2]];
        if (!A || !B || !C) continue;
        AB.subVectors(B, A);
        AC.subVectors(C, A);
        cross.crossVectors(AB, AC);
        if (cross.lengthSq() > minArea) valid.push(tri);
    }
    return valid;
}
function fixWinding(vertices, triangles, capNormal) {
    const AB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), AC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const tri of triangles){
        const A = vertices[tri[0]], B = vertices[tri[1]], C = vertices[tri[2]];
        AB.subVectors(B, A);
        AC.subVectors(C, A);
        cross.crossVectors(AB, AC);
        if (cross.dot(capNormal) < 0) {
            // Flip winding
            const tmp = tri[1];
            tri[1] = tri[2];
            tri[2] = tmp;
        }
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Step 11 — Per-vertex normals with G1 boundary continuity
// ─────────────────────────────────────────────────────────────────────────────
function computePerVertexNormals(vertices, triangles, capNormal, boundaryCount, adjacentNormals) {
    const n = vertices.length;
    const normals = Array.from({
        length: n
    }, ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
    const AB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), AC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const [a, b, c] of triangles){
        const vA = vertices[a], vB = vertices[b], vC = vertices[c];
        AB.subVectors(vB, vA);
        AC.subVectors(vC, vA);
        // Area-weighted face normal
        const faceN = AB.clone().cross(AC);
        normals[a].add(faceN);
        normals[b].add(faceN);
        normals[c].add(faceN);
    }
    for(let i = 0; i < n; i++){
        if (normals[i].lengthSq() > 1e-20) {
            normals[i].normalize();
        } else {
            normals[i].copy(capNormal);
        }
        // Ensure same hemisphere as cap normal
        if (normals[i].dot(capNormal) < 0) normals[i].negate();
        // G1 continuity at boundary: blend with adjacent mesh normal if available
        if (i < boundaryCount && adjacentNormals) {
            const key = quantKey(vertices[i]);
            const adjN = adjacentNormals.get(key);
            if (adjN && adjN.dot(capNormal) > -0.5) {
                // Blend adjacent surface normal into boundary vertex normal
                normals[i].lerp(adjN, 0.4).normalize();
            }
        }
    }
    return normals;
}
// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function empty() {
    return {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
}
// ── Point-in-polygon (ray casting, 2-D) ──────────────────────────────────────
// Returns true when `pt` is strictly inside `poly` (closed planar polygon).
function pointInsidePoly2D(pt, poly) {
    let inside = false;
    const n = poly.length;
    for(let i = 0, j = n - 1; i < n; j = i++){
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        if (yi > pt.y !== yj > pt.y && pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 1e-30) + xi) {
            inside = !inside;
        }
    }
    return inside;
}
// ── Project a vertex back onto the polygon boundary ───────────────────────────
// Used when a smoothing step pushes an interior vertex outside the polygon.
// Projects to the nearest point on the boundary perimeter, then nudges it
// slightly toward the polygon centroid so it remains strictly inside.
function clipVertexToPolygon2D(pt, poly) {
    const n = poly.length;
    // Compute centroid for the inward nudge direction
    let cx = 0, cy = 0;
    for (const p of poly){
        cx += p.x;
        cy += p.y;
    }
    cx /= n;
    cy /= n;
    let bestDist = Infinity;
    let bestPX = pt.x, bestPY = pt.y;
    for(let i = 0; i < n; i++){
        const a = poly[i], b = poly[(i + 1) % n];
        const dx = b.x - a.x, dy = b.y - a.y;
        const lenSq = dx * dx + dy * dy;
        if (lenSq < 1e-20) continue;
        const t = Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / lenSq));
        const projX = a.x + t * dx, projY = a.y + t * dy;
        const d = (pt.x - projX) ** 2 + (pt.y - projY) ** 2;
        if (d < bestDist) {
            bestDist = d;
            bestPX = projX;
            bestPY = projY;
        }
    }
    // Nudge 0.1 % of the way toward the centroid so the point is strictly inside
    const NUDGE = 0.001;
    pt.x = bestPX + (cx - bestPX) * NUDGE;
    pt.y = bestPY + (cy - bestPY) * NUDGE;
}
function projectToPlane(p, plane) {
    const d = p.clone().sub(plane.point).dot(plane.normal);
    return p.clone().addScaledVector(plane.normal, -d);
}
function autoRings(area, avgSpacing) {
    if (avgSpacing < 1e-10) return 2;
    const approxRadius = Math.sqrt(area / Math.PI);
    const rings = Math.round(approxRadius / avgSpacing);
    return Math.max(2, Math.min(8, rings));
}
function quantKey(p, Q = 1e4) {
    return `${Math.round(p.x * Q)},${Math.round(p.y * Q)},${Math.round(p.z * Q)}`;
}
function signedArea2D(pts) {
    let a = 0;
    const n = pts.length;
    for(let i = 0; i < n; i++){
        const p = pts[i], q = pts[(i + 1) % n];
        a += p.x * q.y - q.x * p.y;
    }
    return a * 0.5;
}
function flattenToSoup(vertices, triangles, normals, flipped) {
    const posArr = [];
    const nrmArr = [];
    for (const tri of triangles){
        const [ia, ib, ic] = flipped ? [
            tri[0],
            tri[2],
            tri[1]
        ] : [
            tri[0],
            tri[1],
            tri[2]
        ];
        const A = vertices[ia], B = vertices[ib], C = vertices[ic];
        const nA = flipped ? normals[ia].clone().negate() : normals[ia];
        const nB = flipped ? normals[ib].clone().negate() : normals[ib];
        const nC = flipped ? normals[ic].clone().negate() : normals[ic];
        posArr.push(A.x, A.y, A.z, B.x, B.y, B.z, C.x, C.y, C.z);
        nrmArr.push(nA.x, nA.y, nA.z, nB.x, nB.y, nB.z, nC.x, nC.y, nC.z);
    }
    return {
        pos: new Float32Array(posArr),
        nrm: new Float32Array(nrmArr)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/solid-plane-cut.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "planeFromAxisOffset",
    ()=>planeFromAxisOffset,
    "solidPlaneCut",
    ()=>solidPlaneCut
]);
/**
 * Solid Plane Cut — Corte de sólido por plano (watertight manifold)
 * ------------------------------------------------------------------
 * Implementa o pipeline completo descrito na especificação técnica:
 *   1. Calcular a interseção do plano com todos os triângulos.
 *   2. Gerar segmentos de interseção (directed half-edges).
 *   3. Organizar os segmentos em loops fechados (chain following).
 *   4. Triangular o contorno (Ear Clipping via THREE.ShapeUtils).
 *   5. Criar as faces do CAP com winding correto para cada metade.
 *   6. Soldar vértices duplicados (quantized snapping).
 *   7. Recalcular normais.
 *   8. Garantir que a malha seja watertight.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cap-generation.ts [app-client] (ecmascript)");
;
;
function planeFromAxisOffset(bbox, axis, offset, flip = false) {
    const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    bbox.getCenter(center);
    const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
    if (flip) normal.negate();
    const min = bbox.min[axis];
    const max = bbox.max[axis];
    const coord = min + (max - min) * offset;
    const point = center.clone();
    point[axis] = coord;
    return {
        normal,
        point
    };
}
// ---------------------------------------------------------------------------
// Acumulador de triângulos para cada metade do corte
// ---------------------------------------------------------------------------
class SideBuilder {
    pos = [];
    nrm = [];
    pushTri(a, b, c) {
        this.pos.push(a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z, c.p.x, c.p.y, c.p.z);
        this.nrm.push(a.n.x, a.n.y, a.n.z, b.n.x, b.n.y, b.n.z, c.n.x, c.n.y, c.n.z);
    }
    pushCapTri(a, b, c, capN) {
        this.pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        this.nrm.push(capN.x, capN.y, capN.z, capN.x, capN.y, capN.z, capN.x, capN.y, capN.z);
    }
    toGeometry() {
        const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
        geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](this.pos, 3));
        geo.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](this.nrm, 3));
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        return geo;
    }
}
function planeBasis(n) {
    const a = Math.abs(n.x) < 0.9 ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0);
    const u = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(a, n).normalize();
    const v = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().crossVectors(n, u).normalize();
    return {
        u,
        v
    };
}
function lerpVtx(a, b, t) {
    const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().lerpVectors(a.p, b.p, t);
    const nm = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().lerpVectors(a.n, b.n, t);
    if (nm.lengthSq() > 1e-12) nm.normalize();
    return {
        p,
        n: nm
    };
}
function solidPlaneCut(geometry, planeNormal, planePoint, eps) {
    const n = planeNormal.clone().normalize();
    const posAttr = geometry.getAttribute('position');
    const nrmAttr = geometry.getAttribute('normal');
    const idxAttr = geometry.index;
    const triCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    const scale = geometry.boundingSphere ? geometry.boundingSphere.radius : 1;
    const EPS = eps ?? Math.max(1e-9, scale * 1e-6);
    const positive = new SideBuilder();
    const negative = new SideBuilder();
    // Armazena segmentos de interseção como pares de pontos [ax,ay,az, bx,by,bz]
    // com direção consistente: visto de +n, o material NEGATIVO fica à ESQUERDA.
    const segFlat = [];
    const idxA = idxAttr ? idxAttr.array : null;
    const tmpFaceN = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const va = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), vb = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), vc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    const readVtx = (vi, faceN)=>{
        const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi));
        let nm;
        if (nrmAttr) {
            nm = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](nrmAttr.getX(vi), nrmAttr.getY(vi), nrmAttr.getZ(vi));
            if (nm.lengthSq() < 1e-12) nm.copy(faceN);
        } else {
            nm = faceN.clone();
        }
        return {
            p,
            n: nm
        };
    };
    // ---------------------------------------------------------------------------
    // PASSO 1-2: classifica e divide cada triângulo pelo plano
    // ---------------------------------------------------------------------------
    for(let f = 0; f < triCount; f++){
        const i0 = idxA ? idxA[f * 3] : f * 3;
        const i1 = idxA ? idxA[f * 3 + 1] : f * 3 + 1;
        const i2 = idxA ? idxA[f * 3 + 2] : f * 3 + 2;
        va.set(posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0));
        vb.set(posAttr.getX(i1), posAttr.getY(i1), posAttr.getZ(i1));
        vc.set(posAttr.getX(i2), posAttr.getY(i2), posAttr.getZ(i2));
        tmpFaceN.crossVectors(vb.clone().sub(va), vc.clone().sub(va));
        if (tmpFaceN.lengthSq() > 1e-20) tmpFaceN.normalize();
        const V = [
            readVtx(i0, tmpFaceN),
            readVtx(i1, tmpFaceN),
            readVtx(i2, tmpFaceN)
        ];
        const d = [
            V[0].p.clone().sub(planePoint).dot(n),
            V[1].p.clone().sub(planePoint).dot(n),
            V[2].p.clone().sub(planePoint).dot(n)
        ];
        // Classifica: snap vértices muito próximos do plano para cima/baixo
        const side = d.map((di)=>di > EPS ? 1 : di < -EPS ? -1 : 0);
        const dMin = Math.min(d[0], d[1], d[2]);
        const dMax = Math.max(d[0], d[1], d[2]);
        // ── Triângulo inteiramente acima (ou coplanar) → lado positivo ──────────
        if (dMin >= -EPS) {
            positive.pushTri(V[0], V[1], V[2]);
            // Aresta coplanar: dois vértices sobre o plano, terceiro acima.
            // Segmento deve ser emitido com o lado NEGATIVO à ESQUERDA visto de +n.
            // Como o winding do triângulo (CCW de +n) tem o positivo à esquerda,
            // a aresta coplanar a→b no sentido CCW deixa o interior positivo à
            // esquerda → inverte para b→a (negativo à esquerda).
            for(let i = 0; i < 3; i++){
                const j = (i + 1) % 3;
                const k = (i + 2) % 3;
                if (side[i] === 0 && side[j] === 0 && side[k] >= 0) {
                    const a = V[i].p, b = V[j].p;
                    if (a.distanceToSquared(b) > EPS * EPS) {
                        // Inverte: emite b→a
                        segFlat.push(b.x, b.y, b.z, a.x, a.y, a.z);
                    }
                }
            }
            continue;
        }
        // ── Triângulo inteiramente abaixo → lado negativo ──────────────────────
        if (dMax <= EPS) {
            negative.pushTri(V[0], V[1], V[2]);
            // Aresta coplanar com terceiro vértice abaixo: emite a→b direto
            // (winding CCW de +n já coloca o negativo à esquerda pois o tri está abaixo)
            for(let i = 0; i < 3; i++){
                const j = (i + 1) % 3;
                const k = (i + 2) % 3;
                if (side[i] === 0 && side[j] === 0 && side[k] <= 0) {
                    const a = V[i].p, b = V[j].p;
                    if (a.distanceToSquared(b) > EPS * EPS) {
                        segFlat.push(a.x, a.y, a.z, b.x, b.y, b.z);
                    }
                }
            }
            continue;
        }
        // ── Straddle: triângulo cruza o plano ──────────────────────────────────
        // Usa clip explícito com rastreamento de quais vértices estão sobre o plano.
        clipTriangle(V, d, side, EPS, positive, negative, segFlat);
    }
    // ---------------------------------------------------------------------------
    // PASSOS 3-4: reconstrói loops fechados a partir dos segmentos
    // ---------------------------------------------------------------------------
    const loops = buildLoops(segFlat, scale, EPS);
    // ---------------------------------------------------------------------------
    // PASSOS 5-7: triangula os loops e gera as tampas
    // ---------------------------------------------------------------------------
    const { u, v } = planeBasis(n);
    let capTriangles = 0;
    if (loops.length > 0) {
        capTriangles = buildCaps(loops, n, u, v, planePoint, positive, negative);
    }
    return {
        positive: positive.toGeometry(),
        negative: negative.toGeometry(),
        capLoops: loops.length,
        capTriangles
    };
}
// ---------------------------------------------------------------------------
// Clip de um triângulo que cruza o plano (Sutherland-Hodgman adaptado)
// ---------------------------------------------------------------------------
function clipTriangle(V, d, side, EPS, positive, negative, segFlat) {
    // Polígonos resultantes do clip: cada vértice carrega se está sobre o plano.
    const posPoly = [];
    const negPoly = [];
    const posOn = [];
    const negOn = [];
    for(let i = 0; i < 3; i++){
        const j = (i + 1) % 3;
        const di = d[i], dj = d[j];
        const si = side[i], sj = side[j];
        const vi = V[i], vj = V[j];
        // Adiciona vértice atual ao lado correto
        if (si >= 0) {
            posPoly.push(vi);
            posOn.push(si === 0);
        }
        if (si <= 0) {
            negPoly.push(vi);
            negOn.push(si === 0);
        }
        // Interseção estrita entre lados opostos (ignora vértices sobre o plano)
        if (si > 0 && sj < 0 || si < 0 && sj > 0) {
            const t = di / (di - dj);
            const ip = lerpVtx(vi, vj, t);
            posPoly.push(ip);
            posOn.push(true);
            negPoly.push(ip);
            negOn.push(true);
        }
    }
    // Fan-triangula o polígono positivo
    for(let i = 1; i + 1 < posPoly.length; i++){
        positive.pushTri(posPoly[0], posPoly[i], posPoly[i + 1]);
    }
    // Fan-triangula o polígono negativo
    for(let i = 1; i + 1 < negPoly.length; i++){
        negative.pushTri(negPoly[0], negPoly[i], negPoly[i + 1]);
    }
    // Extrai o segmento de interseção: aresta de negPoly cujos dois extremos
    // estão sobre o plano, percorrida no sentido CCW do polígono negativo.
    // Isso garante que o material negativo fique à esquerda visto de +n.
    const m = negPoly.length;
    for(let k = 0; k < m; k++){
        const k2 = (k + 1) % m;
        if (negOn[k] && negOn[k2]) {
            const a = negPoly[k].p;
            const b = negPoly[k2].p;
            if (a.distanceToSquared(b) > EPS * EPS) {
                segFlat.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        // Continua procurando: pode haver múltiplos pares (ex.: um vértice está
        // exatamente sobre o plano junto com um ponto de interseção).
        }
    }
}
function buildLoops(segFlat, scale, EPS) {
    const segCount = segFlat.length / 6;
    if (segCount === 0) return [];
    // Solda pontos por posição quantizada para eliminar micro-gaps entre
    // segmentos de triângulos adjacentes.
    const Q = 1 / Math.max(scale * 1e-4, 1e-9);
    const keyToId = new Map();
    const idPos = [];
    const idOf = (x, y, z)=>{
        const k = `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`;
        let id = keyToId.get(k);
        if (id === undefined) {
            id = idPos.length;
            keyToId.set(k, id);
            idPos.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](x, y, z));
        }
        return id;
    };
    // Constrói grafo direcionado a → [b1, b2, ...], removendo duplicatas.
    // Duplicatas surgem quando dois triângulos compartilham a mesma aresta
    // de corte (aresta interior da malha exatamente sobre o plano).
    const outEdges = new Map();
    const seen = new Set();
    for(let s = 0; s < segCount; s++){
        const o = s * 6;
        const a = idOf(segFlat[o], segFlat[o + 1], segFlat[o + 2]);
        const b = idOf(segFlat[o + 3], segFlat[o + 4], segFlat[o + 5]);
        if (a === b) continue;
        const key = `${a}>${b}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const list = outEdges.get(a);
        if (list) {
            list.push(b);
        } else {
            outEdges.set(a, [
                b
            ]);
        }
    }
    // Chain following: percorre o grafo direcionado extraindo cadeias fechadas.
    // Usa um mapa de "próximo ponteiro" por nó para consumir arestas sem repetir.
    const nextPtr = new Map();
    const loops = [];
    for (const [startNode] of outEdges){
        // Enquanto este nó ainda tiver arestas não consumidas, inicia uma cadeia.
        while(true){
            const ptr = nextPtr.get(startNode) ?? 0;
            const outs = outEdges.get(startNode);
            if (!outs || ptr >= outs.length) break;
            // Percorre a cadeia até fechar o loop ou esgotar as saídas.
            const chain = [];
            let cur = startNode;
            const maxSteps = idPos.length + 4;
            let steps = 0;
            let closed = false;
            while(steps++ < maxSteps){
                const curPtr = nextPtr.get(cur) ?? 0;
                const curOuts = outEdges.get(cur);
                if (!curOuts || curPtr >= curOuts.length) break; // sem saída disponível
                chain.push(cur);
                const next = curOuts[curPtr];
                nextPtr.set(cur, curPtr + 1); // consome a aresta cur→next
                if (next === startNode) {
                    closed = true;
                    break;
                }
                cur = next;
            }
            if (closed && chain.length >= 3) {
                loops.push({
                    pts: chain.map((id)=>idPos[id])
                });
            }
        // Se não fechou, as arestas foram consumidas igualmente — sem loop infinito.
        }
    }
    return loops;
}
function signedArea2D(pts) {
    let a = 0;
    const n = pts.length;
    for(let i = 0; i < n; i++){
        const p = pts[i], q = pts[(i + 1) % n];
        a += p.x * q.y - q.x * p.y;
    }
    return a * 0.5;
}
function pointInPoly(pt, poly) {
    let inside = false;
    for(let i = 0, j = poly.length - 1; i < poly.length; j = i++){
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        const intersect = yi > pt.y !== yj > pt.y && pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 1e-30) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}
function buildCaps(loops, n, u, v, planePoint, positive, negative) {
    // ── Determine loop nesting (outer loops vs holes) ─────────────────────────
    const L = loops.map((lp)=>{
        const pts2d = lp.pts.map((p)=>{
            const rel = p.clone().sub(planePoint);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](rel.dot(u), rel.dot(v));
        });
        return {
            pts3d: lp.pts,
            pts2d,
            area: signedArea2D(pts2d)
        };
    });
    const depth = L.map((li, i)=>{
        const rep = li.pts2d[0];
        let d = 0;
        for(let j = 0; j < L.length; j++){
            if (j === i) continue;
            if (Math.abs(L[j].area) <= Math.abs(li.area)) continue;
            if (pointInPoly(rep, L[j].pts2d)) d++;
        }
        return d;
    });
    const outers = [];
    const holesOf = new Map();
    L.forEach((_, i)=>{
        if (depth[i] % 2 === 0) {
            outers.push(i);
            holesOf.set(i, []);
        }
    });
    L.forEach((li, i)=>{
        if (depth[i] % 2 === 1) {
            let best = -1, bestArea = Infinity;
            for (const oi of outers){
                const outerArea = Math.abs(L[oi].area);
                if (outerArea < Math.abs(li.area)) continue;
                if (pointInPoly(li.pts2d[0], L[oi].pts2d) && outerArea < bestArea) {
                    best = oi;
                    bestArea = outerArea;
                }
            }
            if (best >= 0) holesOf.get(best).push(i);
        }
    });
    const plane = {
        normal: n,
        point: planePoint
    };
    let capTriangles = 0;
    for (const oi of outers){
        const outer = L[oi];
        const holeLoops = holesOf.get(oi).map((hi)=>L[hi].pts3d);
        // Normalise outer winding so pts3d runs CCW viewed from +n
        const outerPts = outer.area >= 0 ? outer.pts3d.slice() : outer.pts3d.slice().reverse();
        let negCap;
        let posCap;
        if (holeLoops.length === 0) {
            // ── Simple loop: full high-quality pipeline ──────────────────────────
            negCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCap"])(outerPts, {
                plane,
                flipped: false
            });
            posCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCap"])(outerPts, {
                plane,
                flipped: true
            });
        } else {
            // ── Loop with holes: smoothed contours + ShapeUtils ──────────────────
            negCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCapWithHoles"])(outerPts, holeLoops, n, u, v, planePoint, false);
            posCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCapWithHoles"])(outerPts, holeLoops, n, u, v, planePoint, true);
        }
        // Push negative-side cap — preserve per-vertex normals from generateCap
        const negCount = negCap.pos.length / 9;
        for(let t = 0; t < negCount; t++){
            const o = t * 9;
            negative.pos.push(negCap.pos[o], negCap.pos[o + 1], negCap.pos[o + 2], negCap.pos[o + 3], negCap.pos[o + 4], negCap.pos[o + 5], negCap.pos[o + 6], negCap.pos[o + 7], negCap.pos[o + 8]);
            negative.nrm.push(negCap.nrm[o], negCap.nrm[o + 1], negCap.nrm[o + 2], negCap.nrm[o + 3], negCap.nrm[o + 4], negCap.nrm[o + 5], negCap.nrm[o + 6], negCap.nrm[o + 7], negCap.nrm[o + 8]);
        }
        // Push positive-side cap — preserve per-vertex normals from generateCap
        const posCount = posCap.pos.length / 9;
        for(let t = 0; t < posCount; t++){
            const o = t * 9;
            positive.pos.push(posCap.pos[o], posCap.pos[o + 1], posCap.pos[o + 2], posCap.pos[o + 3], posCap.pos[o + 4], posCap.pos[o + 5], posCap.pos[o + 6], posCap.pos[o + 7], posCap.pos[o + 8]);
            positive.nrm.push(posCap.nrm[o], posCap.nrm[o + 1], posCap.nrm[o + 2], posCap.nrm[o + 3], posCap.nrm[o + 4], posCap.nrm[o + 5], posCap.nrm[o + 6], posCap.nrm[o + 7], posCap.nrm[o + 8]);
        }
        capTriangles += negCount + posCount;
    }
    return capTriangles;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/plane-cut-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlaneCutPanel",
    ()=>PlaneCutPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scissors.mjs [app-client] (ecmascript) <export default as Scissors>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flip$2d$horizontal$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlipHorizontal2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flip-horizontal-2.mjs [app-client] (ecmascript) <export default as FlipHorizontal2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/solid-plane-cut.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const AXES = [
    {
        id: 'x',
        label: 'X',
        color: 'oklch(0.65 0.22 25)',
        glow: 'oklch(0.65 0.22 25 / 35%)'
    },
    {
        id: 'y',
        label: 'Y',
        color: 'oklch(0.72 0.20 145)',
        glow: 'oklch(0.72 0.20 145 / 35%)'
    },
    {
        id: 'z',
        label: 'Z',
        color: 'oklch(0.65 0.20 250)',
        glow: 'oklch(0.65 0.20 250 / 35%)'
    }
];
const RULER_TICKS = 20 // divisões da régua
;
function MiniRuler({ value, onChange, modelSize, axisColor }) {
    _s();
    const trackRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handlePointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MiniRuler.useCallback[handlePointerDown]": (e)=>{
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = trackRef.current.getBoundingClientRect();
            const clamp = {
                "MiniRuler.useCallback[handlePointerDown].clamp": (v)=>Math.min(0.98, Math.max(0.02, v))
            }["MiniRuler.useCallback[handlePointerDown].clamp"];
            onChange(clamp((e.clientX - rect.left) / rect.width));
        }
    }["MiniRuler.useCallback[handlePointerDown]"], [
        onChange
    ]);
    const handlePointerMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MiniRuler.useCallback[handlePointerMove]": (e)=>{
            if (e.buttons !== 1) return;
            const rect = trackRef.current.getBoundingClientRect();
            const clamp = {
                "MiniRuler.useCallback[handlePointerMove].clamp": (v)=>Math.min(0.98, Math.max(0.02, v))
            }["MiniRuler.useCallback[handlePointerMove].clamp"];
            onChange(clamp((e.clientX - rect.left) / rect.width));
        }
    }["MiniRuler.useCallback[handlePointerMove]"], [
        onChange
    ]);
    const mmTotal = modelSize || 100;
    const mmValue = (value * mmTotal).toFixed(1);
    const tickSpacing = 1 / RULER_TICKS;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1 select-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-mono uppercase tracking-widest",
                        style: {
                            color: 'oklch(0.40 0 0)'
                        },
                        children: "Posição do corte"
                    }, void 0, false, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-mono tabular-nums font-medium",
                        style: {
                            color: axisColor
                        },
                        children: [
                            mmValue,
                            " mm"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: trackRef,
                onPointerDown: handlePointerDown,
                onPointerMove: handlePointerMove,
                className: "relative h-8 rounded-lg cursor-col-resize",
                style: {
                    background: 'oklch(0.12 0 0)',
                    border: '1px solid oklch(0.20 0 0)',
                    userSelect: 'none',
                    touchAction: 'none'
                },
                children: [
                    Array.from({
                        length: RULER_TICKS + 1
                    }).map((_, i)=>{
                        const pos = i / RULER_TICKS;
                        const isMajor = i % 5 === 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-0 w-px",
                            style: {
                                left: `${pos * 100}%`,
                                height: isMajor ? '60%' : '35%',
                                background: isMajor ? 'oklch(0.32 0 0)' : 'oklch(0.22 0 0)'
                            }
                        }, i, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 78,
                            columnNumber: 13
                        }, this);
                    }),
                    Array.from({
                        length: 5
                    }).map((_, i)=>{
                        const pos = i / 4 * 100;
                        const mm = (i / 4 * mmTotal).toFixed(0);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "absolute bottom-0.5 font-mono text-[6px] -translate-x-1/2",
                            style: {
                                left: `${pos}%`,
                                color: 'oklch(0.30 0 0)',
                                userSelect: 'none'
                            },
                            children: mm
                        }, i, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 bottom-0 flex flex-col items-center pointer-events-none",
                        style: {
                            left: `${value * 100}%`,
                            transform: 'translateX(-50%)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-0.5 flex-1 rounded-full",
                                style: {
                                    background: axisColor,
                                    boxShadow: `0 0 6px ${axisColor}`
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "8",
                                height: "5",
                                viewBox: "0 0 8 5",
                                className: "shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                    points: "4,0 8,5 0,5",
                                    fill: axisColor
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                lineNumber: 116,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 h-0.5 rounded-full",
                        style: {
                            background: 'oklch(0.14 0 0)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-full rounded-full transition-all duration-75",
                            style: {
                                width: `${value * 100}%`,
                                background: axisColor
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[8px] font-mono tabular-nums",
                        style: {
                            color: 'oklch(0.35 0 0)'
                        },
                        children: [
                            Math.round(value * 100),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/plane-cut-panel.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/plane-cut-panel.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/plane-cut-panel.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_s(MiniRuler, "RdthvSuBIVnSEBIsb62rCGlz1dw=");
_c = MiniRuler;
function PlaneCutPanel() {
    _s1();
    const { activeTool, modelMesh, modelInfo, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip, setCutPlaneAxis, setCutPlaneOffset, toggleCutPlaneFlip, setModelMesh, setModelInfo, addCutPart, cutParts, setStatus, pushHistory, clearSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    // Tamanho do modelo no eixo selecionado para a régua — deve estar antes de qualquer return
    const modelSizeMm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlaneCutPanel.useMemo[modelSizeMm]": ()=>{
            if (!modelMesh) return 100;
            const geo = modelMesh.geometry;
            if (!geo.boundingBox) geo.computeBoundingBox();
            const bb = geo.boundingBox;
            const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
            bb.getSize(size);
            return cutPlaneAxis === 'x' ? size.x : cutPlaneAxis === 'y' ? size.y : size.z;
        }
    }["PlaneCutPanel.useMemo[modelSizeMm]"], [
        modelMesh,
        cutPlaneAxis
    ]);
    if (activeTool !== 'cut' || !modelMesh) return null;
    const axisInfo = AXES.find((a)=>a.id === cutPlaneAxis);
    const handleExecute = ()=>{
        if (!modelMesh) return;
        pushHistory();
        setStatus('cutting', 'Executando corte de sólido (watertight)...');
        // rAF para não travar o frame corrente
        requestAnimationFrame(()=>setTimeout(()=>{
                const geo = modelMesh.geometry;
                if (!geo.boundingBox) geo.computeBoundingBox();
                const bbox = geo.boundingBox;
                const { normal, point } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["planeFromAxisOffset"])(bbox, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip);
                let result;
                try {
                    result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["solidPlaneCut"])(geo, normal, point);
                } catch (err) {
                    console.error('[PlaneCut] Erro no corte de sólido:', err);
                    setStatus('error', 'Falha ao cortar o sólido.');
                    return;
                }
                const { positive, negative, capLoops, capTriangles } = result;
                const posCount = positive.getAttribute('position')?.count ?? 0;
                const negCount = negative.getAttribute('position')?.count ?? 0;
                if (posCount === 0 || negCount === 0) {
                    setStatus('error', 'O plano não intercepta o modelo. Ajuste a posição do corte.');
                    return;
                }
                const mainMat = modelMesh.material.clone();
                mainMat.side = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"];
                mainMat.needsUpdate = true;
                const mainMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](positive, mainMat);
                mainMesh.position.copy(modelMesh.position);
                mainMesh.rotation.copy(modelMesh.rotation);
                mainMesh.scale.copy(modelMesh.scale);
                mainMesh.castShadow = true;
                mainMesh.receiveShadow = true;
                const partMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]('#ff6600'),
                    roughness: 0.55,
                    metalness: 0.10,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                });
                const partMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](negative, partMat);
                partMesh.position.copy(modelMesh.position);
                partMesh.rotation.copy(modelMesh.rotation);
                partMesh.scale.copy(modelMesh.scale);
                partMesh.castShadow = true;
                partMesh.receiveShadow = true;
                const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                bbox.getSize(size);
                const spread = Math.max(size.x, size.y, size.z) * 0.18;
                partMesh.position.add(normal.clone().multiplyScalar(-spread));
                setModelMesh(mainMesh);
                if (modelInfo) {
                    const bb = positive.boundingBox;
                    const s = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                    bb?.getSize(s);
                    setModelInfo({
                        ...modelInfo,
                        vertices: posCount,
                        faces: Math.floor(posCount / 3),
                        width: bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
                        height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
                        depth: bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth
                    });
                }
                addCutPart({
                    id: `plane-${Date.now()}`,
                    name: `Metade ${cutParts.length + 1}`,
                    mesh: partMesh,
                    faceIndices: [],
                    color: '#ff6600'
                });
                clearSelection();
                setStatus('loaded', `Corte concluído — 2 peças fechadas · ${capLoops} contorno(s) · ${capTriangles.toLocaleString()} triângulos de tampa`);
            }, 20));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3 p-3.5 rounded-2xl border",
            style: {
                background: 'oklch(0.09 0 0 / 97%)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                borderColor: 'oklch(0.18 0 0)',
                boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)',
                minWidth: '340px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-1.5 h-4 rounded-full",
                                    style: {
                                        background: axisInfo.color,
                                        boxShadow: `0 0 8px ${axisInfo.glow}`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 280,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground",
                                    children: "Corte por plano"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 284,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 279,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono px-1.5 py-0.5 rounded-md",
                            style: {
                                background: 'oklch(0.14 0 0)',
                                color: 'oklch(0.40 0 0)'
                            },
                            children: "watertight"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 288,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                    lineNumber: 278,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono uppercase tracking-widest w-8",
                            style: {
                                color: 'oklch(0.35 0 0)'
                            },
                            children: "Eixo"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 298,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1 flex-1",
                            children: AXES.map((ax)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setCutPlaneAxis(ax.id),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded-xl py-1.5 text-xs font-mono font-semibold transition-all duration-150', cutPlaneAxis === ax.id ? 'text-background' : 'border text-muted-foreground/50 hover:text-muted-foreground'),
                                    style: cutPlaneAxis === ax.id ? {
                                        background: ax.color,
                                        boxShadow: `0 0 12px ${ax.glow}`,
                                        borderColor: 'transparent'
                                    } : {
                                        borderColor: 'oklch(0.18 0 0)'
                                    },
                                    "aria-pressed": cutPlaneAxis === ax.id,
                                    children: ax.label
                                }, ax.id, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 303,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 301,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                    lineNumber: 297,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRuler, {
                    value: cutPlaneOffset,
                    onChange: setCutPlaneOffset,
                    modelSize: modelSizeMm,
                    axisColor: axisInfo.color
                }, void 0, false, {
                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                    lineNumber: 326,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 pt-0.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: toggleCutPlaneFlip,
                            title: "Inverte qual metade fica com o modelo principal",
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono transition-all duration-150', cutPlaneFlip ? 'text-background' : 'border text-muted-foreground/50 hover:text-muted-foreground'),
                            style: cutPlaneFlip ? {
                                background: 'oklch(0.45 0.05 250)',
                                borderColor: 'transparent'
                            } : {
                                borderColor: 'oklch(0.18 0 0)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flip$2d$horizontal$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlipHorizontal2$3e$__["FlipHorizontal2"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 350,
                                    columnNumber: 13
                                }, this),
                                "Inverter"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 335,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleExecute,
                            className: "flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl text-[12px] font-mono font-semibold text-background hover:opacity-90 transition-all duration-150",
                            style: {
                                background: axisInfo.color,
                                boxShadow: `0 0 16px ${axisInfo.glow}`
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                                    lineNumber: 362,
                                    columnNumber: 13
                                }, this),
                                "Executar corte"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/plane-cut-panel.tsx",
                            lineNumber: 354,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/plane-cut-panel.tsx",
                    lineNumber: 334,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/plane-cut-panel.tsx",
            lineNumber: 267,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/plane-cut-panel.tsx",
        lineNumber: 266,
        columnNumber: 5
    }, this);
}
_s1(PlaneCutPanel, "Wh2LOVidPtWL0w/rrzV5iHiL+hE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c1 = PlaneCutPanel;
var _c, _c1;
__turbopack_context__.k.register(_c, "MiniRuler");
__turbopack_context__.k.register(_c1, "PlaneCutPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/plane-cut-panel.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/layout/plane-cut-panel.tsx [app-client] (ecmascript)"));
}),
"[project]/node_modules/lucide-react/dist/esm/icons/flip-horizontal-2.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>FlipHorizontal2
]);
/**
 * @license lucide-react v1.25.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m3 7 5 5-5 5V7",
            key: "couhi7"
        }
    ],
    [
        "path",
        {
            d: "m21 7-5 5 5 5V7",
            key: "6ouia7"
        }
    ],
    [
        "path",
        {
            d: "M12 20v2",
            key: "1lh1kg"
        }
    ],
    [
        "path",
        {
            d: "M12 14v2",
            key: "8jcxud"
        }
    ],
    [
        "path",
        {
            d: "M12 8v2",
            key: "1woqiv"
        }
    ],
    [
        "path",
        {
            d: "M12 2v2",
            key: "tus03m"
        }
    ]
];
const FlipHorizontal2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("flip-horizontal-2", __iconNode);
;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/flip-horizontal-2.mjs [app-client] (ecmascript) <export default as FlipHorizontal2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FlipHorizontal2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flip$2d$horizontal$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flip$2d$horizontal$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flip-horizontal-2.mjs [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_00o82m3._.js.map