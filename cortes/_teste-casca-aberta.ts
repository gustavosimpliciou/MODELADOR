import * as THREE from 'three'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'
import { solidPlaneCut, planeFromAxisOffset } from './lib/solid-plane-cut'

function ensureNormals(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!geo.getAttribute('normal')) geo.computeVertexNormals()
  return geo
}
const meshVolume = (g: THREE.BufferGeometry): number => {
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const idx = g.index
  const fc = idx ? idx.count / 3 : pos.count / 3
  let vol = 0
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
  for (let i = 0; i < fc; i++) {
    a.fromBufferAttribute(pos, idx ? idx.getX(i * 3) : i * 3)
    b.fromBufferAttribute(pos, idx ? idx.getX(i * 3 + 1) : i * 3 + 1)
    c.fromBufferAttribute(pos, idx ? idx.getX(i * 3 + 2) : i * 3 + 2)
    vol += a.dot(b.cross(c)) / 6
  }
  return Math.abs(vol)
}
const cnt = (g: any) => (g ? g.attributes.position.count : 0)

// ── Casca ABERTA (modo noCap): esfera com capa, sem tampa no corte ───────────
const sphere = new THREE.SphereGeometry(10, 32, 24)
sphere.computeVertexNormals(); sphere.computeBoundingBox()
const { normal, point } = planeFromAxisOffset(sphere.boundingBox!, 'y', 0.5)
const cut = solidPlaneCut(sphere, normal, point)
const openShell = cut.positive  // peça "extraída" — no app pode ficar SEM tampa
// Simula: remove as faces da tampa para deixar aberto (finge que veio sem cap)
console.log('Casca fechada vol:', meshVolume(cut.positive).toFixed(1), 'verts:', cnt(cut.positive))

// Brush de fêmea
const brushGeo = new THREE.CylinderGeometry(3.2, 3.2, 12, 48, 1, false)
brushGeo.translate(0, 6, 0)
const brush = new Brush(brushGeo)
brush.position.set(0, 0.2, 0)
brush.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0).normalize())
brush.updateMatrixWorld()

const ev = new Evaluator()
ev.attributes = ['position', 'normal']
const ba = new Brush(ensureNormals(cut.positive.clone()))
ba.updateMatrixWorld()
const res = ev.evaluate(ba, brush, SUBTRACTION)
const after = res.geometry
console.log('Após SUBTRAÇÃO na casca FECHADA → verts:', cnt(after), 'vol:', meshVolume(after).toFixed(1))

// Agora a MESMA operação com a peça SEM a tampa (malha aberta)
// Abre a malha removendo todos os triângulos cuja normal é ~+y (a tampa)
function openMesh(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const idx = g.index
  const fc = idx ? idx.count / 3 : pos.count / 3
  const keep: number[] = []
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3()
  for (let f = 0; f < fc; f++) {
    a.fromBufferAttribute(pos, idx ? idx.getX(f * 3) : f * 3)
    b.fromBufferAttribute(pos, idx ? idx.getX(f * 3 + 1) : f * 3 + 1)
    c.fromBufferAttribute(pos, idx ? idx.getX(f * 3 + 2) : f * 3 + 2)
    e1.subVectors(b, a); e2.subVectors(c, a); e1.cross(e2); e1.normalize()
    if (e1.y > 0.7) continue // descarta a tampa superior
    keep.push(f)
  }
  const out = new THREE.BufferGeometry()
  const arr = new Float32Array(keep.length * 9)
  for (let i = 0; i < keep.length; i++) {
    const f = keep[i]
    for (let v = 0; v < 3; v++) {
      const vi = idx ? idx.getX(f * 3 + v) : f * 3 + v
      arr[i * 9 + v * 3] = pos.getX(vi); arr[i * 9 + v * 3 + 1] = pos.getY(vi); arr[i * 9 + v * 3 + 2] = pos.getZ(vi)
    }
  }
  out.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  return out
}
const openG = openMesh(cut.positive)
openG.computeVertexNormals()
console.log('Casca ABERTA verts:', cnt(openG), 'vol(≈0 se aberta):', meshVolume(openG).toFixed(1))

const ev2 = new Evaluator()
ev2.attributes = ['position', 'normal']
const ba2 = new Brush(ensureNormals(openG))
ba2.updateMatrixWorld()
try {
  const res2 = ev2.evaluate(ba2, brush, SUBTRACTION)
  const after2 = res2.geometry
  console.log('Após SUBTRAÇÃO na casca ABERTA → verts:', cnt(after2), 'vol:', meshVolume(after2).toFixed(1))
  const same = cnt(after2) === cnt(openG)
  console.log('RESULTADO IDÊNTICO (furo não criado)?', same)
} catch (e) {
  console.log('ERRO no CSG de malha aberta:', (e as Error).message)
}
