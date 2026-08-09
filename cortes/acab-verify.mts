/**
 * Verificação temporária do motor ACAB (não faz parte do repositório).
 * Executar: node --import tsx acab-verify.mts
 */
import * as THREE from 'three'
import { mergeVertices } from 'three-stdlib'
import {
  ACAB_LIMITS,
  clampAcabSettings,
  settingsFromPreset,
  identifyCutRegion,
  expandInfluenceMask,
  runAcabamento,
  validateGeometry,
  estimateVolume,
} from './lib/acabamento'

let pass = 0
let fail = 0
const check = (name: string, cond: boolean, extra = '') => {
  if (cond) {
    pass++
    console.log(`  OK   ${name}${extra ? ' :: ' + extra : ''}`)
  } else {
    fail++
    console.log(`  FALHA ${name}${extra ? ' :: ' + extra : ''}`)
  }
}

// ── Peça sintética: cilindro soldado = casca curva + 2 tampas planas ─────────
// Simula o resultado de um corte (a tampa plana é a "região de corte").
function buildCutPart() {
  const raw = new THREE.CylinderGeometry(5, 5, 20, 48, 1, false)
  raw.deleteAttribute('normal')
  raw.deleteAttribute('uv')
  const geo = mergeVertices(raw, 1e-4)
  geo.computeVertexNormals()
  return geo
}

// Faces cuja normal aponta em +Y => tampa superior (região de corte "tagueada")
function topCapFaces(geo: THREE.BufferGeometry): number[] {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.getIndex()!
  const out: number[] = []
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
  for (let f = 0; f < idx.count / 3; f++) {
    a.fromBufferAttribute(pos, idx.getX(f * 3))
    b.fromBufferAttribute(pos, idx.getX(f * 3 + 1))
    c.fromBufferAttribute(pos, idx.getX(f * 3 + 2))
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize()
    if (n.y > 0.97) out.push(f)
  }
  return out
}

console.log('\n=== ACAB — verificação do motor ===\n')

// ── 1. Limites de segurança ─────────────────────────────────────────────────
console.log('[1] Limites de segurança (clampAcabSettings)')
{
  const abusivo = clampAcabSettings({
    intensity: 5, radiusMm: 99, iterations: 50,
    preserveVolume: true, preserveDetails: true, preset: 'custom',
  })
  check('intensity limitada a 0.70', abusivo.intensity === ACAB_LIMITS.intensityMax, String(abusivo.intensity))
  check('radiusMm limitado a 1.50', abusivo.radiusMm === ACAB_LIMITS.radiusMmMax, String(abusivo.radiusMm))
  check('iterations limitado a 4', abusivo.iterations === ACAB_LIMITS.iterationsMax, String(abusivo.iterations))

  const negativo = clampAcabSettings({
    intensity: -3, radiusMm: -1, iterations: -9,
    preserveVolume: false, preserveDetails: false, preset: 'custom',
  })
  check('intensity nunca negativa', negativo.intensity === 0, String(negativo.intensity))
  check('iterations minimo 1', negativo.iterations === 1, String(negativo.iterations))
}

// ── 2. Presets ──────────────────────────────────────────────────────────────
console.log('\n[2] Presets')
for (const id of ['sutil', 'premium', 'suave', 'custom'] as const) {
  const s = settingsFromPreset(id)
  const c = clampAcabSettings(s)
  check(`preset ${id} dentro dos limites`,
    s.preset === id && c.intensity === s.intensity && c.radiusMm === s.radiusMm,
    `int=${s.intensity} raio=${s.radiusMm} it=${s.iterations}`)
}

// ── 3. Detecção da região de corte ──────────────────────────────────────────
console.log('\n[3] identifyCutRegion')
const geo = buildCutPart()
const vCount = (geo.getAttribute('position') as THREE.BufferAttribute).count
console.log(`     malha de teste: ${vCount} vertices, ${geo.getIndex()!.count / 3} faces`)

{
  const auto = identifyCutRegion(geo)
  check('deteccao automatica encontra a tampa', auto.method !== 'fallback-none',
    `metodo=${auto.method} faces=${auto.cutFaceIndices.length} area=${auto.areaEstimate.toFixed(1)}`)

  const tagged = identifyCutRegion(geo, { taggedFaceIndices: topCapFaces(geo) })
  check('modo tagged tem prioridade', tagged.method === 'tagged', `metodo=${tagged.method}`)

  let seeds = 0
  for (let i = 0; i < tagged.vertexWeights.length; i++) if (tagged.vertexWeights[i] > 0.99) seeds++
  check('mascara marca so parte dos vertices', seeds > 0 && seeds < vCount,
    `${seeds}/${vCount} vertices na regiao`)

  // Geometria com atributo position vazio (caso que o guard vertexCount===0 trata)
  const vaziaGeo = new THREE.BufferGeometry()
  vaziaGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3))
  const vazio = identifyCutRegion(vaziaGeo)
  check('geometria sem vertices -> fallback-none', vazio.method === 'fallback-none')

  // Robustez: geometria SEM atributo position
  let semPositionOk = false
  let semPositionErro = ''
  try {
    identifyCutRegion(new THREE.BufferGeometry())
    semPositionOk = true
  } catch (e) {
    semPositionErro = e instanceof Error ? e.message : String(e)
  }
  check('geometria sem atributo position nao quebra', semPositionOk, semPositionErro)
}

// ── 4. Máscara de influência ────────────────────────────────────────────────
console.log('\n[4] expandInfluenceMask')
{
  const region = identifyCutRegion(geo, { taggedFaceIndices: topCapFaces(geo) })
  const mask = expandInfluenceMask(geo, region.vertexWeights, 0.30, 1, true)
  let dentro = 0, fora = 0, foraDoRange = 0
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] >= 1e-4) dentro++; else fora++
    if (mask[i] < 0 || mask[i] > 1) foraDoRange++
  }
  check('pesos sempre entre 0 e 1', foraDoRange === 0)
  check('existem vertices intocados (peso 0)', fora > 0, `${fora} intocados / ${dentro} afetados`)
  check('influencia nao vaza para a peca toda', dentro < vCount * 0.75,
    `${((dentro / vCount) * 100).toFixed(1)}% afetado`)
}

// ── 5. Pipeline completo ────────────────────────────────────────────────────
console.log('\n[5] runAcabamento (pipeline completo)')
{
  const original = geo.clone()
  const originalPos = Float32Array.from(
    (geo.getAttribute('position') as THREE.BufferAttribute).array as Float32Array,
  )
  const tagged = topCapFaces(geo)

  for (const id of ['sutil', 'premium', 'suave'] as const) {
    const r = runAcabamento(geo, settingsFromPreset(id), { taggedFaceIndices: tagged })
    check(`preset ${id}: resultado valido`, r.valid, r.issues.join('; ') || 'sem problemas')
    check(`preset ${id}: volume dentro de ${ACAB_LIMITS.maxVolumeDeltaPct}%`,
      Math.abs(r.volumeDeltaPct) <= ACAB_LIMITS.maxVolumeDeltaPct,
      `delta=${r.volumeDeltaPct.toFixed(3)}%`)

    const rp = (r.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
    let nan = 0
    for (let i = 0; i < rp.length; i++) if (!Number.isFinite(rp[i])) nan++
    check(`preset ${id}: sem NaN/Infinity`, nan === 0)

    let movidos = 0
    for (let i = 0; i < rp.length; i += 3) {
      if (rp[i] !== originalPos[i] || rp[i + 1] !== originalPos[i + 1] || rp[i + 2] !== originalPos[i + 2]) movidos++
    }
    check(`preset ${id}: alterou a regiao de corte`, movidos > 0, `${movidos} vertices movidos`)
  }

  // Invariante crítica: vértice fora da máscara nunca se move
  const s = settingsFromPreset('suave')
  const region = identifyCutRegion(geo, { taggedFaceIndices: tagged })
  const mask = expandInfluenceMask(geo, region.vertexWeights, s.radiusMm, 1, s.preserveDetails)
  const r = runAcabamento(geo, s, { taggedFaceIndices: tagged })
  const rp = (r.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
  let violacoes = 0
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] >= 1e-4) continue
    if (rp[i * 3] !== originalPos[i * 3] ||
        rp[i * 3 + 1] !== originalPos[i * 3 + 1] ||
        rp[i * 3 + 2] !== originalPos[i * 3 + 2]) violacoes++
  }
  check('REGRA DE OURO: vertice fora da mascara nunca se move', violacoes === 0,
    `${violacoes} violacoes`)

  // Original não pode ser mutado
  const nowPos = (geo.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
  let mutado = 0
  for (let i = 0; i < nowPos.length; i++) if (nowPos[i] !== originalPos[i]) mutado++
  check('geometria original permanece intacta', mutado === 0, `${mutado} valores alterados`)

  check('contagem de vertices preservada',
    (r.geometry.getAttribute('position') as THREE.BufferAttribute).count ===
      (original.getAttribute('position') as THREE.BufferAttribute).count)
  check('contagem de faces preservada',
    r.geometry.getIndex()!.count === original.getIndex()!.count)
  check('normais recalculadas', !!r.geometry.getAttribute('normal'))
}

// ── 6. Sem região detectável -> não altera nada ─────────────────────────────
console.log('\n[6] Peca sem regiao de corte (esfera fechada)')
{
  const raw = new THREE.SphereGeometry(5, 32, 24)
  raw.deleteAttribute('normal'); raw.deleteAttribute('uv')
  const esfera = mergeVertices(raw, 1e-4)
  const antes = Float32Array.from((esfera.getAttribute('position') as THREE.BufferAttribute).array as Float32Array)
  const r = runAcabamento(esfera, settingsFromPreset('suave'))
  const dp = (r.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
  let dif = 0
  for (let i = 0; i < dp.length; i++) if (dp[i] !== antes[i]) dif++
  check('nao explode em malha sem tampa', r.valid || r.issues.length > 0,
    `metodo/issues: ${r.issues.join('; ') || 'ok'}`)
  check('volume permanece coerente', Math.abs(r.volumeDeltaPct) <= ACAB_LIMITS.maxVolumeDeltaPct,
    `delta=${r.volumeDeltaPct.toFixed(3)}%`)
  console.log(`     (${dif} componentes alterados)`)
}

// ── 7. Validação geométrica ─────────────────────────────────────────────────
console.log('\n[7] validateGeometry')
{
  const v = validateGeometry(geo)
  check('malha de teste passa na validacao', v.valid, v.issues.join('; ') || 'sem problemas')
  check('volume estimado > 0', estimateVolume(geo) > 0, estimateVolume(geo).toFixed(1))
}

console.log(`\n=== RESULTADO: ${pass} passaram, ${fail} falharam ===\n`)
process.exit(fail === 0 ? 0 : 1)
