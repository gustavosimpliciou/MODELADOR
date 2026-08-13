"use client"

import * as THREE from 'three'
import { useAppStore } from './store'
import { useUserStore } from './user-store'
import type { Part } from './parts-manager'
import type { CutPart, ModelInfo } from './store'

/** Máximo de projetos salvos por usuário na ferramenta de cortes. */
export const MAX_SAVED_PROJECTS = 2

interface SavedAttr {
  /** Base64 de Float32Array (count * itemSize) — sem metadado. */
  b64: string
  itemSize: number
  count: number
  /** true quando o atributo deve ser reconstruído como Uint32 (índice). */
  asUint?: boolean
}

interface SavedMesh {
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string | null
  vertexColors: boolean
  castShadow: boolean
  receiveShadow: boolean
  geometry: SavedGeometry
}

interface SavedGeometry {
  position: SavedAttr | null
  normal: SavedAttr | null
  color: SavedAttr | null
  uv: SavedAttr | null
  index: SavedAttr | null
}

export interface SavedProjectData {
  version: 1
  unit: string
  modelInfo: ModelInfo | null
  activePartId: string | null
  parts: SavedMeshPart[]
  cutParts: { id: string; name: string; color: string; isConnector?: boolean }[]
}

interface SavedMeshPart extends SavedMesh {
  id: string
  visible: boolean
  selected: boolean
  locked: boolean
  parentId: string | null
  cutHistory: string[]
}

export interface ProjectRow {
  id: string
  user_id: string
  name: string
  data: SavedProjectData
  created_at: string
  updated_at: string
}

export type SaveOutcome =
  | { ok: true; project: ProjectRow; local?: boolean }
  | { ok: false; msg: string; full?: boolean }

// ─── Base64 helpers (browser) ────────────────────────────────────────────────

function abToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
  }
  return btoa(bin)
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

// ─── Serialização de atributo/geometria ──────────────────────────────────────

function saveAttr(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null): SavedAttr | null {
  if (!attr || attr.count === 0) return null
  const raw = attr.array
  const itemSize = attr.itemSize
  const count = attr.count
  const total = count * itemSize
  let floats: Float32Array
  if (raw instanceof Float32Array) {
    floats = raw.slice(0, total)
  } else {
    floats = new Float32Array(total)
    for (let i = 0; i < total; i++) floats[i] = Number(raw[i])
  }
  const asUint = raw instanceof Uint32Array || raw instanceof Uint16Array || raw instanceof Int32Array
  return { b64: abToBase64(floats.buffer as ArrayBuffer), itemSize, count, asUint }
}

function saveGeometry(geo: THREE.BufferGeometry): SavedGeometry {
  return {
    position: saveAttr(geo.getAttribute('position')),
    normal:   saveAttr(geo.getAttribute('normal')),
    color:    saveAttr(geo.getAttribute('color')),
    uv:       saveAttr(geo.getAttribute('uv')),
    index:    saveAttr(geo.getIndex() as THREE.BufferAttribute | null),
  }
}

function restoreAttr(saved: SavedAttr | null): THREE.BufferAttribute | null {
  if (!saved) return null
  const floats = new Float32Array(base64ToArrayBuffer(saved.b64))
  const data = floats.slice(0, saved.count * saved.itemSize)
  if (saved.asUint) {
    const uints = new Uint32Array(data.length)
    for (let i = 0; i < data.length; i++) uints[i] = Math.round(data[i])
    return new THREE.BufferAttribute(uints, saved.itemSize)
  }
  return new THREE.BufferAttribute(data, saved.itemSize)
}

function restoreGeometry(saved: SavedGeometry): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  const position = restoreAttr(saved.position)
  if (position) geo.setAttribute('position', position)
  const index = restoreAttr(saved.index)
  if (index) geo.setIndex(index)
  const normal = restoreAttr(saved.normal)
  if (normal) geo.setAttribute('normal', normal)
  const color = restoreAttr(saved.color)
  if (color) geo.setAttribute('color', color)
  const uv = restoreAttr(saved.uv)
  if (uv) geo.setAttribute('uv', uv)
  return geo
}

// ─── Serialização de mesh ────────────────────────────────────────────────────

function matColor(mesh: THREE.Mesh): { color: string | null; vertexColors: boolean } {
  const mat = mesh.material
  if (Array.isArray(mat)) {
    const m0 = mat[0]
    if (m0 instanceof THREE.MeshStandardMaterial || m0 instanceof THREE.MeshBasicMaterial) {
      return { color: `#${m0.color.getHexString()}`, vertexColors: Boolean(m0.vertexColors) }
    }
    return { color: null, vertexColors: false }
  }
  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
    return { color: `#${mat.color.getHexString()}`, vertexColors: Boolean(mat.vertexColors) }
  }
  return { color: null, vertexColors: false }
}

function meshToSaved(mesh: THREE.Mesh): SavedMesh {
  const { color, vertexColors } = matColor(mesh)
  return {
    name: mesh.name,
    position: [mesh.position.x, mesh.position.y, mesh.position.z],
    rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
    scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
    color,
    vertexColors,
    castShadow: mesh.castShadow,
    receiveShadow: mesh.receiveShadow,
    geometry: saveGeometry(mesh.geometry as THREE.BufferGeometry),
  }
}

function savedToMesh(saved: SavedMesh): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({
    color: saved.color ? new THREE.Color(saved.color) : new THREE.Color('#9a9a9d'),
    roughness: 0.55,
    metalness: 0.1,
    side: THREE.DoubleSide,
    vertexColors: saved.vertexColors,
  })
  const mesh = new THREE.Mesh(restoreGeometry(saved.geometry), material)
  mesh.name = saved.name ?? ''
  mesh.position.set(...saved.position)
  mesh.rotation.set(...saved.rotation)
  mesh.scale.set(...saved.scale)
  mesh.castShadow = saved.castShadow ?? true
  mesh.receiveShadow = saved.receiveShadow ?? true
  return mesh
}

// ─── Yield para não travar a UI ──────────────────────────────────────────────

function yieldToUI(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => setTimeout(resolve, 0))
    } else {
      setTimeout(resolve, 0)
    }
  })
}

// ─── Serialização do estado atual da store ───────────────────────────────────

export function serializeProject(): SavedProjectData {
  const s = useAppStore.getState()
  const parts = s.parts
  const cutParts = s.cutParts

  const partsSaved: SavedMeshPart[] = parts.map((p) => ({
    ...meshToSaved(p.mesh),
    id: p.id,
    name: p.name,
    visible: p.visible,
    selected: p.selected,
    locked: p.locked,
    parentId: p.parentId,
    cutHistory: p.cutHistory,
  }))

  const cutPartsSaved = cutParts.map((cp) => ({
    id: cp.id,
    name: cp.name,
    color: cp.color,
    isConnector: cp.isConnector,
  }))

  return {
    version: 1,
    unit: s.unit,
    modelInfo: s.modelInfo,
    activePartId: s.activePartId,
    parts: partsSaved,
    cutParts: cutPartsSaved,
  }
}

// ─── Restauração (assíncrona, sem travar a tela) ────────────────────────────

/**
 * Reconstrói a cena a partir dos dados salvos. Processa as geometrias em
 * etapas com yield à UI (não congela o app em modelos grandes) e reporta
 * progresso no overlay de carregamento.
 */
export async function restoreProject(data: SavedProjectData): Promise<void> {
  const store = useAppStore.getState()
  const { setLoadProgress, setStatus } = store

  setLoadProgress(3, 'Restaurando projeto...')
  await yieldToUI()

  const total = Math.max(1, data.parts?.length || 1)
  const restoredParts: Part[] = []
  const meshById = new Map<string, THREE.Mesh>()

  for (let i = 0; i < total; i++) {
    const sp = data.parts[i]
    if (!sp) continue
    const mesh = savedToMesh(sp)
    // Recomputa normais em pedaços — cada parte "respira" a UI.
    try { (mesh.geometry as THREE.BufferGeometry).computeVertexNormals() } catch {}
    try { (mesh.geometry as THREE.BufferGeometry).computeBoundingBox() } catch {}
    try { (mesh.geometry as THREE.BufferGeometry).computeBoundingSphere() } catch {}
    meshById.set(sp.id, mesh)
    restoredParts.push({
      id: sp.id,
      name: sp.name ?? 'Parte',
      mesh,
      visible: sp.visible,
      selected: sp.selected,
      locked: sp.locked,
      parentId: sp.parentId ?? null,
      cutHistory: sp.cutHistory ?? [],
    })
    setLoadProgress(Math.round(((i + 1) / total) * 70), `Restaurando peças ${i + 1}/${total}...`)
    await yieldToUI()
  }

  const cutPartsRestored: CutPart[] = (data.cutParts || [])
    .map((cp) => {
      const mesh = meshById.get(cp.id)
      if (!mesh) return null
      const colorMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cp.color || '#ff6600'),
        roughness: 0.55,
        metalness: 0.12,
        side: THREE.DoubleSide,
      })
      const cm = new THREE.Mesh(mesh.geometry, colorMat)
      cm.position.copy(mesh.position)
      cm.rotation.copy(mesh.rotation)
      cm.scale.copy(mesh.scale)
      return {
        id: cp.id,
        name: cp.name,
        mesh: cm,
        faceIndices: [],
        color: cp.color,
        isConnector: cp.isConnector,
      }
    })
    .filter(Boolean) as CutPart[]

  const activeId = data.activePartId ?? (restoredParts[0]?.id ?? null)
  const activeMesh: THREE.Mesh | null = activeId ? (meshById.get(activeId) ?? null) : null
  const firstMesh: THREE.Mesh | null = restoredParts[0]?.mesh ?? null

  useAppStore.setState({
    parts: restoredParts,
    cutParts: cutPartsRestored,
    activePartId: activeId,
    modelMesh: activeMesh ?? firstMesh,
    modelInfo: data.modelInfo ?? null,
    unit: (data.unit as 'mm' | 'cm' | 'm' | 'in') || 'mm',
    originalGeometry: restoredParts[0]?.mesh.geometry.clone() ?? null,
    selectedFaceIndices: new Set(),
    hoveredFaceIndices: new Set(),
    selectionState: 'idle',
    past: [],
    future: [],
    status: 'loaded',
    statusMessage: `Projeto restaurado — ${restoredParts.length} parte(s)`,
    loadProgress: -1,
  })

  setLoadProgress(-1)
  setStatus('loaded', `Projeto restaurado — ${restoredParts.length} parte(s)`)
}

// ─── Armazenamento local (IndexedDB — 100% no navegador) ─────────────────────
// Projetos NUNCA vão ao banco: ficam no navegador do usuário (IndexedDB),
// que suporta geometrias grandes sem limite de espaço como o localStorage.

const DB_NAME = 'nativos.cutProjects'
const DB_STORE = 'projects'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(DB_STORE)) {
        const store = db.createObjectStore(DB_STORE, { keyPath: 'id' })
        store.createIndex('user_id', 'user_id', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('indexedDB failed'))
    req.onblocked = () => reject(new Error('indexedDB blocked'))
  })
}

function idbTx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    try {
      const db = await openDb()
      const tx = db.transaction(DB_STORE, mode)
      const req = fn(tx.objectStore(DB_STORE))
      req.onsuccess = () => resolve(req.result as T)
      req.onerror = () => reject(req.error ?? new Error('idb error'))
      tx.oncomplete = () => db.close()
      tx.onabort = () => reject(tx.error ?? new Error('idb abort'))
      tx.onerror = () => reject(tx.error ?? new Error('idb error'))
    } catch (e) {
      reject(e)
    }
  })
}

async function idbGetAll(): Promise<ProjectRow[]> {
  return idbTx<ProjectRow[]>('readonly', (store) => store.getAll())
}

function nowIso(): string {
  return new Date().toISOString()
}

function uid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function listProjects(): Promise<ProjectRow[]> {
  const user = useUserStore.getState().user
  if (!user) return []
  try {
    const all = await idbGetAll()
    return all
      .filter((p) => p.user_id === user.id)
      .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
  } catch {
    return []
  }
}

/** Cria um novo salvamento (respeita o limite de MAX_SAVED_PROJECTS). */
export async function saveProject(name: string): Promise<SaveOutcome> {
  const user = useUserStore.getState().user
  if (!user) return { ok: false, msg: 'Faça login para salvar projetos.' }
  if (useAppStore.getState().parts.length === 0 && !useAppStore.getState().modelMesh) {
    return { ok: false, msg: 'Não há modelo na cena para salvar.' }
  }
  try {
    const rows = await idbGetAll()
    const mine = rows.filter((r) => r.user_id === user.id)
    if (mine.length >= MAX_SAVED_PROJECTS) {
      return {
        ok: false,
        full: true,
        msg: `Salvamento cheio! Você tem ${MAX_SAVED_PROJECTS} projetos. Apague um deles para salvar um novo.`,
      }
    }

    const project: ProjectRow = {
      id: uid(),
      user_id: user.id,
      name: name.trim() || 'Projeto sem título',
      data: serializeProject(),
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    await idbTx('readwrite', (store) => store.put(project))
    return { ok: true, project, local: true }
  } catch (e: any) {
    return { ok: false, msg: `Erro ao salvar: ${e?.message ?? 'desconhecido'}` }
  }
}

/** Sobrescreve um projeto existente (não atravessa o limite de slots). */
export async function overwriteProject(id: string, name?: string): Promise<SaveOutcome> {
  const user = useUserStore.getState().user
  if (!user) return { ok: false, msg: 'Faça login para salvar projetos.' }
  try {
    const rows = await idbGetAll()
    const idx  = rows.findIndex((r) => r.id === id && r.user_id === user.id)
    if (idx === -1) return { ok: false, msg: 'Projeto não encontrado.' }
    rows[idx] = {
      ...rows[idx],
      data: serializeProject(),
      ...(name?.trim() ? { name: name.trim() } : {}),
      updated_at: nowIso(),
    }
    await idbTx('readwrite', (store) => store.put(rows[idx]))
    return { ok: true, project: rows[idx], local: true }
  } catch (e: any) {
    return { ok: false, msg: `Erro ao salvar: ${e?.message ?? 'desconhecido'}` }
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  const user = useUserStore.getState().user
  if (!user) return false
  try {
    await idbTx('readwrite', (store) => store.delete(id))
    return true
  } catch {
    return false
  }
}