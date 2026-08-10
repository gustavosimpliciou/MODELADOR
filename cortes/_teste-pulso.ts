import * as THREE from 'three'
import { solidPlaneCut, planeFromAxisOffset } from './lib/solid-plane-cut'
import { analyzeEncaixe, applyEncaixe } from './lib/encaixe'

function selectCapFace(g: THREE.BufferGeometry, want: THREE.Vector3): Set<number> {
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const idx = g.index
  const fc = idx ? idx.count / 3 : pos.count / 3
  const sel = new Set<number>()
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3()
  for (let f = 0; f < fc; f++) {
    a.fromBufferAttribute(pos, idx ? idx.getX(f * 3) : f * 3)
    b.fromBufferAttribute(pos, idx ? idx.getX(f * 3 + 1) : f * 3 + 1)
    c.fromBufferAttribute(pos, idx ? idx.getX(f * 3 + 2) : f * 3 + 2)
    e1.subVectors(b, a); e2.subVectors(c, a); e1.cross(e2); e1.normalize()
    if (Math.abs(e1.dot(want) - 1) < 0.05) sel.add(f)
  }
  return sel
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
let pass = 0, fail = 0
const check = (l: string, ok: boolean) => { console.log(ok ? '  ✓' : '  ✗ FALHOU', l); ok ? pass++ : fail++ }

// ── Cenário "pulso": cilindro (pulso+antebraço) cortado em dois ──────────────
// Corta um cilindro (raio 12, altura 40) perpendicular ao eixo → dois discos.
// Simula a mão (um disco) e o antebraço (outro disco), espalhados.
console.log('Cenário pulso/mão — cilindro cortado ao meio:')
const cyl = new THREE.CylinderGeometry(12, 12, 40, 48)
cyl.computeVertexNormals(); cyl.computeBoundingBox()
const cn = new THREE.Vector3(0, 1, 0) // corte perpendicular ao eixo (y)
const cp = new THREE.Vector3(0, 0, 0)
const ccut = solidPlaneCut(cyl, cn, cp)
const m = new THREE.Mesh(ccut.positive)  // "mão" (metade superior)
const f = new THREE.Mesh(ccut.negative)  // "antebraço" (metade inferior)
m.position.y = 8
f.position.y = -8
const vm = meshVolume(ccut.positive), vf = meshVolume(ccut.negative)
console.log('  vol mão:', vm.toFixed(1), '| vol antebraço:', vf.toFixed(1))

// seleciona a tampa plana da mão (normal +y → face inferior em y=0 aponta -y? a tampa do corte fica em y=0)
const selM = selectCapFace(ccut.positive, new THREE.Vector3(0, -1, 0))
console.log('  faces selecionadas (tampa):', selM.size)
const lim = analyzeEncaixe(ccut.positive, selM, [{ id: 'antebraco', name: 'Antebraço', mesh: f }], 'antebraco')
console.log('  complemento:', lim?.complementName, '| center:', lim?.center.toArray().map(n=>+n.toFixed(1)), '| normal:', lim?.normal.toArray().map(n=>+n.toFixed(2)))

// MACHO na mão → FÊMEA auto no antebraço
try {
  const res = applyEncaixe({
    center: lim!.center.clone(), direction: lim!.normal.clone(),
    radius: 3, height: 4, tolerance: 0.2, mode: 'both',
    sourceMesh: m, maleMesh: m, femaleMesh: f,
  })
  const rM = meshVolume(res.maleGeo!), rF = meshVolume(res.femaleGeo!)
  console.log('  macho:', vm.toFixed(1), '→', rM.toFixed(1), `(+${(rM-vm).toFixed(1)})`)
  console.log('  fêmea:', vf.toFixed(1), '→', rF.toFixed(1), `(${(rF-vf).toFixed(1)})`)
  check('macho adicionou material', rM > vm + 1)
  check('fêmea removeu material', rF < vf - 1)
} catch (e) {
  console.log('  ERRO:', (e as Error).message)
  check('applyEncaixe NÃO lançou erro (furo criado)', false)
}

// ── TESTE 2: mão no frame com rotação/translação forte (como modelo real) ────
console.log('\nTeste com posições mais realistas (offset grande):')
const m2 = new THREE.Mesh(ccut.positive)
const f2 = new THREE.Mesh(ccut.negative)
m2.position.y = 20
f2.position.y = -20
const selM2 = selectCapFace(ccut.positive, new THREE.Vector3(0, -1, 0))
const lim2 = analyzeEncaixe(ccut.positive, selM2, [{ id: 'b', name: 'B', mesh: f2 }], 'b')
try {
  const res2 = applyEncaixe({
    center: lim2!.center.clone(), direction: lim2!.normal.clone(),
    radius: 3, height: 4, tolerance: 0.2, mode: 'both',
    sourceMesh: m2, maleMesh: m2, femaleMesh: f2,
  })
  const rM2 = meshVolume(res2.maleGeo!), rF2 = meshVolume(res2.femaleGeo!)
  console.log('  macho:', vm.toFixed(1), '→', rM2.toFixed(1))
  console.log('  fêmea:', vf.toFixed(1), '→', rF2.toFixed(1))
  check('macho ok', rM2 > vm + 1)
  check('fêmea ok', rF2 < vf - 1)
} catch (e) {
  console.log('  ERRO:', (e as Error).message)
  check('applyEncaixe NÃO lançou erro', false)
}

console.log(`\n═══ RESULTADO: ${pass} OK / ${fail} FALHOU ═══`)
process.exit(fail > 0 ? 1 : 0)
