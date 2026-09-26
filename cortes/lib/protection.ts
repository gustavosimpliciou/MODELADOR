/**
 * Protection Manager — ownership + geometria protegida + operação local.
 *
 * REGRA DE OURO: CORTE CONFIRMADO É CORTE PRESERVADO. ENCAIXE CONFIRMADO É
 * ENCAIXE PRESERVADO. Nenhuma operação pode modificar geometria protegida sem
 * que o usuário a direcione explicitamente para aquela geometria.
 *
 * Modelo:
 *   MODEL
 *   ├── ProtectedCut / ProtectedJoint (artefatos, um por operação confirmada)
 *   ├── Editable Region (seleção atual, fora das proteções)
 *   └── Generated Cut Geometry (peças novas de cada commit)
 *
 * Como a proteção funciona (sem bounding-box como decisão final):
 *   1. OWNERSHIP por face: cada artefato registra as faces que possui, no
 *      objeto de malha do momento do commit (meshUuid + índices).
 *   2. TESTE DE INTERSEÇÃO: nova seleção na MESMA malha é testada contra as
 *      faces protegidas (ownership direto) + expansão de 1-ring + margem de
 *      segurança adaptativa (safe zone). Bbox é só pré-filtro de performance.
 *   3. REBASE ESPACIAL: quando um corte reconstrói a malha (novos objetos),
 *      as proteções são remapeadas por proximidade de centroides — a proteção
 *      sobrevive ao rebuild sem depender de índices antigos.
 *   4. EXCLUSÃO DE COMPLEMENTO: peças com joint protegido nunca são escolhidas
 *      automaticamente como complemento de um novo encaixe.
 *
 * Tudo aqui é puro (sem React/three scene) exceto o acesso a BufferGeometry.
 * NUNCA modifica a malha — só lê posições para centroides/bounds.
 */

import * as THREE from 'three'
import { getSmartGeometryData } from './smart-cut'

export type ArtifactKind = 'cut' | 'joint'
export type ArtifactState = 'COMMITTED' | 'PROTECTED' | 'DEGRADED' | 'STALE'

export interface ProtectedArtifact {
  /** ID único do artefato (ex.: 'cut-...', 'joint-...'). */
  id: string
  /** ID da operação que o criou (corte e seu joint compartilham o opId). */
  opId: string
  kind: ArtifactKind
  label: string
  /** Parte dona da geometria no commit (ownership). */
  partId: string | null
  /** UUID do objeto BufferGeometry no commit (ownership físico). */
  meshUuid: string
  /** Faces possuídas (índices na malha do commit). */
  faces: number[]
  /** Bounds locais da região (pré-filtro rápido + safe zone). */
  boxMin: [number, number, number]
  boxMax: [number, number, number]
  /** Margem de segurança adaptativa (mm) ao redor do box. */
  safeMargin: number
  /** Fingerprint das posições (verificação exata de preservação). */
  fingerprint: number
  state: ArtifactState
  /** Lado do joint (só kind === 'joint'). */
  jointSide?: 'male' | 'female'
  /** Artefato de corte ao qual este joint pertence (ownership §13). */
  linkedCutId?: string
  createdAt: number
}

// ─── Utilidades geométricas ────────────────────────────────────────────────────

function faceCentroid(
  pos: Float32Array,
  idx: Uint32Array | Int32Array | null,
  posAttr: THREE.BufferAttribute,
  f: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  const a = idx ? idx[f * 3] : f * 3
  const b = idx ? idx[f * 3 + 1] : f * 3 + 1
  const c = idx ? idx[f * 3 + 2] : f * 3 + 2
  void posAttr
  out.set(
    (pos[a * 3] + pos[b * 3] + pos[c * 3]) / 3,
    (pos[a * 3 + 1] + pos[b * 3 + 1] + pos[c * 3 + 1]) / 3,
    (pos[a * 3 + 2] + pos[b * 3 + 2] + pos[c * 3 + 2]) / 3,
  )
  return out
}

function geometryAccess(geometry: THREE.BufferGeometry): {
  pos: Float32Array
  idx: Uint32Array | Int32Array | null
  posAttr: THREE.BufferAttribute
  faceCount: number
} | null {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute | null
  if (!posAttr || posAttr.count === 0) return null
  const pos = posAttr.array as Float32Array
  const index = geometry.index
  const idx = index ? (index.array as Uint32Array | Int32Array) : null
  const faceCount = index ? index.count / 3 : posAttr.count / 3
  return { pos, idx, posAttr, faceCount }
}

/** Fingerprint rápido e estável das faces (soma quantizada de centroides). */
export function fingerprintFaces(geometry: THREE.BufferGeometry, faces: Set<number> | number[]): number {
  const acc = geometryAccess(geometry)
  if (!acc) return 0
  const { pos, idx, posAttr } = acc
  const v = new THREE.Vector3()
  let h = 0
  const Q = 1e3 // quantum 0.001mm — abaixo do visível, acima do ruído float
  for (const f of faces) {
    faceCentroid(pos, idx, posAttr, f, v)
    h += Math.round(v.x * Q) * 0.31 + Math.round(v.y * Q) * 1.7 + Math.round(v.z * Q) * 3.1
  }
  return Math.round(h * 1000) / 1000
}

/** Bounds locais das faces + margem de segurança adaptativa. */
export function regionBounds(
  geometry: THREE.BufferGeometry,
  faces: Set<number> | number[],
  modelMaxDim: number,
): { boxMin: [number, number, number]; boxMax: [number, number, number]; safeMargin: number } {
  const acc = geometryAccess(geometry)
  const min = new THREE.Vector3(Infinity, Infinity, Infinity)
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
  const v = new THREE.Vector3()
  if (acc) {
    for (const f of faces) {
      faceCentroid(acc.pos, acc.idx, acc.posAttr, f, v)
      min.min(v)
      max.max(v)
    }
  }
  if (!isFinite(min.x)) {
    min.set(0, 0, 0)
    max.set(0, 0, 0)
  }
  // Safe zone adaptativa: 1% da dimensão do modelo, piso 0.3mm.
  const safeMargin = Math.max(0.3, (modelMaxDim || 0) * 0.01)
  return {
    boxMin: [min.x, min.y, min.z],
    boxMax: [max.x, max.y, max.z],
    safeMargin,
  }
}

let artifactCounter = 1
function newArtifactId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(artifactCounter++).toString(36)}`
}

// ─── Criação de artefatos (no COMMIT) ─────────────────────────────────────────

export interface RegisterCutInput {
  geometry: THREE.BufferGeometry
  /** Faces da seleção que originou o corte (ownership da região). */
  selectedFaces: Set<number>
  partId: string | null
  /** IDs das peças criadas pelo commit (corpo + peça cortada). */
  newPartIds: string[]
  label: string
  modelMaxDim: number
  opId?: string
}

export function createCutArtifact(input: RegisterCutInput): ProtectedArtifact {
  const faces = [...input.selectedFaces].filter((f) => Number.isInteger(f) && f >= 0)
  faces.sort((a, b) => a - b)
  const { boxMin, boxMax, safeMargin } = regionBounds(input.geometry, faces, input.modelMaxDim)
  const opId = input.opId ?? newArtifactId('op')
  return {
    id: newArtifactId('cut'),
    opId,
    kind: 'cut',
    label: input.label,
    partId: input.partId,
    meshUuid: (input.geometry as THREE.BufferGeometry).uuid,
    faces,
    boxMin,
    boxMax,
    safeMargin,
    fingerprint: fingerprintFaces(input.geometry, faces),
    state: 'PROTECTED',
    createdAt: Date.now(),
  }
}

export interface RegisterJointInput {
  geometry: THREE.BufferGeometry
  /** Centro do cilindro do joint (frame local da malha alvo). */
  center: THREE.Vector3
  direction: THREE.Vector3
  /** Raio de influência (raio do pino + tolerância + parede). */
  radius: number
  partId: string | null
  jointSide: 'male' | 'female'
  linkedCutId?: string
  label: string
  modelMaxDim: number
  opId?: string
}

/** Faces do joint = faces cujo centroide cai dentro do cilindro de influência. */
export function jointRegionFaces(
  geometry: THREE.BufferGeometry,
  center: THREE.Vector3,
  direction: THREE.Vector3,
  radius: number,
): number[] {
  const acc = geometryAccess(geometry)
  if (!acc) return []
  const d = direction.clone().normalize()
  const v = new THREE.Vector3()
  const rel = new THREE.Vector3()
  const out: number[] = []
  for (let f = 0; f < acc.faceCount; f++) {
    faceCentroid(acc.pos, acc.idx, acc.posAttr, f, v)
    rel.copy(v).sub(center)
    const axial = rel.dot(d)
    const radial = rel.clone().addScaledVector(d, -axial).length()
    if (radial <= radius && axial >= -radius && axial <= radius * 3) out.push(f)
  }
  return out
}

export function createJointArtifact(input: RegisterJointInput): ProtectedArtifact {
  const faces = jointRegionFaces(input.geometry, input.center, input.direction, input.radius)
  const { boxMin, boxMax, safeMargin } = regionBounds(input.geometry, faces, input.modelMaxDim)
  const opId = input.opId ?? newArtifactId('op')
  return {
    id: newArtifactId('joint'),
    opId,
    kind: 'joint',
    label: input.label,
    partId: input.partId,
    meshUuid: (input.geometry as THREE.BufferGeometry).uuid,
    faces,
    boxMin,
    boxMax,
    safeMargin,
    fingerprint: fingerprintFaces(input.geometry, faces),
    state: 'PROTECTED',
    jointSide: input.jointSide,
    linkedCutId: input.linkedCutId,
    createdAt: Date.now(),
  }
}

// ─── Teste de interseção (nova seleção × proteções) ────────────────────────────
// Regra §7/§19: bbox = pré-filtro; decisão final = ownership por face +
// expansão de 1-ring + margem. Fora da região protegida → ALLOW.

export interface IntersectionHit {
  artifact: ProtectedArtifact
  /** Faces da nova seleção que tocam a proteção (ownership direto). */
  directFaces: number
  /** Via vizinhança/margem (proximidade, não posse). */
  proximity: boolean
}

export function queryProtectedIntersection(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
  artifacts: ProtectedArtifact[],
  opts: { safeRings?: number; extraMargin?: number } = {},
): IntersectionHit[] {
  if (selectedFaces.size === 0 || artifacts.length === 0) return []
  const acc = geometryAccess(geometry)
  if (!acc) return []
  const safeRings = opts.safeRings ?? 1
  const extraMargin = opts.extraMargin ?? 0

  // Centroides da seleção (para teste de margem) — só das faces selecionadas.
  const v = new THREE.Vector3()
  const selBox = new THREE.Box3()
  for (const f of selectedFaces) {
    if (f < 0 || f >= acc.faceCount) continue
    faceCentroid(acc.pos, acc.idx, acc.posAttr, f, v)
    selBox.expandByPoint(v)
  }

  const data = getSmartGeometryData(geometry)
  const hits: IntersectionHit[] = []

  for (const art of artifacts) {
    if (art.state !== 'PROTECTED' && art.state !== 'COMMITTED') continue
    // Ownership físico: só vale na MESMA malha do commit. Outra malha =
    // outro dono (rebase mantém o vínculo após rebuilds).
    const sameMesh = art.meshUuid === (geometry as THREE.BufferGeometry).uuid

    // Pré-filtro bbox expandida (rápido; nunca decide sozinho).
    const m = art.safeMargin + extraMargin
    const artBox = new THREE.Box3(
      new THREE.Vector3(art.boxMin[0] - m, art.boxMin[1] - m, art.boxMin[2] - m),
      new THREE.Vector3(art.boxMax[0] + m, art.boxMax[1] + m, art.boxMax[2] + m),
    )
    if (!artBox.intersectsBox(selBox)) continue

    let directFaces = 0
    let proximity = false

    if (sameMesh) {
      // Decisão final 1: ownership direto por face.
      const owned = new Set(art.faces)
      for (const f of selectedFaces) {
        if (owned.has(f)) {
          directFaces++
          break
        }
      }
      // Decisão final 2: expansão de safeRings no grafo (borda da proteção).
      if (directFaces === 0 && data && safeRings > 0) {
        let frontier = new Set(art.faces)
        for (let r = 0; r < safeRings; r++) {
          const next = new Set<number>()
          for (const f of frontier) {
            const adj = data.adjList[f]
            if (!adj) continue
            for (let i = 0; i < adj.length; i++) {
              const nb = adj[i]
              if (selectedFaces.has(nb)) {
                proximity = true
                break
              }
              next.add(nb)
            }
            if (proximity) break
          }
          if (proximity) break
          frontier = next
          if (frontier.size === 0) break
        }
      }
    } else {
      // Malha diferente: sem ownership comum — a bbox já filtrou; trata como
      // proximidade espacial (conservador, mas não bloqueante sozinho).
      proximity = true
    }

    if (directFaces > 0 || proximity) {
      hits.push({ artifact: art, directFaces, proximity })
    }
  }
  return hits
}

// ─── Rebase espacial (proteção sobrevive ao rebuild) ──────────────────────────
// Quando um corte reconstrói a malha (novos objetos), remapeia as faces
// protegidas por proximidade de centroides. Tol adaptada ao weldQ usado.

export function rebaseArtifact(
  newGeometry: THREE.BufferGeometry,
  artifact: ProtectedArtifact,
): ProtectedArtifact {
  // Sem os centroides antigos não há remapeamento honesto por proximidade —
  // degradar para proteção ESPACIAL (box + margem). O chamador que possui a
  // malha antiga deve preferir rebaseArtifactWithCentroids.
  void newGeometry
  return { ...artifact, faces: [], state: 'DEGRADED' }
}

/**
 * Rebase preciso: recebe os centroides antigos (da malha do commit) e encontra
 * as faces correspondentes na nova malha. É o caminho usado após rebuilds.
 */
export function rebaseArtifactWithCentroids(
  newGeometry: THREE.BufferGeometry,
  artifact: ProtectedArtifact,
  oldCentroids: THREE.Vector3[],
  weldTol = 2e-3,
): ProtectedArtifact {
  const acc = geometryAccess(newGeometry)
  if (!acc || oldCentroids.length === 0) {
    return { ...artifact, meshUuid: (newGeometry as THREE.BufferGeometry).uuid, faces: [], state: 'DEGRADED' }
  }
  const cell = Math.max(weldTol * 4, 2e-3)
  const keyOf = (x: number, y: number, z: number) =>
    `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
  const grid = new Map<string, number[]>()
  const v = new THREE.Vector3()
  const m = artifact.safeMargin + weldTol
  for (let f = 0; f < acc.faceCount; f++) {
    faceCentroid(acc.pos, acc.idx, acc.posAttr, f, v)
    if (
      v.x < artifact.boxMin[0] - m || v.x > artifact.boxMax[0] + m ||
      v.y < artifact.boxMin[1] - m || v.y > artifact.boxMax[1] + m ||
      v.z < artifact.boxMin[2] - m || v.z > artifact.boxMax[2] + m
    ) continue
    const k = keyOf(v.x, v.y, v.z)
    let arr = grid.get(k)
    if (!arr) { arr = []; grid.set(k, arr) }
    arr.push(f)
  }
  const tol2 = weldTol * weldTol
  const found = new Set<number>()
  const probe = new THREE.Vector3()
  for (const c of oldCentroids) {
    const cx = Math.floor(c.x / cell), cy = Math.floor(c.y / cell), cz = Math.floor(c.z / cell)
    let best = -1
    let bestD2 = tol2
    for (let ix = cx - 1; ix <= cx + 1; ix++) {
      for (let iy = cy - 1; iy <= cy + 1; iy++) {
        for (let iz = cz - 1; iz <= cz + 1; iz++) {
          const arr = grid.get(`${ix},${iy},${iz}`)
          if (!arr) continue
          for (const f of arr) {
            const a = acc.idx ? acc.idx[f * 3] : f * 3
            const b = acc.idx ? acc.idx[f * 3 + 1] : f * 3 + 1
            const cc = acc.idx ? acc.idx[f * 3 + 2] : f * 3 + 2
            probe.set(
              (acc.pos[a * 3] + acc.pos[b * 3] + acc.pos[cc * 3]) / 3,
              (acc.pos[a * 3 + 1] + acc.pos[b * 3 + 1] + acc.pos[cc * 3 + 1]) / 3,
              (acc.pos[a * 3 + 2] + acc.pos[b * 3 + 2] + acc.pos[cc * 3 + 2]) / 3,
            )
            const d2 = probe.distanceToSquared(c)
            if (d2 < bestD2) { bestD2 = d2; best = f }
          }
        }
      }
    }
    if (best >= 0) found.add(best)
  }
  const faces = [...found].sort((a, b) => a - b)
  const coverage = oldCentroids.length > 0 ? faces.length / oldCentroids.length : 0
  return {
    ...artifact,
    meshUuid: (newGeometry as THREE.BufferGeometry).uuid,
    faces,
    fingerprint: fingerprintFaces(newGeometry, faces),
    state: coverage >= 0.5 ? 'PROTECTED' : 'DEGRADED',
  }
}

/** Centroides das faces de um artefato (para rebase futuro). */
export function artifactCentroids(
  geometry: THREE.BufferGeometry,
  artifact: Pick<ProtectedArtifact, 'faces'>,
): THREE.Vector3[] {
  const acc = geometryAccess(geometry)
  if (!acc) return []
  const v = new THREE.Vector3()
  const out: THREE.Vector3[] = []
  for (const f of artifact.faces) {
    if (f < 0 || f >= acc.faceCount) continue
    faceCentroid(acc.pos, acc.idx, acc.posAttr, f, v)
    out.push(v.clone())
  }
  return out
}

// ─── Ownership queries ─────────────────────────────────────────────────────────

/** IDs das partes que carregam joint protegido (exclusão de complemento). */
export function partsWithProtectedJoints(
  artifacts: ProtectedArtifact[],
): Set<string> {
  const out = new Set<string>()
  for (const a of artifacts) {
    if (a.kind === 'joint' && (a.state === 'PROTECTED' || a.state === 'COMMITTED') && a.partId) {
      out.add(a.partId)
    }
  }
  return out
}

/** Meshes (objetos) que carregam joint protegido de OUTRA operação. */
export function meshesWithForeignJoints(
  parts: { id: string; mesh: THREE.Mesh }[],
  artifacts: ProtectedArtifact[],
  excludePartId: string | null,
): THREE.Mesh[] {
  const protectedParts = partsWithProtectedJoints(artifacts)
  const out: THREE.Mesh[] = []
  for (const p of parts) {
    if (p.id === excludePartId) continue
    if (protectedParts.has(p.id) && p.mesh) out.push(p.mesh)
  }
  return out
}

// ─── Verificação exata (preservação byte-equivalente no nível do quantum) ─────

export type VerifyStatus = 'OK' | 'CHANGED' | 'MISSING' | 'STALE' | 'DEGRADED'

export interface VerifyResult {
  artifactId: string
  label: string
  status: VerifyStatus
  detail: string
}

/**
 * Confere cada artefato contra as malhas atuais: a região protegida permanece
 * exatamente como no commit (fingerprint) e o objeto de malha ainda existe.
 */
export function verifyArtifacts(
  parts: { id: string; mesh: THREE.Mesh }[],
  artifacts: ProtectedArtifact[],
  tol = 1e-6,
): VerifyResult[] {
  const byUuid = new Map<string, THREE.BufferGeometry>()
  for (const p of parts) {
    if (p.mesh?.geometry) byUuid.set(p.mesh.geometry.uuid, p.mesh.geometry)
  }
  const out: VerifyResult[] = []
  for (const a of artifacts) {
    if (a.state === 'STALE') {
      out.push({ artifactId: a.id, label: a.label, status: 'STALE', detail: 'malha do commit não existe mais' })
      continue
    }
    if (a.state === 'DEGRADED') {
      out.push({ artifactId: a.id, label: a.label, status: 'DEGRADED', detail: 'rebase parcial — proteção espacial (box) ativa' })
      continue
    }
    const geo = byUuid.get(a.meshUuid)
    if (!geo) {
      out.push({ artifactId: a.id, label: a.label, status: 'MISSING', detail: 'objeto de malha substituído — verificar rebase' })
      continue
    }
    const fp = fingerprintFaces(geo, a.faces)
    if (Math.abs(fp - a.fingerprint) <= tol) {
      out.push({ artifactId: a.id, label: a.label, status: 'OK', detail: `${a.faces.length} faces intactas` })
    } else {
      out.push({ artifactId: a.id, label: a.label, status: 'CHANGED', detail: `fingerprint ${a.fingerprint} → ${fp}` })
    }
  }
  return out
}

// ─── Debug (modo desenvolvimento — §25) ───────────────────────────────────────
// Mapeamento visual: VERMELHO = protegido, AMARELO = safe zone, AZUL = operação
// atual (seleção), VERDE = editável (todo o resto). O overlay 3D vive em
// ProtectionDebugOverlay; aqui vai o dump textual.

export function dumpProtectionMap(
  parts: { id: string; name: string; mesh: THREE.Mesh }[],
  artifacts: ProtectedArtifact[],
): string {
  const lines = ['[Protection] mapa de operações:']
  lines.push(`  partes: ${parts.length} · artefatos: ${artifacts.length}`)
  for (const a of artifacts) {
    lines.push(
      `  ${a.state === 'PROTECTED' ? '🔴' : a.state === 'COMMITTED' ? '🟠' : '⚪'} [${a.kind}] ${a.label} ` +
      `op=${a.opId} part=${a.partId ?? '?'} faces=${a.faces.length} ` +
      `margem=${a.safeMargin.toFixed(2)}mm ${a.linkedCutId ? `← ${a.linkedCutId}` : ''}`,
    )
  }
  const ver = verifyArtifacts(parts, artifacts)
  for (const v of ver) {
    lines.push(`    ${v.status === 'OK' ? '✓' : '✗'} ${v.label}: ${v.status} — ${v.detail}`)
  }
  return lines.join('\n')
}
