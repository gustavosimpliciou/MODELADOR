/**
 * Cut Telemetry — métricas internas + perfilador do pipeline de corte.
 *
 * Responde "onde a ferramenta está gastando tempo?" sem depender de
 * ferramentas externas. Funciona na thread principal e dentro de Workers.
 *
 * Etapas medidas:
 *  importação | classificação | interseção | reconstrução |
 *  fechamento (capping) | limpeza | normais | upload GPU | total
 */

export type CutStage =
  | 'import'
  | 'classify'
  | 'intersect'
  | 'reconstruct'
  | 'cap'
  | 'cleanup'
  | 'normals'
  | 'gpu_upload'
  | 'total'

export interface CutMetrics {
  inputFaces: number
  inputVerts: number
  outputPosFaces: number
  outputNegFaces: number
  outputVerts: number
  /** ms por etapa */
  stageMs: Record<CutStage, number>
  /** pico estimado de RAM temporária (bytes) */
  peakTempBytes: number
  invalidTris: number
  degenerateTris: number
  cancelled: boolean
}

export function emptyMetrics(): CutMetrics {
  return {
    inputFaces: 0,
    inputVerts: 0,
    outputPosFaces: 0,
    outputNegFaces: 0,
    outputVerts: 0,
    stageMs: {
      import: 0, classify: 0, intersect: 0, reconstruct: 0,
      cap: 0, cleanup: 0, normals: 0, gpu_upload: 0, total: 0,
    },
    peakTempBytes: 0,
    invalidTris: 0,
    degenerateTris: 0,
    cancelled: false,
  }
}

/** Cronômetro leve por etapa (performance.now disponível no worker). */
export class CutProfiler {
  private t0 = 0
  private marks = new Map<CutStage, number>()
  readonly metrics: CutMetrics = emptyMetrics()

  begin(): void {
    this.t0 = now()
    this.marks.clear()
  }

  start(_stage: CutStage): void {
    this.marks.set(_stage, now())
  }

  end(stage: CutStage): void {
    const s = this.marks.get(stage)
    if (s !== undefined) this.metrics.stageMs[stage] += now() - s
  }

  finish(): CutMetrics {
    this.metrics.stageMs.total = now() - this.t0
    return this.metrics
  }
}

function now(): number {
  try {
    return performance.now()
  } catch {
    return Date.now()
  }
}

/** Pico de heap JS quando o navegador expõe (Chrome). Retorna 0 quando indisponível. */
export function heapUsedBytes(): number {
  try {
    const p = performance as unknown as { memory?: { usedJSHeapSize: number } }
    return p.memory?.usedJSHeapSize ?? 0
  } catch {
    return 0
  }
}

export function formatBytes(b: number): string {
  if (!isFinite(b) || b <= 0) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/** Linha de perfil estilo "Importação 4% | BVH 11% | ..." para diagnóstico. */
export function profileLine(m: CutMetrics): string {
  const t = m.stageMs.total || 1
  const pct = (v: number) => `${((v / t) * 100).toFixed(1)}%`
  return (
    `classificação ${pct(m.stageMs.classify)} · ` +
    `interseção ${pct(m.stageMs.intersect)} · ` +
    `reconstrução ${pct(m.stageMs.reconstruct)} · ` +
    `tampa ${pct(m.stageMs.cap)} · ` +
    `limpeza ${pct(m.stageMs.cleanup)} · ` +
    `normais ${pct(m.stageMs.normals)} · ` +
    `upload GPU ${pct(m.stageMs.gpu_upload)}`
  )
}
