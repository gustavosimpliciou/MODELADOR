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
"[project]/lib/smart-cut.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CONTOUR",
    ()=>DEFAULT_CONTOUR,
    "DEFAULT_OPTIONS",
    ()=>DEFAULT_OPTIONS,
    "autoFillMicroFragments",
    ()=>autoFillMicroFragments,
    "buildAdjacencyCache",
    ()=>buildAdjacencyCache,
    "buildCap",
    ()=>buildCap,
    "computeSmoothNormalsByPosition",
    ()=>computeSmoothNormalsByPosition,
    "ensureColorAttribute",
    ()=>ensureColorAttribute,
    "extractSubMesh",
    ()=>extractSubMesh,
    "getFaceCentroids",
    ()=>getFaceCentroids,
    "invalidateAdjacencyCache",
    ()=>invalidateAdjacencyCache,
    "paintFaces",
    ()=>paintFaces,
    "paintFacesDelta",
    ()=>paintFacesDelta,
    "paintHoverDelta",
    ()=>paintHoverDelta,
    "refineSelectionForPrint",
    ()=>refineSelectionForPrint,
    "removeSubMesh",
    ()=>removeSubMesh,
    "smartSelect",
    ()=>smartSelect
]);
/**
 * SmartCut — Segmentação por Curvatura Acumulada (Dijkstra Budget)
 *
 * Problema dos algoritmos BFS simples: param em cada aresta afiada,
 * quebrando a seleção no meio de uma peça orgânica.
 *
 * Solução: Dijkstra com "budget" de curvatura total.
 * - Cada aresta tem custo = ângulo diedro entre as normais das faces.
 * - O algoritmo expande faces em ordem de custo acumulado.
 * - Quando o custo acumulado de uma face ultrapassa o budget, ela é bloqueada.
 * - Isso fecha peças inteiras (óculos, cabelo) mesmo com bordas suaves.
 *
 * Para modelos STL binários (não-indexados), a adjacência é construída
 * via hash de posição (quantização 1e4) — resolve o problema de vértices
 * duplicados com posições iguais.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cap-generation.ts [app-client] (ecmascript)");
;
;
const DEFAULT_OPTIONS = {
    sharpAngle: 30,
    maxFaces: 2_000_000,
    mode: 'island'
};
const geomCache = new WeakMap();
function invalidateAdjacencyCache(geo) {
    geomCache.delete(geo);
}
function buildAdjacencyCache(geometry, _sharpAngle = 30 // mantido para compatibilidade mas não usado aqui
) {
    if (geomCache.get(geometry)?.built) return;
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const pos = posAttr.array;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    // ── Normais por face ──────────────────────────────────────────────────────
    const faceNormals = new Float32Array(faceCount * 3);
    for(let f = 0; f < faceCount; f++){
        const b3 = f * 3;
        const ai = idxAttr ? idxAttr.getX(b3) : b3;
        const bi = idxAttr ? idxAttr.getX(b3 + 1) : b3 + 1;
        const ci = idxAttr ? idxAttr.getX(b3 + 2) : b3 + 2;
        const ax = pos[ai * 3], ay = pos[ai * 3 + 1], az = pos[ai * 3 + 2];
        const bx = pos[bi * 3], by = pos[bi * 3 + 1], bz = pos[bi * 3 + 2];
        const cx = pos[ci * 3], cy = pos[ci * 3 + 1], cz = pos[ci * 3 + 2];
        let nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
        let ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        let nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 1e-10) {
            nx /= len;
            ny /= len;
            nz /= len;
        }
        faceNormals[f * 3] = nx;
        faceNormals[f * 3 + 1] = ny;
        faceNormals[f * 3 + 2] = nz;
    }
    // ── Hash de posição numérico para fundir vértices duplicados (STL binário) ─
    // Empacota 3 coordenadas quantizadas em 16-bit em um inteiro de 48 bits que
    // cabe em float64 (< 2^53). Elimina string allocation e GC pressure vs strings.
    const Q = 10 // resolução 0.1 unidade ≈ 0.1 mm — suficiente
    ;
    const OFF = 32768 // 2^15 — desloca negativos para o intervalo positivo
    ;
    const posKeyNum = (vi)=>{
        const x = Math.round(pos[vi * 3] * Q) + OFF & 0xFFFF;
        const y = Math.round(pos[vi * 3 + 1] * Q) + OFF & 0xFFFF;
        const z = Math.round(pos[vi * 3 + 2] * Q) + OFF & 0xFFFF;
        return x + y * 65536 + z * 65536 * 65536;
    };
    const posToUID = new Map();
    const faceVerts = new Int32Array(faceCount * 3);
    for(let f = 0; f < faceCount; f++){
        for(let c = 0; c < 3; c++){
            const raw = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            const key = posKeyNum(raw);
            let uid = posToUID.get(key);
            if (uid === undefined) {
                uid = posToUID.size;
                posToUID.set(key, uid);
            }
            faceVerts[f * 3 + c] = uid;
        }
    }
    // ── vertFaces: lista invertida uid→[faces] ────────────────────────────────
    const uniq = posToUID.size;
    const vfCnt = new Int32Array(uniq);
    for(let i = 0; i < faceCount * 3; i++)vfCnt[faceVerts[i]]++;
    const vfOff = new Int32Array(uniq + 1);
    for(let v = 0; v < uniq; v++)vfOff[v + 1] = vfOff[v] + vfCnt[v];
    const vfList = new Int32Array(vfOff[uniq]);
    const vfPtr = new Int32Array(uniq);
    for(let f = 0; f < faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = faceVerts[f * 3 + c];
            vfList[vfOff[v] + vfPtr[v]++] = f;
        }
    }
    // ── Construir adjList e edgeCost ──────────────────────────────────────────
    const adjList = new Array(faceCount);
    const edgeCost = new Array(faceCount);
    const tmp = new Int32Array(512);
    // Scratch Uint8Array para deduplicação O(1) — substitui inner loop O(n)
    const seen = new Uint8Array(faceCount);
    const RAD2DEG = 180 / Math.PI;
    for(let f = 0; f < faceCount; f++){
        let cnt = 0;
        for(let c = 0; c < 3; c++){
            const v = faceVerts[f * 3 + c];
            for(let j = vfOff[v]; j < vfOff[v + 1]; j++){
                const nb = vfList[j];
                if (nb === f || seen[nb]) continue;
                seen[nb] = 1;
                if (cnt < tmp.length) tmp[cnt++] = nb;
            }
        }
        // Limpa seen apenas nas entradas que escrevemos — O(k) não O(n)
        for(let k = 0; k < cnt; k++)seen[tmp[k]] = 0;
        adjList[f] = new Int32Array(cnt);
        edgeCost[f] = new Float32Array(cnt);
        const fnx = faceNormals[f * 3], fny = faceNormals[f * 3 + 1], fnz = faceNormals[f * 3 + 2];
        for(let k = 0; k < cnt; k++){
            const nb = tmp[k];
            adjList[f][k] = nb;
            const dot = Math.max(-1, Math.min(1, fnx * faceNormals[nb * 3] + fny * faceNormals[nb * 3 + 1] + fnz * faceNormals[nb * 3 + 2]));
            // custo = ângulo em graus entre as normais (0=plano, 180=opostas)
            edgeCost[f][k] = Math.acos(dot) * RAD2DEG;
        }
    }
    // ── Rotular ilhas (componentes conexos) via BFS ───────────────────────────
    // Duas faces estão na mesma ilha se compartilham posição (vértice soldado),
    // independente da curvatura. Isso identifica peças fisicamente separadas
    // como cabelo, óculos e roupa em modelos exportados/mesclados.
    const compLabel = new Int32Array(faceCount).fill(-1);
    const compSizeArr = [];
    const stack = new Int32Array(faceCount);
    let compCount = 0;
    for(let start = 0; start < faceCount; start++){
        if (compLabel[start] !== -1) continue;
        const label = compCount++;
        let size = 0;
        let sp = 0;
        stack[sp++] = start;
        compLabel[start] = label;
        while(sp > 0){
            const f = stack[--sp];
            size++;
            const adj = adjList[f];
            for(let i = 0; i < adj.length; i++){
                const nb = adj[i];
                if (compLabel[nb] === -1) {
                    compLabel[nb] = label;
                    stack[sp++] = nb;
                }
            }
        }
        compSizeArr.push(size);
    }
    const compSize = Int32Array.from(compSizeArr);
    geomCache.set(geometry, {
        adjList,
        edgeCost,
        faceNormals,
        faceCount,
        compLabel,
        compSize,
        compCount,
        built: true
    });
}
function smartSelect(geometry, clickedFaceIndex, options = {}) {
    const opts = {
        ...DEFAULT_OPTIONS,
        ...options
    };
    buildAdjacencyCache(geometry, opts.sharpAngle);
    const cache = geomCache.get(geometry);
    const { adjList, edgeCost, faceCount, compLabel, compCount } = cache;
    if (clickedFaceIndex < 0 || clickedFaceIndex >= faceCount) return new Set();
    const clickedIsland = compLabel[clickedFaceIndex];
    // ── Modo ILHA: seleciona a peça inteira (componente conexo) ────────────────
    // Se o modelo tem partes separadas, isto captura exatamente a peça clicada
    // (só o cabelo, só os óculos, só a roupa) sem vazar para nada mais.
    // Fallback: se o modelo é uma única malha soldada (1 ilha), não faz sentido
    // "selecionar tudo", então caímos no modo curvatura automaticamente.
    if (opts.mode === 'island' && compCount > 1) {
        const selected = new Set();
        for(let f = 0; f < faceCount; f++){
            if (compLabel[f] === clickedIsland) selected.add(f);
        }
        return selected;
    }
    // ── Modo CURVATURA: Dijkstra com budget, restrito à ilha clicada ───────────
    // Nunca cruza a fronteira para outra peça (compLabel diferente), evitando
    // vazamento entre partes fisicamente separadas.
    const budget = opts.sharpAngle // budget = o sharpAngle (graus acumulados)
    ;
    const INF = 1e9;
    const dist = new Float32Array(faceCount).fill(INF);
    const visited = new Uint8Array(faceCount);
    dist[clickedFaceIndex] = 0;
    // Heap binário mínimo real — O(log n) push/pop vs O(n) splice anterior
    const heap = new BinaryMinHeap(Math.min(faceCount * 2, 131072));
    heap.push(0, clickedFaceIndex);
    const selected = new Set();
    selected.add(clickedFaceIndex);
    while(!heap.empty && selected.size < opts.maxFaces){
        const cost = heap.popCost();
        const f = heap.lastFace;
        if (visited[f]) continue;
        visited[f] = 1;
        const adj = adjList[f];
        const costs = edgeCost[f];
        for(let i = 0; i < adj.length; i++){
            const nb = adj[i];
            if (visited[nb]) continue;
            // Não sai da peça clicada
            if (compLabel[nb] !== clickedIsland) continue;
            const newCost = cost + costs[i];
            if (newCost <= budget && newCost < dist[nb]) {
                dist[nb] = newCost;
                selected.add(nb);
                heap.push(newCost, nb);
            }
        }
    }
    return selected;
}
// ── Heap binário mínimo — O(log n) push/pop ───────────────────────────────────
// Armazena pares [custo, face] em Float64Array intercalado.
// Float64 mantém custo (float32) e face (int ≤ 2M) sem perda em um único word.
class BinaryMinHeap {
    buf;
    _size = 0;
    lastFace = 0 // preenchido por popCost(), lido pelo caller
    ;
    constructor(initialCapacity = 4096){
        this.buf = new Float64Array(Math.max(initialCapacity, 64) * 2);
    }
    get empty() {
        return this._size === 0;
    }
    push(cost, face) {
        if (this._size * 2 >= this.buf.length) {
            const next = new Float64Array(this.buf.length * 2);
            next.set(this.buf);
            this.buf = next;
        }
        let i = this._size++;
        this.buf[i * 2] = cost;
        this.buf[i * 2 + 1] = face;
        // Sobe na árvore até ordenar
        while(i > 0){
            const p = i - 1 >> 1;
            if (this.buf[p * 2] <= this.buf[i * 2]) break;
            this._swap(p, i);
            i = p;
        }
    }
    /** Retorna o custo mínimo e guarda a face correspondente em `lastFace`. */ popCost() {
        const cost = this.buf[0];
        this.lastFace = this.buf[1];
        const last = --this._size;
        if (last > 0) {
            this.buf[0] = this.buf[last * 2];
            this.buf[1] = this.buf[last * 2 + 1];
            // Desce na árvore
            let i = 0;
            while(true){
                const l = i * 2 + 1, r = l + 1;
                let m = i;
                if (l < this._size && this.buf[l * 2] < this.buf[m * 2]) m = l;
                if (r < this._size && this.buf[r * 2] < this.buf[m * 2]) m = r;
                if (m === i) break;
                this._swap(i, m);
                i = m;
            }
        }
        return cost;
    }
    _swap(a, b) {
        const tc = this.buf[a * 2], tf = this.buf[a * 2 + 1];
        this.buf[a * 2] = this.buf[b * 2];
        this.buf[a * 2 + 1] = this.buf[b * 2 + 1];
        this.buf[b * 2] = tc;
        this.buf[b * 2 + 1] = tf;
    }
}
// ─── Centróides de face (cache) ───────────────────────────────────────────────
// Usado pela borracha para testar quais faces caem dentro do raio do pincel.
const centroidCache = new WeakMap();
function getFaceCentroids(geometry) {
    const cached = centroidCache.get(geometry);
    if (cached) return cached;
    const pos = geometry.getAttribute('position');
    const idx = geometry.index;
    const faceCount = idx ? idx.count / 3 : pos.count / 3;
    const centroids = new Float32Array(faceCount * 3);
    for(let f = 0; f < faceCount; f++){
        const a = idx ? idx.getX(f * 3) : f * 3;
        const b = idx ? idx.getX(f * 3 + 1) : f * 3 + 1;
        const c = idx ? idx.getX(f * 3 + 2) : f * 3 + 2;
        centroids[f * 3] = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3;
        centroids[f * 3 + 1] = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
        centroids[f * 3 + 2] = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3;
    }
    centroidCache.set(geometry, centroids);
    return centroids;
}
const DEFAULT_CONTOUR = {
    strength: 0.6,
    smoothIterations: 4,
    flipRatio: 0.6,
    minAreaFraction: 0.003,
    featureAngle: 42,
    printGuard: true
};
/** Área de cada triângulo da malha (metade do módulo do produto vetorial). */ function computeFaceAreas(geometry) {
    const pos = geometry.getAttribute('position');
    const idx = geometry.index;
    const p = pos.array;
    const faceCount = idx ? idx.count / 3 : pos.count / 3;
    const areas = new Float32Array(faceCount);
    for(let f = 0; f < faceCount; f++){
        const a = idx ? idx.getX(f * 3) : f * 3;
        const b = idx ? idx.getX(f * 3 + 1) : f * 3 + 1;
        const c = idx ? idx.getX(f * 3 + 2) : f * 3 + 2;
        const abx = p[b * 3] - p[a * 3], aby = p[b * 3 + 1] - p[a * 3 + 1], abz = p[b * 3 + 2] - p[a * 3 + 2];
        const acx = p[c * 3] - p[a * 3], acy = p[c * 3 + 1] - p[a * 3 + 1], acz = p[c * 3 + 2] - p[a * 3 + 2];
        const cx = aby * acz - abz * acy;
        const cy = abz * acx - abx * acz;
        const cz = abx * acy - aby * acx;
        areas[f] = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
    }
    return areas;
}
/**
 * Dilata a seleção `k` vezes: toda face vizinha a uma face selecionada entra.
 * (Operador morfológico de crescimento sobre o grafo 1-ring da malha.)
 */ function dilateSelection(inSel, k, adjList) {
    const faceCount = inSel.length;
    for(let it = 0; it < k; it++){
        const add = [];
        for(let f = 0; f < faceCount; f++){
            if (inSel[f]) continue;
            const adj = adjList[f];
            for(let i = 0; i < adj.length; i++){
                if (inSel[adj[i]]) {
                    add.push(f);
                    break;
                }
            }
        }
        if (add.length === 0) break;
        for (const f of add)inSel[f] = 1;
    }
}
/**
 * Erode a seleção `k` vezes: toda face selecionada com vizinho de fora sai.
 * Se `isFeature` for passado, faces sobre relevo real (mecha/ponta) resistem —
 * é o que impede o Smart Contour de "comer" os fios de cabelo ao alisar.
 */ function erodeSelection(inSel, k, adjList, isFeature) {
    const faceCount = inSel.length;
    for(let it = 0; it < k; it++){
        const rem = [];
        for(let f = 0; f < faceCount; f++){
            if (!inSel[f]) continue;
            if (isFeature && isFeature[f]) continue; // relevo real preservado
            const adj = adjList[f];
            for(let i = 0; i < adj.length; i++){
                if (!inSel[adj[i]]) {
                    rem.push(f);
                    break;
                }
            }
        }
        if (rem.length === 0) break;
        for (const f of rem)inSel[f] = 0;
    }
}
function refineSelectionForPrint(geometry, selected, options = {}) {
    const opts = {
        ...DEFAULT_CONTOUR,
        ...options
    };
    if (selected.size === 0) return new Set(selected);
    buildAdjacencyCache(geometry);
    const cache = geomCache.get(geometry);
    if (!cache) return new Set(selected);
    const { adjList, faceNormals, faceCount } = cache;
    const areas = computeFaceAreas(geometry);
    let totalArea = 0;
    for (const f of selected)totalArea += areas[f];
    const minArea = Math.max(totalArea * opts.minAreaFraction, 0);
    const cosFeature = Math.cos(opts.featureAngle * Math.PI / 180);
    // Raio morfológico adaptativo pela intensidade (1..4 faces).
    const strength = Math.max(0, Math.min(1, opts.strength));
    const k = Math.max(1, Math.round(1 + strength * 3));
    const smoothIters = Math.max(0, Math.round(opts.smoothIterations * (0.4 + strength)));
    // ── 0. Curvatura local por face = desvio máximo de normal p/ vizinhos ───────
    // Faces com curvatura alta ficam sobre relevo real (mecha, ponta, volume) e
    // são protegidas da erosão — o que preserva os detalhes que importam.
    const isFeature = new Uint8Array(faceCount);
    for(let f = 0; f < faceCount; f++){
        const adj = adjList[f];
        const nx = faceNormals[f * 3], ny = faceNormals[f * 3 + 1], nz = faceNormals[f * 3 + 2];
        let minDot = 1;
        for(let i = 0; i < adj.length; i++){
            const nb = adj[i];
            const dot = nx * faceNormals[nb * 3] + ny * faceNormals[nb * 3 + 1] + nz * faceNormals[nb * 3 + 2];
            if (dot < minDot) minDot = dot;
        }
        if (minDot < cosFeature) isFeature[f] = 1;
    }
    const inSel = new Uint8Array(faceCount);
    for (const f of selected)inSel[f] = 1;
    // ── 1. Fechamento morfológico: preenche entalhes e vales de serrilhado ──────
    dilateSelection(inSel, k, adjList);
    erodeSelection(inSel, k, adjList, isFeature);
    // ── 2. Abertura morfológica: remove dentes e farpas (relevo preservado) ─────
    erodeSelection(inSel, k, adjList, isFeature);
    dilateSelection(inSel, k, adjList);
    // ── 3. Curvature-flow: alisa a fronteira remanescente por votação ──────────
    let cur = inSel;
    for(let it = 0; it < smoothIters; it++){
        const next = cur.slice();
        let changed = false;
        for(let f = 0; f < faceCount; f++){
            const adj = adjList[f];
            const n = adj.length;
            if (n === 0) continue;
            let diff = 0;
            for(let i = 0; i < n; i++)if (cur[adj[i]] !== cur[f]) diff++;
            const frac = diff / n;
            if (frac < opts.flipRatio) continue;
            // relevo real só inverte se o anel inteiro discordar (ruído gritante)
            if (isFeature[f] && frac < 0.85) continue;
            next[f] = cur[f] ^ 1;
            changed = true;
        }
        cur = next;
        if (!changed) break;
    }
    cur.forEach((v, f)=>{
        inSel[f] = v;
    });
    // ── 4. Limpeza de ilhas e buracos por área ─────────────────────────────────
    removeSmallComponents(inSel, 1, adjList, areas, minArea); // cacos soltos → fora
    removeSmallComponents(inSel, 0, adjList, areas, minArea); // furos pequenos → dentro
    // ── 5. Guarda de imprimibilidade: elimina pescoços/pontes de 1 face ─────────
    if (opts.printGuard) {
        for(let pass = 0; pass < 2; pass++){
            const rem = [];
            for(let f = 0; f < faceCount; f++){
                if (!inSel[f] || isFeature[f]) continue;
                const adj = adjList[f];
                const n = adj.length;
                if (n === 0) continue;
                let selN = 0;
                for(let i = 0; i < n; i++)if (inSel[adj[i]]) selN++;
                // Menos de 1/3 do anel dentro → parede fina / ponta frágil → remove
                if (selN <= 1 || selN / n < 0.34) rem.push(f);
            }
            if (rem.length === 0) break;
            for (const f of rem)inSel[f] = 0;
        }
        // Rebalanceia buracos criados pela guarda
        removeSmallComponents(inSel, 0, adjList, areas, minArea);
    }
    const out = new Set();
    for(let f = 0; f < faceCount; f++)if (inSel[f]) out.add(f);
    // segurança: nunca devolver vazio
    return out.size > 0 ? out : new Set(selected);
}
/**
 * Inverte a rotulação (value → value^1) de componentes conexos do lado `value`
 * cuja área total seja menor que `minArea`. Usa a adjacência 1-ring da malha.
 */ function removeSmallComponents(inSel, value, adjList, areas, minArea) {
    if (minArea <= 0) return;
    const faceCount = inSel.length;
    const visited = new Uint8Array(faceCount);
    const stack = new Int32Array(faceCount);
    for(let start = 0; start < faceCount; start++){
        if (visited[start] || inSel[start] !== value) continue;
        let sp = 0;
        stack[sp++] = start;
        visited[start] = 1;
        const comp = [];
        let area = 0;
        while(sp > 0){
            const f = stack[--sp];
            comp.push(f);
            area += areas[f];
            const adj = adjList[f];
            for(let i = 0; i < adj.length; i++){
                const nb = adj[i];
                if (!visited[nb] && inSel[nb] === value) {
                    visited[nb] = 1;
                    stack[sp++] = nb;
                }
            }
        }
        if (area < minArea) {
            for (const f of comp)inSel[f] = value ^ 1;
        }
    }
}
function autoFillMicroFragments(geometry, selected, minAreaFraction = 0.005) {
    if (selected.size === 0) return {
        cleaned: new Set(),
        addedFaces: 0,
        removedFaces: 0
    };
    buildAdjacencyCache(geometry);
    const cache = geomCache.get(geometry);
    if (!cache) return {
        cleaned: new Set(selected),
        addedFaces: 0,
        removedFaces: 0
    };
    const { adjList, faceCount } = cache;
    const areas = computeFaceAreas(geometry);
    // Área total da seleção → define a escala do limiar
    let selectedArea = 0;
    for (const f of selected)selectedArea += areas[f];
    if (selectedArea <= 0) return {
        cleaned: new Set(selected),
        addedFaces: 0,
        removedFaces: 0
    };
    const minArea = selectedArea * minAreaFraction;
    const inSel = new Uint8Array(faceCount);
    for (const f of selected)inSel[f] = 1;
    // 1. Absorve ilhas não-selecionadas pequenas (buracos minúsculos → dentro)
    removeSmallComponents(inSel, 0, adjList, areas, minArea);
    // 2. Remove cacos selecionados pequenos isolados do corpo principal
    removeSmallComponents(inSel, 1, adjList, areas, minArea);
    // Conta diferenças
    let addedFaces = 0, removedFaces = 0;
    for(let f = 0; f < faceCount; f++){
        if (inSel[f]) {
            if (!selected.has(f)) addedFaces++;
        } else {
            if (selected.has(f)) removedFaces++;
        }
    }
    const cleaned = new Set();
    for(let f = 0; f < faceCount; f++)if (inSel[f]) cleaned.add(f);
    // Segurança: nunca retornar seleção vazia
    return {
        cleaned: cleaned.size > 0 ? cleaned : new Set(selected),
        addedFaces,
        removedFaces
    };
}
// ─── Pintura de vertex colors ─────────────────────────────────────────────────
const C_SELECTED = [
    1.00,
    0.38,
    0.00
] // laranja vivo
;
const C_HOVER = [
    1.00,
    0.65,
    0.10
] // laranja hover
;
const C_HOVER_SUB = [
    0.20,
    0.50,
    1.00
] // azul subtract
;
const C_BASE = [
    0.50,
    0.50,
    0.52
] // cinza neutro
;
const C_DIMMED = [
    0.10,
    0.10,
    0.11
] // quase preto
;
function ensureColorAttribute(geometry, material) {
    material.color.set(0xffffff);
    material.vertexColors = true;
    material.needsUpdate = true;
    let attr = geometry.getAttribute('color');
    if (attr) return attr;
    const vertCount = geometry.getAttribute('position').count;
    const colors = new Float32Array(vertCount * 3);
    for(let i = 0; i < vertCount; i++){
        colors[i * 3] = C_BASE[0];
        colors[i * 3 + 1] = C_BASE[1];
        colors[i * 3 + 2] = C_BASE[2];
    }
    attr = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](colors, 3);
    attr.setUsage(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DynamicDrawUsage"]);
    geometry.setAttribute('color', attr);
    return attr;
}
function vertexOf(geometry, face, corner) {
    const idx = geometry.index;
    const base = face * 3 + corner;
    return idx ? idx.getX(base) : base;
}
function paintFaces(geometry, colorAttr, selected, hovered, mode) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    const colors = colorAttr.array;
    const hasSel = selected.size > 0;
    for(let f = 0; f < faceCount; f++){
        const isSel = selected.has(f);
        const isHov = hovered.has(f);
        let col;
        if (isSel && isHov && mode === 'subtract') col = C_HOVER_SUB;
        else if (isSel) col = C_SELECTED;
        else if (isHov) col = mode === 'subtract' ? C_BASE : C_HOVER;
        else if (hasSel) col = C_DIMMED;
        else col = C_BASE;
        for(let c = 0; c < 3; c++){
            const vi = vertexOf(geometry, f, c);
            colors[vi * 3] = col[0];
            colors[vi * 3 + 1] = col[1];
            colors[vi * 3 + 2] = col[2];
        }
    }
    colorAttr.needsUpdate = true;
}
function paintFacesDelta(geometry, colorAttr, prevSelected, nextSelected, mode) {
    const colors = colorAttr.array;
    const hasNext = nextSelected.size > 0;
    const hadPrev = prevSelected.size > 0;
    // Transição entre "sem seleção" e "com seleção": bulk-fill TypedArray em loop
    // compacto (~10× mais rápido que iterar faceCount faces com Set.has()), depois
    // apenas as faces selecionadas recebem a cor laranja por cima.
    if (hadPrev !== hasNext) {
        const [br, bg, bb] = hasNext ? C_DIMMED : C_BASE;
        for(let i = 0; i < colors.length; i += 3){
            colors[i] = br;
            colors[i + 1] = bg;
            colors[i + 2] = bb;
        }
        const [sr, sg, sb] = C_SELECTED;
        for (const f of nextSelected){
            for(let c = 0; c < 3; c++){
                const vi = vertexOf(geometry, f, c);
                colors[vi * 3] = sr;
                colors[vi * 3 + 1] = sg;
                colors[vi * 3 + 2] = sb;
            }
        }
        colorAttr.needsUpdate = true;
        return;
    }
    // Mesmo estado de seleção (ambos vazios ou ambos com faces): pintar só o diff
    const [dr, dg, db] = hasNext ? C_DIMMED : C_BASE;
    const [sr, sg, sb] = C_SELECTED;
    for (const f of prevSelected){
        if (nextSelected.has(f)) continue;
        for(let c = 0; c < 3; c++){
            const vi = vertexOf(geometry, f, c);
            colors[vi * 3] = dr;
            colors[vi * 3 + 1] = dg;
            colors[vi * 3 + 2] = db;
        }
    }
    for (const f of nextSelected){
        if (prevSelected.has(f)) continue;
        for(let c = 0; c < 3; c++){
            const vi = vertexOf(geometry, f, c);
            colors[vi * 3] = sr;
            colors[vi * 3 + 1] = sg;
            colors[vi * 3 + 2] = sb;
        }
    }
    colorAttr.needsUpdate = true;
}
function paintHoverDelta(geometry, colorAttr, selected, prevHover, nextHover, mode) {
    const colors = colorAttr.array;
    const hasSel = selected.size > 0;
    const paint = (f, col)=>{
        for(let c = 0; c < 3; c++){
            const vi = vertexOf(geometry, f, c);
            colors[vi * 3] = col[0];
            colors[vi * 3 + 1] = col[1];
            colors[vi * 3 + 2] = col[2];
        }
    };
    for (const f of prevHover){
        if (nextHover.has(f)) continue;
        paint(f, selected.has(f) ? C_SELECTED : hasSel ? C_DIMMED : C_BASE);
    }
    for (const f of nextHover){
        if (prevHover.has(f)) continue;
        if (selected.has(f) && mode !== 'subtract') continue; // já laranja
        let col;
        if (selected.has(f) && mode === 'subtract') col = C_HOVER_SUB;
        else col = mode === 'subtract' ? C_BASE : C_HOVER;
        paint(f, col);
    }
    colorAttr.needsUpdate = true;
}
function computeSmoothNormalsByPosition(geometry) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const vertCount = posAttr.count;
    const faceCount = idxAttr ? idxAttr.count / 3 : vertCount / 3;
    // Hash numérico 48-bit — elimina string allocation vs versão anterior
    const QN = 10, OFFN = 32768;
    const keyN = (v)=>{
        const x = Math.round(posAttr.getX(v) * QN) + OFFN & 0xFFFF;
        const y = Math.round(posAttr.getY(v) * QN) + OFFN & 0xFFFF;
        const z = Math.round(posAttr.getZ(v) * QN) + OFFN & 0xFFFF;
        return x + y * 65536 + z * 65536 * 65536;
    };
    // Acumula a normal (ponderada por área) por posição
    const accum = new Map();
    for(let f = 0; f < faceCount; f++){
        const a = idxAttr ? idxAttr.getX(f * 3) : f * 3;
        const b = idxAttr ? idxAttr.getX(f * 3 + 1) : f * 3 + 1;
        const c = idxAttr ? idxAttr.getX(f * 3 + 2) : f * 3 + 2;
        const ax = posAttr.getX(a), ay = posAttr.getY(a), az = posAttr.getZ(a);
        const bx = posAttr.getX(b), by = posAttr.getY(b), bz = posAttr.getZ(b);
        const cx = posAttr.getX(c), cy = posAttr.getY(c), cz = posAttr.getZ(c);
        const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
        const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        for (const v of [
            a,
            b,
            c
        ]){
            const k = keyN(v);
            const cur = accum.get(k);
            if (cur) {
                cur[0] += nx;
                cur[1] += ny;
                cur[2] += nz;
            } else accum.set(k, [
                nx,
                ny,
                nz
            ]);
        }
    }
    const normals = new Float32Array(vertCount * 3);
    for(let v = 0; v < vertCount; v++){
        const n = accum.get(keyN(v));
        if (n) {
            const len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1;
            normals[v * 3] = n[0] / len;
            normals[v * 3 + 1] = n[1] / len;
            normals[v * 3 + 2] = n[2] / len;
        }
    }
    geometry.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](normals, 3));
    geometry.getAttribute('normal').needsUpdate = true;
}
function buildCap(geometry, faceSet, weldQ = 1e4) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faces = Array.isArray(faceSet) ? faceSet : Array.from(faceSet);
    if (faces.length === 0) return {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
    // ── 1. Quantização e soldagem de vértices ──────────────────────────────────
    const Q = weldQ;
    const keyToId = new Map();
    const idPx = [] // posição x,y,z por ID
    ;
    const vId = (v)=>{
        const k = `${Math.round(posAttr.getX(v) * Q)},${Math.round(posAttr.getY(v) * Q)},${Math.round(posAttr.getZ(v) * Q)}`;
        let id = keyToId.get(k);
        if (id === undefined) {
            id = idPx.length / 3;
            keyToId.set(k, id);
            idPx.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
        }
        return id;
    };
    // ── 2. Arestas direcionadas — borda = aresta sem reverso ───────────────────
    // Usa string-key para evitar colisão numérica com modelos grandes
    const dirEdgeSet = new Set();
    const facesIds = [];
    for (const f of faces){
        const a = vId(idxAttr ? idxAttr.getX(f * 3) : f * 3);
        const b = vId(idxAttr ? idxAttr.getX(f * 3 + 1) : f * 3 + 1);
        const c = vId(idxAttr ? idxAttr.getX(f * 3 + 2) : f * 3 + 2);
        facesIds.push([
            a,
            b,
            c
        ]);
        dirEdgeSet.add(`${a}>${b}`);
        dirEdgeSet.add(`${b}>${c}`);
        dirEdgeSet.add(`${c}>${a}`);
    }
    // Grafo direcionado de arestas de borda: para cada nó, lista de saídas
    const outEdges = new Map();
    for (const [a, b, c] of facesIds){
        for (const [x, y] of [
            [
                a,
                b
            ],
            [
                b,
                c
            ],
            [
                c,
                a
            ]
        ]){
            // Aresta de borda: x→y existe mas y→x não existe
            if (!dirEdgeSet.has(`${y}>${x}`)) {
                // Tampa: percorremos y→x (inverso) para orientar a face "para fora"
                let list = outEdges.get(y);
                if (!list) {
                    list = [];
                    outEdges.set(y, list);
                }
                if (!list.includes(x)) list.push(x);
            }
        }
    }
    if (outEdges.size === 0) return {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
    // ── 3. Chain-following: extrai loops fechados ──────────────────────────────
    const nextPtr = new Map();
    const rawLoops = [];
    for (const [startNode] of outEdges){
        while(true){
            const ptr = nextPtr.get(startNode) ?? 0;
            const outs = outEdges.get(startNode);
            if (!outs || ptr >= outs.length) break;
            const chain = [];
            let cur = startNode;
            const maxSteps = idPx.length / 3 + 4;
            let steps = 0;
            let closed = false;
            while(steps++ < maxSteps){
                const cPtr = nextPtr.get(cur) ?? 0;
                const cOuts = outEdges.get(cur);
                if (!cOuts || cPtr >= cOuts.length) break;
                chain.push(cur);
                const next = cOuts[cPtr];
                nextPtr.set(cur, cPtr + 1);
                if (next === startNode) {
                    closed = true;
                    break;
                }
                cur = next;
            }
            if (closed && chain.length >= 3) rawLoops.push({
                ids: chain
            });
        }
    }
    if (rawLoops.length === 0) return {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
    // ── 4. High-quality cap generation via generateCap pipeline ───────────────
    const allPos = [];
    const allNrm = [];
    for (const { ids } of rawLoops){
        const pts3d = ids.map((id)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](idPx[id * 3], idPx[id * 3 + 1], idPx[id * 3 + 2]));
        if (pts3d.length < 3) continue;
        const { pos, nrm } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cap$2d$generation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCap"])(pts3d);
        for(let i = 0; i < pos.length; i++)allPos.push(pos[i]);
        for(let i = 0; i < nrm.length; i++)allNrm.push(nrm[i]);
    }
    return {
        pos: new Float32Array(allPos),
        nrm: new Float32Array(allNrm)
    };
}
function removeSubMesh(geometry, facesToRemove, weldQ = 1e4) {
    const posAttr = geometry.getAttribute('position');
    const normalAttr = geometry.getAttribute('normal');
    const uvAttr = geometry.getAttribute('uv');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    // Faces que permanecem
    const keepFaces = [];
    for(let f = 0; f < faceCount; f++){
        if (!facesToRemove.has(f)) keepFaces.push(f);
    }
    // Tampa que fecha a seção do corte (contorno aberto das faces mantidas)
    const cap = buildCap(geometry, keepFaces, weldQ);
    const capVerts = cap.pos.length / 3;
    const shellVerts = keepFaces.length * 3;
    const vCount = shellVerts + capVerts;
    const newPos = new Float32Array(vCount * 3);
    const newNormal = new Float32Array(vCount * 3);
    const newUV = uvAttr ? new Float32Array(vCount * 2) : null;
    let w = 0;
    for (const f of keepFaces){
        for(let c = 0; c < 3; c++){
            const v = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            newPos[w * 3] = posAttr.getX(v);
            newPos[w * 3 + 1] = posAttr.getY(v);
            newPos[w * 3 + 2] = posAttr.getZ(v);
            if (normalAttr) {
                newNormal[w * 3] = normalAttr.getX(v);
                newNormal[w * 3 + 1] = normalAttr.getY(v);
                newNormal[w * 3 + 2] = normalAttr.getZ(v);
            }
            if (newUV) {
                newUV[w * 2] = uvAttr.getX(v);
                newUV[w * 2 + 1] = uvAttr.getY(v);
            }
            w++;
        }
    }
    // Anexa os vértices da tampa
    if (capVerts > 0) {
        newPos.set(cap.pos, shellVerts * 3);
        newNormal.set(cap.nrm, shellVerts * 3);
    // UV da tampa fica em (0,0) — o array já vem zerado
    }
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newPos, 3));
    geo.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newNormal, 3));
    if (newUV) geo.setAttribute('uv', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newUV, 2));
    // Sempre recalcula normais para garantir consistência com a nova tampa
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
function extractSubMesh(geometry, selectedFaces, cap = true, weldQ = 1e5) {
    const posAttr = geometry.getAttribute('position');
    const uvAttr = geometry.getAttribute('uv');
    const idxAttr = geometry.index;
    const faceArr = Array.from(selectedFaces);
    const maxV = faceArr.length * 3;
    // ── Coletar vértices únicos por posição para soldagem ──────────────────────
    const Q = weldQ;
    const posKey = (v)=>{
        const x = Math.round(posAttr.getX(v) * Q);
        const y = Math.round(posAttr.getY(v) * Q);
        const z = Math.round(posAttr.getZ(v) * Q);
        return `${x},${y},${z}`;
    };
    // uid unificado por posição → novo índice
    const uidToNew = new Map();
    const newPos = [];
    const newUV = [];
    const faceRaw = [] // [a0,b0,c0, a1,b1,c1 ...] raw indices originais
    ;
    for (const fi of faceArr){
        const b3 = fi * 3;
        const a = idxAttr ? idxAttr.getX(b3) : b3;
        const b = idxAttr ? idxAttr.getX(b3 + 1) : b3 + 1;
        const c = idxAttr ? idxAttr.getX(b3 + 2) : b3 + 2;
        faceRaw.push(a, b, c);
    }
    const rawToNew = new Int32Array(faceRaw.length);
    for(let i = 0; i < faceRaw.length; i++){
        const v = faceRaw[i];
        const key = posKey(v);
        let nv = uidToNew.get(key);
        if (nv === undefined) {
            nv = newPos.length / 3;
            uidToNew.set(key, nv);
            newPos.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
            if (uvAttr) newUV.push(uvAttr.getX(v), uvAttr.getY(v));
        }
        rawToNew[i] = nv;
    }
    const vertCount = newPos.length / 3;
    const newIdx = new Uint32Array(faceRaw.length);
    for(let i = 0; i < faceRaw.length; i++)newIdx[i] = rawToNew[i];
    // ── Normais suaves: acumular contribuição de cada face em cada vértice ──────
    const normals = new Float32Array(vertCount * 3) // zero init
    ;
    for(let fi = 0; fi < faceArr.length; fi++){
        const ia = newIdx[fi * 3], ib = newIdx[fi * 3 + 1], ic = newIdx[fi * 3 + 2];
        const ax = newPos[ia * 3], ay = newPos[ia * 3 + 1], az = newPos[ia * 3 + 2];
        const bx = newPos[ib * 3], by = newPos[ib * 3 + 1], bz = newPos[ib * 3 + 2];
        const cx = newPos[ic * 3], cy = newPos[ic * 3 + 1], cz = newPos[ic * 3 + 2];
        // Normal da face (não normalizada = peso pela área)
        const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
        const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        for (const vi of [
            ia,
            ib,
            ic
        ]){
            normals[vi * 3] += nx;
            normals[vi * 3 + 1] += ny;
            normals[vi * 3 + 2] += nz;
        }
    }
    // Normalizar
    for(let v = 0; v < vertCount; v++){
        const len = Math.sqrt(normals[v * 3] ** 2 + normals[v * 3 + 1] ** 2 + normals[v * 3 + 2] ** 2);
        if (len > 1e-10) {
            normals[v * 3] /= len;
            normals[v * 3 + 1] /= len;
            normals[v * 3 + 2] /= len;
        }
    }
    // ── Tampa: fecha a seção do corte → peça MACIÇA (volume fechado) ────────────
    // Sem a tampa, a peça é uma casca aberta e o fatiador não consegue preenchê-la.
    // buildCap gera os triângulos que tapam o(s) contorno(s) aberto(s) da seleção,
    // com orientação autoconsistente para este conjunto de faces.
    const capData = cap ? buildCap(geometry, selectedFaces, weldQ) : {
        pos: new Float32Array(0),
        nrm: new Float32Array(0)
    };
    const capVertCount = capData.pos.length / 3;
    const shellVertCount = vertCount // vértices soldados da casca
    ;
    const totalVertCount = shellVertCount + capVertCount;
    // Posições: casca soldada + vértices da tampa (sopa de triângulos)
    const finalPos = new Float32Array(totalVertCount * 3);
    finalPos.set(newPos, 0);
    if (capVertCount > 0) finalPos.set(capData.pos, shellVertCount * 3);
    // Normais: casca (suaves) + tampa (planas)
    const finalNrm = new Float32Array(totalVertCount * 3);
    finalNrm.set(normals, 0);
    if (capVertCount > 0) finalNrm.set(capData.nrm, shellVertCount * 3);
    // Índices: casca (indexada) + tampa (índices sequenciais)
    const finalIdx = new Uint32Array(newIdx.length + capVertCount);
    finalIdx.set(newIdx, 0);
    for(let i = 0; i < capVertCount; i++)finalIdx[newIdx.length + i] = shellVertCount + i;
    // UV: tampa fica em (0,0) — array já vem zerado
    let finalUV = null;
    if (uvAttr) {
        finalUV = new Float32Array(totalVertCount * 2);
        finalUV.set(newUV, 0);
    }
    // ── Montar geometria final ─────────────────────────────────────────────────
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](finalPos, 3));
    geo.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](finalNrm, 3));
    if (finalUV) geo.setAttribute('uv', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](finalUV, 2));
    geo.setIndex(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](finalIdx, 1));
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/model-loader.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportMesh",
    ()=>exportMesh,
    "loadModel",
    ()=>loadModel
]);
/**
 * Model Loader — Importação otimizada de modelos 3D
 * Suporte: STL, OBJ, GLB, GLTF, PLY
 * Otimizações:
 * - Leitura via ArrayBuffer (zero-copy)
 * - Decimação automática para modelos > DECIMATE_THRESHOLD triângulos
 * - mergeVertices para reduzir duplicatas e permitir índices
 * - computeBoundsTree via three-mesh-bvh para raycasting O(log n)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
// Loaders are imported lazily inside each function so they are only fetched
// when the user actually opens a file of that format. This keeps the initial
// bundle lean — Three.js core is still loaded eagerly (needed everywhere),
// but the per-format parser code is split into separate dynamic chunks.
/** Acima deste limite de triângulos, sugerir decimação */ const DECIMATE_THRESHOLD = 800_000;
async function loadModel(file) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    // Ler arquivo uma única vez como ArrayBuffer
    const buffer = await file.arrayBuffer();
    let geometry = null;
    if (ext === 'stl') {
        geometry = await loadSTLFromBuffer(buffer);
    } else if (ext === 'obj') {
        geometry = await loadOBJFromText(buffer);
    } else if (ext === 'ply') {
        geometry = await loadPLYFromBuffer(buffer);
    } else if (ext === 'glb' || ext === 'gltf') {
        geometry = await loadGLTFFromBuffer(buffer, file.name);
    } else {
        throw new Error(`Formato .${ext} não suportado.`);
    }
    if (!geometry) throw new Error('Falha ao carregar geometria.');
    // ── Garantir índices (mergeVertices reduz vértices duplicados e cria index) ──
    // Só para geometrias não-indexadas (STL binário típico)
    let faceCount = geometry.index ? geometry.index.count / 3 : geometry.getAttribute('position').count / 3;
    // Converter para indexado se não tiver índice (melhora performance do BVH)
    if (!geometry.index) {
        // Criar índices triviais — permite cache de adjacência e BVH
        const posAttr = geometry.getAttribute('position');
        const indices = new Uint32Array(posAttr.count);
        for(let i = 0; i < posAttr.count; i++)indices[i] = i;
        geometry.setIndex(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](indices, 1));
    }
    // Decimação leve para modelos muito pesados
    let wasDecimated = false;
    if (faceCount > DECIMATE_THRESHOLD) {
        geometry = decimateGeometry(geometry, DECIMATE_THRESHOLD);
        wasDecimated = true;
        faceCount = geometry.index ? geometry.index.count / 3 : geometry.getAttribute('position').count / 3;
    }
    // Normais e bounding
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    // Centralizar
    const box = geometry.boundingBox;
    const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    box.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
    // Recalcular bounds após translação
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    // Material — aparência de peça SÓLIDA (chapada), não de casca.
    // • side: FrontSide → backface culling. Como o modelo é um sólido fechado,
    //   ver só as faces frontais faz a peça parecer maciça (sem enxergar as
    //   paredes internas, o que dava o efeito de "casca de papel" com DoubleSide).
    // • flatShading → cada face recebe sua própria normal (facetado), leitura
    //   típica de peça física / preparação para impressão 3D, em vez do brilho
    //   suave que fazia chapas planas parecerem finas.
    const material = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](0x888888),
        roughness: 0.6,
        metalness: 0.1,
        // DoubleSide garante que modelos com normais invertidas (winding incorreto)
        // ainda apareçam visíveis — correção crítica para compatibilidade geral.
        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"],
        flatShading: true
    });
    const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](geometry, material);
    mesh.name = file.name;
    // Sem castShadow/receiveShadow — não usamos sombras para CAD
    // Informações do modelo
    const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    geometry.boundingBox.getSize(size);
    const posAttr = geometry.getAttribute('position');
    const info = {
        name: file.name,
        vertices: posAttr.count,
        faces: faceCount,
        width: parseFloat(size.x.toFixed(2)),
        height: parseFloat(size.y.toFixed(2)),
        depth: parseFloat(size.z.toFixed(2)),
        fileSize: formatFileSize(file.size)
    };
    return {
        mesh,
        info,
        wasDecimated
    };
}
// ─── Loaders sincronos / assíncronos usando buffer direto ─────────────────
async function loadSTLFromBuffer(buffer) {
    const { STLLoader } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/loaders/STLLoader.js [app-client] (ecmascript, async loader)");
    return new STLLoader().parse(buffer);
}
async function loadOBJFromText(buffer) {
    const { OBJLoader } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/loaders/OBJLoader.js [app-client] (ecmascript, async loader)");
    const text = new TextDecoder().decode(buffer);
    const loader = new OBJLoader();
    const obj = loader.parse(text);
    const geometries = [];
    obj.traverse((child)=>{
        if (child.isMesh) {
            const m = child;
            const g = m.geometry.clone();
            g.applyMatrix4(m.matrixWorld);
            geometries.push(g);
        }
    });
    if (geometries.length === 0) throw new Error('Nenhuma geometria encontrada no OBJ.');
    if (geometries.length === 1) return geometries[0];
    return mergeGeometriesFast(geometries);
}
async function loadPLYFromBuffer(buffer) {
    const { PLYLoader } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/loaders/PLYLoader.js [app-client] (ecmascript, async loader)");
    return new PLYLoader().parse(buffer);
}
async function loadGLTFFromBuffer(buffer, filename) {
    return new Promise((resolve, reject)=>{
        const loader = new GLTFLoader();
        const ext = filename.split('.').pop()?.toLowerCase();
        loader.parse(buffer, '', (gltf)=>{
            const geometries = [];
            gltf.scene.traverse((child)=>{
                if (child.isMesh) {
                    const m = child;
                    const g = m.geometry.clone();
                    g.applyMatrix4(child.matrixWorld);
                    geometries.push(g);
                }
            });
            if (geometries.length === 0) {
                reject(new Error('Nenhuma geometria encontrada.'));
                return;
            }
            resolve(geometries.length === 1 ? geometries[0] : mergeGeometriesFast(geometries));
        }, reject);
    });
}
// ─── Merge de geometrias com typed arrays ─────────────────────────────────
function mergeGeometriesFast(geos) {
    let totalVerts = 0;
    let totalIdx = 0;
    for (const g of geos){
        const p = g.getAttribute('position');
        totalVerts += p.count;
        totalIdx += g.index ? g.index.count : p.count;
    }
    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const indices = new Uint32Array(totalIdx);
    let vOff = 0;
    let iOff = 0;
    for (const g of geos){
        const p = g.getAttribute('position');
        const n = g.getAttribute('normal');
        const idx = g.index;
        for(let i = 0; i < p.count; i++){
            const d = (vOff + i) * 3;
            positions[d] = p.getX(i);
            positions[d + 1] = p.getY(i);
            positions[d + 2] = p.getZ(i);
            if (n) {
                normals[d] = n.getX(i);
                normals[d + 1] = n.getY(i);
                normals[d + 2] = n.getZ(i);
            }
        }
        if (idx) {
            for(let i = 0; i < idx.count; i++)indices[iOff++] = idx.getX(i) + vOff;
        } else {
            for(let i = 0; i < p.count; i++)indices[iOff++] = i + vOff;
        }
        vOff += p.count;
    }
    const merged = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    merged.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](positions, 3));
    merged.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](normals, 3));
    merged.setIndex(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](indices, 1));
    return merged;
}
// ─── Decimação simples por stride (preserva estrutura, reduz carga) ────────
function decimateGeometry(geo, targetFaces) {
    const indexAttr = geo.index;
    const posAttr = geo.getAttribute('position');
    const faceCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
    const keepEvery = Math.ceil(faceCount / targetFaces);
    const newPositions = [];
    const newNormals = [];
    const newIndices = [];
    const normalAttr = geo.getAttribute('normal');
    let vi = 0;
    for(let f = 0; f < faceCount; f += keepEvery){
        const base = f * 3;
        const a = indexAttr ? indexAttr.getX(base) : base;
        const b = indexAttr ? indexAttr.getX(base + 1) : base + 1;
        const c = indexAttr ? indexAttr.getX(base + 2) : base + 2;
        for (const v of [
            a,
            b,
            c
        ]){
            newPositions.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
            if (normalAttr) {
                newNormals.push(normalAttr.getX(v), normalAttr.getY(v), normalAttr.getZ(v));
            }
        }
        newIndices.push(vi, vi + 1, vi + 2);
        vi += 3;
    }
    const dec = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    dec.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newPositions, 3));
    if (newNormals.length > 0) {
        dec.setAttribute('normal', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](newNormals, 3));
    }
    dec.setIndex(newIndices);
    return dec;
}
async function exportMesh(mesh, format = 'stl', filename = 'model') {
    if (format === 'stl') {
        const { STLExporter } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/exporters/STLExporter.js [app-client] (ecmascript, async loader)");
        const result = new STLExporter().parse(mesh, {
            binary: true
        });
        downloadBlob(new Blob([
            result
        ], {
            type: 'application/octet-stream'
        }), `${filename}.stl`);
    } else {
        const { OBJExporter } = await __turbopack_context__.A("[project]/node_modules/three/examples/jsm/exporters/OBJExporter.js [app-client] (ecmascript, async loader)");
        const result = new OBJExporter().parse(mesh);
        downloadBlob(new Blob([
            result
        ], {
            type: 'text/plain'
        }), `${filename}.obj`);
    }
}
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
"[project]/components/viewport/cut-preview-overlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CutPreviewOverlay",
    ()=>CutPreviewOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * CutPreviewOverlay V2 — Visualização interativa 3D do pipeline de corte.
 *
 * Suporta os modos de visualização do SmartCut V2:
 *   'plane'      → mostra apenas a linha de corte (isocontorno)
 *   'shell'      → cascas abertas (Etapas 1–3, sem tampas)
 *   'caps'       → peças com tampas geradas (Etapas 4–6)
 *   'connectors' → igual a 'caps' (encaixes são aplicados ao final)
 *   'final'      → resultado final (igual a 'caps')
 *
 * Para compatibilidade, quando autoCutPreviewMode não está ativo,
 * usa o comportamento legado com cutPreview e previewViewMode.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-client] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function CutPreviewOverlay() {
    _s();
    const cutPreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CutPreviewOverlay.useAppStore[cutPreview]": (s)=>s.cutPreview
    }["CutPreviewOverlay.useAppStore[cutPreview]"]);
    const openCutData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CutPreviewOverlay.useAppStore[openCutData]": (s)=>s.openCutData
    }["CutPreviewOverlay.useAppStore[openCutData]"]);
    const autoCutPreviewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CutPreviewOverlay.useAppStore[autoCutPreviewMode]": (s)=>s.autoCutPreviewMode
    }["CutPreviewOverlay.useAppStore[autoCutPreviewMode]"]);
    const autoCutPipelineStage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CutPreviewOverlay.useAppStore[autoCutPipelineStage]": (s)=>s.autoCutPipelineStage
    }["CutPreviewOverlay.useAppStore[autoCutPipelineStage]"]);
    const previewViewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CutPreviewOverlay.useAppStore[previewViewMode]": (s)=>s.previewViewMode
    }["CutPreviewOverlay.useAppStore[previewViewMode]"]);
    const modelMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CutPreviewOverlay.useAppStore[modelMesh]": (s)=>s.modelMesh
    }["CutPreviewOverlay.useAppStore[modelMesh]"]);
    const [seamGeo, setSeamGeo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const seamGeoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Determina quais geometrias mostrar de acordo com o modo
    const showShell = autoCutPreviewMode === 'shell' && autoCutPipelineStage !== 'idle' && !!openCutData;
    const showCaps = (autoCutPreviewMode === 'caps' || autoCutPreviewMode === 'connectors' || autoCutPreviewMode === 'final') && !!cutPreview;
    const showPlane = autoCutPreviewMode === 'plane';
    // Fallback: legado (quando o pipeline V2 não está ativo)
    const legacyMode = autoCutPipelineStage === 'idle' && !!cutPreview;
    const selectedGeo = showShell ? openCutData.openSelectedGeometry : showCaps ? cutPreview.selectedGeometry : legacyMode ? cutPreview.selectedGeometry : null;
    const bodyGeo = showShell ? openCutData.openBodyGeometry : showCaps ? cutPreview.bodyGeometry : legacyMode ? cutPreview.bodyGeometry : null;
    // Pontos do isocontorno (seam line)
    const seamPoints = showShell ? openCutData.seamPoints : cutPreview?.seamPoints ?? null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CutPreviewOverlay.useEffect": ()=>{
            if (seamGeoRef.current) {
                seamGeoRef.current.dispose();
                seamGeoRef.current = null;
            }
            if (seamPoints && seamPoints.length > 0) {
                const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
                geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](seamPoints, 3));
                seamGeoRef.current = geo;
                setSeamGeo(geo);
            } else {
                setSeamGeo(null);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
            return ({
                "CutPreviewOverlay.useEffect": ()=>{
                    if (seamGeoRef.current) {
                        seamGeoRef.current.dispose();
                        seamGeoRef.current = null;
                    }
                }
            })["CutPreviewOverlay.useEffect"];
        }
    }["CutPreviewOverlay.useEffect"], [
        seamPoints
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CutPreviewOverlay.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        }
    }["CutPreviewOverlay.useEffect"], [
        previewViewMode,
        autoCutPreviewMode,
        selectedGeo,
        bodyGeo
    ]);
    if (!modelMesh) return null;
    if (!selectedGeo && !showPlane) return null;
    const pos = modelMesh.position.toArray();
    const rot = [
        modelMesh.rotation.x,
        modelMesh.rotation.y,
        modelMesh.rotation.z
    ];
    const scale = modelMesh.scale.toArray();
    const wireframe = previewViewMode === 'wireframe';
    const xray = previewViewMode === 'xray';
    const isShell = cutPreview?.params.cutType === 'shell';
    // Cor da peça selecionada depende do modo
    // Shell (cascas abertas) → laranja translúcido; Tampas → vermelho translúcido
    const selectedColor = showShell ? '#ff8800' : isShell ? '#3388ff' : '#ff2222';
    const selectedOpacity = wireframe ? 1 : showShell ? 0.35 : isShell ? 0.55 : 0.42;
    // Modo 'plane': mostra só a linha de corte, sem geometrias de peça
    if (showPlane && !selectedGeo) {
        if (!seamGeo) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
            position: pos,
            rotation: rot,
            scale: scale,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                geometry: seamGeo,
                renderOrder: 999,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                    color: "#00aaff",
                    transparent: true,
                    opacity: 0.95,
                    depthTest: false
                }, void 0, false, {
                    fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                    lineNumber: 104,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                lineNumber: 103,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
            lineNumber: 102,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: pos,
        rotation: rot,
        scale: scale,
        children: [
            bodyGeo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                geometry: bodyGeo,
                renderOrder: 1,
                castShadow: true,
                receiveShadow: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                    color: "#8a8a8d",
                    roughness: 0.6,
                    metalness: 0.05,
                    transparent: xray,
                    opacity: xray ? 0.25 : 1,
                    wireframe: wireframe,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"],
                    depthWrite: !xray
                }, void 0, false, {
                    fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                    lineNumber: 115,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                lineNumber: 114,
                columnNumber: 9
            }, this),
            selectedGeo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                geometry: selectedGeo,
                renderOrder: 2,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                    color: selectedColor,
                    roughness: showShell ? 0.7 : isShell ? 0.35 : 0.5,
                    metalness: showShell ? 0.0 : isShell ? 0.15 : 0.1,
                    transparent: true,
                    opacity: selectedOpacity,
                    wireframe: wireframe,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"],
                    depthWrite: false
                }, void 0, false, {
                    fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                    lineNumber: 131,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                lineNumber: 130,
                columnNumber: 9
            }, this),
            seamGeo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                geometry: seamGeo,
                renderOrder: 999,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                    color: showPlane || showShell ? '#00aaff' : '#ffffff',
                    transparent: true,
                    opacity: 0.9,
                    depthTest: false
                }, void 0, false, {
                    fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                    lineNumber: 147,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
                lineNumber: 146,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/cut-preview-overlay.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s(CutPreviewOverlay, "fGaMZcOuIGokM+1hJSUNgkw7Yvg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = CutPreviewOverlay;
var _c;
__turbopack_context__.k.register(_c, "CutPreviewOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/viewport/model-renderer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModelRenderer",
    ()=>ModelRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-client] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/solid-plane-cut.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$cut$2d$preview$2d$overlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/viewport/cut-preview-overlay.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// Geometrias de plano pré-alocadas fora do ciclo de render — reutilizadas por
// todas as instâncias de preview, evitando criação de objeto a cada render.
const _PLANE_GEO_CACHE = new Map();
function getPlaneGeo(size) {
    // Arredonda para 2 casas decimais para maximizar cache hits
    const key = Math.round(size * 100);
    let geo = _PLANE_GEO_CACHE.get(key);
    if (!geo) {
        geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlaneGeometry"](size, size);
        _PLANE_GEO_CACHE.set(key, geo);
    }
    return geo;
}
/**
 * Verdadeiro quando o CutPreviewOverlay está exibindo geometria de peça
 * (casca, tampas ou preview legado) — nesses casos o modelo original e as
 * peças já cortadas devem ficar ocultos para não sobrepor o overlay.
 * No modo 'plane' o overlay mostra apenas a linha de corte, então o
 * modelo permanece visível.
 */ function useCutOverlayActive() {
    _s();
    const cutPreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useCutOverlayActive.useAppStore[cutPreview]": (s)=>s.cutPreview
    }["useCutOverlayActive.useAppStore[cutPreview]"]);
    const openCutData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useCutOverlayActive.useAppStore[openCutData]": (s)=>s.openCutData
    }["useCutOverlayActive.useAppStore[openCutData]"]);
    const autoCutPreviewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useCutOverlayActive.useAppStore[autoCutPreviewMode]": (s)=>s.autoCutPreviewMode
    }["useCutOverlayActive.useAppStore[autoCutPreviewMode]"]);
    const autoCutPipelineStage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useCutOverlayActive.useAppStore[autoCutPipelineStage]": (s)=>s.autoCutPipelineStage
    }["useCutOverlayActive.useAppStore[autoCutPipelineStage]"]);
    const showShell = autoCutPreviewMode === 'shell' && autoCutPipelineStage !== 'idle' && !!openCutData;
    const showCaps = (autoCutPreviewMode === 'caps' || autoCutPreviewMode === 'connectors' || autoCutPreviewMode === 'final') && !!cutPreview;
    const legacyMode = autoCutPipelineStage === 'idle' && !!cutPreview;
    return showShell || showCaps || legacyMode;
}
_s(useCutOverlayActive, "ZA3TfHBZBL8YO0BULGddTBLs4yQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
function ModelRenderer() {
    _s1();
    const parts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "ModelRenderer.useAppStore[parts]": (s)=>s.parts
    }["ModelRenderer.useAppStore[parts]"]);
    const activePartId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "ModelRenderer.useAppStore[activePartId]": (s)=>s.activePartId
    }["ModelRenderer.useAppStore[activePartId]"]);
    const modelMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "ModelRenderer.useAppStore[modelMesh]": (s)=>s.modelMesh
    }["ModelRenderer.useAppStore[modelMesh]"]);
    if (parts.length === 0 && !modelMesh) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: [
            parts.map((part)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PartMesh, {
                    part: part,
                    isActive: part.id === activePartId,
                    isolate: activePartId !== null
                }, part.id, false, {
                    fileName: "[project]/components/viewport/model-renderer.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)),
            modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlaneCutPreview, {
                mesh: modelMesh
            }, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 65,
                columnNumber: 21
            }, this),
            modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AutoSplitPreview, {
                mesh: modelMesh
            }, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 66,
                columnNumber: 21
            }, this),
            modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AutoCutPreview, {
                mesh: modelMesh
            }, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 67,
                columnNumber: 21
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$cut$2d$preview$2d$overlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CutPreviewOverlay"], {}, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/model-renderer.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_s1(ModelRenderer, "hwhyMdjRfEvQVUsTJYCjwaVqPPA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = ModelRenderer;
const PartMesh = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(_s2(function PartMesh({ part, isActive, isolate }) {
    _s2();
    const overlayActive = useCutOverlayActive();
    const { showWireframe } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    // Visibility rules:
    // 1. If overlay is active, hide everything (CutPreviewOverlay replaces the view)
    // 2. If in isolation mode and this is not the active part → hidden
    // 3. Respect the part's own visibility flag
    const visible = !overlayActive && (!isolate || isActive) && part.visible;
    // Sync visibility directly on the underlying Three.js object so raycasters
    // (which bypass React props and read the object directly) always see the
    // correct flag.  matrixWorld is kept current by R3F because the object is
    // actually in the scene graph via <primitive>.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PartMesh.PartMesh.useEffect": ()=>{
            part.mesh.visible = visible;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        }
    }["PartMesh.PartMesh.useEffect"], [
        part.mesh,
        visible
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PartMesh.PartMesh.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        }
    }["PartMesh.PartMesh.useEffect"], [
        showWireframe
    ]);
    // Use <primitive> so part.mesh IS the actual scene object.
    // This is critical: raycaster.intersectObject(modelMesh) uses matrixWorld,
    // which Three.js only updates for objects that live in the scene graph.
    // With a separate <mesh geometry={...}> the store's modelMesh reference is
    // never in the scene, so its matrixWorld stays at identity regardless of
    // any transforms — causing mismatched raycasts.
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
        object: part.mesh,
        visible: visible,
        castShadow: true,
        receiveShadow: true,
        children: isActive && visible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
            geometry: part.mesh.geometry,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                color: "#ffffff",
                wireframe: true,
                transparent: true,
                opacity: 0.06,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1,
                depthWrite: false
            }, void 0, false, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 116,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/viewport/model-renderer.tsx",
            lineNumber: 115,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/viewport/model-renderer.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}, "KYpOUxqp9PtN9JLzgjIfau+XaAc=", false, function() {
    return [
        useCutOverlayActive,
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
}));
_c1 = PartMesh;
// ── Plano de corte AutoCut ────────────────────────────────────────────────────
function AutoCutPreview({ mesh }) {
    _s3();
    const preview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "AutoCutPreview.useAppStore[preview]": (s)=>s.autoCutPreview
    }["AutoCutPreview.useAppStore[preview]"]);
    const overlayActive = useCutOverlayActive();
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AutoCutPreview.useMemo[data]": ()=>{
            if (!preview || overlayActive) return null;
            const geo = mesh.geometry;
            if (!geo.boundingBox) geo.computeBoundingBox();
            const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
            geo.boundingBox.getSize(size);
            const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1;
            const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](preview.normal[0], preview.normal[1], preview.normal[2]).normalize();
            const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1), normal);
            const point = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](preview.point[0], preview.point[1], preview.point[2]);
            return {
                point,
                quat,
                diag
            };
        }
    }["AutoCutPreview.useMemo[data]"], [
        preview,
        mesh,
        overlayActive
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AutoCutPreview.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        }
    }["AutoCutPreview.useEffect"], [
        data
    ]);
    if (!data) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: data.point.toArray(),
        quaternion: data.quat.toArray(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                renderOrder: 999,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                        args: [
                            data.diag,
                            data.diag
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#ff6600",
                        transparent: true,
                        opacity: 0.18,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"],
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                renderOrder: 1000,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
                        object: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EdgesGeometry"](getPlaneGeo(data.diag)),
                        attach: "geometry"
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                        color: "#ff6600",
                        transparent: true,
                        opacity: 0.85,
                        depthTest: false
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/model-renderer.tsx",
        lineNumber: 155,
        columnNumber: 5
    }, this);
}
_s3(AutoCutPreview, "9aRAyppidL6Rth6Vd3xIJvUC7Vo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        useCutOverlayActive
    ];
});
_c2 = AutoCutPreview;
// ── Preview do plano de corte ─────────────────────────────────────────────────
function PlaneCutPreview({ mesh }) {
    _s4();
    const { cutPlaneAxis, cutPlaneOffset, cutPlaneFlip, activeTool } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const overlayActive = useCutOverlayActive();
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PlaneCutPreview.useMemo[data]": ()=>{
            if (activeTool !== 'cut' || overlayActive) return null;
            const geo = mesh.geometry;
            if (!geo.boundingBox) geo.computeBoundingBox();
            const bb = geo.boundingBox;
            const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
            bb.getSize(size);
            const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1;
            const { normal, point } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["planeFromAxisOffset"])(bb, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip);
            const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1), normal);
            return {
                point,
                quat,
                diag
            };
        }
    }["PlaneCutPreview.useMemo[data]"], [
        activeTool,
        mesh,
        cutPlaneAxis,
        cutPlaneOffset,
        cutPlaneFlip,
        overlayActive
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlaneCutPreview.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        }
    }["PlaneCutPreview.useEffect"], [
        data
    ]);
    if (!data) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: data.point.toArray(),
        quaternion: data.quat.toArray(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                renderOrder: 2,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                        args: [
                            data.diag,
                            data.diag
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: 0x4488ff,
                        transparent: true,
                        opacity: 0.14,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"],
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                renderOrder: 3,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
                        object: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EdgesGeometry"](getPlaneGeo(data.diag)),
                        attach: "geometry"
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                        color: 0x4488ff,
                        transparent: true,
                        opacity: 0.7,
                        depthTest: false
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/model-renderer.tsx",
        lineNumber: 194,
        columnNumber: 5
    }, this);
}
_s4(PlaneCutPreview, "AdLvx4ValSV372pRKagCHOxJqzU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        useCutOverlayActive
    ];
});
_c3 = PlaneCutPreview;
// ── Preview dos planos de divisão automática ──────────────────────────────────
function AutoSplitPreview({ mesh }) {
    _s5();
    const { autoSplitPlan, activeTool } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const overlayActive = useCutOverlayActive();
    const cuts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AutoSplitPreview.useMemo[cuts]": ()=>{
            if (activeTool !== 'autosplit' || !autoSplitPlan || overlayActive) return [];
            const geo = mesh.geometry;
            if (!geo.boundingBox) geo.computeBoundingBox();
            const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
            geo.boundingBox.getSize(size);
            const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1;
            const planNormal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](...autoSplitPlan.normal);
            return autoSplitPlan.cuts.map({
                "AutoSplitPreview.useMemo[cuts]": (cut)=>{
                    const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1), planNormal);
                    const point = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](...cut.center);
                    return {
                        point,
                        quat,
                        diag
                    };
                }
            }["AutoSplitPreview.useMemo[cuts]"]);
        }
    }["AutoSplitPreview.useMemo[cuts]"], [
        activeTool,
        mesh,
        autoSplitPlan,
        overlayActive
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AutoSplitPreview.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        }
    }["AutoSplitPreview.useEffect"], [
        cuts
    ]);
    if (cuts.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: cuts.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                position: c.point.toArray(),
                quaternion: c.quat.toArray(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        renderOrder: 2,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("planeGeometry", {
                                args: [
                                    c.diag,
                                    c.diag
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/model-renderer.tsx",
                                lineNumber: 240,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                color: 0x44cc88,
                                transparent: true,
                                opacity: 0.12,
                                side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"],
                                depthWrite: false
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/model-renderer.tsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                        renderOrder: 3,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
                                object: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EdgesGeometry"](getPlaneGeo(c.diag)),
                                attach: "geometry"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/model-renderer.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                                color: 0x44cc88,
                                transparent: true,
                                opacity: 0.7,
                                depthTest: false
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/model-renderer.tsx",
                                lineNumber: 245,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/model-renderer.tsx",
                        lineNumber: 243,
                        columnNumber: 11
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/components/viewport/model-renderer.tsx",
                lineNumber: 238,
                columnNumber: 9
            }, this))
    }, void 0, false);
}
_s5(AutoSplitPreview, "ms9mKk1Ixe2ypVoAa+0dBdZqdpo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        useCutOverlayActive
    ];
});
_c4 = AutoSplitPreview;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "ModelRenderer");
__turbopack_context__.k.register(_c1, "PartMesh");
__turbopack_context__.k.register(_c2, "AutoCutPreview");
__turbopack_context__.k.register(_c3, "PlaneCutPreview");
__turbopack_context__.k.register(_c4, "AutoSplitPreview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/viewport/axes-helper.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AxesHelper",
    ()=>AxesHelper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
"use client";
;
;
function AxesHelper() {
    const size = 1.5;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: [
            -4.5,
            -1.8,
            -4.5
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("arrowHelper", {
                args: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 0),
                    size,
                    0xff3333,
                    0.15,
                    0.08
                ]
            }, void 0, false, {
                fileName: "[project]/components/viewport/axes-helper.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("arrowHelper", {
                args: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 0),
                    size,
                    0x33ff66,
                    0.15,
                    0.08
                ]
            }, void 0, false, {
                fileName: "[project]/components/viewport/axes-helper.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("arrowHelper", {
                args: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 0),
                    size,
                    0x3366ff,
                    0.15,
                    0.08
                ]
            }, void 0, false, {
                fileName: "[project]/components/viewport/axes-helper.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/axes-helper.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = AxesHelper;
var _c;
__turbopack_context__.k.register(_c, "AxesHelper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/viewport/viewport-3d.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Viewport3D",
    ()=>Viewport3D
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-client] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-client] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrbitControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Grid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-cut.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$model$2d$loader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/model-loader.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$model$2d$renderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/viewport/model-renderer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$axes$2d$helper$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/viewport/axes-helper.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
// ─── WebGL Error Boundary ─────────────────────────────────────────────────────
// Catches the "Error creating WebGL context" thrown by @react-three/fiber's
// Canvas when the device/environment has no GPU. Without this, the entire app
// crashes with an unhandled rejection.
class WebGLErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"] {
    state = {
        failed: false,
        message: ''
    };
    static getDerivedStateFromError(err) {
        return {
            failed: true,
            message: err.message ?? String(err)
        };
    }
    componentDidCatch(err, info) {
        console.warn('[Viewport3D] WebGL context error caught by boundary:', err.message, info);
    }
    render() {
        if (this.state.failed) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground/60 select-none pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        viewBox: "0 0 40 40",
                        className: "w-12 h-12 opacity-30",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                x: "4",
                                y: "4",
                                width: "32",
                                height: "32",
                                rx: "4"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: "12",
                                y1: "12",
                                x2: "28",
                                y2: "28"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: "28",
                                y1: "12",
                                x2: "12",
                                y2: "28"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-mono text-center px-6",
                        children: [
                            "WebGL não disponível neste dispositivo.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, this),
                            "Tente um navegador com aceleração de hardware ativada."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
}
// ─── FPS Counter ──────────────────────────────────────────────────────────────
function FpsCounter() {
    _s();
    const setFps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FpsCounter.useAppStore[setFps]": (s)=>s.setFps
    }["FpsCounter.useAppStore[setFps]"]);
    const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const last = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(performance.now());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "FpsCounter.useFrame": ()=>{
            count.current++;
            const now = performance.now();
            const dt = now - last.current;
            if (dt >= 1000) {
                setFps(Math.round(count.current * 1000 / dt));
                count.current = 0;
                last.current = now;
            }
        }
    }["FpsCounter.useFrame"]);
    return null;
}
_s(FpsCounter, "RTADW6osFZbQoX8+H8hzAlhe58I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = FpsCounter;
// ─── SmartCut Interaction ─────────────────────────────────────────────────────
function SmartCutInteraction() {
    _s1();
    const { modelMesh, activeTool, selectionMode, setSelectionMode, setSelectionState, setSelectedFaceIndices, selectedFaceIndices, setStatus, sharpAngle, cutMode, pushHistory, undo, redo, allowCutPartSelection, cutParts, activeCutPartId, setActiveCutPartId, activePartId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const { camera, gl, raycaster } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    // Refs para estado mutable sem re-render
    const mouseNDC = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]());
    const hoverRafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const pendingMouse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isOrbitingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const orbitStartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const modKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        ctrl: false,
        alt: false
    });
    // Cache do último resultado de hover: evita re-executar Dijkstra quando o
    // mouse permanece sobre a mesma face (mover dentro da mesma região é comum)
    const hoverCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Refs para estado de seleção acessível sem closure stale
    const selectedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const hoveredRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const colorAttrRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selModeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('new');
    // Sincroniza o ref de seleção com o store. Quando a mudança vem de fora do
    // fluxo normal de clique (ex.: desfazer/refazer), o objeto Set é diferente do
    // que está pintado, então repintamos o delta para refletir na geometria.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartCutInteraction.useEffect": ()=>{
            const prev = selectedRef.current;
            if (prev !== selectedFaceIndices) {
                const colorAttr = colorAttrRef.current;
                if (modelMesh && colorAttr) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["paintFacesDelta"])(modelMesh.geometry, colorAttr, prev, selectedFaceIndices, 'new');
                    hoveredRef.current = new Set();
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
                }
                selectedRef.current = selectedFaceIndices;
            }
        }
    }["SmartCutInteraction.useEffect"], [
        selectedFaceIndices,
        modelMesh
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartCutInteraction.useEffect": ()=>{
            selModeRef.current = selectionMode;
        }
    }["SmartCutInteraction.useEffect"], [
        selectionMode
    ]);
    // Inicializar colorAttr quando modelo carrega
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartCutInteraction.useEffect": ()=>{
            if (!modelMesh) {
                colorAttrRef.current = null;
                hoveredRef.current = new Set();
                hoverCache.current = null;
                return;
            }
            const mat = modelMesh.material;
            colorAttrRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureColorAttribute"])(modelMesh.geometry, mat);
            // Construir cache de adjacência com ângulo atual (adiado para não travar o frame)
            setTimeout({
                "SmartCutInteraction.useEffect": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildAdjacencyCache"])(modelMesh.geometry, sharpAngle ?? 35)
            }["SmartCutInteraction.useEffect"], 80);
        }
    }["SmartCutInteraction.useEffect"], [
        modelMesh,
        sharpAngle
    ]);
    // Invalida o hover cache sempre que os parâmetros de seleção mudam
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartCutInteraction.useEffect": ()=>{
            hoverCache.current = null;
        }
    }["SmartCutInteraction.useEffect"], [
        cutMode,
        sharpAngle
    ]);
    // ── Ctrl / Alt ───────────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartCutInteraction.useEffect": ()=>{
            const onKey = {
                "SmartCutInteraction.useEffect.onKey": (e)=>{
                    modKeys.current.ctrl = e.ctrlKey || e.metaKey;
                    modKeys.current.alt = e.altKey;
                    const next = e.ctrlKey || e.metaKey ? 'add' : e.altKey ? 'subtract' : 'new';
                    selModeRef.current = next;
                    setSelectionMode(next);
                }
            }["SmartCutInteraction.useEffect.onKey"];
            window.addEventListener('keydown', onKey, {
                passive: true
            });
            window.addEventListener('keyup', onKey, {
                passive: true
            });
            return ({
                "SmartCutInteraction.useEffect": ()=>{
                    window.removeEventListener('keydown', onKey);
                    window.removeEventListener('keyup', onKey);
                }
            })["SmartCutInteraction.useEffect"];
        }
    }["SmartCutInteraction.useEffect"], [
        setSelectionMode
    ]);
    // ── Raycast ──────────────────────────────────────────────────────────────────
    const raycastFace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartCutInteraction.useCallback[raycastFace]": (clientX, clientY)=>{
            if (!modelMesh) return null;
            const rect = gl.domElement.getBoundingClientRect();
            mouseNDC.current.set((clientX - rect.left) / rect.width * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
            raycaster.setFromCamera(mouseNDC.current, camera);
            const hits = raycaster.intersectObject(modelMesh, false);
            return hits.length > 0 && hits[0].faceIndex !== undefined ? hits[0].faceIndex : null;
        }
    }["SmartCutInteraction.useCallback[raycastFace]"], [
        modelMesh,
        camera,
        gl,
        raycaster
    ]);
    // ── Hover: direto ao BufferAttribute, zero React ─────────────────────────────
    const doHover = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartCutInteraction.useCallback[doHover]": (clientX, clientY)=>{
            if (!modelMesh || activeTool !== 'select') return;
            const colorAttr = colorAttrRef.current;
            if (!colorAttr) return;
            const faceIndex = raycastFace(clientX, clientY);
            // Hover cache: se o cursor está sobre a mesma face com os mesmos parâmetros,
            // reutiliza o resultado anterior — evita re-executar Dijkstra em cada frame.
            const angle = sharpAngle ?? 35;
            let newHovered;
            if (faceIndex === null) {
                newHovered = new Set();
                hoverCache.current = null;
            } else {
                const c = hoverCache.current;
                if (c && c.face === faceIndex && c.mode === cutMode && c.angle === angle) {
                    newHovered = c.result;
                } else {
                    newHovered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["smartSelect"])(modelMesh.geometry, faceIndex, {
                        sharpAngle: angle,
                        mode: cutMode
                    });
                    hoverCache.current = {
                        face: faceIndex,
                        mode: cutMode,
                        angle,
                        result: newHovered
                    };
                }
            }
            // Só repintar se o hover mudou (compara por identidade de Set)
            if (newHovered === hoveredRef.current) return;
            if (faceIndex === null && hoveredRef.current.size === 0) return;
            const prevHover = hoveredRef.current;
            hoveredRef.current = newHovered;
            // Pintura cirúrgica delta: só as faces que entraram/saíram do hover
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["paintHoverDelta"])(modelMesh.geometry, colorAttr, selectedRef.current, prevHover, newHovered, selModeRef.current);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        }
    }["SmartCutInteraction.useCallback[doHover]"], [
        modelMesh,
        activeTool,
        raycastFace,
        sharpAngle,
        cutMode
    ]);
    const handleMouseMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartCutInteraction.useCallback[handleMouseMove]": (e)=>{
            if (isOrbitingRef.current) return;
            pendingMouse.current = {
                x: e.clientX,
                y: e.clientY
            };
            if (hoverRafRef.current !== null) return;
            hoverRafRef.current = requestAnimationFrame({
                "SmartCutInteraction.useCallback[handleMouseMove]": ()=>{
                    hoverRafRef.current = null;
                    const pos = pendingMouse.current;
                    if (!pos) return;
                    pendingMouse.current = null;
                    doHover(pos.x, pos.y);
                }
            }["SmartCutInteraction.useCallback[handleMouseMove]"]);
        }
    }["SmartCutInteraction.useCallback[handleMouseMove]"], [
        doHover
    ]);
    // ── Click: BFS + acumulação + state ──────────────────────────────────────────
    const handleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartCutInteraction.useCallback[handleClick]": (e)=>{
            if (!modelMesh || activeTool !== 'select' || isOrbitingRef.current) return;
            const colorAttr = colorAttrRef.current;
            if (!colorAttr) return;
            // Seleção de peças já cortadas (vermelhas): só quando habilitado E
            // nenhuma peça está em modo de isolamento. Em isolamento, apenas a peça
            // ativa importa; detectar outras peças aqui causaria interceptação falsa
            // (matrixWorld pode ser obsoleto para objetos fora do grafo da cena).
            if (allowCutPartSelection && cutParts.length > 0 && activePartId === null) {
                const rect = gl.domElement.getBoundingClientRect();
                mouseNDC.current.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
                raycaster.setFromCamera(mouseNDC.current, camera);
                const partMeshes = cutParts.map({
                    "SmartCutInteraction.useCallback[handleClick].partMeshes": (p)=>p.mesh
                }["SmartCutInteraction.useCallback[handleClick].partMeshes"]);
                const partHits = raycaster.intersectObjects(partMeshes, false);
                if (partHits.length > 0) {
                    const hitMesh = partHits[0].object;
                    const part = cutParts.find({
                        "SmartCutInteraction.useCallback[handleClick].part": (p)=>p.mesh === hitMesh
                    }["SmartCutInteraction.useCallback[handleClick].part"]);
                    if (part) {
                        const nextActive = part.id === activeCutPartId ? null : part.id;
                        setActiveCutPartId(nextActive);
                        setStatus('loaded', nextActive ? `Peça selecionada — ${part.name}` : 'Seleção da peça removida');
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
                        return;
                    }
                }
            }
            const faceIndex = raycastFace(e.clientX, e.clientY);
            // Clique no vazio com modo neutro → limpar tudo
            if (faceIndex === null) {
                if (!modKeys.current.ctrl && !modKeys.current.alt) {
                    const prev = selectedRef.current;
                    if (prev.size > 0) pushHistory();
                    selectedRef.current = new Set();
                    hoveredRef.current = new Set();
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["paintFacesDelta"])(modelMesh.geometry, colorAttr, prev, new Set(), 'new');
                    setSelectedFaceIndices(new Set());
                    setSelectionState('idle');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
                }
                return;
            }
            const mode = modKeys.current.ctrl ? 'add' : modKeys.current.alt ? 'subtract' : 'new';
            // Grava estado atual no histórico antes de mudar a seleção
            pushHistory();
            setStatus('selecting', 'SmartCut selecionando...');
            // Roda na mesma microtask para não bloquear o frame
            const region = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["smartSelect"])(modelMesh.geometry, faceIndex, {
                sharpAngle: sharpAngle ?? 35,
                mode: cutMode
            });
            let next;
            if (mode === 'add') {
                next = new Set(selectedRef.current);
                for (const f of region)next.add(f);
            } else if (mode === 'subtract') {
                next = new Set(selectedRef.current);
                for (const f of region)next.delete(f);
            } else {
                next = region;
            }
            // Pintura incremental (cirúrgica)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["paintFacesDelta"])(modelMesh.geometry, colorAttr, selectedRef.current, next, mode);
            // Limpar hover após commit
            hoveredRef.current = new Set();
            selectedRef.current = next;
            setSelectedFaceIndices(next);
            setSelectionState(next.size > 0 ? 'selected' : 'idle');
            const label = mode === 'add' ? `+${region.size.toLocaleString()} faces adicionadas — ${next.size.toLocaleString()} total` : mode === 'subtract' ? `${region.size.toLocaleString()} faces removidas — ${next.size.toLocaleString()} total` : `${next.size.toLocaleString()} faces selecionadas`;
            setStatus('loaded', label);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        }
    }["SmartCutInteraction.useCallback[handleClick]"], [
        modelMesh,
        activeTool,
        raycastFace,
        setSelectedFaceIndices,
        setSelectionState,
        setStatus,
        sharpAngle,
        cutMode,
        pushHistory,
        allowCutPartSelection,
        cutParts,
        activeCutPartId,
        setActiveCutPartId,
        activePartId,
        camera,
        gl,
        raycaster
    ]);
    // ── Atalhos de teclado ────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartCutInteraction.useEffect": ()=>{
            const { setStatus, registerModelAsPart, setModelInfo, setOriginalGeometry } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState();
            const onKeyDown = {
                "SmartCutInteraction.useEffect.onKeyDown": (e)=>{
                    const mod = e.ctrlKey || e.metaKey;
                    if (!mod) return;
                    const key = e.key.toLowerCase();
                    if (key === 'z' && !e.shiftKey) {
                        e.preventDefault();
                        undo();
                    } else if (key === 'z' && e.shiftKey || key === 'y') {
                        e.preventDefault();
                        redo();
                    } else if (key === 'o') {
                        // Ctrl+O — reutiliza o <input id="cortes-file-input"> que o TopBar
                        // mantém sempre no DOM com CSS visually-hidden (nunca display:none).
                        // Clicar nele via .click() a partir de um evento de teclado (user
                        // gesture) funciona mesmo em iframes com sandbox no Chrome 116+.
                        e.preventDefault();
                        const fileInput = document.getElementById('cortes-file-input');
                        if (fileInput) fileInput.click();
                    }
                }
            }["SmartCutInteraction.useEffect.onKeyDown"];
            window.addEventListener('keydown', onKeyDown);
            return ({
                "SmartCutInteraction.useEffect": ()=>window.removeEventListener('keydown', onKeyDown)
            })["SmartCutInteraction.useEffect"];
        }
    }["SmartCutInteraction.useEffect"], [
        undo,
        redo
    ]);
    // Pausar hover durante orbita
    const handlePointerDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartCutInteraction.useCallback[handlePointerDown]": (e)=>{
            isOrbitingRef.current = true;
            orbitStartRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        }
    }["SmartCutInteraction.useCallback[handlePointerDown]"], []);
    const handlePointerUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartCutInteraction.useCallback[handlePointerUp]": (e)=>{
            const start = orbitStartRef.current;
            const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) > 4 : false;
            if (!moved) isOrbitingRef.current = false;
            else setTimeout({
                "SmartCutInteraction.useCallback[handlePointerUp]": ()=>{
                    isOrbitingRef.current = false;
                }
            }["SmartCutInteraction.useCallback[handlePointerUp]"], 60);
            orbitStartRef.current = null;
        }
    }["SmartCutInteraction.useCallback[handlePointerUp]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartCutInteraction.useEffect": ()=>{
            const canvas = gl.domElement;
            canvas.addEventListener('mousemove', handleMouseMove, {
                passive: true
            });
            canvas.addEventListener('click', handleClick);
            canvas.addEventListener('pointerdown', handlePointerDown, {
                passive: true
            });
            canvas.addEventListener('pointerup', handlePointerUp, {
                passive: true
            });
            return ({
                "SmartCutInteraction.useEffect": ()=>{
                    canvas.removeEventListener('mousemove', handleMouseMove);
                    canvas.removeEventListener('click', handleClick);
                    canvas.removeEventListener('pointerdown', handlePointerDown);
                    canvas.removeEventListener('pointerup', handlePointerUp);
                    if (hoverRafRef.current !== null) cancelAnimationFrame(hoverRafRef.current);
                }
            })["SmartCutInteraction.useEffect"];
        }
    }["SmartCutInteraction.useEffect"], [
        gl.domElement,
        handleMouseMove,
        handleClick,
        handlePointerDown,
        handlePointerUp
    ]);
    return null;
}
_s1(SmartCutInteraction, "ftHSdVkyinAHsmLZVlWQXdygefE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"]
    ];
});
_c1 = SmartCutInteraction;
// ─── Camera auto-fit ──────────────────────────────────────────────────────────
// Fires whenever modelMesh changes (new file loaded) and adjusts the camera +
// OrbitControls target so the model fills the viewport nicely.
function CameraFitter({ controlsRef }) {
    _s2();
    const modelMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CameraFitter.useAppStore[modelMesh]": (s)=>s.modelMesh
    }["CameraFitter.useAppStore[modelMesh]"]);
    const { camera } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CameraFitter.useEffect": ()=>{
            if (!modelMesh) return;
            const geo = modelMesh.geometry;
            if (!geo.boundingSphere) geo.computeBoundingSphere();
            const sphere = geo.boundingSphere;
            const radius = Math.max(sphere.radius, 0.001);
            const fov = camera.fov * (Math.PI / 180);
            // Distance so the sphere fits inside the viewport with a bit of padding
            const distance = radius / Math.sin(fov / 2) * 1.6;
            // Isometric-ish angle for a good first look
            const dir = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0.6, 0.45, 1).normalize();
            camera.position.copy(dir.multiplyScalar(distance));
            camera.near = distance * 0.001;
            camera.far = distance * 100;
            camera.updateProjectionMatrix();
            if (controlsRef.current) {
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["CameraFitter.useEffect"], [
        modelMesh
    ]);
    return null;
}
_s2(CameraFitter, "XLtA6VsTpN24PrMeD+p7ndPQ0Gc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"]
    ];
});
_c2 = CameraFitter;
function Viewport3D() {
    _s3();
    // Selective selectors — prevents re-render when unrelated state (fps, selection, etc.) changes
    const showGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Viewport3D.useAppStore[showGrid]": (s)=>s.showGrid
    }["Viewport3D.useAppStore[showGrid]"]);
    const showAxes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Viewport3D.useAppStore[showAxes]": (s)=>s.showAxes
    }["Viewport3D.useAppStore[showAxes]"]);
    const modelMesh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Viewport3D.useAppStore[modelMesh]": (s)=>s.modelMesh
    }["Viewport3D.useAppStore[modelMesh]"]);
    const [webglFailed, setWebglFailed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDragOver, setIsDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const controlsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // R3F throws the WebGL context creation failure as an *async* unhandled
    // rejection, which React Error Boundaries cannot catch. We intercept it
    // globally so the app does not crash, and flip to the fallback UI instead.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Viewport3D.useEffect": ()=>{
            const handler = {
                "Viewport3D.useEffect.handler": (event)=>{
                    const msg = event.reason?.message ?? String(event.reason ?? '');
                    if (msg.includes('WebGL') || msg.includes('webgl') || msg.includes('WebGLRenderer')) {
                        event.preventDefault();
                        console.warn('[Viewport3D] WebGL unavailable — showing fallback UI');
                        setWebglFailed(true);
                    }
                }
            }["Viewport3D.useEffect.handler"];
            window.addEventListener('unhandledrejection', handler);
            return ({
                "Viewport3D.useEffect": ()=>window.removeEventListener('unhandledrejection', handler)
            })["Viewport3D.useEffect"];
        }
    }["Viewport3D.useEffect"], []);
    if (webglFailed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full h-full bg-[#060608] flex flex-col items-center justify-center gap-3 text-muted-foreground/50 select-none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    viewBox: "0 0 40 40",
                    className: "w-14 h-14 opacity-25",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: "4",
                            y: "4",
                            width: "32",
                            height: "32",
                            rx: "4"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 470,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "12",
                            y1: "12",
                            x2: "28",
                            y2: "28"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 471,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "28",
                            y1: "12",
                            x2: "12",
                            y2: "28"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 472,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                    lineNumber: 469,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs font-mono text-center px-8 leading-relaxed",
                    children: [
                        "WebGL não disponível neste dispositivo.",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 476,
                            columnNumber: 11
                        }, this),
                        "Ative a aceleração de hardware no navegador e recarregue a página."
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                    lineNumber: 474,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/viewport/viewport-3d.tsx",
            lineNumber: 468,
            columnNumber: 7
        }, this);
    }
    // ── Drag-and-drop de arquivos 3D ─────────────────────────────────────────────
    const handleDragOver = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };
    const handleDragLeave = (e)=>{
        e.preventDefault();
        setIsDragOver(false);
    };
    const handleDrop = async (e)=>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (![
            'stl',
            'obj',
            'ply',
            'glb',
            'gltf'
        ].includes(ext)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState().setStatus('error', `Formato .${ext} não suportado.`);
            return;
        }
        const { setStatus, registerModelAsPart, setModelInfo, setOriginalGeometry } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState();
        setStatus('loading', `Carregando ${file.name}...`);
        try {
            const { mesh, info, wasDecimated } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$model$2d$loader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadModel"])(file);
            registerModelAsPart(mesh, info.name);
            setModelInfo(info);
            setOriginalGeometry(mesh.geometry.clone());
            setStatus('loaded', `Modelo carregado — ${info.name}${wasDecimated ? ' (decimado para fluidez)' : ''}`);
        } catch (err) {
            console.error('[Cortes] Erro no drop:', err);
            setStatus('error', `Erro ao carregar: ${err?.message ?? 'desconhecido'}`);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-full bg-[#060608]",
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: [
            isDragOver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none",
                style: {
                    background: 'oklch(0.08 0 0 / 85%)',
                    border: '2px dashed oklch(0.70 0.22 42 / 60%)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        viewBox: "0 0 40 40",
                        className: "w-12 h-12 mb-3",
                        fill: "none",
                        stroke: "oklch(0.70 0.22 42)",
                        strokeWidth: "1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M20 4v20M12 16l8 8 8-8",
                                strokeLinecap: "round",
                                strokeLinejoin: "round"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 530,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                x: "4",
                                y: "28",
                                width: "32",
                                height: "8",
                                rx: "2"
                            }, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 531,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 529,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-mono",
                        style: {
                            color: 'oklch(0.70 0.22 42)'
                        },
                        children: "Soltar para carregar"
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 533,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-mono text-muted-foreground mt-1",
                        children: "STL · OBJ · PLY · GLB · GLTF"
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 534,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 527,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 pointer-events-none",
                style: {
                    backgroundImage: 'linear-gradient(oklch(0.18 0 0 / 30%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.18 0 0 / 30%) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }
            }, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 539,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WebGLErrorBoundary, {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
                    frameloop: "demand",
                    camera: {
                        position: [
                            0,
                            0,
                            5
                        ],
                        fov: 45,
                        near: 0.001,
                        far: 2000
                    },
                    gl: {
                        antialias: true,
                        toneMapping: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACESFilmicToneMapping"],
                        toneMappingExposure: 1.2,
                        outputColorSpace: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SRGBColorSpace"],
                        preserveDrawingBuffer: false,
                        powerPreference: 'high-performance',
                        failIfMajorPerformanceCaveat: false
                    },
                    style: {
                        background: 'transparent'
                    },
                    dpr: [
                        1,
                        1.5
                    ],
                    onCreated: ({ gl })=>{
                        // Silence any post-creation context-lost events so they don't
                        // propagate as unhandled rejections.
                        gl.domElement.addEventListener('webglcontextlost', (e)=>{
                            e.preventDefault();
                            console.warn('[Viewport3D] WebGL context lost');
                        }, false);
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FpsCounter, {}, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 572,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CameraFitter, {
                            controlsRef: controlsRef
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 573,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SmartCutInteraction, {}, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 574,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                            intensity: 0.55
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 576,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                            position: [
                                5,
                                8,
                                5
                            ],
                            intensity: 1.2
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 577,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                            position: [
                                -5,
                                3,
                                -5
                            ],
                            intensity: 0.35,
                            color: "#6688aa"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 578,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                            position: [
                                0,
                                -5,
                                0
                            ],
                            intensity: 0.15,
                            color: "#334455"
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 579,
                            columnNumber: 9
                        }, this),
                        showGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Grid"], {
                            args: [
                                20,
                                20
                            ],
                            position: [
                                0,
                                -2,
                                0
                            ],
                            cellSize: 0.5,
                            cellThickness: 0.5,
                            cellColor: "#1a1a1a",
                            sectionSize: 2,
                            sectionThickness: 1,
                            sectionColor: "#222222",
                            fadeDistance: 15,
                            fadeStrength: 1,
                            followCamera: false
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 582,
                            columnNumber: 11
                        }, this),
                        showAxes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$axes$2d$helper$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AxesHelper"], {}, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 597,
                            columnNumber: 22
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                            fallback: null,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$viewport$2f$model$2d$renderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ModelRenderer"], {}, void 0, false, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 600,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 599,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrbitControls"], {
                            ref: controlsRef,
                            enableDamping: true,
                            dampingFactor: 0.06,
                            rotateSpeed: 0.65,
                            zoomSpeed: 1.2,
                            panSpeed: 0.85,
                            minDistance: 0.001,
                            maxDistance: 500,
                            enablePan: true,
                            mouseButtons: {
                                LEFT: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MOUSE"].ROTATE,
                                MIDDLE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MOUSE"].DOLLY,
                                RIGHT: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MOUSE"].PAN
                            },
                            onChange: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])()
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 603,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                    lineNumber: 549,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 548,
                columnNumber: 7
            }, this),
            !modelMesh && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-20 h-20 rounded-lg border border-border/30 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                viewBox: "0 0 40 40",
                                className: "w-10 h-10 text-muted-foreground/30",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                        points: "20,4 36,14 36,26 20,36 4,26 4,14"
                                    }, void 0, false, {
                                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                                        lineNumber: 628,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "20",
                                        y1: "4",
                                        x2: "20",
                                        y2: "36"
                                    }, void 0, false, {
                                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                                        lineNumber: 629,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "4",
                                        y1: "14",
                                        x2: "36",
                                        y2: "14"
                                    }, void 0, false, {
                                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                                        lineNumber: 630,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "4",
                                        y1: "26",
                                        x2: "36",
                                        y2: "26"
                                    }, void 0, false, {
                                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                                        lineNumber: 631,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/viewport/viewport-3d.tsx",
                                lineNumber: 627,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 626,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground/50 font-mono uppercase tracking-widest",
                                    children: "Nenhum modelo carregado"
                                }, void 0, false, {
                                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                                    lineNumber: 635,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground/30 mt-1",
                                    children: "STL · OBJ · PLY · GLB · GLTF"
                                }, void 0, false, {
                                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                                    lineNumber: 638,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/viewport/viewport-3d.tsx",
                            lineNumber: 634,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/viewport/viewport-3d.tsx",
                    lineNumber: 625,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 624,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActiveToolIndicator, {}, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 644,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/viewport-3d.tsx",
        lineNumber: 519,
        columnNumber: 5
    }, this);
}
_s3(Viewport3D, "CCa5NoirEhGH3qhVoHRE/eMk+8Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c3 = Viewport3D;
// ─── Indicador de modo ────────────────────────────────────────────────────────
function ActiveToolIndicator() {
    _s4();
    const { activeTool, selectionState, selectedFaceIndices, selectionMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    if (activeTool !== 'select') return null;
    const modeLabel = selectionMode === 'add' ? '+ Adicionar  (Ctrl)' : selectionMode === 'subtract' ? '− Remover  (Alt)' : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2",
        children: [
            modeLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass-panel rounded px-3 py-1 text-xs font-mono tracking-wider",
                style: {
                    color: selectionMode === 'add' ? 'oklch(0.75 0.22 42)' : 'oklch(0.70 0.12 250)',
                    borderColor: selectionMode === 'add' ? 'oklch(0.50 0.20 42 / 60%)' : 'oklch(0.45 0.10 250 / 60%)'
                },
                children: modeLabel
            }, void 0, false, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 661,
                columnNumber: 9
            }, this),
            selectionState === 'selected' && selectedFaceIndices.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in glass-panel rounded-md px-4 py-2 flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-2 h-2 rounded-full",
                        style: {
                            background: 'oklch(0.70 0.22 42)',
                            boxShadow: '0 0 6px oklch(0.70 0.22 42)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 674,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-mono text-foreground",
                        children: [
                            selectedFaceIndices.size.toLocaleString(),
                            " faces selecionadas"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/viewport/viewport-3d.tsx",
                        lineNumber: 678,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/viewport/viewport-3d.tsx",
                lineNumber: 673,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/viewport/viewport-3d.tsx",
        lineNumber: 659,
        columnNumber: 5
    }, this);
}
_s4(ActiveToolIndicator, "8De6M11Ogm8cnOkNTqEtgFBsWNk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c4 = ActiveToolIndicator;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "FpsCounter");
__turbopack_context__.k.register(_c1, "SmartCutInteraction");
__turbopack_context__.k.register(_c2, "CameraFitter");
__turbopack_context__.k.register(_c3, "Viewport3D");
__turbopack_context__.k.register(_c4, "ActiveToolIndicator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/viewport/viewport-3d.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/viewport/viewport-3d.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_0a64fpn._.js.map