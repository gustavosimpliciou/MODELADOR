(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/lib/encaixe.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyEncaixe",
    ()=>applyEncaixe,
    "planEncaixe",
    ()=>planEncaixe
]);
/**
 * Encaixe Quadrado — Geração de encaixe de quadrado tipo pino/furo
 * -----------------------------------------------------------------
 * Workflow separado do corte: o usuário seleciona com SmartCut a região
 * onde quer o encaixe (ex: pescoço), clica "Gerar Encaixe" e o sistema:
 *
 *   1. Analisa a costura da seleção para encontrar o plano de encaixe.
 *   2. Detecta automaticamente a peça complementar (aquela que foi
 *      descolada naquele ponto — ex: cabeça, mão).
 *   3. Subtrai o furo nas DUAS peças (pino vai por fora como peça solta).
 *   4. Cria o pino quadrado como cutPart separado (para impressão avulsa).
 *
 * Tamanho proporcional à seção transversal da costura.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/Evaluator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/Brush.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three-bvh-csg/src/core/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$autocut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/smart-autocut.ts [app-client] (ecmascript)");
;
;
;
// ─── Planejamento ─────────────────────────────────────────────────────────────
const SIZE_FRACTION = {
    xs: 0.08,
    s: 0.13,
    m: 0.20
};
const MIN_SIDE_MM = 0.8;
const MAX_SIDE_MM = 10.0;
function planEncaixe(geometry, selectedFaces, cutParts, params) {
    if (selectedFaces.size === 0) return null;
    const ana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$smart$2d$autocut$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["analyzeSelection"])(geometry, selectedFaces);
    // ── Normal orientada da seleção para o complemento ───────────────────────
    const seamNormal = ana.fitNormal.clone().normalize();
    const sourceOffset = ana.selectionCenter.clone().sub(ana.seamCenter).dot(seamNormal);
    // Se a seleção está no lado positivo da normal, a normal já aponta
    // para longe da seleção (em direção ao complemento). Caso contrário, inverte.
    if (sourceOffset > 0) seamNormal.negate();
    // ── Tamanho proporcional à seção mínima da costura ───────────────────────
    const minSectionDim = Math.min(ana.halfU, ana.halfV) * 2;
    const fraction = SIZE_FRACTION[params.size];
    let side = minSectionDim * fraction;
    // Fallback: seção muito pequena ou inválida → usa escala global
    if (!isFinite(side) || side < MIN_SIDE_MM) {
        side = Math.max(MIN_SIDE_MM, ana.modelDiagonal * 0.012 * fraction / 0.13);
    }
    side = Math.min(side, MAX_SIDE_MM);
    const depth = side * 2.2 // profundidade total ≈ 2× a largura
    ;
    // ── Detecta peça complementar (opcional) ─────────────────────────────────
    const seamCenter = ana.seamCenter.clone();
    let bestIdx = -1;
    let bestDist = Infinity;
    for(let i = 0; i < cutParts.length; i++){
        const geo = cutParts[i].mesh.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const center = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
        geo.boundingBox.getCenter(center);
        // Prefere peças do lado oposto ao da seleção (lado do complemento)
        const sideSign = center.clone().sub(seamCenter).dot(seamNormal);
        // Pontuação: peças no lado certo (sideSign > 0) e próximas ao seam têm prioridade
        const penaltyWrongSide = sideSign < 0 ? 1e6 : 0;
        const score = center.distanceTo(seamCenter) + penaltyWrongSide;
        if (score < bestDist) {
            bestDist = score;
            bestIdx = i;
        }
    }
    // bestIdx === -1 quando não há peças cortadas — encaixe só na peça fonte
    return {
        seamCenter,
        seamNormal,
        side,
        depth,
        tolerance: params.tolerance,
        complementIndex: bestIdx,
        complementName: bestIdx >= 0 ? cutParts[bestIdx].name : ''
    };
}
// ─── Aplicação ────────────────────────────────────────────────────────────────
/**
 * Subtrai os furos das duas peças e retorna as geometrias atualizadas
 * junto com o pino quadrado para ser adicionado como cutPart separado.
 *
 * Pode lançar — envolva em try/catch no chamador.
 */ /** Cria um novo Brush do furo posicionado na costura. Recriado a cada operação
 *  para evitar estado acumulado no three-bvh-csg entre chamadas consecutivas. */ function makeHoleBrush(holeGeo, seamCenter, quat) {
    const b = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Brush"](holeGeo.clone());
    b.position.copy(seamCenter);
    b.quaternion.copy(quat);
    b.updateMatrixWorld();
    return b;
}
function applyEncaixe(sourceMesh, complementMesh, plan) {
    // ── Geometria do furo (maior que o pino pela tolerância) ─────────────────
    const hs = plan.side + plan.tolerance * 2;
    const hd = plan.depth + plan.tolerance;
    const holeGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoxGeometry"](hs, hd, hs);
    const quat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Quaternion"]().setFromUnitVectors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 1, 0), plan.seamNormal.clone().normalize());
    // ── Subtrai furo da peça fonte — avaliador independente ──────────────────
    let sourceGeo;
    try {
        const ev = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Evaluator"]();
        ev.attributes = [
            'position',
            'normal'
        ];
        const srcBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Brush"](sourceMesh.geometry.clone());
        srcBrush.updateMatrixWorld();
        const holeSrc = makeHoleBrush(holeGeo, plan.seamCenter, quat);
        sourceGeo = ev.evaluate(srcBrush, holeSrc, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SUBTRACTION"]).geometry;
    } catch (e) {
        console.error('[Encaixe] CSG falhou na peça fonte:', e);
        sourceGeo = sourceMesh.geometry.clone();
    }
    // ── Subtrai furo da peça complementar — avaliador independente ───────────
    // null quando não existe peça cortada — encaixe só na fonte
    let complementGeo = null;
    if (complementMesh) {
        try {
            const ev = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Evaluator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Evaluator"]();
            ev.attributes = [
                'position',
                'normal'
            ];
            const compBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$Brush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Brush"](complementMesh.geometry.clone());
            compBrush.updateMatrixWorld();
            const holeComp = makeHoleBrush(holeGeo, plan.seamCenter, quat);
            complementGeo = ev.evaluate(compBrush, holeComp, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2d$bvh$2d$csg$2f$src$2f$core$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SUBTRACTION"]).geometry;
        } catch (e) {
            console.error('[Encaixe] CSG falhou na peça complementar:', e);
            complementGeo = complementMesh.geometry.clone();
        }
    }
    // ── Geometria do pino (levemente menor que o furo) ───────────────────────
    const ps = Math.max(0.3, plan.side - plan.tolerance * 0.5);
    const pd = Math.max(0.5, plan.depth - plan.tolerance * 1.0);
    const pegGeo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoxGeometry"](ps, pd, ps);
    // ── Finaliza ─────────────────────────────────────────────────────────────
    for (const g of [
        sourceGeo,
        complementGeo,
        pegGeo
    ]){
        if (!g) continue;
        g.computeVertexNormals();
        g.computeBoundingBox();
        g.computeBoundingSphere();
    }
    holeGeo.dispose();
    return {
        sourceGeo,
        complementGeo,
        pegGeo,
        pegPosition: plan.seamCenter.clone(),
        pegQuaternion: quat.clone()
    };
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
"[project]/components/layout/encaixe-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EncaixePanel",
    ()=>EncaixePanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * EncaixePanel — Gerar encaixe quadrado pino/furo em peças já cortadas
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.mjs [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-horizontal.mjs [app-client] (ecmascript) <export default as GripHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$encaixe$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/encaixe.ts [app-client] (ecmascript)");
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
const TOLERANCES = [
    0.10,
    0.15,
    0.20,
    0.25
];
function EncaixePanel() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { pos, onHandleMouseDown } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDraggable"])();
    const { encaixeOpen, setEncaixeOpen, modelMesh, selectedFaceIndices, selectionState, cutParts, setCutParts, addCutPart, setModelMesh, setStatus, pushHistory, clearSelection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])();
    const SIZES = [
        {
            id: 'xs',
            label: t.size_xs_label,
            desc: t.size_xs_desc
        },
        {
            id: 's',
            label: t.size_s_label,
            desc: t.size_s_desc
        },
        {
            id: 'm',
            label: t.size_m_label,
            desc: t.size_m_desc
        }
    ];
    const [size, setSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('s');
    const [tolerance, setTolerance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.15);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const computeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected';
    const visible = encaixeOpen && !!modelMesh;
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EncaixePanel.useMemo[plan]": ()=>{
            if (!visible || !modelMesh || !hasSelection) return null;
            try {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$encaixe$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["planEncaixe"])(modelMesh.geometry, selectedFaceIndices, cutParts, {
                    size,
                    tolerance
                });
            } catch  {
                return null;
            }
        }
    }["EncaixePanel.useMemo[plan]"], [
        visible,
        modelMesh,
        selectedFaceIndices,
        cutParts,
        size,
        tolerance
    ]);
    const handleApply = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EncaixePanel.useCallback[handleApply]": ()=>{
            if (!modelMesh || !plan) return;
            const myVersion = ++computeRef.current;
            setBusy(true);
            const hasComplement = plan.complementIndex >= 0;
            setStatus('cutting', hasComplement ? 'Gerando encaixe — furando peça atual e peça removida...' : 'Gerando encaixe — furando peça selecionada...');
            setTimeout({
                "EncaixePanel.useCallback[handleApply]": ()=>{
                    if (myVersion !== computeRef.current) {
                        setBusy(false);
                        return;
                    }
                    try {
                        pushHistory();
                        const complementPart = hasComplement ? cutParts[plan.complementIndex] : null;
                        const { sourceGeo, complementGeo, pegGeo, pegPosition, pegQuaternion } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$encaixe$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyEncaixe"])(modelMesh, complementPart?.mesh ?? null, plan);
                        const newSourceMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](sourceGeo, modelMesh.material.clone());
                        newSourceMesh.castShadow = true;
                        newSourceMesh.receiveShadow = true;
                        newSourceMesh.position.copy(modelMesh.position);
                        newSourceMesh.rotation.copy(modelMesh.rotation);
                        newSourceMesh.scale.copy(modelMesh.scale);
                        newSourceMesh.userData = {
                            ...modelMesh.userData
                        };
                        setModelMesh(newSourceMesh);
                        if (complementPart && complementGeo) {
                            const newCompMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](complementGeo, complementPart.mesh.material);
                            newCompMesh.castShadow = true;
                            newCompMesh.receiveShadow = true;
                            newCompMesh.position.copy(complementPart.mesh.position);
                            newCompMesh.rotation.copy(complementPart.mesh.rotation);
                            newCompMesh.scale.copy(complementPart.mesh.scale);
                            newCompMesh.userData = {
                                ...complementPart.mesh.userData
                            };
                            const updatedParts = cutParts.map({
                                "EncaixePanel.useCallback[handleApply].updatedParts": (cp, i)=>i === plan.complementIndex ? {
                                        ...cp,
                                        mesh: newCompMesh
                                    } : cp
                            }["EncaixePanel.useCallback[handleApply].updatedParts"]);
                            setCutParts(updatedParts);
                        }
                        const pegM = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix4"]().compose(pegPosition, pegQuaternion, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](1, 1, 1));
                        pegGeo.applyMatrix4(pegM);
                        pegGeo.computeVertexNormals();
                        const pegMat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshStandardMaterial"]({
                            color: '#c8ccd4',
                            roughness: 0.3,
                            metalness: 0.55,
                            side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                        });
                        const pegMesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](pegGeo, pegMat);
                        pegMesh.castShadow = true;
                        pegMesh.receiveShadow = true;
                        pegMesh.position.copy(modelMesh.position);
                        pegMesh.rotation.copy(modelMesh.rotation);
                        pegMesh.scale.copy(modelMesh.scale);
                        addCutPart({
                            id: `encaixe-pino-${Date.now()}`,
                            name: `Pino (${plan.side.toFixed(1)}×${plan.side.toFixed(1)})`,
                            mesh: pegMesh,
                            faceIndices: [],
                            color: '#c8ccd4',
                            isConnector: true
                        });
                        clearSelection();
                        setEncaixeOpen(false);
                        setStatus('loaded', hasComplement ? `Encaixe gerado · pino ${plan.side.toFixed(1)}×${plan.depth.toFixed(1)}mm` : `Encaixe gerado · pino ${plan.side.toFixed(1)}×${plan.depth.toFixed(1)}mm`);
                    } catch (err) {
                        setStatus('error', 'Falha ao gerar encaixe. Tente nova seleção.');
                        console.error('[Encaixe] Erro:', err);
                    } finally{
                        setBusy(false);
                    }
                }
            }["EncaixePanel.useCallback[handleApply]"], 60);
        }
    }["EncaixePanel.useCallback[handleApply]"], [
        modelMesh,
        plan,
        cutParts,
        pushHistory,
        setModelMesh,
        setCutParts,
        addCutPart,
        setStatus,
        clearSelection,
        setEncaixeOpen
    ]);
    if (!visible) return null;
    const sizeLabel = plan ? `${plan.side.toFixed(1)} × ${plan.side.toFixed(1)} × ${plan.depth.toFixed(1)} mm` : '—';
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
            className: "flex flex-col gap-2 p-3 rounded-2xl border w-[248px]",
            style: {
                background: 'oklch(0.09 0 0 / 97%)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                borderColor: 'oklch(0.38 0.08 260 / 70%)',
                boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none",
                    onMouseDown: onHandleMouseDown,
                    title: "Arraste para mover",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__["GripHorizontal"], {
                            className: "w-3 h-3 shrink-0 text-muted-foreground/30"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 155,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                            className: "w-3 h-3 shrink-0",
                            style: {
                                color: 'oklch(0.65 0.18 260)'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 156,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex-1",
                            children: t.encaixe_title
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onMouseDown: (e)=>e.stopPropagation(),
                            onClick: ()=>setEncaixeOpen(false),
                            className: "p-0.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-colors",
                            title: "Fechar",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-3 h-3"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/encaixe-panel.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 160,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 150,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                            children: t.pin_size_label
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 172,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-0.5",
                            children: SIZES.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSize(s.id),
                                    title: s.desc,
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 flex flex-col items-center gap-0.5 rounded py-1 transition-all', size === s.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                    style: size === s.id ? {
                                        background: 'oklch(0.55 0.15 260)'
                                    } : undefined,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-mono font-medium",
                                            children: s.label
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                                            lineNumber: 187,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[7px] font-mono opacity-70",
                                            children: s.desc
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                                            lineNumber: 188,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, s.id, true, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 177,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 175,
                            columnNumber: 11
                        }, this),
                        plan && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center gap-1 mt-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/50",
                                    children: t.pin_suffix
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 194,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono",
                                    style: {
                                        color: 'oklch(0.75 0.12 260)'
                                    },
                                    children: sizeLabel
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 195,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 193,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 171,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1 rounded-lg border border-border/60 p-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60",
                            children: t.hole_clearance_label
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 202,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-0.5",
                            children: TOLERANCES.map((tol)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setTolerance(tol),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', tolerance === tol ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'),
                                    style: tolerance === tol ? {
                                        background: 'oklch(0.55 0.15 260)'
                                    } : undefined,
                                    children: tol.toFixed(2)
                                }, tol, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 207,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 205,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 201,
                    columnNumber: 9
                }, this),
                !hasSelection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 225,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono text-yellow-200/70 leading-relaxed",
                            children: t.select_faces_hint
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 226,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 224,
                    columnNumber: 11
                }, this) : plan ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-0.5 rounded-lg px-2 py-1.5",
                    style: {
                        background: 'oklch(0.55 0.15 260 / 10%)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/50",
                                    children: t.hole_in
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 231,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-foreground/70",
                                    children: t.piece_current
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 232,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 230,
                            columnNumber: 13
                        }, this),
                        plan.complementIndex >= 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/50",
                                    children: t.hole_also_in
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 236,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono",
                                    style: {
                                        color: 'oklch(0.75 0.15 260)'
                                    },
                                    children: plan.complementName
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 237,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 235,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/50",
                                    children: t.hole_also_in
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 241,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[8px] font-mono text-muted-foreground/40 italic",
                                    children: t.no_complement
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 242,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 240,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 229,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 248,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[8px] font-mono text-yellow-200/70 leading-relaxed",
                            children: t.analysis_error
                        }, void 0, false, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 249,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 247,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleApply,
                    disabled: busy || !plan,
                    className: "flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50",
                    style: {
                        background: 'oklch(0.55 0.15 260)'
                    },
                    children: busy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-3.5 h-3.5 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/encaixe-panel.tsx",
                                lineNumber: 261,
                                columnNumber: 17
                            }, this),
                            t.generating_enc
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                className: "w-3.5 h-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/layout/encaixe-panel.tsx",
                                lineNumber: 262,
                                columnNumber: 17
                            }, this),
                            t.apply_encaixe
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 254,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3 text-[7px] font-mono text-muted-foreground/40",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-1.5 h-1.5 rounded-sm bg-gray-400"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 267,
                                    columnNumber: 53
                                }, this),
                                t.legend_hole_in
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 267,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-1.5 h-1.5 rounded-sm",
                                    style: {
                                        background: 'oklch(0.65 0.18 260)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                                    lineNumber: 268,
                                    columnNumber: 53
                                }, this),
                                t.legend_pin_loose
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/encaixe-panel.tsx",
                            lineNumber: 268,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/layout/encaixe-panel.tsx",
                    lineNumber: 266,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/layout/encaixe-panel.tsx",
            lineNumber: 140,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/encaixe-panel.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, this);
}
_s(EncaixePanel, "JAHSJU3Zipv4gIeFGyutDlKetoA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$lang$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$draggable$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDraggable"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c = EncaixePanel;
var _c;
__turbopack_context__.k.register(_c, "EncaixePanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/encaixe-panel.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/layout/encaixe-panel.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_04yokjq._.js.map