"use client"

import { useState } from 'react'
import { Download, X, FileDown, Layers, Package } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

interface ExportPanelProps {
  open: boolean
  onClose: () => void
}

type ExportFormat = 'stl' | 'obj'

export function ExportPanel({ open, onClose }: ExportPanelProps) {
  const { parts, setStatus } = useAppStore()
  const [format, setFormat] = useState<ExportFormat>('stl')
  const [exporting, setExporting] = useState(false)

  if (!open) return null

  const visibleParts = parts.filter((p) => p.mesh)

  const handleExport = async () => {
    if (visibleParts.length === 0) return
    setExporting(true)
    setStatus('exporting', 'Exportando todas as partes...')

    try {
      if (visibleParts.length === 1) {
        // Single part — download directly (no ZIP needed)
        await exportSingleMesh(visibleParts[0].mesh, format, visibleParts[0].name)
      } else {
        // Multiple parts — bundle into a ZIP
        await exportAllAsZip(visibleParts.map((p) => ({ mesh: p.mesh, name: p.name })), format)
      }

      setStatus('loaded', `Exportação concluída — ${visibleParts.length} parte(s).`)
      onClose()
    } catch (err: any) {
      setStatus('error', `Erro ao exportar: ${err.message}`)
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
            <FileDown className="w-4 h-4" style={{ color: 'oklch(0.70 0.22 42)' }} />
            <span className="font-mono text-sm font-medium text-foreground uppercase tracking-wider">
              Exportar
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Formato */}
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
                  style={
                    format === f
                      ? { background: 'oklch(0.70 0.22 42)' }
                      : undefined
                  }
                >
                  .{f}
                </button>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div
            className="flex items-start gap-3 px-3 py-3 rounded-lg border border-border/50"
            style={{ background: 'oklch(0.70 0.22 42 / 6%)' }}
          >
            {visibleParts.length > 1
              ? <Package className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'oklch(0.70 0.22 42)' }} />
              : <Layers className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'oklch(0.70 0.22 42)' }} />
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

          {/* Botão exportar */}
          <button
            onClick={handleExport}
            disabled={exporting || visibleParts.length === 0}
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-mono font-medium text-background transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'oklch(0.70 0.22 42)' }}
          >
            {exporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {visibleParts.length > 1 ? 'Exportar ZIP' : 'Exportar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers de exportação ────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-À-ÿ ]/g, '_').trim() || 'Parte'
}

async function meshToBlob(mesh: THREE.Mesh, format: ExportFormat): Promise<Blob> {
  if (format === 'stl') {
    const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter.js')
    const result = new STLExporter().parse(mesh, { binary: true })
    return new Blob([result], { type: 'application/octet-stream' })
  } else {
    const { OBJExporter } = await import('three/examples/jsm/exporters/OBJExporter.js')
    const result = new OBJExporter().parse(mesh)
    return new Blob([result], { type: 'text/plain' })
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function exportSingleMesh(mesh: THREE.Mesh, format: ExportFormat, name: string) {
  const blob = await meshToBlob(mesh, format)
  downloadBlob(blob, `${sanitizeFilename(name)}.${format}`)
}

async function exportAllAsZip(
  parts: { mesh: THREE.Mesh; name: string }[],
  format: ExportFormat,
) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  // Deduplicate filenames (e.g. two parts both named "Parte 1")
  const usedNames = new Map<string, number>()

  for (const { mesh, name } of parts) {
    const base = sanitizeFilename(name)
    const count = usedNames.get(base) ?? 0
    usedNames.set(base, count + 1)
    const filename = count === 0 ? `${base}.${format}` : `${base} (${count + 1}).${format}`

    const blob = await meshToBlob(mesh, format)
    zip.file(filename, blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  downloadBlob(zipBlob, 'Projeto.zip')
}
