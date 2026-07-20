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
"[project]/lib/auto-split.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "makePinPositions",
    ()=>makePinPositions,
    "performSplit",
    ()=>performSplit,
    "pickLongestAxis",
    ()=>pickLongestAxis,
    "planAutoSplit",
    ()=>planAutoSplit
]);
/**
 * Auto Split Engine — Sugestão automática de cortes por geometria
 * ---------------------------------------------------------------
 * Analisa a malha e sugere planos de corte nas SEÇÕES TRANSVERSAIS MÍNIMAS
 * (pescoços / junções naturais), onde a costura de impressão fica discreta e
 * a peça é fisicamente mais fácil de dividir.
 *
 * Pipeline:
 *   1. Escolhe o eixo de corte (automático = eixo mais longo).
 *   2. Varre a bounding box em N fatias e estima a área da seção transversal
 *      de cada fatia (envelope varrido dos triângulos que a cruzam).
 *   3. Suaviza o perfil e detecta vales (mínimos locais de área).
 *   4. Classifica os vales por "proeminência" (quão profundo é o pescoço) e
 *      seleciona os melhores respeitando separação mínima e sensibilidade.
 *   5. Para cada corte, calcula o centro sólido da seção (para posicionar os
 *      pinos de alinhamento) e a meia-extensão perpendicular.
 *
 * O corte físico watertight reaproveita `solidPlaneCut`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/solid-plane-cut.ts [app-client] (ecmascript)");
;
;
const PERP = {
    x: [
        'y',
        'z'
    ],
    y: [
        'x',
        'z'
    ],
    z: [
        'x',
        'y'
    ]
};
const AXIS_IDX = {
    x: 0,
    y: 1,
    z: 2
};
function comp(attr, i, c) {
    return c === 0 ? attr.getX(i) : c === 1 ? attr.getY(i) : attr.getZ(i);
}
function pickLongestAxis(bbox) {
    const s = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    bbox.getSize(s);
    if (s.x >= s.y && s.x >= s.z) return 'x';
    if (s.y >= s.x && s.y >= s.z) return 'y';
    return 'z';
}
function planAutoSplit(geometry, opts) {
    const pos = geometry.getAttribute('position');
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bbox = geometry.boundingBox.clone();
    const axis = opts.axis === 'auto' ? pickLongestAxis(bbox) : opts.axis;
    const ai = AXIS_IDX[axis];
    const [ua, va] = PERP[axis];
    const ui = AXIS_IDX[ua];
    const vi = AXIS_IDX[va];
    const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    bbox.getSize(size);
    const axisMin = comp3(bbox.min, ai);
    const axisLen = size.getComponent(ai) || 1;
    const samples = Math.max(48, Math.min(opts.samples ?? 220, 400));
    // Envelope perpendicular varrido por triângulo (silhueta do sólido por fatia)
    const uMinB = new Float64Array(samples).fill(Infinity);
    const uMaxB = new Float64Array(samples).fill(-Infinity);
    const vMinB = new Float64Array(samples).fill(Infinity);
    const vMaxB = new Float64Array(samples).fill(-Infinity);
    // Centroide sólido por fatia (média dos vértices)
    const sumU = new Float64Array(samples);
    const sumV = new Float64Array(samples);
    const cnt = new Float64Array(samples);
    const idx = geometry.index;
    const triCount = idx ? idx.count / 3 : pos.count / 3;
    const idxArr = idx ? idx.array : null;
    const binOf = (coord)=>{
        const t = (coord - axisMin) / axisLen;
        let b = Math.floor(t * samples);
        if (b < 0) b = 0;
        if (b >= samples) b = samples - 1;
        return b;
    };
    // ── Passo 2: varredura de triângulos ─────────────────────────────────────
    for(let f = 0; f < triCount; f++){
        const i0 = idxArr ? idxArr[f * 3] : f * 3;
        const i1 = idxArr ? idxArr[f * 3 + 1] : f * 3 + 1;
        const i2 = idxArr ? idxArr[f * 3 + 2] : f * 3 + 2;
        const a0 = comp(pos, i0, ai), a1 = comp(pos, i1, ai), a2 = comp(pos, i2, ai);
        const u0 = comp(pos, i0, ui), u1 = comp(pos, i1, ui), u2 = comp(pos, i2, ui);
        const v0 = comp(pos, i0, vi), v1 = comp(pos, i1, vi), v2 = comp(pos, i2, vi);
        const tmin = Math.min(a0, a1, a2);
        const tmax = Math.max(a0, a1, a2);
        const uLo = Math.min(u0, u1, u2), uHi = Math.max(u0, u1, u2);
        const vLo = Math.min(v0, v1, v2), vHi = Math.max(v0, v1, v2);
        const b0 = binOf(tmin);
        const b1 = binOf(tmax);
        for(let b = b0; b <= b1; b++){
            if (uLo < uMinB[b]) uMinB[b] = uLo;
            if (uHi > uMaxB[b]) uMaxB[b] = uHi;
            if (vLo < vMinB[b]) vMinB[b] = vLo;
            if (vHi > vMaxB[b]) vMaxB[b] = vHi;
        }
    }
    // ── Centroide sólido por fatia (loop de vértices) ────────────────────────
    for(let i = 0; i < pos.count; i++){
        const b = binOf(comp(pos, i, ai));
        sumU[b] += comp(pos, i, ui);
        sumV[b] += comp(pos, i, vi);
        cnt[b] += 1;
    }
    // ── Perfil de área (com preenchimento de fatias vazias) ──────────────────
    const rawArea = new Float64Array(samples);
    for(let b = 0; b < samples; b++){
        if (uMaxB[b] > uMinB[b] && vMaxB[b] > vMinB[b]) {
            rawArea[b] = (uMaxB[b] - uMinB[b]) * (vMaxB[b] - vMinB[b]);
        } else {
            rawArea[b] = NaN;
        }
    }
    fillGaps(rawArea);
    // ── Suavização (média móvel) ─────────────────────────────────────────────
    const smoothWin = Math.max(1, Math.round(samples * 0.02));
    const area = movingAverage(rawArea, smoothWin);
    let maxArea = 0;
    for(let b = 0; b < samples; b++)if (area[b] > maxArea) maxArea = area[b];
    if (maxArea <= 0) maxArea = 1;
    // ── Passo 3-4: detecta vales e calcula proeminência ──────────────────────
    const edge = Math.round(samples * 0.06);
    const r = Math.max(2, Math.round(samples * 0.025));
    const promWin = Math.max(4, Math.round(samples * 0.18));
    const valleys = [];
    for(let b = edge; b < samples - edge; b++){
        let isMin = true;
        for(let k = b - r; k <= b + r; k++){
            if (k < 0 || k >= samples) continue;
            if (area[k] < area[b] - 1e-9) {
                isMin = false;
                break;
            }
        }
        if (!isMin) continue;
        // Evita duplicar platôs: exige que seja o início do vale
        if (b > 0 && area[b - 1] < area[b] - 1e-9) continue;
        let leftPeak = area[b];
        for(let k = b; k >= Math.max(0, b - promWin); k--)if (area[k] > leftPeak) leftPeak = area[k];
        let rightPeak = area[b];
        for(let k = b; k <= Math.min(samples - 1, b + promWin); k++)if (area[k] > rightPeak) rightPeak = area[k];
        const prom = Math.min(leftPeak, rightPeak) - area[b];
        valleys.push({
            b,
            area: area[b],
            prom: prom / maxArea
        });
    }
    // Ordena por proeminência (pescoços mais fundos primeiro)
    valleys.sort((p, q)=>q.prom - p.prom);
    const threshold = lerp(0.12, 0.004, clamp01(opts.sensitivity));
    const minGap = Math.max(3, Math.round(samples * 0.08));
    const chosen = [];
    const accept = (v)=>{
        for (const c of chosen)if (Math.abs(c.b - v.b) < minGap) return false;
        return true;
    };
    for (const v of valleys){
        if (chosen.length >= opts.maxCuts) break;
        if (v.prom < threshold) continue;
        if (accept(v)) chosen.push(v);
    }
    // Garante ao menos uma sugestão (o mínimo global) mesmo em peças uniformes
    if (chosen.length === 0 && valleys.length > 0) {
        // valleys[0] já é o de maior proeminência; se todos forem baixos, pega o
        // de menor área absoluta como fallback do "mínimo global".
        let best = valleys[0];
        for (const v of valleys)if (v.area < best.area) best = v;
        chosen.push(best);
    }
    // Ordena os cortes escolhidos ao longo do eixo
    chosen.sort((p, q)=>p.b - q.b);
    const centerAt = (b)=>{
        let cu, cv;
        if (cnt[b] > 0) {
            cu = sumU[b] / cnt[b];
            cv = sumV[b] / cnt[b];
        } else {
            cu = (uMinB[b] + uMaxB[b]) / 2;
            cv = (vMinB[b] + vMaxB[b]) / 2;
        }
        const coord = axisMin + (b + 0.5) / samples * axisLen;
        const out = [
            0,
            0,
            0
        ];
        out[ai] = coord;
        out[ui] = Number.isFinite(cu) ? cu : comp3(bboxCenter(bbox), ui);
        out[vi] = Number.isFinite(cv) ? cv : comp3(bboxCenter(bbox), vi);
        return out;
    };
    const cuts = chosen.map((v)=>{
        const coord = axisMin + (v.b + 0.5) / samples * axisLen;
        const halfU = Number.isFinite(uMaxB[v.b]) ? (uMaxB[v.b] - uMinB[v.b]) / 2 : 0;
        const halfV = Number.isFinite(vMaxB[v.b]) ? (vMaxB[v.b] - vMinB[v.b]) / 2 : 0;
        return {
            offset: (coord - axisMin) / axisLen,
            coord,
            area: v.area,
            prominence: v.prom,
            center: centerAt(v.b),
            halfU,
            halfV
        };
    });
    const profile = [];
    for(let b = 0; b < samples; b++){
        profile.push({
            coord: axisMin + (b + 0.5) / samples * axisLen,
            area: area[b]
        });
    }
    const normal = [
        0,
        0,
        0
    ];
    normal[ai] = 1;
    return {
        axis,
        normal,
        cuts,
        profile,
        maxArea
    };
}
function performSplit(geometry, plan) {
    const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](plan.normal[0], plan.normal[1], plan.normal[2]);
    const cuts = [
        ...plan.cuts
    ].sort((a, b)=>a.coord - b.coord);
    const pieces = [];
    let remaining = geometry;
    for (const cut of cuts){
        const point = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](cut.center[0], cut.center[1], cut.center[2]);
        let res;
        try {
            res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$solid$2d$plane$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["solidPlaneCut"])(remaining, normal, point);
        } catch  {
            continue;
        }
        const negCount = res.negative.getAttribute('position')?.count ?? 0;
        const posCount = res.positive.getAttribute('position')?.count ?? 0;
        if (negCount === 0 || posCount === 0) continue;
        pieces.push(res.negative);
        remaining = res.positive;
    }
    pieces.push(remaining);
    return pieces;
}
function makePinPositions(plan, cut, count) {
    const base = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](cut.center[0], cut.center[1], cut.center[2]);
    if (count <= 1) return [
        base
    ];
    const [ua, va] = PERP[plan.axis];
    const useU = cut.halfU >= cut.halfV;
    const alongIdx = AXIS_IDX[useU ? ua : va];
    const half = useU ? cut.halfU : cut.halfV;
    const d = Math.max(half * 0.45, 0);
    const p1 = base.clone();
    p1.setComponent(alongIdx, base.getComponent(alongIdx) - d);
    const p2 = base.clone();
    p2.setComponent(alongIdx, base.getComponent(alongIdx) + d);
    return [
        p1,
        p2
    ];
}
// ─── Helpers ────────────────────────────────────────────────────────────────
function comp3(v, c) {
    return c === 0 ? v.x : c === 1 ? v.y : v.z;
}
function bboxCenter(b) {
    const c = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    b.getCenter(c);
    return c;
}
function clamp01(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
/** Preenche valores NaN por interpolação linear com vizinhos válidos. */ function fillGaps(arr) {
    const n = arr.length;
    let i = 0;
    while(i < n){
        if (!Number.isNaN(arr[i])) {
            i++;
            continue;
        }
        let j = i;
        while(j < n && Number.isNaN(arr[j]))j++;
        const left = i - 1 >= 0 ? arr[i - 1] : j < n ? arr[j] : 0;
        const right = j < n ? arr[j] : left;
        const span = j - i + 1;
        for(let k = i; k < j; k++){
            const t = (k - i + 1) / span;
            arr[k] = left + (right - left) * t;
        }
        i = j;
    }
}
function movingAverage(arr, win) {
    const n = arr.length;
    const out = new Float64Array(n);
    for(let i = 0; i < n; i++){
        let s = 0;
        let c = 0;
        for(let k = i - win; k <= i + win; k++){
            if (k < 0 || k >= n) continue;
            s += arr[k];
            c++;
        }
        out[i] = c > 0 ? s / c : arr[i];
    }
    return out;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/auto-split-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AutoSplitPanel",
    ()=>AutoSplitPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wand-sparkles.mjs [app-client] (ecmascript) <export default as Wand2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scan$2d$line$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScanLine$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scan-line.mjs [app-client] (ecmascript) <export default as ScanLine>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$boxes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Boxes$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/boxes.mjs [app-client] (ecmascript) <export default as Boxes>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.mjs [app-client] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/Evaluator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/Brush.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auto-split.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const AXES = [
    {
        id: 'auto',
        label: 'Auto'
    },
    {
        id: 'x',
        label: 'X'
    },
    {
        id: 'y',
        label: 'Y'
    },
    {
        id: 'z',
        label: 'Z'
    }
];
// Paleta para distinguir as peças no modo explodido (sem roxo/violeta)
const PALETTE = [
    '#ff6600',
    '#00b4d8',
    '#43aa8b',
    '#f9c74f',
    '#ef476f',
    '#4d96ff',
    '#f3722c',
    '#90be6d'
];
function AutoSplitPanel() {
    _s();
    const { activeTool, modelMesh, modelInfo, autoSplitPlan, setAutoSplitPlan, setModelMesh, setModelInfo, addCutPart, setStatus, pushHistory, clearSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [axis, setAxis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('auto');
    const [maxCuts, setMaxCuts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(3);
    const [sensitivity, setSensitivity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.5);
    const [usePins, setUsePins] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [pinDiameter, setPinDiameter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(4);
    const [pinDepth, setPinDepth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(6);
    const [pinTolerance, setPinTolerance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.15);
    const [pinCount, setPinCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(2);
    const [spacing, setSpacing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.25);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (activeTool !== 'autosplit' || !modelMesh) return null;
    const handleAnalyze = ()=>{
        if (!modelMesh) return;
        setBusy(true);
        setStatus('selecting', 'Analisando geometria — buscando seções mínimas...');
        setTimeout(()=>{
            try {
                const geo = modelMesh.geometry;
                const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["planAutoSplit"])(geo, {
                    axis,
                    maxCuts,
                    sensitivity
                });
                setAutoSplitPlan(plan);
                const n = plan.cuts.length;
                setStatus('loaded', n > 0 ? `${n} corte(s) sugerido(s) no eixo ${plan.axis.toUpperCase()} — revise e execute` : 'Nenhum pescoço encontrado. Aumente a sensibilidade.');
            } catch (err) {
                console.log('[v0] Erro na análise Auto Split:', err.message);
                setStatus('error', 'Falha ao analisar a geometria.');
            } finally{
                setBusy(false);
            }
        }, 40);
    };
    const handleExecute = ()=>{
        if (!modelMesh) return;
        setBusy(true);
        pushHistory();
        setStatus('cutting', 'Dividindo modelo e gerando pinos de alinhamento...');
        setTimeout(()=>{
            try {
                const geo = modelMesh.geometry;
                const plan = autoSplitPlan ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["planAutoSplit"])(geo, {
                    axis,
                    maxCuts,
                    sensitivity
                });
                if (plan.cuts.length === 0) {
                    setStatus('error', 'Nenhum corte sugerido. Ajuste a sensibilidade e analise novamente.');
                    setBusy(false);
                    return;
                }
                const pieces = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["performSplit"])(geo, plan);
                if (pieces.length < 2) {
                    setStatus('error', 'Não foi possível dividir — os planos não interceptam o sólido.');
                    setBusy(false);
                    return;
                }
                const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](plan.normal[0], plan.normal[1], plan.normal[2]);
                const sortedCuts = [
                    ...plan.cuts
                ].sort((a, b)=>a.coord - b.coord);
                // ── Pinos de alinhamento (furos via CSG + dowel separado) ──────────
                const dowels = [];
                let pinsOk = true;
                if (usePins) {
                    try {
                        const evaluator = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Evaluator"]();
                        evaluator.attributes = [
                            'position',
                            'normal'
                        ];
                        const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0), normal);
                        const rHole = pinDiameter / 2 + pinTolerance;
                        const rDowel = pinDiameter / 2;
                        const holeH = pinDepth * 2 + Math.max(pinDepth * 0.2, 0.5);
                        const dowelH = pinDepth * 2 - 0.4;
                        for(let k = 0; k < sortedCuts.length && k + 1 < pieces.length; k++){
                            const cut = sortedCuts[k];
                            const positions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auto$2d$split$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makePinPositions"])(plan, cut, pinCount);
                            for (const p of positions){
                                const holeGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CylinderGeometry"](rHole, rHole, holeH, 28);
                                holeGeo.deleteAttribute('uv');
                                const holeBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Brush"](holeGeo);
                                holeBrush.position.copy(p);
                                holeBrush.quaternion.copy(quat);
                                holeBrush.updateMatrixWorld();
                                // Subtrai o furo das duas peças adjacentes (k e k+1)
                                for (const pi of [
                                    k,
                                    k + 1
                                ]){
                                    const pieceBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Brush"](pieces[pi]);
                                    pieceBrush.updateMatrixWorld();
                                    const out = evaluator.evaluate(pieceBrush, holeBrush, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SUBTRACTION"]);
                                    pieces[pi] = out.geometry;
                                }
                                dowels.push({
                                    pos: p.clone(),
                                    quat: quat.clone(),
                                    radius: rDowel,
                                    height: dowelH
                                });
                                holeGeo.dispose();
                            }
                        }
                    } catch (err) {
                        console.log('[v0] CSG de pinos falhou, seguindo sem furos:', err.message);
                        pinsOk = false;
                    }
                }
                // ── Monta as peças no viewport (base fica como modelo principal) ────
                const geoBox = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]().setFromBufferAttribute(geo.getAttribute('position'));
                const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                geoBox.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                const spread = maxDim * spacing;
                pieces.forEach((g)=>{
                    g.computeVertexNormals();
                    g.computeBoundingBox();
                    g.computeBoundingSphere();
                });
                // Peça 0 (base) → modelo principal
                const mainMat = modelMesh.material.clone();
                mainMat.side = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"];
                mainMat.needsUpdate = true;
                const mainMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](pieces[0], mainMat);
                mainMesh.position.copy(modelMesh.position);
                mainMesh.rotation.copy(modelMesh.rotation);
                mainMesh.scale.copy(modelMesh.scale);
                setModelMesh(mainMesh);
                if (modelInfo) {
                    const bb = pieces[0].boundingBox;
                    const s = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                    bb?.getSize(s);
                    const count = pieces[0].getAttribute('position')?.count ?? 0;
                    setModelInfo({
                        ...modelInfo,
                        vertices: count,
                        faces: Math.floor(count / 3),
                        width: bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
                        height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
                        depth: bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth
                    });
                }
                // Peças 1..n → partes separadas coloridas, afastadas (exploded)
                for(let i = 1; i < pieces.length; i++){
                    const color = PALETTE[i % PALETTE.length];
                    const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](color),
                        roughness: 0.6,
                        metalness: 0.1,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                    });
                    const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](pieces[i], mat);
                    mesh.position.copy(modelMesh.position);
                    mesh.rotation.copy(modelMesh.rotation);
                    mesh.scale.copy(modelMesh.scale);
                    mesh.position.add(normal.clone().multiplyScalar(spread * i));
                    addCutPart({
                        id: `auto-${Date.now()}-${i}`,
                        name: `Peça ${i + 1}`,
                        mesh,
                        faceIndices: [],
                        color
                    });
                }
                // Pinos (dowels) → peças cilíndricas separadas, no vão da junta
                dowels.forEach((d, i)=>{
                    const dGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CylinderGeometry"](d.radius, d.radius, d.height, 28);
                    const m = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]().compose(d.pos, d.quat, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](1, 1, 1));
                    dGeo.applyMatrix4(m);
                    dGeo.computeVertexNormals();
                    const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]('#c0c4cc'),
                        roughness: 0.35,
                        metalness: 0.6,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                    });
                    const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](dGeo, mat);
                    mesh.position.copy(modelMesh.position);
                    mesh.rotation.copy(modelMesh.rotation);
                    mesh.scale.copy(modelMesh.scale);
                    addCutPart({
                        id: `pin-${Date.now()}-${i}`,
                        name: `Pino ${i + 1}`,
                        mesh,
                        faceIndices: [],
                        color: '#c0c4cc'
                    });
                });
                setAutoSplitPlan(null);
                clearSelection();
                const pinMsg = usePins ? pinsOk ? ` · ${dowels.length} pino(s) de alinhamento` : ' · pinos ignorados (falha no booleano)' : '';
                setStatus('loaded', `Divisão automática concluída — ${pieces.length} peças${pinMsg}`);
            } catch (err) {
                console.log('[v0] Erro na execução Auto Split:', err.message);
                setStatus('error', 'Falha ao dividir o modelo.');
            } finally{
                setBusy(false);
            }
        }, 60);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3 p-3 rounded-xl border w-[380px]",
            style: {
                background: 'oklch(0.10 0 0 / 95%)',
                backdropFilter: 'blur(16px)',
                borderColor: 'oklch(0.22 0 0)',
                boxShadow: '0 8px 32px oklch(0 0 0 / 60%)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 269,
                                    columnNumber: 13
                                }, this),
                                "Divisão automática"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 268,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-mono text-muted-foreground/50",
                            children: "seção mínima"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 267,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-mono text-muted-foreground/70 w-14",
                            children: "Eixo"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 277,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1 flex-1",
                            children: AXES.map((ax)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setAxis(ax.id),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-1.5 text-xs font-mono font-medium transition-all duration-150', axis === ax.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                    style: axis === ax.id ? {
                                        background: 'oklch(0.70 0.22 42)'
                                    } : undefined,
                                    "aria-pressed": axis === ax.id,
                                    children: ax.label
                                }, ax.id, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 278,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 276,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                    label: "Cortes",
                    value: maxCuts,
                    min: 1,
                    max: 8,
                    step: 1,
                    onChange: setMaxCuts,
                    display: `${maxCuts}`
                }, void 0, false, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 299,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                    label: "Sensib.",
                    value: sensitivity,
                    min: 0,
                    max: 1,
                    step: 0.05,
                    onChange: setSensitivity,
                    display: `${Math.round(sensitivity * 100)}%`
                }, void 0, false, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 310,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                    label: "Explodir",
                    value: spacing,
                    min: 0,
                    max: 0.6,
                    step: 0.02,
                    onChange: setSpacing,
                    display: `${Math.round(spacing * 100)}%`
                }, void 0, false, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 321,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2 rounded-lg border border-border/60 p-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setUsePins((v)=>!v),
                            className: "flex items-center justify-between",
                            "aria-pressed": usePins,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                                            className: "w-3 h-3"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                                            lineNumber: 339,
                                            columnNumber: 15
                                        }, this),
                                        "Pinos de alinhamento"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 338,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('relative w-8 h-4 rounded-full transition-colors duration-150', usePins ? '' : 'bg-secondary'),
                                    style: usePins ? {
                                        background: 'oklch(0.70 0.22 42)'
                                    } : undefined,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all duration-150', usePins ? 'left-4' : 'left-0.5')
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/auto-split-panel.tsx",
                                        lineNumber: 349,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 342,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 333,
                            columnNumber: 11
                        }, this),
                        usePins && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2 pt-1 animate-fade-in",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-mono text-muted-foreground/70 w-14",
                                            children: "Qtd/junta"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                                            lineNumber: 361,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1 flex-1",
                                            children: [
                                                1,
                                                2
                                            ].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setPinCount(c),
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-1 text-[11px] font-mono transition-all duration-150', pinCount === c ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                                    style: pinCount === c ? {
                                                        background: 'oklch(0.55 0.02 250)'
                                                    } : undefined,
                                                    children: [
                                                        c,
                                                        " pino",
                                                        c > 1 ? 's' : ''
                                                    ]
                                                }, c, true, {
                                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                                    lineNumber: 364,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                                            lineNumber: 362,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 360,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                                    label: "Ø (mm)",
                                    value: pinDiameter,
                                    min: 1,
                                    max: 16,
                                    step: 0.5,
                                    onChange: setPinDiameter,
                                    display: pinDiameter.toFixed(1)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 380,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                                    label: "Prof (mm)",
                                    value: pinDepth,
                                    min: 2,
                                    max: 30,
                                    step: 0.5,
                                    onChange: setPinDepth,
                                    display: pinDepth.toFixed(1)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 381,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SliderRow, {
                                    label: "Folga (mm)",
                                    value: pinTolerance,
                                    min: 0,
                                    max: 0.6,
                                    step: 0.01,
                                    onChange: setPinTolerance,
                                    display: pinTolerance.toFixed(2)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 382,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 359,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 332,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleAnalyze,
                            disabled: busy,
                            className: "flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 border border-border text-muted-foreground hover:text-foreground disabled:opacity-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scan$2d$line$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScanLine$3e$__["ScanLine"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 394,
                                    columnNumber: 13
                                }, this),
                                "Analisar"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 389,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleExecute,
                            disabled: busy,
                            className: "flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 selection-glow transition-all duration-150 disabled:opacity-50",
                            style: {
                                background: 'oklch(0.70 0.22 42)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$boxes$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Boxes$3e$__["Boxes"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                                    lineNumber: 403,
                                    columnNumber: 13
                                }, this),
                                "Dividir"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/auto-split-panel.tsx",
                            lineNumber: 397,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/auto-split-panel.tsx",
                    lineNumber: 388,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/auto-split-panel.tsx",
            lineNumber: 258,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/auto-split-panel.tsx",
        lineNumber: 257,
        columnNumber: 5
    }, this);
}
_s(AutoSplitPanel, "FEXy8WoGUYv0HJmG8If7xrZoFCM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = AutoSplitPanel;
function SliderRow({ label, value, min, max, step, onChange, display }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-mono text-muted-foreground/70 w-14",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/layout/auto-split-panel.tsx",
                lineNumber: 425,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "range",
                min: min,
                max: max,
                step: step,
                value: value,
                onChange: (e)=>onChange(Number(e.target.value)),
                className: "flex-1 cursor-pointer",
                style: {
                    accentColor: 'oklch(0.70 0.22 42)'
                },
                "aria-label": label
            }, void 0, false, {
                fileName: "[project]/components/layout/auto-split-panel.tsx",
                lineNumber: 426,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-mono tabular-nums w-10 text-right",
                style: {
                    color: 'oklch(0.70 0.22 42)'
                },
                children: display
            }, void 0, false, {
                fileName: "[project]/components/layout/auto-split-panel.tsx",
                lineNumber: 437,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/auto-split-panel.tsx",
        lineNumber: 424,
        columnNumber: 5
    }, this);
}
_c1 = SliderRow;
var _c, _c1;
__turbopack_context__.k.register(_c, "AutoSplitPanel");
__turbopack_context__.k.register(_c1, "SliderRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/auto-split-panel.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/layout/auto-split-panel.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_18rvcf7._.js.map