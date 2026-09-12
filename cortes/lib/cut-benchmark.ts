/**
 * Cut Benchmark — suíte de estresse obrigatória do pipeline de corte.
 *
 * Tamanhos: 100k · 250k · 500k · 750k · 1M · 1.2M · 1.5M · 2M · 2.5M · 3M
 * (e 5M quando `includeHuge`).
 *
 * Para cada tamanho executa o corte REAL (classificação + clip, sem tampas
 * pesadas por padrão) atravessando 10% / 50% / 90% do modelo e mede:
 * tempo total, throughput (faces/s), pico de RAM e validade da saída.
 *
 * Uso (console do navegador ou teste):
 *   import { runCutBenchmark } from '@/lib/cut-benchmark'
 *   await runCutBenchmark({ sizes: [100_000, 1_200_000, 3_000_000] })
 */

import { solidPlaneCutFast } from './plane-cut-fast'
import { formatBytes } from './cut-telemetry'

export interface BenchCase {
  faces: number
  /** fração da altura onde o plano corta (0.1 / 0.5 / 0.9) */
  crossing: number
}

export interface BenchRow {
  faces: number
  crossing: number
  ms: number
  facesPerSec: number
  outPos: number
  outNeg: number
  invalid: number
  degenerate: number
  peakTemp: string
  ok: boolean
}

export interface BenchOptions {
  sizes?: number[]
  crossings?: number[]
  includeHuge?: boolean
  topology?: 'grid' | 'organic'
  onLog?: (line: string) => void
}

const DEFAULT_SIZES = [
  100_000, 250_000, 500_000, 750_000,
  1_000_000, 1_200_000, 1_500_000,
  2_000_000, 2_500_000, 3_000_000,
]

/** Gera malha sintética indexada com ~`faces` faces (grade + ruído orgânico). */
export function makeBenchMesh(faces: number, topology: 'grid' | 'organic' = 'grid'): {
  positions: Float32Array
  indices: Uint32Array
} {
  // Grade N×N com 2 tris por célula → faces ≈ 2·N²
  const n = Math.max(2, Math.floor(Math.sqrt(faces / 2)))
  const vertsPerSide = n + 1
  const positions = new Float32Array(vertsPerSide * vertsPerSide * 3)
  let vp = 0
  for (let iy = 0; iy < vertsPerSide; iy++) {
    for (let ix = 0; ix < vertsPerSide; ix++) {
      const x = (ix / n - 0.5) * 200
      const y = (iy / n - 0.5) * 200
      // Relevo: senos cruzados (orgânico) ou plano (grade regular)
      const z = topology === 'organic'
        ? 18 * Math.sin(ix * 0.35) * Math.cos(iy * 0.27) + 6 * Math.sin(ix * 1.7 + iy * 1.3)
        : 0
      positions[vp++] = x
      positions[vp++] = y
      positions[vp++] = z
    }
  }
  const quads = n * n
  const indices = new Uint32Array(quads * 6)
  let ip = 0
  for (let iy = 0; iy < n; iy++) {
    for (let ix = 0; ix < n; ix++) {
      const a = iy * vertsPerSide + ix
      const b = a + 1
      const c = a + vertsPerSide
      const d = c + 1
      indices[ip++] = a; indices[ip++] = c; indices[ip++] = b
      indices[ip++] = b; indices[ip++] = c; indices[ip++] = d
    }
  }
  return { positions, indices }
}

export async function runCutBenchmark(opts: BenchOptions = {}): Promise<BenchRow[]> {
  const sizes = opts.sizes ?? (opts.includeHuge ? [...DEFAULT_SIZES, 5_000_000] : DEFAULT_SIZES)
  const crossings = opts.crossings ?? [0.1, 0.5, 0.9]
  const log = opts.onLog ?? ((l: string) => console.log(`[bench] ${l}`))
  const rows: BenchRow[] = []

  log(`topologia=${opts.topology ?? 'grid'} · casos=${sizes.length * crossings.length}`)
  for (const faces of sizes) {
    const { positions, indices } = makeBenchMesh(faces, opts.topology ?? 'grid')
    const realFaces = Math.floor(indices.length / 3)
    for (const crossing of crossings) {
      // Plano horizontal atravessando `crossing` da altura (y de -100 a +100).
      const y = -100 + 200 * crossing
      const t0 = perf()
      const r = await solidPlaneCutFast({
        positions,
        normals: null,
        indices,
        planeN: [0, 1, 0],
        planeP: [0, y, 0],
      })
      const ms = perf() - t0
      const ok = r.posTris + r.negTris > 0 && isFinite(r.posTris + r.negTris)
      const row: BenchRow = {
        faces: realFaces,
        crossing,
        ms: Math.round(ms * 10) / 10,
        facesPerSec: Math.round(realFaces / Math.max(ms / 1000, 1e-6)),
        outPos: r.posTris,
        outNeg: r.negTris,
        invalid: r.metrics.invalidTris,
        degenerate: r.metrics.degenerateTris,
        peakTemp: formatBytes(r.metrics.peakTempBytes),
        ok,
      }
      rows.push(row)
      log(
        `${realFaces.toLocaleString('pt-BR')} faces @${Math.round(crossing * 100)}% → ` +
        `${row.ms}ms · ${row.facesPerSec.toLocaleString('pt-BR')} faces/s · ` +
        `saída ${row.outPos.toLocaleString('pt-BR')}+${row.outNeg.toLocaleString('pt-BR')} · ok=${ok}`,
      )
      // Libera pressão de memória entre casos grandes
      await new Promise((res) => setTimeout(res, 0))
    }
  }

  const slow = rows.filter((r) => !r.ok)
  log(slow.length === 0 ? 'BENCHMARK OK — todos os casos válidos.' : `FALHAS: ${slow.length} casos inválidos.`)
  return rows
}

export function benchmarkSummary(rows: BenchRow[]): string {
  const head = 'faces      | corte | tempo    | faces/s      | saída (pos+neg)        | pico temp | ok'
  const lines = rows.map((r) =>
    `${String(r.faces).padStart(10)} | ${String(Math.round(r.crossing * 100)).padStart(3)}%  | ` +
    `${String(r.ms).padStart(8)} | ${String(r.facesPerSec).padStart(12)} | ` +
    `${String(r.outPos).padStart(9)}+${String(r.outNeg).padStart(9)} | ${r.peakTemp.padStart(9)} | ${r.ok ? '✓' : '✗'}`,
  )
  return [head, ...lines].join('\n')
}

function perf(): number {
  try { return performance.now() } catch { return Date.now() }
}
