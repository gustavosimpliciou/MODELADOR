"use client"

import { useState } from 'react'
import { Download, X, FileDown, Layers, Package, Zap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useUserStore } from '@/lib/user-store'
import { trackEvent } from '@/lib/events'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

interface ExportPanelProps {
  open: boolean
  onClose: () => void
}

type ExportFormat = 'stl' | 'obj'

const ACCENT = 'oklch(0.70 0.22 42)'
const EXPORT_COST = 40

export function ExportPanel({ open, onClose }: ExportPanelProps) {
  const { parts, setStatus } = useAppStore()
  const tryExport         = useUserStore((s) => s.tryExport)
  const confirmExport     = useUserStore((s) => s.confirmExport)
  const credits           = useUserStore((s) => s.credits)
  const user              = useUserStore((s) => s.user)
  const freeDownloadUsed  = useUserStore((s) => s.freeDownloadUsed)

  const [format, setFormat] = useState<ExportFormat>('stl')
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  if (!open) return null

  const visibleParts = parts.filter((p) => p.mesh)
  const printSize    = computePrintSizeMM(visibleParts.map((p) => p.mesh))
  const isScaled     = printSize !== null && printSize.scale < 0.9999

  // What will this export cost / show to user
  const isAdmin = user?.is_admin
  const isFree  = !freeDownloadUsed  // first download is free
  const hasEnoughCredits = isAdmin || isFree || credits >= EXPORT_COST

  const handleExport = async () => {
    if (visibleParts.length === 0) return

    // ── Credit gate ────────────────────────────────────────────────
    setExporting(true)
    trackEvent('download_attempt', {
      format,
      partCount: visibleParts.length,
      credits: credits,
    })
    const result = await tryExport()

    if (result === 'upgrade_required') {
      setExporting(false)
      trackEvent('download_attempt', {
        format,
        partCount: visibleParts.length,
        blocked: true,
        reason: 'creditos_insuficientes',
      })
      onClose()   // close export panel so upgrade modal is visible
      return
    }

    // ── Proceed with export ────────────────────────────────────────
    if (result === 'free') {
      setNotice('Download gratuito utilizado! Próximos downloads: 40 créditos cada.')
    }

    setStatus('exporting', 'Exportando todas as partes...')

    try {
      if (visibleParts.length === 1) {
        await exportSingleMesh(visibleParts[0].mesh, format, visibleParts[0].name)
      } else {
        await exportAllAsZip(visibleParts.map((p) => ({ mesh: p.mesh, name: p.name })), format)
      }
      setStatus('loaded', `Exportação concluída — ${visibleParts.length} parte(s).`)
      trackEvent('download', {
        format,
        partCount: visibleParts.length,
        mode: result === 'free' ? 'free' : 'paid',
        fileCount: visibleParts.length === 1 ? 1 : visibleParts.length,
        zip: visibleParts.length > 1,
      })
      
      // Confirm export only after successful download
      await confirmExport(result)
      
      if (result !== 'free') onClose()
    } catch (err: any) {
      setStatus('error', `Erro ao exportar: ${err.message}`)
      // Do NOT confirm export — credits are preserved
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog" aria-label="Exportar modelo">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-96 rounded-xl border border-border animate-fade-in overflow-hidden"
        style={{ background: 'oklch(0.10 0 0)', boxShadow: '0 24px 48px oklch(0 0 0 / 80%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4" style={{ color: ACCENT }} />
            <span className="font-mono text-sm font-medium text-foreground uppercase tracking-wider">
              Exportar
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Credits info */}
          {!isAdmin && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{
                borderColor: hasEnoughCredits ? `${ACCENT}4d` : 'oklch(0.65 0.18 28 / 40%)',
                background:  hasEnoughCredits ? `${ACCENT}0f` : 'oklch(0.65 0.18 28 / 8%)',
              }}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: hasEnoughCredits ? ACCENT : 'oklch(0.65 0.18 28)' }} />
              <div className="flex-1 min-w-0">
                {isFree ? (
                  <p className="text-[11px] font-mono" style={{ color: ACCENT }}>
                    ✦ 1º download gratuito disponível
                  </p>
                ) : hasEnoughCredits ? (
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Saldo: <span style={{ color: ACCENT }} className="font-semibold">{credits.toLocaleString('pt-BR')} créditos</span>
                    <span className="text-muted-foreground/50"> · custo: {EXPORT_COST}</span>
                  </p>
                ) : (
                  <p className="text-[11px] font-mono" style={{ color: 'oklch(0.65 0.18 28)' }}>
                    Créditos insuficientes ({credits}/{EXPORT_COST}) — escolha um plano
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Free download notice */}
          {notice && (
            <div
              className="px-3 py-2 rounded-lg border text-[11px] font-mono"
              style={{ borderColor: `${ACCENT}4d`, background: `${ACCENT}0f`, color: ACCENT }}
            >
              {notice}
              <button className="ml-2 underline opacity-60" onClick={() => setNotice(null)}>×</button>
            </div>
          )}

          {/* Format selector */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Formato
            </p>
            <div className="flex gap-2">
              {(['stl', 'obj'] as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider transition-all',
                    format === f
                      ? 'text-background border-transparent'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                  )}
                  style={format === f ? { background: ACCENT } : undefined}
                >
                  .{f}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div
            className="flex items-start gap-3 px-3 py-3 rounded-lg border border-border/50"
            style={{ background: `${ACCENT}0f` }}
          >
            {visibleParts.length > 1
              ? <Package className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
              : <Layers   className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
            }
            <div>
              <p className="text-xs font-mono font-medium text-foreground">
                {visibleParts.length > 1 ? 'Exportar como Projeto.zip' : `Exportar ${visibleParts[0]?.name ?? 'parte'}`}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                {visibleParts.length > 1
                  ? `${visibleParts.length} partes · cada uma em um arquivo .${format} separado dentro do ZIP`
                  : `1 parte · arquivo .${format}`}
              </p>
              {visibleParts.length > 1 && (
                <ul className="mt-2 flex flex-col gap-0.5">
                  {visibleParts.slice(0, 6).map((p) => (
                    <li key={p.id} className="text-[10px] font-mono text-muted-foreground/60 truncate">
                      └ {sanitizeFilename(p.name)}.{format}
                    </li>
                  ))}
                  {visibleParts.length > 6 && (
                    <li className="text-[10px] font-mono text-muted-foreground/40">
                      └ …e mais {visibleParts.length - 6} parte(s)
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Print size */}
          {printSize && (
            <div
              className="px-3 py-3 rounded-lg border text-[11px] font-mono"
              style={{
                borderColor: isScaled ? `${ACCENT}66` : 'oklch(0.5 0 0 / 30%)',
                background:  isScaled ? `${ACCENT}14` : 'oklch(0.5 0 0 / 8%)',
              }}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Tamanho de impressão (mm)
              </p>
              <p className="text-foreground font-medium">
                {printSize.x} × {printSize.y} × {printSize.z} mm
              </p>
              {isScaled ? (
                <p className="text-muted-foreground/70 mt-1">
                  ↓ Reduzido para caber em 20 cm · escala {(printSize.scale * 100).toFixed(1)}% · encaixes preservados
                </p>
              ) : (
                <p className="text-muted-foreground/70 mt-1">✓ Dentro do limite de 20 cm · sem redução</p>
              )}
            </div>
          )}

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting || visibleParts.length === 0}
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-mono font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: hasEnoughCredits ? ACCENT : 'oklch(0.65 0.18 28)',
              color: '#000',
            }}
          >
            {exporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Exportando...
              </>
            ) : !hasEnoughCredits ? (
              <>
                <Zap className="w-4 h-4" />
                Recarregar créditos
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {visibleParts.length > 1 ? 'Exportar ZIP' : 'Exportar'}
                {!isFree && !isAdmin && (
                  <span className="text-[10px] opacity-60 ml-1">−{EXPORT_COST} créditos</span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Export helpers ────────────────────────────────────────────────────────────

const MAX_PRINT_MM = 200

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-À-ÿ ]/g, '_').trim() || 'Parte'
}

function computeUniformScaleFactor(meshes: THREE.Mesh[]): number {
  let maxDim = 0
  for (const mesh of meshes) {
    const box  = new THREE.Box3().setFromObject(mesh)
    const size = new THREE.Vector3()
    box.getSize(size)
    maxDim = Math.max(maxDim, size.x, size.y, size.z)
  }
  if (maxDim <= 0) return 1
  return maxDim > MAX_PRINT_MM ? MAX_PRINT_MM / maxDim : 1
}

function buildExportMesh(mesh: THREE.Mesh, scaleFactor: number): THREE.Mesh {
  mesh.updateWorldMatrix(true, false)
  const geo = mesh.geometry.clone()
  const exportMatrix = new THREE.Matrix4()
    .makeScale(scaleFactor, scaleFactor, scaleFactor)
    .multiply(mesh.matrixWorld)
  geo.applyMatrix4(exportMatrix)
  const exportMesh = new THREE.Mesh(geo, mesh.material)
  exportMesh.position.set(0, 0, 0)
  exportMesh.rotation.set(0, 0, 0)
  exportMesh.scale.set(1, 1, 1)
  return exportMesh
}

async function meshToBlob(exportMesh: THREE.Mesh, format: ExportFormat): Promise<Blob> {
  if (format === 'stl') {
    const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter.js')
    const result = new STLExporter().parse(exportMesh, { binary: true })
    return new Blob([result], { type: 'application/octet-stream' })
  } else {
    const { OBJExporter } = await import('three/examples/jsm/exporters/OBJExporter.js')
    const result = new OBJExporter().parse(exportMesh)
    return new Blob([result], { type: 'text/plain' })
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function exportSingleMesh(mesh: THREE.Mesh, format: ExportFormat, name: string) {
  const scaleFactor  = computeUniformScaleFactor([mesh])
  const exportMesh   = buildExportMesh(mesh, scaleFactor)
  const blob         = await meshToBlob(exportMesh, format)
  exportMesh.geometry.dispose()
  downloadBlob(blob, `${sanitizeFilename(name)}.${format}`)
}

async function exportAllAsZip(parts: { mesh: THREE.Mesh; name: string }[], format: ExportFormat) {
  const JSZip       = (await import('jszip')).default
  const zip         = new JSZip()
  const scaleFactor = computeUniformScaleFactor(parts.map((p) => p.mesh))
  const usedNames   = new Map<string, number>()

  for (const { mesh, name } of parts) {
    const base     = sanitizeFilename(name)
    const count    = usedNames.get(base) ?? 0
    usedNames.set(base, count + 1)
    const filename = count === 0 ? `${base}.${format}` : `${base} (${count + 1}).${format}`
    const exportMesh = buildExportMesh(mesh, scaleFactor)
    const blob       = await meshToBlob(exportMesh, format)
    exportMesh.geometry.dispose()
    zip.file(filename, blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  downloadBlob(zipBlob, 'Projeto.zip')
}

function computePrintSizeMM(meshes: THREE.Mesh[]): { x: number; y: number; z: number; scale: number } | null {
  if (meshes.length === 0) return null
  const scale    = computeUniformScaleFactor(meshes)
  const combined = new THREE.Box3()
  for (const mesh of meshes) combined.union(new THREE.Box3().setFromObject(mesh))
  const size = new THREE.Vector3()
  combined.getSize(size)
  return {
    x: Math.round(size.x * scale),
    y: Math.round(size.y * scale),
    z: Math.round(size.z * scale),
    scale,
  }
}
