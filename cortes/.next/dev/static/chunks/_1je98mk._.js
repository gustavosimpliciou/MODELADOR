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
"[project]/lib/quality-cut.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_QUALITY",
    ()=>DEFAULT_QUALITY,
    "qualityContourCut",
    ()=>qualityContourCut,
    "validateCutResult",
    ()=>validateCutResult
]);
/**
 * QualityCut — Corte por Contorno Matemático Reconstruído (Isocontorno)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * PIPELINE PROFISSIONAL (conforme especificação):
 *   1. Campo indicador φ por vértice soldado: +1 dentro, -1 fora da seleção.
 *   2. Difusão Taubin (filtro passa-baixa): elimina ruído de triangulação,
 *      preserva volumes e formas reais.
 *   3. Ajuste de offset: desloca o isocontorno para expandir/contrair a peça.
 *   4. Marching-Triangles: corta no isocontorno φ=offset, gerando vértices
 *      NOVOS por interpolação. Curva contínua, independente da topologia.
 *   5. Relaxação de fronteira (Edge Relax): Taubin suavizante na linha de
 *      costura → elimina picos e irregularidades finais.
 *   6. Limpeza de malha (Boundary Cleanup): remove faces degeneradas, picos,
 *      vértices duplicados, conserta normais.
 *   7. Tampas (buildCap): fecham a costura → peças maciças e imprimíveis.
 *   8. Normais suaves por posição → acabamento contínuo.
 *   9. Validação da malha resultante.
 *
 * PRIORIDADE ABSOLUTA: A seleção do SmartCut é inviolável.
 * O algoritmo só constrói a SUPERFÍCIE DE SEPARAÇÃO — nunca altera o volume
 * ou o contorno da peça selecionada.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-cut.ts [app-client] (ecmascript)");
;
;
const DEFAULT_QUALITY = {
    strength: 0.6,
    qualityFirst: true,
    weldQ: 1e4,
    qualityThreshold: 12,
    offset: 0,
    relaxIterations: 2
};
function weldMesh(geometry, Q) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    const keyToUID = new Map();
    const faceUID = new Int32Array(faceCount * 3);
    const faceCorner = new Int32Array(faceCount * 3);
    const uidOf = (v)=>{
        const k = `${Math.round(posAttr.getX(v) * Q)},${Math.round(posAttr.getY(v) * Q)},${Math.round(posAttr.getZ(v) * Q)}`;
        let id = keyToUID.get(k);
        if (id === undefined) {
            id = keyToUID.size;
            keyToUID.set(k, id);
        }
        return id;
    };
    for(let f = 0; f < faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            faceCorner[f * 3 + c] = v;
            faceUID[f * 3 + c] = uidOf(v);
        }
    }
    const uidCount = keyToUID.size;
    const nbSets = Array.from({
        length: uidCount
    }, ()=>new Set());
    for(let f = 0; f < faceCount; f++){
        const a = faceUID[f * 3], b = faceUID[f * 3 + 1], c = faceUID[f * 3 + 2];
        nbSets[a].add(b);
        nbSets[a].add(c);
        nbSets[b].add(a);
        nbSets[b].add(c);
        nbSets[c].add(a);
        nbSets[c].add(b);
    }
    const neighbors = nbSets.map((s)=>Int32Array.from(s));
    return {
        faceUID,
        faceCorner,
        faceCount,
        uidCount,
        neighbors
    };
}
// ─── Campo indicador inicial φ0 ────────────────────────────────────────────────
function buildIndicatorField(w, selected) {
    const totalCnt = new Float32Array(w.uidCount);
    const selCnt = new Float32Array(w.uidCount);
    for(let f = 0; f < w.faceCount; f++){
        const inSel = selected.has(f) ? 1 : 0;
        for(let c = 0; c < 3; c++){
            const uid = w.faceUID[f * 3 + c];
            totalCnt[uid] += 1;
            selCnt[uid] += inSel;
        }
    }
    const phi = new Float32Array(w.uidCount);
    for(let u = 0; u < w.uidCount; u++){
        const t = totalCnt[u] > 0 ? selCnt[u] / totalCnt[u] : 0;
        phi[u] = t * 2 - 1;
    }
    return phi;
}
// ─── Difusão Taubin (filtro passa-baixa sem encolhimento) ───────────────────────
function diffuseField(phi0, w, iterations) {
    const LAMBDA = 0.6;
    const MU = -0.62;
    let cur = phi0.slice();
    let buf = new Float32Array(cur.length);
    for(let it = 0; it < iterations; it++){
        const factor = it % 2 === 0 ? LAMBDA : MU;
        for(let u = 0; u < w.uidCount; u++){
            const nb = w.neighbors[u];
            const n = nb.length;
            if (n === 0) {
                buf[u] = cur[u];
                continue;
            }
            let sum = 0;
            for(let i = 0; i < n; i++)sum += cur[nb[i]];
            const avg = sum / n;
            buf[u] = cur[u] + factor * (avg - cur[u]);
        }
        const tmp = cur;
        cur = buf;
        buf = tmp;
    }
    return cur;
}
function marchTriangles(geometry, w, phi, hasUV, threshold) {
    const posAttr = geometry.getAttribute('position');
    const uvAttr = hasUV ? geometry.getAttribute('uv') : null;
    const out = {
        posA: [],
        uvA: [],
        posB: [],
        uvB: [],
        seam: []
    };
    const P = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]()
    ];
    const U = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
    ];
    const d = [
        0,
        0,
        0
    ];
    const lerpCorner = (i, j, t)=>{
        const p = P[i].clone().lerp(P[j], t);
        const u = hasUV ? U[i].clone().lerp(U[j], t) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
        return {
            p,
            u
        };
    };
    // Clip polygon keeping vertices where (d - threshold) satisfies keepInside
    const clip = (keepInside)=>{
        const poly = [];
        for(let i = 0; i < 3; i++){
            const j = (i + 1) % 3;
            const di = d[i] - threshold, dj = d[j] - threshold;
            const inI = keepInside ? di >= 0 : di < 0;
            const inJ = keepInside ? dj >= 0 : dj < 0;
            if (inI) poly.push({
                p: P[i].clone(),
                u: hasUV ? U[i].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
            });
            if (inI !== inJ) {
                const t = di / (di - dj);
                poly.push(lerpCorner(i, j, t));
            }
        }
        return poly;
    };
    const emit = (posArr, uvArr, poly)=>{
        for(let k = 1; k + 1 < poly.length; k++){
            const a = poly[0], b = poly[k], c = poly[k + 1];
            posArr.push(a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z, c.p.x, c.p.y, c.p.z);
            if (hasUV) uvArr.push(a.u.x, a.u.y, b.u.x, b.u.y, c.u.x, c.u.y);
        }
    };
    for(let f = 0; f < w.faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = w.faceCorner[f * 3 + c];
            P[c].set(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
            if (uvAttr) U[c].set(uvAttr.getX(v), uvAttr.getY(v));
            d[c] = phi[w.faceUID[f * 3 + c]];
        }
        const nInside = (d[0] >= threshold ? 1 : 0) + (d[1] >= threshold ? 1 : 0) + (d[2] >= threshold ? 1 : 0);
        if (nInside === 3) {
            emit(out.posA, out.uvA, [
                {
                    p: P[0].clone(),
                    u: hasUV ? U[0].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                {
                    p: P[1].clone(),
                    u: hasUV ? U[1].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                {
                    p: P[2].clone(),
                    u: hasUV ? U[2].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
                }
            ]);
        } else if (nInside === 0) {
            emit(out.posB, out.uvB, [
                {
                    p: P[0].clone(),
                    u: hasUV ? U[0].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                {
                    p: P[1].clone(),
                    u: hasUV ? U[1].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
                },
                {
                    p: P[2].clone(),
                    u: hasUV ? U[2].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
                }
            ]);
        } else {
            const inPoly = clip(true);
            const outPoly = clip(false);
            if (inPoly.length >= 3) emit(out.posA, out.uvA, inPoly);
            if (outPoly.length >= 3) emit(out.posB, out.uvB, outPoly);
            // Registra o segmento do isocontorno
            const cross = [];
            for(let i = 0; i < 3; i++){
                const j = (i + 1) % 3;
                const di = d[i] - threshold, dj = d[j] - threshold;
                if (di >= 0 !== dj >= 0) {
                    const t = di / (di - dj);
                    cross.push(P[i].clone().lerp(P[j], t));
                }
            }
            if (cross.length === 2) {
                out.seam.push(cross[0].x, cross[0].y, cross[0].z, cross[1].x, cross[1].y, cross[1].z);
            }
        }
    }
    return out;
}
// ─── Score de qualidade do contorno ────────────────────────────────────────────
function scoreSeam(seam, Q) {
    const segCount = seam.length / 6;
    if (segCount === 0) return {
        score: 0,
        segments: 0
    };
    const key = (x, y, z)=>`${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`;
    const nodePos = new Map();
    const adj = new Map();
    for(let s = 0; s < segCount; s++){
        const b = s * 6;
        const ka = key(seam[b], seam[b + 1], seam[b + 2]);
        const kb = key(seam[b + 3], seam[b + 4], seam[b + 5]);
        if (ka === kb) continue;
        nodePos.set(ka, [
            seam[b],
            seam[b + 1],
            seam[b + 2]
        ]);
        nodePos.set(kb, [
            seam[b + 3],
            seam[b + 4],
            seam[b + 5]
        ]);
        (adj.get(ka) ?? adj.set(ka, []).get(ka)).push(kb);
        (adj.get(kb) ?? adj.set(kb, []).get(kb)).push(ka);
    }
    let totalDev = 0;
    let nodes = 0;
    const a = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), c = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const [k, nbs] of adj){
        if (nbs.length < 2) continue;
        const pc = nodePos.get(k);
        const pa = nodePos.get(nbs[0]);
        const pb = nodePos.get(nbs[1]);
        center.set(pc[0], pc[1], pc[2]);
        a.set(pa[0], pa[1], pa[2]).sub(center);
        c.set(pb[0], pb[1], pb[2]).sub(center);
        const la = a.length(), lc = c.length();
        if (la < 1e-9 || lc < 1e-9) continue;
        const cos = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].clamp(a.dot(c) / (la * lc), -1, 1);
        const angle = Math.acos(cos) * 180 / Math.PI;
        totalDev += Math.abs(180 - angle);
        nodes++;
    }
    const score = nodes > 0 ? totalDev / nodes : 0;
    return {
        score,
        segments: segCount
    };
}
// ─── Edge Relax: Taubin suavizante nos vértices da borda de corte ──────────────
/**
 * Identifica os vértices da borda aberta (costura) e aplica suavização Taubin
 * (λ/μ alternado) para eliminar picos e ondulações sem encolhimento.
 * Somente a borda de corte é modificada — a geometria externa permanece intacta.
 */ function relaxBoundary(pos, iterations) {
    if (iterations <= 0 || pos.length < 9) return;
    const Q = 1e4;
    const vertCount = pos.length / 3;
    const faceCount = vertCount / 3;
    // ── UID por posição quantizada ────────────────────────────────────────────
    const posKey = (i)=>`${Math.round(pos[i * 3] * Q)},${Math.round(pos[i * 3 + 1] * Q)},${Math.round(pos[i * 3 + 2] * Q)}`;
    const uidMap = new Map();
    const uid = new Int32Array(vertCount);
    for(let i = 0; i < vertCount; i++){
        const k = posKey(i);
        let id = uidMap.get(k);
        if (id === undefined) {
            id = uidMap.size;
            uidMap.set(k, id);
        }
        uid[i] = id;
    }
    const uidCount = uidMap.size;
    // ── Contagem de arestas → borda aberta = aparece 1 vez ───────────────────
    const edgeCnt = new Map();
    // Edge key = uid_min * uidCount + uid_max (hash compacto de inteiros)
    const edgeVerts = new Map();
    for(let f = 0; f < faceCount; f++){
        const corners = [
            f * 3,
            f * 3 + 1,
            f * 3 + 2
        ];
        for(let ci = 0; ci < 3; ci++){
            const a = corners[ci], b = corners[(ci + 1) % 3];
            const ua = uid[a], ub = uid[b];
            const k = ua < ub ? ua * uidCount + ub : ub * uidCount + ua;
            edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1);
            if (!edgeVerts.has(k)) edgeVerts.set(k, [
                a,
                b
            ]);
        }
    }
    // ── Adjacência apenas na borda aberta ────────────────────────────────────
    const uidNeighbors = Array.from({
        length: uidCount
    }, ()=>new Set());
    const isBoundaryUID = new Uint8Array(uidCount);
    for (const [k, cnt] of edgeCnt){
        if (cnt !== 1) continue;
        const [a, b] = edgeVerts.get(k);
        const ua = uid[a], ub = uid[b];
        uidNeighbors[ua].add(ub);
        uidNeighbors[ub].add(ua);
        isBoundaryUID[ua] = 1;
        isBoundaryUID[ub] = 1;
    }
    if (isBoundaryUID.every((v)=>v === 0)) return;
    // ── Posição média por UID ─────────────────────────────────────────────────
    const uidPos = new Float32Array(uidCount * 3);
    const uidCnt = new Int32Array(uidCount);
    for(let i = 0; i < vertCount; i++){
        const u = uid[i];
        uidPos[u * 3] += pos[i * 3];
        uidPos[u * 3 + 1] += pos[i * 3 + 1];
        uidPos[u * 3 + 2] += pos[i * 3 + 2];
        uidCnt[u]++;
    }
    for(let u = 0; u < uidCount; u++){
        if (uidCnt[u] > 0) {
            uidPos[u * 3] /= uidCnt[u];
            uidPos[u * 3 + 1] /= uidCnt[u];
            uidPos[u * 3 + 2] /= uidCnt[u];
        }
    }
    // ── Taubin smooth (λ/μ alternado) sobre UIDs de borda ────────────────────
    const LAMBDA = 0.5;
    const MU = -0.53;
    const buf = new Float32Array(uidCount * 3);
    for(let iter = 0; iter < iterations * 2; iter++){
        const factor = iter % 2 === 0 ? LAMBDA : MU;
        buf.set(uidPos);
        for(let u = 0; u < uidCount; u++){
            if (!isBoundaryUID[u]) continue;
            const nb = uidNeighbors[u];
            const n = nb.size;
            if (n === 0) continue;
            let sx = 0, sy = 0, sz = 0;
            for (const v of nb){
                sx += uidPos[v * 3];
                sy += uidPos[v * 3 + 1];
                sz += uidPos[v * 3 + 2];
            }
            const avg_x = sx / n, avg_y = sy / n, avg_z = sz / n;
            buf[u * 3] = uidPos[u * 3] + factor * (avg_x - uidPos[u * 3]);
            buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (avg_y - uidPos[u * 3 + 1]);
            buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (avg_z - uidPos[u * 3 + 2]);
        }
        uidPos.set(buf);
    }
    // ── Aplica de volta nos vértices originais ────────────────────────────────
    for(let i = 0; i < vertCount; i++){
        const u = uid[i];
        if (!isBoundaryUID[u]) continue;
        pos[i * 3] = uidPos[u * 3];
        pos[i * 3 + 1] = uidPos[u * 3 + 1];
        pos[i * 3 + 2] = uidPos[u * 3 + 2];
    }
}
// ─── Boundary Cleanup: remove faces degeneradas e picos ───────────────────────
/**
 * Remove triângulos com área negligível (degenerate faces) que causam
 * artefatos visuais e problemas em impressão 3D.
 */ function cleanupDegenerateFaces(pos) {
    const cleaned = [];
    const faceCount = pos.length / 9;
    const MIN_AREA = 1e-10;
    const ab = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), ac = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for(let f = 0; f < faceCount; f++){
        const b = f * 9;
        ab.set(pos[b + 3] - pos[b], pos[b + 4] - pos[b + 1], pos[b + 5] - pos[b + 2]);
        ac.set(pos[b + 6] - pos[b], pos[b + 7] - pos[b + 1], pos[b + 8] - pos[b + 2]);
        cross.crossVectors(ab, ac);
        if (cross.lengthSq() > MIN_AREA) {
            for(let i = 0; i < 9; i++)cleaned.push(pos[b + i]);
        }
    }
    return cleaned;
}
// ─── Montagem de uma peça a partir dos buffers ─────────────────────────────────
function buildPiece(pos, uv, hasUV, weldQ, relaxIterations) {
    // Edge relax da borda de corte antes de fechar a tampa
    relaxBoundary(pos, relaxIterations);
    // Remove faces degeneradas geradas pelo clipping
    const cleanPos = cleanupDegenerateFaces(pos);
    const posToUse = cleanPos.length >= 9 ? cleanPos : pos;
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(posToUse), 3));
    if (hasUV && uv.length === posToUse.length / 3 * 2) {
        geo.setAttribute('uv', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(uv), 2));
    }
    // Tampa fecha a costura → peça maciça e imprimível
    const faceCount = posToUse.length / 9;
    const allFaces = new Set();
    for(let f = 0; f < faceCount; f++)allFaces.add(f);
    const cap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildCap"])(geo, allFaces, weldQ);
    if (cap.pos.length > 0) {
        const shellV = posToUse.length / 3;
        const capV = cap.pos.length / 3;
        const merged = new Float32Array((shellV + capV) * 3);
        merged.set(new Float32Array(posToUse), 0);
        merged.set(cap.pos, shellV * 3);
        geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](merged, 3));
        if (geo.getAttribute('uv')) {
            const mUV = new Float32Array((shellV + capV) * 2);
            mUV.set(new Float32Array(uv), 0);
            geo.setAttribute('uv', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](mUV, 2));
        }
    }
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSmoothNormalsByPosition"])(geo);
    } catch  {
        geo.computeVertexNormals();
    }
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
function validateCutResult(selectedPiece, bodyPiece) {
    const issues = [];
    const checkPiece = (geo, label)=>{
        const posAttr = geo.getAttribute('position');
        const vertCount = posAttr.count;
        const faceCount = vertCount / 3;
        if (faceCount < 4) return;
        // 1. Faces degeneradas
        let degCount = 0;
        const ab = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), ac = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
        for(let f = 0; f < faceCount; f++){
            const b = f * 3;
            ab.set(posAttr.getX(b + 1) - posAttr.getX(b), posAttr.getY(b + 1) - posAttr.getY(b), posAttr.getZ(b + 1) - posAttr.getZ(b));
            ac.set(posAttr.getX(b + 2) - posAttr.getX(b), posAttr.getY(b + 2) - posAttr.getY(b), posAttr.getZ(b + 2) - posAttr.getZ(b));
            cross.crossVectors(ab, ac);
            if (cross.lengthSq() < 1e-18) degCount++;
        }
        if (degCount > 0) {
            issues.push({
                type: 'degenerate_faces',
                message: `${label}: ${degCount} face(s) degenerada(s) detectada(s)`,
                count: degCount
            });
        }
        // 2. Borda aberta (buracos)
        const Q = 1e4;
        const edgeCnt = new Map();
        const edgeKey = (ia, ib)=>{
            const qa = `${Math.round(posAttr.getX(ia) * Q)},${Math.round(posAttr.getY(ia) * Q)},${Math.round(posAttr.getZ(ia) * Q)}`;
            const qb = `${Math.round(posAttr.getX(ib) * Q)},${Math.round(posAttr.getY(ib) * Q)},${Math.round(posAttr.getZ(ib) * Q)}`;
            return qa < qb ? `${qa}|${qb}` : `${qb}|${qa}`;
        };
        for(let f = 0; f < faceCount; f++){
            const b = f * 3;
            for(let ci = 0; ci < 3; ci++){
                const k = edgeKey(b + ci, b + (ci + 1) % 3);
                edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1);
            }
        }
        let openEdges = 0, nonManifold = 0;
        for (const cnt of edgeCnt.values()){
            if (cnt === 1) openEdges++;
            else if (cnt > 2) nonManifold++;
        }
        // Small number of open edges is expected (the seam before capping)
        const openThreshold = Math.max(3, faceCount * 0.01);
        if (openEdges > openThreshold) {
            issues.push({
                type: 'open_boundary',
                message: `${label}: ${openEdges} aresta(s) abertas — possível buraco na malha`,
                count: openEdges
            });
        }
        if (nonManifold > 0) {
            issues.push({
                type: 'non_manifold',
                message: `${label}: ${nonManifold} aresta(s) não-manifold`,
                count: nonManifold
            });
        }
    };
    checkPiece(selectedPiece, 'Peça selecionada');
    checkPiece(bodyPiece, 'Corpo');
    return issues;
}
function qualityContourCut(geometry, selected, options = {}) {
    const opts = {
        ...DEFAULT_QUALITY,
        ...options
    };
    const w = weldMesh(geometry, opts.weldQ);
    const phi0 = buildIndicatorField(w, selected);
    const hasUV = !!geometry.getAttribute('uv');
    const strength = Math.max(0, Math.min(1, opts.strength));
    let iterations = Math.max(6, Math.round(10 + strength * 60));
    const maxTries = opts.qualityFirst ? 4 : 1;
    let best = null;
    // Offset: desloca o isocontorno (threshold = offset em espaço phi)
    // Negativo expande a seleção, positivo contrai.
    const threshold = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].clamp(-(opts.offset ?? 0), -0.4, 0.4);
    for(let attempt = 0; attempt < maxTries; attempt++){
        const phi = diffuseField(phi0, w, iterations);
        const buf = marchTriangles(geometry, w, phi, hasUV, threshold);
        const { score, segments } = scoreSeam(buf.seam, opts.weldQ);
        if (!best || score < best.score) best = {
            buf,
            score,
            segments,
            iters: iterations
        };
        if (score <= opts.qualityThreshold || !opts.qualityFirst) break;
        iterations = Math.round(iterations * 1.8);
    }
    const chosen = best;
    const relaxIters = Math.max(0, Math.min(8, opts.relaxIterations ?? 2));
    const selectedPiece = buildPiece(chosen.buf.posA, chosen.buf.uvA, hasUV, opts.weldQ, relaxIters);
    const bodyPiece = buildPiece(chosen.buf.posB, chosen.buf.uvB, hasUV, opts.weldQ, relaxIters);
    const ok = (selectedPiece.getAttribute('position')?.count ?? 0) > 0 && (bodyPiece.getAttribute('position')?.count ?? 0) > 0;
    // Isocontorno como Float32Array para LineSegments no Preview
    const seamPoints = new Float32Array(chosen.buf.seam);
    // Validação automática das peças
    const validationIssues = ok ? validateCutResult(selectedPiece, bodyPiece) : [];
    return {
        selectedPiece,
        bodyPiece,
        seamPoints,
        seamScore: chosen.score,
        iterations: chosen.iters,
        seamSegments: chosen.segments,
        validationIssues,
        ok
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/smartcut-pipeline.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "V2_DEFAULT_OPTIONS",
    ()=>V2_DEFAULT_OPTIONS,
    "addCapsToShell",
    ()=>addCapsToShell,
    "computeOpenCut",
    ()=>computeOpenCut,
    "generateCaps",
    ()=>generateCaps,
    "optimizeMesh",
    ()=>optimizeMesh
]);
/**
 * SmartCut V2 Pipeline — Pipeline Modular de Corte Profissional
 * ──────────────────────────────────────────────────────────────
 *
 * Separa o pipeline em etapas independentes e explícitas:
 *
 *   ETAPA 1–3:  Cálculo do corte + Extração de Loops + Limpeza
 *               → cascas abertas (sem tampas)
 *   ETAPA 4–6:  Geração + Suavização + Validação das Tampas
 *               → peças totalmente fechadas
 *   ETAPA 7:    Preview inteligente (controlado pelo painel)
 *   ETAPA 8:    Geração de Encaixes (opcional, só se habilitado)
 *   ETAPA 9–10: União Final + Otimização
 *
 * Cada etapa é independente: falha em uma não destrói resultados anteriores.
 * A superfície externa original é SEMPRE preservada intacta.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-cut.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$quality$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/quality-cut.ts [app-client] (ecmascript)");
;
;
;
const V2_DEFAULT_OPTIONS = {
    strength: 0.6,
    weldQ: 1e4,
    offset: 0,
    relaxIterations: 2,
    qualityFirst: true
};
function weldMesh(geometry, Q) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    const keyToUID = new Map();
    const faceUID = new Int32Array(faceCount * 3);
    const faceCorner = new Int32Array(faceCount * 3);
    const uidOf = (v)=>{
        const k = `${Math.round(posAttr.getX(v) * Q)},${Math.round(posAttr.getY(v) * Q)},${Math.round(posAttr.getZ(v) * Q)}`;
        let id = keyToUID.get(k);
        if (id === undefined) {
            id = keyToUID.size;
            keyToUID.set(k, id);
        }
        return id;
    };
    for(let f = 0; f < faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            faceCorner[f * 3 + c] = v;
            faceUID[f * 3 + c] = uidOf(v);
        }
    }
    const uidCount = keyToUID.size;
    const nbSets = Array.from({
        length: uidCount
    }, ()=>new Set());
    for(let f = 0; f < faceCount; f++){
        const a = faceUID[f * 3], b = faceUID[f * 3 + 1], c = faceUID[f * 3 + 2];
        nbSets[a].add(b);
        nbSets[a].add(c);
        nbSets[b].add(a);
        nbSets[b].add(c);
        nbSets[c].add(a);
        nbSets[c].add(b);
    }
    return {
        faceUID,
        faceCorner,
        faceCount,
        uidCount,
        neighbors: nbSets.map((s)=>Int32Array.from(s))
    };
}
function buildIndicatorField(w, selected) {
    const totalCnt = new Float32Array(w.uidCount);
    const selCnt = new Float32Array(w.uidCount);
    for(let f = 0; f < w.faceCount; f++){
        const inSel = selected.has(f) ? 1 : 0;
        for(let c = 0; c < 3; c++){
            const uid = w.faceUID[f * 3 + c];
            totalCnt[uid] += 1;
            selCnt[uid] += inSel;
        }
    }
    const phi = new Float32Array(w.uidCount);
    for(let u = 0; u < w.uidCount; u++){
        const t = totalCnt[u] > 0 ? selCnt[u] / totalCnt[u] : 0;
        phi[u] = t * 2 - 1;
    }
    return phi;
}
function diffuseField(phi0, w, iterations) {
    const LAMBDA = 0.6, MU = -0.62;
    let cur = phi0.slice(), buf = new Float32Array(cur.length);
    for(let it = 0; it < iterations; it++){
        const factor = it % 2 === 0 ? LAMBDA : MU;
        for(let u = 0; u < w.uidCount; u++){
            const nb = w.neighbors[u];
            const n = nb.length;
            if (n === 0) {
                buf[u] = cur[u];
                continue;
            }
            let sum = 0;
            for(let i = 0; i < n; i++)sum += cur[nb[i]];
            buf[u] = cur[u] + factor * (sum / n - cur[u]);
        }
        const tmp = cur;
        cur = buf;
        buf = tmp;
    }
    return cur;
}
function marchTriangles(geometry, w, phi, hasUV, threshold) {
    const posAttr = geometry.getAttribute('position');
    const uvAttr = hasUV ? geometry.getAttribute('uv') : null;
    const out = {
        posA: [],
        uvA: [],
        posB: [],
        uvB: [],
        seam: []
    };
    const P = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]()
    ];
    const U = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
    ];
    const d = [
        0,
        0,
        0
    ];
    const lerpC = (i, j, t)=>({
            p: P[i].clone().lerp(P[j], t),
            u: hasUV ? U[i].clone().lerp(U[j], t) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
        });
    const clip = (keepInside)=>{
        const poly = [];
        for(let i = 0; i < 3; i++){
            const j = (i + 1) % 3;
            const di = d[i] - threshold, dj = d[j] - threshold;
            const inI = keepInside ? di >= 0 : di < 0;
            const inJ = keepInside ? dj >= 0 : dj < 0;
            if (inI) poly.push({
                p: P[i].clone(),
                u: hasUV ? U[i].clone() : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]()
            });
            if (inI !== inJ) poly.push(lerpC(i, j, di / (di - dj)));
        }
        return poly;
    };
    const emit = (posArr, uvArr, poly)=>{
        for(let k = 1; k + 1 < poly.length; k++){
            const a = poly[0], b = poly[k], c = poly[k + 1];
            posArr.push(a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z, c.p.x, c.p.y, c.p.z);
            if (hasUV) uvArr.push(a.u.x, a.u.y, b.u.x, b.u.y, c.u.x, c.u.y);
        }
    };
    const noUV = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"]();
    for(let f = 0; f < w.faceCount; f++){
        for(let c = 0; c < 3; c++){
            const v = w.faceCorner[f * 3 + c];
            P[c].set(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
            if (uvAttr) U[c].set(uvAttr.getX(v), uvAttr.getY(v));
            d[c] = phi[w.faceUID[f * 3 + c]];
        }
        const nIn = (d[0] >= threshold ? 1 : 0) + (d[1] >= threshold ? 1 : 0) + (d[2] >= threshold ? 1 : 0);
        if (nIn === 3) {
            emit(out.posA, out.uvA, [
                {
                    p: P[0].clone(),
                    u: hasUV ? U[0].clone() : noUV
                },
                {
                    p: P[1].clone(),
                    u: hasUV ? U[1].clone() : noUV
                },
                {
                    p: P[2].clone(),
                    u: hasUV ? U[2].clone() : noUV
                }
            ]);
        } else if (nIn === 0) {
            emit(out.posB, out.uvB, [
                {
                    p: P[0].clone(),
                    u: hasUV ? U[0].clone() : noUV
                },
                {
                    p: P[1].clone(),
                    u: hasUV ? U[1].clone() : noUV
                },
                {
                    p: P[2].clone(),
                    u: hasUV ? U[2].clone() : noUV
                }
            ]);
        } else {
            const inPoly = clip(true), outPoly = clip(false);
            if (inPoly.length >= 3) emit(out.posA, out.uvA, inPoly);
            if (outPoly.length >= 3) emit(out.posB, out.uvB, outPoly);
            const cross = [];
            for(let i = 0; i < 3; i++){
                const j = (i + 1) % 3;
                const di = d[i] - threshold, dj = d[j] - threshold;
                if (di >= 0 !== dj >= 0) cross.push(P[i].clone().lerp(P[j], di / (di - dj)));
            }
            if (cross.length === 2) out.seam.push(cross[0].x, cross[0].y, cross[0].z, cross[1].x, cross[1].y, cross[1].z);
        }
    }
    return out;
}
function scoreSeam(seam, Q) {
    const segCount = seam.length / 6;
    if (segCount === 0) return {
        score: 0,
        segments: 0
    };
    const key = (x, y, z)=>`${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`;
    const nodePos = new Map();
    const adj = new Map();
    for(let s = 0; s < segCount; s++){
        const b = s * 6;
        const ka = key(seam[b], seam[b + 1], seam[b + 2]);
        const kb = key(seam[b + 3], seam[b + 4], seam[b + 5]);
        if (ka === kb) continue;
        nodePos.set(ka, [
            seam[b],
            seam[b + 1],
            seam[b + 2]
        ]);
        nodePos.set(kb, [
            seam[b + 3],
            seam[b + 4],
            seam[b + 5]
        ]);
        (adj.get(ka) ?? adj.set(ka, []).get(ka)).push(kb);
        (adj.get(kb) ?? adj.set(kb, []).get(kb)).push(ka);
    }
    let totalDev = 0, nodes = 0;
    const a = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), c = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const [k, nbs] of adj){
        if (nbs.length < 2) continue;
        const pc = nodePos.get(k), pa = nodePos.get(nbs[0]), pb = nodePos.get(nbs[1]);
        center.set(pc[0], pc[1], pc[2]);
        a.set(pa[0], pa[1], pa[2]).sub(center);
        c.set(pb[0], pb[1], pb[2]).sub(center);
        const la = a.length(), lc = c.length();
        if (la < 1e-9 || lc < 1e-9) continue;
        totalDev += Math.abs(180 - Math.acos(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].clamp(a.dot(c) / (la * lc), -1, 1)) * 180 / Math.PI);
        nodes++;
    }
    return {
        score: nodes > 0 ? totalDev / nodes : 0,
        segments: segCount
    };
}
/** Etapa 3: Limpa a fronteira da malha via Taubin suave na borda aberta. */ function relaxBoundary(pos, iterations) {
    if (iterations <= 0 || pos.length < 9) return;
    const Q = 1e4;
    const vertCount = pos.length / 3;
    const faceCount = vertCount / 3;
    const posKey = (i)=>`${Math.round(pos[i * 3] * Q)},${Math.round(pos[i * 3 + 1] * Q)},${Math.round(pos[i * 3 + 2] * Q)}`;
    const uidMap = new Map();
    const uid = new Int32Array(vertCount);
    for(let i = 0; i < vertCount; i++){
        const k = posKey(i);
        let id = uidMap.get(k);
        if (id === undefined) {
            id = uidMap.size;
            uidMap.set(k, id);
        }
        uid[i] = id;
    }
    const uidCount = uidMap.size;
    const edgeCnt = new Map();
    const edgeVerts = new Map();
    for(let f = 0; f < faceCount; f++){
        for(let ci = 0; ci < 3; ci++){
            const a = f * 3 + ci, b = f * 3 + (ci + 1) % 3;
            const ua = uid[a], ub = uid[b];
            const k = ua < ub ? ua * uidCount + ub : ub * uidCount + ua;
            edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1);
            if (!edgeVerts.has(k)) edgeVerts.set(k, [
                a,
                b
            ]);
        }
    }
    const uidNeighbors = Array.from({
        length: uidCount
    }, ()=>new Set());
    const isBoundaryUID = new Uint8Array(uidCount);
    for (const [k, cnt] of edgeCnt){
        if (cnt !== 1) continue;
        const [a, b] = edgeVerts.get(k);
        const ua = uid[a], ub = uid[b];
        uidNeighbors[ua].add(ub);
        uidNeighbors[ub].add(ua);
        isBoundaryUID[ua] = 1;
        isBoundaryUID[ub] = 1;
    }
    if (isBoundaryUID.every((v)=>v === 0)) return;
    const uidPos = new Float32Array(uidCount * 3);
    const uidCnt = new Int32Array(uidCount);
    for(let i = 0; i < vertCount; i++){
        const u = uid[i];
        uidPos[u * 3] += pos[i * 3];
        uidPos[u * 3 + 1] += pos[i * 3 + 1];
        uidPos[u * 3 + 2] += pos[i * 3 + 2];
        uidCnt[u]++;
    }
    for(let u = 0; u < uidCount; u++){
        if (uidCnt[u] > 0) {
            uidPos[u * 3] /= uidCnt[u];
            uidPos[u * 3 + 1] /= uidCnt[u];
            uidPos[u * 3 + 2] /= uidCnt[u];
        }
    }
    const LAMBDA = 0.5, MU = -0.53;
    const buf = new Float32Array(uidCount * 3);
    for(let iter = 0; iter < iterations * 2; iter++){
        const factor = iter % 2 === 0 ? LAMBDA : MU;
        buf.set(uidPos);
        for(let u = 0; u < uidCount; u++){
            if (!isBoundaryUID[u]) continue;
            const nb = uidNeighbors[u];
            const n = nb.size;
            if (n === 0) continue;
            let sx = 0, sy = 0, sz = 0;
            for (const v of nb){
                sx += uidPos[v * 3];
                sy += uidPos[v * 3 + 1];
                sz += uidPos[v * 3 + 2];
            }
            buf[u * 3] = uidPos[u * 3] + factor * (sx / n - uidPos[u * 3]);
            buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (sy / n - uidPos[u * 3 + 1]);
            buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (sz / n - uidPos[u * 3 + 2]);
        }
        uidPos.set(buf);
    }
    for(let i = 0; i < vertCount; i++){
        const u = uid[i];
        if (!isBoundaryUID[u]) continue;
        pos[i * 3] = uidPos[u * 3];
        pos[i * 3 + 1] = uidPos[u * 3 + 1];
        pos[i * 3 + 2] = uidPos[u * 3 + 2];
    }
}
/** Remove triângulos com área negligível (faces degeneradas). */ function cleanupDegenerateFaces(pos) {
    const cleaned = [];
    const faceCount = pos.length / 9;
    const ab = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), ac = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](), cross = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for(let f = 0; f < faceCount; f++){
        const b = f * 9;
        ab.set(pos[b + 3] - pos[b], pos[b + 4] - pos[b + 1], pos[b + 5] - pos[b + 2]);
        ac.set(pos[b + 6] - pos[b], pos[b + 7] - pos[b + 1], pos[b + 8] - pos[b + 2]);
        cross.crossVectors(ab, ac);
        if (cross.lengthSq() > 1e-10) for(let i = 0; i < 9; i++)cleaned.push(pos[b + i]);
    }
    return cleaned;
}
/** Constrói casca ABERTA (sem tampa). Inclui limpeza e normalização. */ function buildOpenShell(pos, weldQ, relaxIterations) {
    relaxBoundary(pos, relaxIterations);
    const cleanPos = cleanupDegenerateFaces(pos);
    const posToUse = cleanPos.length >= 9 ? cleanPos : pos;
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(posToUse), 3));
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSmoothNormalsByPosition"])(geo);
    } catch  {
        geo.computeVertexNormals();
    }
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
function addCapsToShell(openGeo, weldQ) {
    const posAttr = openGeo.getAttribute('position');
    const posArr = [];
    for(let i = 0; i < posAttr.count; i++){
        posArr.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }
    const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(posArr), 3));
    const faceCount = posArr.length / 9;
    const allFaces = new Set();
    for(let f = 0; f < faceCount; f++)allFaces.add(f);
    const cap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildCap"])(geo, allFaces, weldQ);
    if (cap.pos.length > 0) {
        const shellV = posArr.length / 3;
        const capV = cap.pos.length / 3;
        const merged = new Float32Array((shellV + capV) * 3);
        merged.set(new Float32Array(posArr), 0);
        merged.set(cap.pos, shellV * 3);
        geo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](merged, 3));
    }
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeSmoothNormalsByPosition"])(geo);
    } catch  {
        geo.computeVertexNormals();
    }
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}
function computeOpenCut(geometry, selectedFaces, options = {}) {
    const opts = {
        ...V2_DEFAULT_OPTIONS,
        ...options
    };
    const w = weldMesh(geometry, opts.weldQ);
    const phi0 = buildIndicatorField(w, selectedFaces);
    const hasUV = !!geometry.getAttribute('uv');
    const strength = Math.max(0, Math.min(1, opts.strength));
    const threshold = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].clamp(-(opts.offset ?? 0), -0.4, 0.4);
    let iterations = Math.max(6, Math.round(10 + strength * 60));
    const maxTries = opts.qualityFirst !== false ? 4 : 1;
    let best = null;
    for(let attempt = 0; attempt < maxTries; attempt++){
        const phi = diffuseField(phi0, w, iterations);
        const buf = marchTriangles(geometry, w, phi, hasUV, threshold);
        const { score, segments } = scoreSeam(buf.seam, opts.weldQ);
        if (!best || score < best.score) best = {
            ...buf,
            score,
            segments,
            iters: iterations
        };
        if (score <= 12 || !opts.qualityFirst) break;
        iterations = Math.round(iterations * 1.8);
    }
    const chosen = best;
    const relaxIters = Math.max(0, Math.min(8, opts.relaxIterations ?? 2));
    const openSelectedGeometry = buildOpenShell(chosen.posA.slice(), opts.weldQ, relaxIters);
    const openBodyGeometry = buildOpenShell(chosen.posB.slice(), opts.weldQ, relaxIters);
    const ok = (openSelectedGeometry.getAttribute('position')?.count ?? 0) > 0 && (openBodyGeometry.getAttribute('position')?.count ?? 0) > 0;
    return {
        openSelectedGeometry,
        openBodyGeometry,
        seamPoints: new Float32Array(chosen.seam),
        seamScore: chosen.score,
        seamSegments: chosen.segments,
        iterations: chosen.iters,
        ok
    };
}
function generateCaps(openResult, weldQ) {
    const cappedSel = addCapsToShell(openResult.openSelectedGeometry, weldQ);
    const cappedBody = addCapsToShell(openResult.openBodyGeometry, weldQ);
    const ok = (cappedSel.getAttribute('position')?.count ?? 0) > 0 && (cappedBody.getAttribute('position')?.count ?? 0) > 0;
    const validationIssues = ok ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$quality$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateCutResult"])(cappedSel, cappedBody) : [];
    return {
        cappedSelectedGeometry: cappedSel,
        cappedBodyGeometry: cappedBody,
        validationIssues,
        ok
    };
}
function optimizeMesh(geo, weldQ = 1e4) {
    const posAttr = geo.getAttribute('position');
    const vertCount = posAttr.count;
    const keyToId = new Map();
    const idPos = [];
    const vertRemap = new Int32Array(vertCount);
    for(let i = 0; i < vertCount; i++){
        const k = `${Math.round(posAttr.getX(i) * weldQ)},${Math.round(posAttr.getY(i) * weldQ)},${Math.round(posAttr.getZ(i) * weldQ)}`;
        let id = keyToId.get(k);
        if (id === undefined) {
            id = idPos.length / 3;
            keyToId.set(k, id);
            idPos.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
        }
        vertRemap[i] = id;
    }
    const faceCount = vertCount / 3;
    const indices = [];
    for(let f = 0; f < faceCount; f++){
        const a = vertRemap[f * 3], b = vertRemap[f * 3 + 1], c = vertRemap[f * 3 + 2];
        if (a !== b && b !== c && a !== c) indices.push(a, b, c);
    }
    const newGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
    newGeo.setAttribute('position', new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float32BufferAttribute"](new Float32Array(idPos), 3));
    newGeo.setIndex(indices);
    newGeo.computeVertexNormals();
    newGeo.computeBoundingBox();
    newGeo.computeBoundingSphere();
    return newGeo;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/smart-autocut.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeSelection",
    ()=>analyzeSelection,
    "computeAutoCutPlane",
    ()=>computeAutoCutPlane,
    "makeDowelGeometry",
    ()=>makeDowelGeometry,
    "makeHoleGeometry",
    ()=>makeHoleGeometry,
    "planConnectors",
    ()=>planConnectors,
    "recommendConnectors",
    ()=>recommendConnectors
]);
/**
 * Smart AutoCut — AutoCut Inteligente na Seleção (SmartCut → AutoCut)
 * ------------------------------------------------------------------
 * Recebe uma REGIÃO selecionada pelo SmartCut (conjunto de faces) e decide
 * automaticamente a MELHOR forma de separá-la do resto do modelo:
 *
 *   1. Extrai a "costura" da seleção (arestas entre faces selecionadas e não
 *      selecionadas) — a junção natural onde o corte deve passar.
 *   2. Ajusta um PLANO por mínimos quadrados (PCA) ao anel de costura.
 *      - 'plano'       → plano alinhado ao eixo de menor variação.
 *      - 'inteligente' → melhor plano; se estiver ~alinhado a um eixo, encaixa
 *                        nele (corte mais limpo). Caso contrário, inclina.
 *      - 'adaptativo'  → melhor plano ajustado, sempre inclinado se necessário.
 *   3. Analisa a seção transversal (área, espessura, alongamento) para decidir
 *      se ENCAIXES agregam valor — e quantos/qual tipo.
 *   4. Planeja os encaixes (posição, orientação, raio, profundidade, tipo).
 *
 * O corte físico watertight reaproveita `solidPlaneCut`; os furos dos encaixes
 * são feitos por CSG (three-bvh-csg) no componente de UI.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
// ─── Utilidades de vértice ──────────────────────────────────────────────────
const Q = 1e4;
function keyOf(x, y, z) {
    return `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`;
}
function analyzeSelection(geometry, selectedFaces) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    bbox.getSize(size);
    const modelDiagonal = size.length() || 1;
    // Soldagem de vértices por posição
    const keyToId = new Map();
    const idPos = [];
    const vId = (v)=>{
        const k = keyOf(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
        let id = keyToId.get(k);
        if (id === undefined) {
            id = idPos.length / 3;
            keyToId.set(k, id);
            idPos.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v));
        }
        return id;
    };
    const cornerId = (f, c)=>vId(idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c);
    const edges = new Map();
    const selCenter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    let selFaceCount = 0;
    for(let f = 0; f < faceCount; f++){
        const isSel = selectedFaces.has(f);
        const a = cornerId(f, 0);
        const b = cornerId(f, 1);
        const c = cornerId(f, 2);
        if (isSel) {
            // acumula centróide da seleção
            selCenter.x += (idPos[a * 3] + idPos[b * 3] + idPos[c * 3]) / 3;
            selCenter.y += (idPos[a * 3 + 1] + idPos[b * 3 + 1] + idPos[c * 3 + 1]) / 3;
            selCenter.z += (idPos[a * 3 + 2] + idPos[b * 3 + 2] + idPos[c * 3 + 2]) / 3;
            selFaceCount++;
        }
        const tri = [
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
        ];
        for (const [x, y] of tri){
            const lo = Math.min(x, y);
            const hi = Math.max(x, y);
            const k = `${lo}_${hi}`;
            let info = edges.get(k);
            if (!info) {
                info = {
                    sel: 0,
                    unsel: 0,
                    a: lo,
                    b: hi
                };
                edges.set(k, info);
            }
            if (isSel) info.sel++;
            else info.unsel++;
        }
    }
    if (selFaceCount > 0) selCenter.multiplyScalar(1 / selFaceCount);
    // Costura = arestas com pelo menos uma face selecionada e uma não selecionada
    const seamPointIds = new Set();
    let seamEdges = 0;
    for (const info of edges.values()){
        if (info.sel > 0 && info.unsel > 0) {
            seamEdges++;
            seamPointIds.add(info.a);
            seamPointIds.add(info.b);
        }
    }
    // ── Fallback: sem costura utilizável (seleção isolada ou peça inteira) ──────
    if (seamPointIds.size < 3) {
        return fallbackAnalysis(geometry, selectedFaces, selCenter, modelDiagonal, idPos);
    }
    // Pontos da costura
    const pts = [];
    const seamCenter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const id of seamPointIds){
        const p = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](idPos[id * 3], idPos[id * 3 + 1], idPos[id * 3 + 2]);
        pts.push(p);
        seamCenter.add(p);
    }
    seamCenter.multiplyScalar(1 / pts.length);
    // ── PCA: covariância dos pontos da costura ─────────────────────────────────
    const cov = covariance(pts, seamCenter);
    const { values, vectors } = symmetricEigen3(cov);
    // values ascendente → vectors[0] é a menor variação = normal do plano
    const fitNormal = vectors[0].clone().normalize();
    const planeU = vectors[2].clone().normalize() // maior variação
    ;
    const planeV = vectors[1].clone().normalize();
    // Planaridade: 1 - (menorVar / mediaVar) — alta quando a costura é bem plana
    const sumVar = values[0] + values[1] + values[2] || 1;
    const planarity = clamp01(1 - values[0] / (sumVar / 3));
    // Extensões na base do plano
    let halfU = 0;
    let halfV = 0;
    for (const p of pts){
        const rel = p.clone().sub(seamCenter);
        halfU = Math.max(halfU, Math.abs(rel.dot(planeU)));
        halfV = Math.max(halfV, Math.abs(rel.dot(planeV)));
    }
    const crossArea = Math.PI * halfU * halfV;
    // Eixo cartesiano mais próximo da fitNormal
    const { axisNormal, tilt } = nearestAxis(fitNormal);
    return {
        seamEdges,
        seamCenter,
        selectionCenter: selCenter,
        fitNormal,
        axisNormal,
        planeU,
        planeV,
        halfU,
        halfV,
        crossArea,
        planarity,
        axisTilt: tilt,
        modelDiagonal,
        hasSeam: true
    };
}
/** Fallback quando não há costura clara: usa a bbox da seleção. */ function fallbackAnalysis(geometry, selectedFaces, selCenter, modelDiagonal, idPos) {
    const posAttr = geometry.getAttribute('position');
    const idxAttr = geometry.index;
    const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]();
    const v = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    for (const f of selectedFaces){
        for(let c = 0; c < 3; c++){
            const vi = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c;
            v.set(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi));
            box.expandByPoint(v);
        }
    }
    const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    box.getSize(size);
    const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
    box.getCenter(center);
    // Eixo de menor extensão da caixa = normal
    const comps = [
        [
            size.x,
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](1, 0, 0)
        ],
        [
            size.y,
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0)
        ],
        [
            size.z,
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, 1)
        ]
    ];
    comps.sort((a, b)=>a[0] - b[0]);
    const normal = comps[0][1];
    const planeU = comps[2][1];
    const planeV = comps[1][1];
    return {
        seamEdges: 0,
        seamCenter: center,
        selectionCenter: selCenter.lengthSq() > 0 ? selCenter : center,
        fitNormal: normal.clone(),
        axisNormal: normal.clone(),
        planeU,
        planeV,
        halfU: comps[2][0] / 2,
        halfV: comps[1][0] / 2,
        crossArea: Math.PI * comps[2][0] * comps[1][0] / 4,
        planarity: 0.5,
        axisTilt: 0,
        modelDiagonal,
        hasSeam: false
    };
}
function computeAutoCutPlane(analysis, cutType) {
    const point = analysis.seamCenter.clone();
    if (cutType === 'plane') {
        return {
            normal: analysis.axisNormal.clone(),
            point
        };
    }
    if (cutType === 'adaptive') {
        return {
            normal: analysis.fitNormal.clone(),
            point
        };
    }
    // 'smart': encaixa no eixo se estiver quase alinhado, senão inclina
    if (analysis.axisTilt <= 14) {
        return {
            normal: analysis.axisNormal.clone(),
            point
        };
    }
    return {
        normal: analysis.fitNormal.clone(),
        point
    };
}
function recommendConnectors(analysis, opts) {
    const minDim = Math.min(analysis.halfU, analysis.halfV) * 2;
    const maxDim = Math.max(analysis.halfU, analysis.halfV) * 2;
    const diag = analysis.modelDiagonal;
    const disabled = (skipReason)=>({
            enabled: false,
            count: 0,
            type: 'cylindrical',
            radius: 0,
            depth: 0,
            skipReason
        });
    if (!opts.createConnectors) return disabled('encaixes desativados');
    // Detecção automática: peça muito pequena / seção muito fina → sem encaixe
    if (minDim < diag * 0.025) return disabled('seção fina demais para encaixe seguro');
    if (analysis.crossArea < diag * diag * 0.0009) return disabled('seção pequena demais');
    // Raio base ~ 18% da menor dimensão, limitado
    const radius = clamp(minDim * 0.18, diag * 0.006, diag * 0.06);
    const depth = clamp(radius * 2.4, diag * 0.02, diag * 0.14);
    // Quantidade automática por tamanho da seção
    let count;
    if (opts.count === 'auto') {
        if (maxDim > diag * 0.28) count = 3;
        else if (maxDim > diag * 0.12) count = 2;
        else count = 1;
    } else {
        count = opts.count;
    }
    // Não cria mais encaixes do que cabem lado a lado
    const maxFit = Math.max(1, Math.floor(maxDim / (radius * 3)));
    count = Math.min(count, maxFit);
    // Tipo automático: seção alongada → chavetado (anti-rotação); senão cilíndrico
    let type;
    if (opts.type === 'auto') {
        const aspect = maxDim / (minDim || 1);
        type = aspect > 1.8 ? 'keyed' : 'cylindrical';
    } else {
        type = opts.type;
    }
    return {
        enabled: true,
        count,
        type,
        radius,
        depth
    };
}
function planConnectors(analysis, plane, resolved) {
    if (!resolved.enabled || resolved.count <= 0) return [];
    const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0), plane.normal.clone().normalize());
    // Distribui ao longo do eixo perpendicular mais largo da seção
    const useU = analysis.halfU >= analysis.halfV;
    const along = (useU ? analysis.planeU : analysis.planeV).clone().normalize();
    const half = useU ? analysis.halfU : analysis.halfV;
    const usableHalf = Math.max(half - resolved.radius * 1.5, 0);
    const specs = [];
    const n = resolved.count;
    for(let i = 0; i < n; i++){
        // t de -1..1 distribuído; centro quando n ímpar
        const t = n === 1 ? 0 : i / (n - 1) * 2 - 1;
        const pos = plane.point.clone().add(along.clone().multiplyScalar(t * usableHalf));
        specs.push({
            position: pos,
            quaternion: quat.clone(),
            type: resolved.type,
            radius: resolved.radius,
            depth: resolved.depth
        });
    }
    return specs;
}
function makeHoleGeometry(type, radius, tolerance, depth) {
    const r = radius + tolerance;
    const h = depth * 2 + Math.max(depth * 0.25, radius * 0.5);
    return makeShape(type, r, h);
}
function makeDowelGeometry(type, radius, depth) {
    const h = depth * 2 - Math.min(0.4, depth * 0.1);
    return makeShape(type, radius, h);
}
function makeShape(type, r, h) {
    let geo;
    switch(type){
        case 'conical':
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CylinderGeometry"](r * 0.6, r, h, 28);
            break;
        case 'rectangular':
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoxGeometry"](r * 1.8, h, r * 1.8);
            break;
        case 'oval':
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CylinderGeometry"](r, r, h, 28);
            geo.scale(1.7, 1, 0.7);
            break;
        case 'keyed':
            // Prisma achatado (formato de chaveta) — impede rotação da junta
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoxGeometry"](r * 2.4, h, r * 1.05);
            break;
        case 'cylindrical':
        default:
            geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CylinderGeometry"](r, r, h, 28);
            break;
    }
    geo.deleteAttribute('uv');
    return geo;
}
function covariance(pts, center) {
    let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
    for (const p of pts){
        const dx = p.x - center.x;
        const dy = p.y - center.y;
        const dz = p.z - center.z;
        xx += dx * dx;
        xy += dx * dy;
        xz += dx * dz;
        yy += dy * dy;
        yz += dy * dz;
        zz += dz * dz;
    }
    const n = pts.length || 1;
    return [
        xx / n,
        xy / n,
        xz / n,
        xy / n,
        yy / n,
        yz / n,
        xz / n,
        yz / n,
        zz / n
    ];
}
/**
 * Autovalores/autovetores de uma matriz simétrica 3x3 via Jacobi cíclico.
 * Retorna valores em ordem ascendente com os vetores correspondentes.
 */ function symmetricEigen3(m) {
    // Matriz de trabalho
    const a = [
        [
            m[0],
            m[1],
            m[2]
        ],
        [
            m[3],
            m[4],
            m[5]
        ],
        [
            m[6],
            m[7],
            m[8]
        ]
    ];
    // Matriz de autovetores (identidade)
    const v = [
        [
            1,
            0,
            0
        ],
        [
            0,
            1,
            0
        ],
        [
            0,
            0,
            1
        ]
    ];
    for(let sweep = 0; sweep < 32; sweep++){
        // Soma dos off-diagonais
        const off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
        if (off < 1e-12) break;
        for (const [p, q] of [
            [
                0,
                1
            ],
            [
                0,
                2
            ],
            [
                1,
                2
            ]
        ]){
            const apq = a[p][q];
            if (Math.abs(apq) < 1e-15) continue;
            const app = a[p][p];
            const aqq = a[q][q];
            const phi = 0.5 * Math.atan2(2 * apq, aqq - app);
            const c = Math.cos(phi);
            const s = Math.sin(phi);
            // Rotação a = Jᵀ a J
            for(let k = 0; k < 3; k++){
                const akp = a[k][p];
                const akq = a[k][q];
                a[k][p] = c * akp - s * akq;
                a[k][q] = s * akp + c * akq;
            }
            for(let k = 0; k < 3; k++){
                const apk = a[p][k];
                const aqk = a[q][k];
                a[p][k] = c * apk - s * aqk;
                a[q][k] = s * apk + c * aqk;
            }
            // Acumula autovetores
            for(let k = 0; k < 3; k++){
                const vkp = v[k][p];
                const vkq = v[k][q];
                v[k][p] = c * vkp - s * vkq;
                v[k][q] = s * vkp + c * vkq;
            }
        }
    }
    const eig = [
        {
            val: a[0][0],
            vec: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](v[0][0], v[1][0], v[2][0])
        },
        {
            val: a[1][1],
            vec: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](v[0][1], v[1][1], v[2][1])
        },
        {
            val: a[2][2],
            vec: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](v[0][2], v[1][2], v[2][2])
        }
    ];
    eig.sort((x, y)=>x.val - y.val);
    return {
        values: eig.map((e)=>e.val),
        vectors: eig.map((e)=>e.vec.normalize())
    };
}
function nearestAxis(n) {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    let axisNormal;
    let dot;
    if (ax >= ay && ax >= az) {
        axisNormal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](Math.sign(n.x) || 1, 0, 0);
        dot = ax;
    } else if (ay >= ax && ay >= az) {
        axisNormal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, Math.sign(n.y) || 1, 0);
        dot = ay;
    } else {
        axisNormal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, Math.sign(n.z) || 1);
        dot = az;
    }
    const tilt = Math.acos(clamp(dot, 0, 1)) * (180 / Math.PI);
    return {
        axisNormal,
        tilt
    };
}
function clamp(x, lo, hi) {
    return x < lo ? lo : x > hi ? hi : x;
}
function clamp01(x) {
    return clamp(x, 0, 1);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/use-draggable.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDraggable",
    ()=>useDraggable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useDraggable() {
    _s();
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const drag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        active: false,
        ox: 0,
        oy: 0,
        ex: 0,
        ey: 0
    });
    const onHandleMouseDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDraggable.useCallback[onHandleMouseDown]": (e)=>{
            // Only respond to primary button
            if (e.button !== 0) return;
            e.preventDefault();
            const panel = e.currentTarget.closest('[data-draggable]');
            if (!panel) return;
            const rect = panel.getBoundingClientRect();
            drag.current = {
                active: true,
                ox: e.clientX,
                oy: e.clientY,
                ex: rect.left,
                ey: rect.top
            };
            const onMove = {
                "useDraggable.useCallback[onHandleMouseDown].onMove": (mv)=>{
                    if (!drag.current.active) return;
                    setPos({
                        x: drag.current.ex + mv.clientX - drag.current.ox,
                        y: drag.current.ey + mv.clientY - drag.current.oy
                    });
                }
            }["useDraggable.useCallback[onHandleMouseDown].onMove"];
            const onUp = {
                "useDraggable.useCallback[onHandleMouseDown].onUp": ()=>{
                    drag.current.active = false;
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                }
            }["useDraggable.useCallback[onHandleMouseDown].onUp"];
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
    }["useDraggable.useCallback[onHandleMouseDown]"], []);
    return {
        pos,
        onHandleMouseDown
    };
}
_s(useDraggable, "dNbmcrfGgNp/KnQ+LBEOvhl4mDQ=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/smart-autocut-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SmartAutoCutPanel",
    ()=>SmartAutoCutPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * SmartAutoCutPanel V2 — Pipeline Modular de Corte
 *
 * Novo fluxo (SmartCut V2):
 *   Configurar → Calcular Corte (cascas abertas) →
 *   Gerar Tampas → [Gerar Encaixes] → Aplicar Corte Final
 *
 * REGRA ABSOLUTA: A seleção do SmartCut é inviolável.
 * O AutoCut age SOMENTE na superfície de separação.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scissors.mjs [app-client] (ecmascript) <export default as Scissors>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.mjs [app-client] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waypoints$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waypoints$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/waypoints.mjs [app-client] (ecmascript) <export default as Waypoints>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/brain.mjs [app-client] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2d$horizontal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/waves-horizontal.mjs [app-client] (ecmascript) <export default as Waves>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$vertical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sliders$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sliders-vertical.mjs [app-client] (ecmascript) <export default as Sliders>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.mjs [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$dashed$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BoxSelect$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-dashed.mjs [app-client] (ecmascript) <export default as BoxSelect>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-horizontal.mjs [app-client] (ecmascript) <export default as GripHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-cut.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smartcut$2d$pipeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smartcut-pipeline.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$autocut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-autocut.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/lang-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-draggable.ts [app-client] (ecmascript)");
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
;
;
;
const PRESETS = [
    {
        id: 'hair',
        label: 'Cabelo',
        icon: '✦',
        strength: 0.85,
        offset: 0,
        relaxIterations: 3,
        weldQ: 1e4,
        description: 'Contorno suave para mechas e detalhes finos'
    },
    {
        id: 'arm',
        label: 'Braço',
        icon: '⬡',
        strength: 0.65,
        offset: 0,
        relaxIterations: 2,
        weldQ: 1e4,
        description: 'Separação de membros e partes orgânicas'
    },
    {
        id: 'head',
        label: 'Cabeça',
        icon: '◉',
        strength: 0.7,
        offset: 0,
        relaxIterations: 2,
        weldQ: 1e4,
        description: 'Destacar cabeça, chapéu ou acessório'
    },
    {
        id: 'mini',
        label: 'Mini',
        icon: '◈',
        strength: 0.75,
        offset: 0,
        relaxIterations: 3,
        weldQ: 1e5,
        description: 'Alta precisão para miniaturas e peças pequenas'
    },
    {
        id: 'fdm',
        label: 'FDM',
        icon: '◆',
        strength: 1.0,
        offset: 0,
        relaxIterations: 4,
        weldQ: 1e5,
        description: 'Qualidade máxima para impressão 3D'
    }
];
const OFFSET_STEPS = [
    {
        value: -0.3,
        label: '−3'
    },
    {
        value: -0.15,
        label: '−1'
    },
    {
        value: 0,
        label: '0'
    },
    {
        value: 0.15,
        label: '+1'
    },
    {
        value: 0.3,
        label: '+3'
    }
];
const RELAX_STEPS = [
    {
        value: 0,
        label: 'Sem'
    },
    {
        value: 1,
        label: 'Leve'
    },
    {
        value: 2,
        label: 'Méd'
    },
    {
        value: 3,
        label: 'Fort'
    },
    {
        value: 4,
        label: 'Máx'
    }
];
const SMOOTH_LEVELS = [
    {
        id: 'subtle',
        label: 'Sutil',
        strength: 0.3
    },
    {
        id: 'balanced',
        label: 'Equil.',
        strength: 0.6
    },
    {
        id: 'strong',
        label: 'Forte',
        strength: 0.85
    },
    {
        id: 'max',
        label: 'Máx',
        strength: 1
    }
];
const PRECISION = [
    {
        id: 'low',
        label: 'Baixa',
        weldQ: 1e3
    },
    {
        id: 'medium',
        label: 'Média',
        weldQ: 1e4
    },
    {
        id: 'high',
        label: 'Alta',
        weldQ: 1e5
    },
    {
        id: 'ultra',
        label: 'Ultra',
        weldQ: 1e6
    }
];
function SmartAutoCutPanel() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { pos, onHandleMouseDown } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDraggable"])();
    const { activeTool, autoCutOpen, setAutoCutOpen, modelMesh, modelInfo, selectedFaceIndices, selectionState, setModelMesh, setModelInfo, addCutPart, cutParts, setStatus, pushHistory, clearSelection, setAutoCutPreview, unit, cutPreview, setCutPreview, previewViewMode, setPreviewViewMode, openCutData, setOpenCutData, autoCutPipelineStage, setAutoCutPipelineStage, autoCutPreviewMode, setAutoCutPreviewMode, setSelectedFaceIndices } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('configure');
    const [contourMode, setContourMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ai');
    const [smoothLevel, setSmoothLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('balanced');
    const [offset, setOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [relaxIterations, setRelaxIterations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(2);
    const [precision, setPrecision] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('high');
    const [activePreset, setActivePreset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [advancedOpen, setAdvancedOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [noCap, setNoCap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [capsGenerated, setCapsGenerated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const recalcTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const computeVersionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const smoothStrength = SMOOTH_LEVELS.find((l)=>l.id === smoothLevel)?.strength ?? 0.6;
    const weldQ = PRECISION.find((p)=>p.id === precision).weldQ;
    const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected';
    const visible = activeTool === 'select' && autoCutOpen && hasSelection && !!modelMesh;
    const analysis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SmartAutoCutPanel.useMemo[analysis]": ()=>{
            if (!visible || !modelMesh) return null;
            try {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$autocut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["analyzeSelection"])(modelMesh.geometry, selectedFaceIndices);
            } catch  {
                return null;
            }
        }
    }["SmartAutoCutPanel.useMemo[analysis]"], [
        visible,
        modelMesh,
        selectedFaceIndices
    ]);
    const disposePreviewGeos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartAutoCutPanel.useCallback[disposePreviewGeos]": (preview)=>{
            if (!preview) return;
            try {
                preview.selectedGeometry.dispose();
            } catch  {}
            try {
                preview.bodyGeometry.dispose();
            } catch  {}
        }
    }["SmartAutoCutPanel.useCallback[disposePreviewGeos]"], []);
    const disposeOpenCutGeos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartAutoCutPanel.useCallback[disposeOpenCutGeos]": (data)=>{
            if (!data) return;
            try {
                data.openSelectedGeometry.dispose();
            } catch  {}
            try {
                data.openBodyGeometry.dispose();
            } catch  {}
        }
    }["SmartAutoCutPanel.useCallback[disposeOpenCutGeos]"], []);
    const cancelPendingCompute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartAutoCutPanel.useCallback[cancelPendingCompute]": ()=>{
            if (recalcTimerRef.current) {
                clearTimeout(recalcTimerRef.current);
                recalcTimerRef.current = null;
            }
            computeVersionRef.current++;
        }
    }["SmartAutoCutPanel.useCallback[cancelPendingCompute]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartAutoCutPanel.useEffect": ()=>{
            if (!visible) {
                cancelPendingCompute();
                setPhase('configure');
                setCapsGenerated(false);
            }
            return ({
                "SmartAutoCutPanel.useEffect": ()=>{
                    if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current);
                }
            })["SmartAutoCutPanel.useEffect"];
        }
    }["SmartAutoCutPanel.useEffect"], [
        visible,
        cancelPendingCompute
    ]);
    // ─── Etapa 1–3: Calcular Corte (cascas abertas) ─────────────────────────────
    const handleCalculateCut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartAutoCutPanel.useCallback[handleCalculateCut]": ()=>{
            if (!modelMesh || !analysis) return;
            const myVersion = ++computeVersionRef.current;
            setBusy(true);
            setCapsGenerated(false);
            setStatus('cutting', 'Calculando corte — extraindo cascas...');
            setTimeout({
                "SmartAutoCutPanel.useCallback[handleCalculateCut]": ()=>{
                    if (myVersion !== computeVersionRef.current) {
                        setBusy(false);
                        return;
                    }
                    try {
                        const geo = modelMesh.geometry;
                        // ── Auto-fill micro-fragmentos ──────────────────────────────────────
                        // Antes de qualquer cálculo, absorve pequenas partículas não-selecionadas
                        // que ficaram de fora do SmartCut e descarta cacos selecionados isolados.
                        // Usa apenas limpeza por área — não altera o contorno da seleção principal.
                        const { cleaned: effectiveSelection, addedFaces, removedFaces } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["autoFillMicroFragments"])(geo, selectedFaceIndices);
                        if (addedFaces + removedFaces > 0) {
                            setSelectedFaceIndices(effectiveSelection);
                            if (addedFaces > 0) {
                                setStatus('cutting', `Ajustando seleção — ${addedFaces} face(s) absorvida(s)${removedFaces > 0 ? `, ${removedFaces} caco(s) removido(s)` : ''}...`);
                            }
                        }
                        let openResult;
                        if (contourMode === 'exact') {
                            // Modo exato: separa pelo contorno da malha sem reconstrução
                            const selGeo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractSubMesh"])(geo, effectiveSelection, true, weldQ);
                            const bodyGeo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$cut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeSubMesh"])(geo, effectiveSelection, weldQ);
                            openResult = {
                                openSelectedGeometry: selGeo,
                                openBodyGeometry: bodyGeo,
                                seamPoints: new Float32Array(0),
                                seamScore: 0,
                                seamSegments: 0,
                                iterations: 0,
                                ok: true
                            };
                        } else {
                            openResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smartcut$2d$pipeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeOpenCut"])(geo, effectiveSelection, {
                                strength: smoothStrength,
                                weldQ,
                                offset,
                                relaxIterations
                            });
                        }
                        if (myVersion !== computeVersionRef.current) {
                            openResult.openSelectedGeometry.dispose();
                            openResult.openBodyGeometry.dispose();
                            setBusy(false);
                            return;
                        }
                        if (!openResult.ok) {
                            setStatus('error', 'Seleção inválida para corte. Ajuste e tente novamente.');
                            setBusy(false);
                            return;
                        }
                        disposeOpenCutGeos(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState().openCutData);
                        disposePreviewGeos(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState().cutPreview);
                        setCutPreview(null);
                        setOpenCutData(openResult);
                        setAutoCutPipelineStage('cut_done');
                        setAutoCutPreviewMode('shell');
                        setPhase('preview');
                        const scoreLabel = openResult.seamScore < 8 ? 'Excelente' : openResult.seamScore < 15 ? 'Boa' : 'Razoável';
                        setStatus('loaded', `Cascas calculadas — qualidade ${scoreLabel} · ${openResult.seamSegments} segmentos`);
                    } catch (err) {
                        setStatus('error', 'Erro ao calcular corte.');
                        console.error('[SmartCut V2] Cut error:', err);
                    } finally{
                        setBusy(false);
                    }
                }
            }["SmartAutoCutPanel.useCallback[handleCalculateCut]"], 60);
        }
    }["SmartAutoCutPanel.useCallback[handleCalculateCut]"], [
        modelMesh,
        analysis,
        contourMode,
        selectedFaceIndices,
        weldQ,
        smoothStrength,
        offset,
        relaxIterations,
        setStatus,
        setOpenCutData,
        setAutoCutPipelineStage,
        setAutoCutPreviewMode,
        setCutPreview,
        disposeOpenCutGeos,
        disposePreviewGeos
    ]);
    // ─── Etapa 4–6: Gerar Tampas ────────────────────────────────────────────────
    const handleGenerateCaps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartAutoCutPanel.useCallback[handleGenerateCaps]": ()=>{
            const currentOpenData = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState().openCutData;
            if (!currentOpenData) return;
            const myVersion = ++computeVersionRef.current;
            setBusy(true);
            setStatus('cutting', 'Gerando tampas — triangulação e validação...');
            setTimeout({
                "SmartAutoCutPanel.useCallback[handleGenerateCaps]": ()=>{
                    if (myVersion !== computeVersionRef.current) {
                        setBusy(false);
                        return;
                    }
                    try {
                        const capResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smartcut$2d$pipeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCaps"])(currentOpenData, weldQ);
                        if (myVersion !== computeVersionRef.current) {
                            capResult.cappedSelectedGeometry.dispose();
                            capResult.cappedBodyGeometry.dispose();
                            setBusy(false);
                            return;
                        }
                        if (!capResult.ok) {
                            setStatus('error', 'Falha ao gerar tampas. Tente aumentar a precisão.');
                            setBusy(false);
                            return;
                        }
                        disposePreviewGeos(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState().cutPreview);
                        setCutPreview({
                            selectedGeometry: capResult.cappedSelectedGeometry,
                            bodyGeometry: capResult.cappedBodyGeometry,
                            seamPoints: currentOpenData.seamPoints,
                            seamScore: currentOpenData.seamScore,
                            seamSegments: currentOpenData.seamSegments,
                            iterations: currentOpenData.iterations,
                            validationIssues: capResult.validationIssues,
                            params: {
                                strength: smoothStrength,
                                weldQ,
                                offset,
                                relaxIterations
                            }
                        });
                        setAutoCutPipelineStage('caps_done');
                        setAutoCutPreviewMode('caps');
                        setCapsGenerated(true);
                        const issues = capResult.validationIssues.length;
                        setStatus('loaded', `Tampas geradas${issues > 0 ? ` · ${issues} aviso(s)` : ' — malha fechada ✓'}`);
                    } catch (err) {
                        setStatus('error', 'Erro ao gerar tampas.');
                        console.error('[SmartCut V2] Caps error:', err);
                    } finally{
                        setBusy(false);
                    }
                }
            }["SmartAutoCutPanel.useCallback[handleGenerateCaps]"], 60);
        }
    }["SmartAutoCutPanel.useCallback[handleGenerateCaps]"], [
        weldQ,
        smoothStrength,
        offset,
        relaxIterations,
        setStatus,
        setCutPreview,
        setAutoCutPipelineStage,
        setAutoCutPreviewMode,
        disposePreviewGeos
    ]);
    // ─── Recalcular quando parâmetros mudam no preview ─────────────────────────
    const scheduleRecalc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SmartAutoCutPanel.useCallback[scheduleRecalc]": ()=>{
            if (phase !== 'preview') return;
            if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current);
            recalcTimerRef.current = setTimeout({
                "SmartAutoCutPanel.useCallback[scheduleRecalc]": ()=>{
                    recalcTimerRef.current = null;
                    handleCalculateCut();
                }
            }["SmartAutoCutPanel.useCallback[scheduleRecalc]"], 350);
        }
    }["SmartAutoCutPanel.useCallback[scheduleRecalc]"], [
        phase,
        handleCalculateCut
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmartAutoCutPanel.useEffect": ()=>{
            if (phase === 'preview') scheduleRecalc();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["SmartAutoCutPanel.useEffect"], [
        smoothLevel,
        offset,
        relaxIterations,
        precision
    ]);
    if (!visible) return null;
    // ─── Aplicar preset ─────────────────────────────────────────────────────────
    const applyPreset = (preset)=>{
        setActivePreset(preset.id);
        setSmoothLevel(preset.strength <= 0.3 ? 'subtle' : preset.strength <= 0.65 ? 'balanced' : preset.strength <= 0.85 ? 'strong' : 'max');
        setOffset(preset.offset);
        setRelaxIterations(preset.relaxIterations);
        const p = PRECISION.find((pr)=>pr.weldQ === preset.weldQ) ?? PRECISION[2];
        setPrecision(p.id);
    };
    // ─── Aplicar corte definitivamente ─────────────────────────────────────────
    const handleApplyCut = ()=>{
        // Modo Sem Tampa: usa cascas abertas diretamente (sem caps)
        const currentOpenData = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState().openCutData;
        if (noCap) {
            if (!modelMesh || !currentOpenData || !analysis) return;
        } else {
            if (!modelMesh || !cutPreview || !analysis) return;
        }
        setBusy(true);
        pushHistory();
        setStatus('cutting', 'Aplicando corte final...');
        setTimeout(()=>{
            try {
                // Escolhe a fonte da geometria:
                // - noCap: peça selecionada = aberta (sem cap); corpo = fechado (cap gerado agora)
                // - normal: ambas as peças com tampas (geradas previamente)
                let selectedPiece;
                let bodyPiece;
                if (noCap) {
                    // Peça extraída: sem tampa (casca aberta)
                    selectedPiece = currentOpenData.openSelectedGeometry.clone();
                    // Corpo: tampa gerada agora para selar o buraco no modelo principal
                    bodyPiece = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smartcut$2d$pipeline$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addCapsToShell"])(currentOpenData.openBodyGeometry.clone(), weldQ);
                } else {
                    selectedPiece = cutPreview.selectedGeometry.clone();
                    bodyPiece = cutPreview.bodyGeometry.clone();
                }
                const cleanBody = bodyPiece.clone();
                const cleanSel = selectedPiece.clone();
                const seamNormal = analysis.fitNormal.clone().normalize();
                const sideDot = analysis.selectionCenter.clone().sub(analysis.seamCenter).dot(seamNormal);
                for (const g of [
                    bodyPiece,
                    selectedPiece
                ]){
                    g.computeVertexNormals();
                    g.computeBoundingBox();
                    g.computeBoundingSphere();
                }
                const mainMat = modelMesh.material.clone();
                mainMat.side = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"];
                mainMat.vertexColors = false;
                mainMat.color = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](0x9a9a9d);
                mainMat.needsUpdate = true;
                const mainMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](bodyPiece, mainMat);
                mainMesh.castShadow = true;
                mainMesh.receiveShadow = true;
                mainMesh.position.copy(modelMesh.position);
                mainMesh.rotation.copy(modelMesh.rotation);
                mainMesh.scale.copy(modelMesh.scale);
                mainMesh.userData.cleanGeometry = cleanBody;
                setModelMesh(mainMesh);
                if (modelInfo) {
                    const bb = bodyPiece.boundingBox;
                    const s = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                    bb?.getSize(s);
                    const vCount = bodyPiece.getAttribute('position')?.count ?? 0;
                    setModelInfo({
                        ...modelInfo,
                        vertices: vCount,
                        faces: Math.floor(vCount / 3),
                        width: bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
                        height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
                        depth: bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth
                    });
                }
                const geo = modelMesh.geometry;
                const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]().setFromBufferAttribute(geo.getAttribute('position'));
                const size = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
                box.getSize(size);
                const spread = (Math.max(size.x, size.y, size.z) || 1) * 0.28;
                const dir = seamNormal.clone().multiplyScalar(sideDot >= 0 ? spread : -spread);
                const partMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                    color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]('#ff6600'),
                    roughness: 0.55,
                    metalness: 0.12,
                    side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                });
                const partMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](selectedPiece, partMat);
                partMesh.castShadow = true;
                partMesh.receiveShadow = true;
                partMesh.position.copy(modelMesh.position);
                partMesh.rotation.copy(modelMesh.rotation);
                partMesh.scale.copy(modelMesh.scale);
                partMesh.userData.cleanGeometry = cleanSel;
                partMesh.position.add(dir);
                addCutPart({
                    id: `autocut-${Date.now()}`,
                    name: `Peça ${cutParts.length + 1}`,
                    mesh: partMesh,
                    faceIndices: [],
                    color: '#ff6600'
                });
                setAutoCutPreview(null);
                setAutoCutOpen(false);
                clearSelection();
                setStatus('loaded', 'AutoCut V2 concluído');
            } catch (err) {
                setStatus('error', 'Falha ao aplicar o AutoCut.');
                console.error('[AutoCut V2] Apply error:', err);
            } finally{
                setBusy(false);
            }
        }, 60);
    };
    const handleResetToConfig = ()=>{
        setCutPreview(null);
        setOpenCutData(null);
        setAutoCutPipelineStage('idle');
        setAutoCutPreviewMode('shell');
        setCapsGenerated(false);
        setPhase('configure');
        setStatus('loaded', 'Reconfigurar parâmetros e recalcular.');
    };
    // ─── Qualidade do corte ─────────────────────────────────────────────────────
    const seamScore = cutPreview?.seamScore ?? openCutData?.seamScore ?? null;
    const qualityLabel = seamScore !== null ? seamScore < 8 ? t.quality_excellent : seamScore < 15 ? t.quality_good : seamScore < 25 ? t.quality_fair : t.quality_low : null;
    const qualityColor = seamScore !== null ? seamScore < 8 ? '#4ade80' : seamScore < 15 ? '#facc15' : seamScore < 25 ? '#fb923c' : '#f87171' : '#ffffff';
    // ─── Preview mode disponíveis de acordo com o estágio ──────────────────────
    const previewModes = [
        {
            id: 'plane',
            label: t.vis_plane
        },
        {
            id: 'shell',
            label: t.vis_shell,
            disabled: autoCutPipelineStage === 'idle'
        },
        {
            id: 'caps',
            label: t.vis_caps,
            disabled: !capsGenerated
        },
        {
            id: 'final',
            label: t.vis_final,
            disabled: !capsGenerated
        }
    ];
    // ─── Render ─────────────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-draggable": true,
        className: pos ? '' : 'absolute bottom-28 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto',
        style: pos ? {
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            zIndex: 20
        } : {},
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-2 p-3 rounded-2xl border w-[268px]",
            style: {
                background: 'oklch(0.09 0 0 / 97%)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                borderColor: phase === 'preview' ? 'oklch(0.42 0.10 250 / 80%)' : 'oklch(0.18 0 0)',
                boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between cursor-grab active:cursor-grabbing select-none",
                    onMouseDown: onHandleMouseDown,
                    title: "Arraste para mover",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__["GripHorizontal"], {
                                    className: "w-3 h-3 text-muted-foreground/30"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 453,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                    className: "w-3 h-3",
                                    style: {
                                        color: 'oklch(0.70 0.22 42)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 454,
                                    columnNumber: 13
                                }, this),
                                phase === 'preview' ? t.autocut_header : t.autocut_on_selection
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 452,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                phase === 'preview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono px-1 py-0.5 rounded",
                                    style: noCap ? {
                                        background: 'oklch(0.70 0.22 42 / 20%)',
                                        color: 'oklch(0.80 0.20 42)'
                                    } : {
                                        background: 'oklch(0.55 0.15 250 / 20%)',
                                        color: 'oklch(0.75 0.15 250)'
                                    },
                                    children: noCap ? t.badge_no_cap : autoCutPipelineStage === 'caps_done' ? t.badge_caps_ok : t.badge_shells
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 459,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onMouseDown: (e)=>e.stopPropagation(),
                                    onClick: ()=>{
                                        setAutoCutOpen(false);
                                        setAutoCutPreview(null);
                                        setCutPreview(null);
                                        setOpenCutData(null);
                                        setAutoCutPipelineStage('idle');
                                        setPhase('configure');
                                        setCapsGenerated(false);
                                    },
                                    className: "text-muted-foreground/50 hover:text-foreground transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                        lineNumber: 475,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 470,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 457,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                    lineNumber: 447,
                    columnNumber: 9
                }, this),
                phase === 'configure' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-1",
                            children: [
                                [
                                    'ai',
                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"],
                                    t.contour_ai,
                                    t.contour_ai_sub
                                ],
                                [
                                    'exact',
                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waypoints$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waypoints$3e$__["Waypoints"],
                                    t.contour_exact,
                                    t.contour_exact_sub
                                ]
                            ].map(([mode, Icon, title, sub])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setContourMode(mode),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col items-start gap-0.5 rounded-lg border px-2 py-1.5 text-left transition-all', contourMode === mode ? 'border-transparent' : 'border-border text-muted-foreground hover:text-foreground'),
                                    style: contourMode === mode ? {
                                        background: 'oklch(0.70 0.22 42 / 16%)',
                                        borderColor: 'oklch(0.70 0.22 42 / 60%)'
                                    } : undefined,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-center gap-1 text-[10px] font-mono font-medium",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: "w-3 h-3",
                                                    style: contourMode === mode ? {
                                                        color: 'oklch(0.70 0.22 42)'
                                                    } : undefined
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 21
                                                }, this),
                                                title
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 492,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono text-muted-foreground/70",
                                            children: sub
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 496,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, mode, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 486,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 484,
                            columnNumber: 13
                        }, this),
                        contourMode === 'ai' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 505,
                                            columnNumber: 19
                                        }, this),
                                        t.presets_label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 504,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-5 gap-0.5",
                                    children: PRESETS.map((p)=>{
                                        const presetLabel = p.id === 'hair' ? t.preset_hair : p.id === 'arm' ? t.preset_arm : p.id === 'head' ? t.preset_head : p.id === 'mini' ? t.preset_mini : t.preset_fdm;
                                        const presetDesc = p.id === 'hair' ? t.preset_hair_desc : p.id === 'arm' ? t.preset_arm_desc : p.id === 'head' ? t.preset_head_desc : p.id === 'mini' ? t.preset_mini_desc : t.preset_fdm_desc;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>applyPreset(p),
                                            title: presetDesc,
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col items-center gap-0.5 rounded py-1 text-[9px] font-mono transition-all', activePreset === p.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                            style: activePreset === p.id ? {
                                                background: 'oklch(0.70 0.22 42)'
                                            } : undefined,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm leading-none",
                                                    children: p.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 516,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px]",
                                                    children: presetLabel
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 517,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, p.id, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 512,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 507,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 503,
                            columnNumber: 15
                        }, this),
                        contourMode === 'ai' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2d$horizontal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__["Waves"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 529,
                                            columnNumber: 19
                                        }, this),
                                        t.smooth_label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 528,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-0.5",
                                    children: SMOOTH_LEVELS.map((l)=>{
                                        const smoothLabel = l.id === 'subtle' ? t.smooth_subtle : l.id === 'balanced' ? t.smooth_balanced : l.id === 'strong' ? t.smooth_strong : t.smooth_max;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setSmoothLevel(l.id);
                                                setActivePreset(null);
                                            },
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-1 text-[9px] font-mono transition-all', smoothLevel === l.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                            style: smoothLevel === l.id ? {
                                                background: 'oklch(0.70 0.22 42)'
                                            } : undefined,
                                            children: smoothLabel
                                        }, l.id, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 535,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 531,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 527,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-lg border border-border/60 p-1.5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setNoCap((v)=>!v),
                                className: "flex items-center justify-between w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex flex-col items-start gap-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1 text-[10px] font-mono text-muted-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$dashed$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BoxSelect$3e$__["BoxSelect"], {
                                                        className: "w-2.5 h-2.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                        lineNumber: 550,
                                                        columnNumber: 21
                                                    }, this),
                                                    t.no_cap_label
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                lineNumber: 549,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] font-mono text-muted-foreground/50",
                                                children: noCap ? t.no_cap_open_desc : t.no_cap_closed_desc
                                            }, void 0, false, {
                                                fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                lineNumber: 552,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                        lineNumber: 548,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('relative w-7 h-3.5 rounded-full transition-colors shrink-0', noCap ? '' : 'bg-secondary'),
                                        style: noCap ? {
                                            background: 'oklch(0.70 0.22 42)'
                                        } : undefined,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('absolute top-0.5 w-2.5 h-2.5 rounded-full bg-background transition-all', noCap ? 'left-3.5' : 'left-0.5')
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 560,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                        lineNumber: 556,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                lineNumber: 547,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 546,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1.5 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setAdvancedOpen((v)=>!v),
                                    className: "flex items-center gap-1 text-[10px] font-mono text-muted-foreground",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 568,
                                            columnNumber: 17
                                        }, this),
                                        t.advanced_label,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-2.5 h-2.5 ml-auto transition-transform', advancedOpen && 'rotate-90')
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 569,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 567,
                                    columnNumber: 15
                                }, this),
                                advancedOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2 pt-0.5 animate-fade-in",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                                    children: t.precision_label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 574,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-0.5",
                                                    children: PRECISION.map((p)=>{
                                                        const precLabel = p.id === 'low' ? t.prec_low : p.id === 'medium' ? t.prec_med : p.id === 'high' ? t.prec_high : t.prec_ultra;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setPrecision(p.id),
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', precision === p.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                                            style: precision === p.id ? {
                                                                background: 'oklch(0.55 0.02 250)'
                                                            } : undefined,
                                                            children: precLabel
                                                        }, p.id, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 579,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 575,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 573,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                                    children: t.edge_relax_label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 588,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-0.5",
                                                    children: RELAX_STEPS.map((r, i)=>{
                                                        const relaxLabel = i === 0 ? t.relax_none : i === 1 ? t.relax_light : i === 2 ? t.relax_med : i === 3 ? t.relax_strong : t.relax_max;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setRelaxIterations(r.value),
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', relaxIterations === r.value ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                                            style: relaxIterations === r.value ? {
                                                                background: 'oklch(0.55 0.02 250)'
                                                            } : undefined,
                                                            children: relaxLabel
                                                        }, r.value, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 593,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 589,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 587,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                                    children: t.offset_label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 602,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-0.5",
                                                    children: OFFSET_STEPS.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setOffset(o.value),
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', offset === o.value ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                                            style: offset === o.value ? {
                                                                background: 'oklch(0.55 0.02 250)'
                                                            } : undefined,
                                                            children: o.label
                                                        }, o.value, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 605,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 603,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 601,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 572,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 566,
                            columnNumber: 13
                        }, this),
                        analysis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 text-[9px] font-mono text-muted-foreground/50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    t.boundary_label,
                                    ": ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-foreground/70",
                                        children: analysis.hasSeam ? t.boundary_seam(analysis.seamEdges) : t.boundary_island
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                        lineNumber: 619,
                                        columnNumber: 43
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                lineNumber: 619,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 618,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleCalculateCut,
                            disabled: busy || !analysis,
                            className: "flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                            style: {
                                background: 'oklch(0.70 0.22 42)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 630,
                                    columnNumber: 15
                                }, this),
                                busy ? t.calculating : t.calc_cut
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 624,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true),
                phase === 'preview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 642,
                                            columnNumber: 17
                                        }, this),
                                        t.visualization_label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 641,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-0.5",
                                    children: previewModes.map(({ id, label, disabled })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>!disabled && setAutoCutPreviewMode(id),
                                            disabled: disabled,
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-1 text-[9px] font-mono transition-all', autoCutPreviewMode === id ? 'text-background' : 'border border-border text-muted-foreground', disabled ? 'opacity-30 cursor-not-allowed' : 'hover:text-foreground'),
                                            style: autoCutPreviewMode === id ? {
                                                background: 'oklch(0.55 0.02 250)'
                                            } : undefined,
                                            children: label
                                        }, id, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 646,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 644,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 640,
                            columnNumber: 13
                        }, this),
                        qualityLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between rounded-lg px-2 py-1.5",
                            style: {
                                background: 'oklch(0.55 0.15 250 / 10%)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono uppercase text-muted-foreground/60",
                                            children: t.quality_label
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 658,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-mono font-medium",
                                            style: {
                                                color: qualityColor
                                            },
                                            children: qualityLabel
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 659,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 657,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-end gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono text-muted-foreground/50",
                                            children: [
                                                openCutData?.seamSegments ?? cutPreview?.seamSegments ?? 0,
                                                " ",
                                                t.seg_suffix
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 662,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono",
                                            style: {
                                                color: qualityColor
                                            },
                                            children: [
                                                (seamScore ?? 0).toFixed(1),
                                                "°"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 665,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 661,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 656,
                            columnNumber: 15
                        }, this),
                        cutPreview?.validationIssues && cutPreview.validationIssues.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-0.5",
                            children: cutPreview.validationIssues.slice(0, 2).map((issue, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-1 rounded bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                            className: "w-2.5 h-2.5 mt-0.5 shrink-0",
                                            style: {
                                                color: '#facc15'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 677,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[8px] font-mono text-yellow-200/80 leading-relaxed",
                                            children: issue.message
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 678,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 676,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 674,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 687,
                                            columnNumber: 17
                                        }, this),
                                        t.rendering_label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 686,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-0.5",
                                    children: [
                                        [
                                            'solid',
                                            t.render_solid
                                        ],
                                        [
                                            'wireframe',
                                            t.render_wire
                                        ],
                                        [
                                            'xray',
                                            t.render_xray
                                        ]
                                    ].map(([mode, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setPreviewViewMode(mode),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', previewViewMode === mode ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                            style: previewViewMode === mode ? {
                                                background: 'oklch(0.35 0.02 250)'
                                            } : undefined,
                                            children: label
                                        }, mode, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 691,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 689,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 685,
                            columnNumber: 13
                        }, this),
                        busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground/60",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "animate-spin w-2.5 h-2.5 border border-t-foreground/60 rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 701,
                                    columnNumber: 17
                                }, this),
                                t.processing
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 700,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-1.5 pt-0.5",
                            children: [
                                autoCutPipelineStage === 'cut_done' && noCap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1 rounded-lg px-2 py-1.5",
                                            style: {
                                                background: 'oklch(0.70 0.22 42 / 12%)',
                                                border: '1px solid oklch(0.70 0.22 42 / 30%)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$dashed$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BoxSelect$3e$__["BoxSelect"], {
                                                    className: "w-3 h-3 shrink-0",
                                                    style: {
                                                        color: 'oklch(0.70 0.22 42)'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 715,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] font-mono",
                                                    style: {
                                                        color: 'oklch(0.80 0.15 42)'
                                                    },
                                                    children: t.no_cap_open_msg
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 716,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 713,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleResetToConfig,
                                                    disabled: busy,
                                                    className: "flex items-center justify-center gap-1 flex-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 726,
                                                            columnNumber: 23
                                                        }, this),
                                                        t.reconfig
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 721,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleApplyCut,
                                                    disabled: busy,
                                                    className: "flex items-center justify-center gap-1.5 flex-[2] px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                                                    style: {
                                                        background: 'oklch(0.70 0.22 42)'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 734,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                                            className: "w-3 h-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                            lineNumber: 735,
                                                            columnNumber: 23
                                                        }, this),
                                                        busy ? t.applying : t.apply_no_cap
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 728,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 720,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true),
                                autoCutPipelineStage === 'cut_done' && !noCap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleGenerateCaps,
                                    disabled: busy,
                                    className: "flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                                    style: {
                                        background: 'oklch(0.70 0.22 42)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$vertical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sliders$3e$__["Sliders"], {
                                            className: "w-3.5 h-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 750,
                                            columnNumber: 19
                                        }, this),
                                        busy ? t.generating : t.gen_caps
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 744,
                                    columnNumber: 17
                                }, this),
                                autoCutPipelineStage === 'caps_done' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleResetToConfig,
                                            disabled: busy,
                                            className: "flex items-center justify-center gap-1 flex-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 763,
                                                    columnNumber: 21
                                                }, this),
                                                t.reconfig
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 758,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleApplyCut,
                                            disabled: busy,
                                            className: "flex items-center justify-center gap-1.5 flex-[2] px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                                            style: {
                                                background: 'oklch(0.70 0.22 42)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 771,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                                    lineNumber: 772,
                                                    columnNumber: 21
                                                }, this),
                                                busy ? t.applying : t.apply_cut
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 765,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 757,
                                    columnNumber: 17
                                }, this),
                                autoCutPipelineStage === 'cut_done' && !noCap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleResetToConfig,
                                    disabled: busy,
                                    className: "flex items-center justify-center gap-1 w-full px-2 py-1 rounded-lg text-[10px] font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                            className: "w-2.5 h-2.5"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 785,
                                            columnNumber: 19
                                        }, this),
                                        t.reconfigure
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 780,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 707,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 text-[8px] font-mono text-muted-foreground/40",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-sm bg-gray-400"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 792,
                                            columnNumber: 59
                                        }, this),
                                        t.legend_body
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 792,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-sm",
                                            style: {
                                                background: autoCutPreviewMode === 'shell' ? '#f97316' : '#ef4444'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 793,
                                            columnNumber: 59
                                        }, this),
                                        t.legend_part
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 793,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-0.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-1.5 h-1.5 rounded-sm bg-white"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                            lineNumber: 794,
                                            columnNumber: 59
                                        }, this),
                                        t.legend_seam
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                                    lineNumber: 794,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
                            lineNumber: 791,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/smart-autocut-panel.tsx",
            lineNumber: 437,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/smart-autocut-panel.tsx",
        lineNumber: 432,
        columnNumber: 5
    }, this);
}
_s(SmartAutoCutPanel, "fXhZ9Eg1DQl1FKtmhoSlkAn4Cck=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDraggable"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = SmartAutoCutPanel;
var _c;
__turbopack_context__.k.register(_c, "SmartAutoCutPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/smart-autocut-panel.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/layout/smart-autocut-panel.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_1je98mk._.js.map