/* Smoke test temporário do Deep Cut (será deletado). */
import * as THREE from 'three'
import {
  extractBoundaryLoops, buildDeepInterface, validateDeepCut, sanitizeDeepParams,
  computeSeatingDirection, checkDeepVsProtected,
} from './lib/deep-cut'
import { createCutArtifact } from './lib/protection'
import { countOpenEdges } from './lib/quality-cut'
import { smartSelect } from './lib/smart-cut'
import { analyzeSelection } from './lib/smart-autocut'
import { computeOpenCut } from './lib/smartcut-pipeline'

const fails: string[] = []
const ok = (c: boolean, m: string) => {
  console.log('%s %s', c ? 'PASS' : 'FAIL', m)
  if (!c) fails.push(m)
}

function main() {
  // peça = só a face do topo (mesmo rim compartilhado, como num corte real).
  // Assentamento d=(0,−1,0): para dentro do corpo.
  const soupBody: number[] = []
  const soupLid: number[] = []
  const box = new THREE.BoxGeometry(20, 10, 20)
  const p = box.getAttribute('position') as THREE.BufferAttribute
  const idx = box.index!
  for (let f = 0; f < idx.count / 3; f++) {
    const ys = [p.getY(idx.getX(f * 3)), p.getY(idx.getX(f * 3 + 1)), p.getY(idx.getX(f * 3 + 2))]
    const cy = (ys[0] + ys[1] + ys[2]) / 3
    const dst = cy > 4 ? soupLid : soupBody
    for (let k = 0; k < 3; k++) {
      const vi = idx.getX(f * 3 + k)
      dst.push(p.getX(vi), p.getY(vi), p.getZ(vi))
    }
  }
  const openTop = new THREE.BufferGeometry()
  openTop.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(soupLid), 3))
  const openBot = new THREE.BufferGeometry()
  openBot.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(soupBody), 3))

  const loopsT = extractBoundaryLoops(openTop, 1e4)
  const loopsB = extractBoundaryLoops(openBot, 1e4)
  ok(loopsT.length === 1 && loopsB.length === 1, `1 loop por casca (topo=${loopsT.length}, base=${loopsB.length})`)
  ok(loopsT[0]?.length === 4, `loop quadrado com 4 vértices (tem ${loopsT[0]?.length})`)

  // Corpo original fechado (para medir espessura)
  const orig = new THREE.BoxGeometry(20, 10, 20)

  // Direção de assentamento: para dentro da base (−Y)? Base ocupa y<0...
  // rim em y=0; seating = entrando no corpo = −Y
  const params = sanitizeDeepParams({ depth: 1.5, clearance: 0.1 })
  const d = new THREE.Vector3(0, -1, 0)
  const res = buildDeepInterface(openTop, openBot, orig, {
    seatingDir: d, depth: params.depth, clearance: params.clearance, weldQ: 1e4,
  })
  ok(countOpenEdges(res.deepBody, 1e4) === 0, 'corpo+cavidade fechado')
  ok(countOpenEdges(res.deepSelected, 1e4) === 0, 'peça+plug fechada')
  ok(Math.abs(res.measuredCavity - 1.5) < 0.2, `cavidade exata (${res.measuredCavity.toFixed(3)}mm)`)
  ok(Math.abs(res.measuredPlug - 1.4) < 0.2, `plug exato (${res.measuredPlug.toFixed(3)}mm, esperado 1.40)`)
  const v = validateDeepCut(res.deepSelected, res.deepBody, res.definition)
  ok(v.ok, `validação ok (${v.issues.map((i) => i.message).join('; ') || 'sem issues'})`)

  // Plug cabe na cavidade (bbox do plug dentro da bbox da cavidade + folga)
  res.deepSelected.computeBoundingBox()
  res.deepBody.computeBoundingBox()
  const pb = res.deepSelected.boundingBox!
  const cb = res.deepBody.boundingBox!
  // plug estende do rim (y=5) para −Y até 3.6; cavidade do rim (y=0) até −1.5
  ok(pb.min.y > 3.55 && pb.min.y < 3.65, `plug termina em ${pb.min.y.toFixed(3)} (esperado ≈3.60)`)
  // clearance lateral: paredes afunilam (fundo do plug ±9.9); a tampa visual
  // (y=5) permanece em tamanho cheio — só o fundo carrega a folga.
  const pp = res.deepSelected.getAttribute('position') as THREE.BufferAttribute
  let fx0 = Infinity, fx1 = -Infinity
  for (let i = 0; i < pp.count; i++) {
    if (pp.getY(i) < 3.7) {
      fx0 = Math.min(fx0, pp.getX(i))
      fx1 = Math.max(fx1, pp.getX(i))
    }
  }
  ok(fx0 > -9.95 && fx0 < -9.85 && fx1 > 9.85 && fx1 < 9.95, `plug com folga lateral no fundo (${fx0.toFixed(2)}..${fx1.toFixed(2)})`)
}

async function fullPath() {
  // Superfície curva ruidosa em modo EXATO (rims compartilhados, como o
  // extractSubMesh produz): direção local + interface completa.
  // NOTA: o ruído é aplicado por POSIÇÃO única (vértices duplicados da
  // costura UV recebem o mesmo deslocamento — como malhas reais).
  const sphere = new THREE.SphereGeometry(10, 36, 24)
  const p = sphere.getAttribute('position') as THREE.BufferAttribute
  const keyNoise = (x: number, y: number, z: number): number => {
    const k = `${Math.round(x * 1e3)},${Math.round(y * 1e3)},${Math.round(z * 1e3)}`
    let h = 0
    for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) | 0
    return (h % 1000) / 1000 - 0.5
  }
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i))
    const n = keyNoise(v.x, v.y, v.z)
    v.multiplyScalar(1 + n * 0.04)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  p.needsUpdate = true
  const seed = 400
  // Região compacta (olho): passa completo. (Sharp alto pinçado → caso de
  // erro honesto testado ao final.)
  const raw = smartSelect(sphere, seed, { sharpAngle: 22, mode: 'curvature' })
  const ana = analyzeSelection(sphere, raw)
  ok(ana.hasSeam, 'seam analisada na esfera')
  // Direção de assentamento deve apontar PARA DENTRO (oposta ao outward)
  const seat = computeSeatingDirection({
    geometry: sphere, selectedFaces: raw,
    seamCenter: ana.seamCenter, fitNormal: ana.fitNormal,
    planeU: ana.planeU, planeV: ana.planeV,
    seamHalfMin: Math.min(ana.halfU, ana.halfV),
  })
  const toCenter = ana.seamCenter.clone().negate().normalize()
  ok(seat.dot(toCenter) > 0.5, `direção local para dentro (dot=${seat.dot(toCenter).toFixed(2)})`)
  // Cascas abertas exatas: sopa das faces selecionadas + restante (rims
  // compartilhados exatamente, como no modo Exato do painel).
  const idx = sphere.index!
  const soupSel: number[] = []
  const soupBody: number[] = []
  for (let f = 0; f < idx.count / 3; f++) {
    const dst = raw.has(f) ? soupSel : soupBody
    for (let k = 0; k < 3; k++) {
      const vi = idx.getX(f * 3 + k)
      dst.push(p.getX(vi), p.getY(vi), p.getZ(vi))
    }
  }
  const openSel = new THREE.BufferGeometry()
  openSel.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(soupSel), 3))
  const openBody = new THREE.BufferGeometry()
  openBody.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(soupBody), 3))
  const res = buildDeepInterface(openSel, openBody, sphere, {
    seatingDir: seat, depth: 1.5, clearance: 0.1, weldQ: 1e4,
  })
  ok(countOpenEdges(res.deepBody, 1e4) === 0, 'corpo curvo fechado')
  ok(countOpenEdges(res.deepSelected, 1e4) === 0, 'peça curva fechada')
  ok(Math.abs(res.measuredCavity - 1.5) < 0.25, `cavidade curva exata (${res.measuredCavity.toFixed(3)}mm)`)
  const v = validateDeepCut(res.deepSelected, res.deepBody, res.definition)
  ok(v.ok, `validação curva ok (${v.issues.map((i) => i.message).join('; ') || 'sem issues'})`)
  // Proteção: artefato longe da cavidade não conflita; em cima conflita
  const farFaces = new Set<number>()
  {
    const idx = sphere.index!
    const pp = sphere.getAttribute('position') as THREE.BufferAttribute
    for (let f = 0; f < idx.count / 3; f++) {
      const cy = (pp.getY(idx.getX(f * 3)) + pp.getY(idx.getX(f * 3 + 1)) + pp.getY(idx.getX(f * 3 + 2))) / 3
      if (cy < -8) farFaces.add(f)
    }
  }
  const art = createCutArtifact({
    geometry: sphere, selectedFaces: farFaces, partId: 'body',
    newPartIds: ['body'], label: 'Corte antigo', modelMaxDim: 20,
  })
  const noHit = checkDeepVsProtected(sphere, res.definition.loopsBody, seat, 1.5, [art])
  ok(noHit.length === 0, 'proteção distante não conflita')
  const art2 = createCutArtifact({
    geometry: sphere, selectedFaces: raw, partId: 'body',
    newPartIds: ['body'], label: 'Corte vizinho', modelMaxDim: 20,
  })
  const hit = checkDeepVsProtected(sphere, res.definition.loopsBody, seat, 1.5, [art2])
  ok(hit.length > 0, 'proteção na coluna da cavidade conflita (READ-ONLY)')
  // Espessura insuficiente bloqueia (placa fina 1mm, pedido 2mm)
  let blocked = ''
  {
    const thin = new THREE.BoxGeometry(20, 1, 20)
    const tp = thin.getAttribute('position') as THREE.BufferAttribute
    const tidx = thin.index!
    const lid: number[] = []
    const rest: number[] = []
    for (let f = 0; f < tidx.count / 3; f++) {
      const cy = (tp.getY(tidx.getX(f * 3)) + tp.getY(tidx.getX(f * 3 + 1)) + tp.getY(tidx.getX(f * 3 + 2))) / 3
      const dst = cy > 0.4 ? lid : rest
      for (let k = 0; k < 3; k++) {
        const vi = tidx.getX(f * 3 + k)
        dst.push(tp.getX(vi), tp.getY(vi), tp.getZ(vi))
      }
    }
    const openLid = new THREE.BufferGeometry()
    openLid.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(lid), 3))
    const openRest = new THREE.BufferGeometry()
    openRest.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(rest), 3))
    try {
      buildDeepInterface(openLid, openRest, thin, {
        seatingDir: new THREE.Vector3(0, -1, 0), depth: 2, clearance: 0.1, weldQ: 1e4,
      })
    } catch (e) {
      blocked = e instanceof Error ? e.message : String(e)
    }
  }
  ok(blocked.length > 0, `profundidade impossível bloqueada ("${blocked.slice(0, 60)}...")`)
  // Seleção pinçada/patológica (sharp alto): erro honesto, nunca par quebrado
  {
    const rawBig = smartSelect(sphere, seed, { sharpAngle: 60, mode: 'curvature' })
    const idx2 = sphere.index!
    const pp2 = sphere.getAttribute('position') as THREE.BufferAttribute
    const sSel: number[] = []
    const sBody: number[] = []
    for (let f = 0; f < idx2.count / 3; f++) {
      const dst = rawBig.has(f) ? sSel : sBody
      for (let k = 0; k < 3; k++) {
        const vi = idx2.getX(f * 3 + k)
        dst.push(pp2.getX(vi), pp2.getY(vi), pp2.getZ(vi))
      }
    }
    const oS = new THREE.BufferGeometry()
    oS.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(sSel), 3))
    const oB = new THREE.BufferGeometry()
    oB.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(sBody), 3))
    let err = ''
    try {
      buildDeepInterface(oS, oB, sphere, {
        seatingDir: seat, depth: 1.5, clearance: 0.1, weldQ: 1e4,
      })
    } catch (e) {
      err = e instanceof Error ? e.message : String(e)
    }
    console.log('pinçada (%d faces): %s', rawBig.size, err ? `erro honesto ("${err.slice(0, 55)}...")` : 'passou (região casou)')
  }
}

main()
fullPath().then(() => {
  if (fails.length) { console.error('FAILURES:', fails); process.exit(1) }
  console.log('DEEP CHECK: PASS')
})
