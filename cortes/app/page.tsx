"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { TopBar } from '@/components/layout/top-bar'
import { LeftPanel } from '@/components/layout/left-panel'
import { RightPanel } from '@/components/layout/right-panel'
import { StatusBar } from '@/components/layout/status-bar'

// ─── Lazy-loaded 3D & heavy components ───────────────────────────────────────
// Splitting these into separate chunks means the browser only downloads
// Three.js / R3F / BVH / CSG code AFTER the UI shell has already painted.
// ssr: false → these components use browser-only APIs (WebGL, canvas).

const Viewport3D = dynamic(
  () => import('@/components/viewport/viewport-3d').then((m) => ({ default: m.Viewport3D })),
  {
    ssr: false,
    // Placeholder so layout doesn't jump while the chunk loads
    loading: () => <div className="absolute inset-0 bg-[#060608]" />,
  },
)

const CutActions = dynamic(
  () => import('@/components/layout/cut-actions').then((m) => ({ default: m.CutActions })),
  { ssr: false },
)

const SmartAutoCutPanel = dynamic(
  () => import('@/components/layout/smart-autocut-panel').then((m) => ({ default: m.SmartAutoCutPanel })),
  { ssr: false },
)

const EncaixePanel = dynamic(
  () => import('@/components/layout/encaixe-panel').then((m) => ({ default: m.EncaixePanel })),
  { ssr: false },
)

const PlaneCutPanel = dynamic(
  () => import('@/components/layout/plane-cut-panel').then((m) => ({ default: m.PlaneCutPanel })),
  { ssr: false },
)

const AutoSplitPanel = dynamic(
  () => import('@/components/layout/auto-split-panel').then((m) => ({ default: m.AutoSplitPanel })),
  { ssr: false },
)

const ExportPanel = dynamic(
  () => import('@/components/layout/export-panel').then((m) => ({ default: m.ExportPanel })),
  { ssr: false },
)

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NativosCut() {
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <main
      className="flex flex-col h-dvh w-screen overflow-hidden select-none"
      style={{ background: 'oklch(0.08 0 0)' }}
    >
      {/* Barra superior */}
      <TopBar onExport={() => setExportOpen(true)} />

      {/* Área de trabalho */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Painel de ferramentas - esquerda */}
        <LeftPanel />

        {/* Viewport 3D — centro */}
        <div className="flex-1 relative overflow-hidden">
          <Viewport3D />
          {/* Ações de corte flutuantes */}
          <CutActions />
          {/* Painel AutoCut inteligente na seleção (SmartCut → AutoCut) */}
          <SmartAutoCutPanel />
          {/* Painel de encaixe quadrado pino/furo (após corte) */}
          <EncaixePanel />
          {/* Painel de corte de sólido por plano */}
          <PlaneCutPanel />
          {/* Painel de divisão automática por geometria */}
          <AutoSplitPanel />
        </div>

        {/* Painel de informações - direita */}
        <RightPanel />
      </div>

      {/* Barra de status */}
      <StatusBar />

      {/* Modal de exportação */}
      <ExportPanel open={exportOpen} onClose={() => setExportOpen(false)} />
    </main>
  )
}
