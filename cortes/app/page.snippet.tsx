// ─── Trecho para app/page.tsx ───────────────────────────────────────────────
// Adicionar o import e o componente <AcabPanel /> junto aos outros painéis.

"use client"

import { useState } from 'react'
import { TopBar } from '@/components/layout/top-bar'
import { LeftPanel } from '@/components/layout/left-panel'
import { RightPanel } from '@/components/layout/right-panel'
import { StatusBar } from '@/components/layout/status-bar'
import { CutActions } from '@/components/layout/cut-actions'
import { PlaneCutPanel } from '@/components/layout/plane-cut-panel'
import { AutoSplitPanel } from '@/components/layout/auto-split-panel'
import { SmartAutoCutPanel } from '@/components/layout/smart-autocut-panel'
import { EncaixePanel } from '@/components/layout/encaixe-panel'
import { AcabPanel } from '@/components/layout/acab-panel'  // ← NOVO
import { ExportPanel } from '@/components/layout/export-panel'
import { UpgradeModal } from '@/components/upgrade-modal'
import { Viewport3D } from '@/components/viewport/viewport-3d'
import { AuthGuard } from '@/components/auth-guard'

export default function NativosCut() {
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <AuthGuard>
    <main
      className="flex flex-col h-dvh w-screen overflow-hidden select-none"
      style={{ background: 'oklch(0.08 0 0)' }}
    >
      <TopBar onExport={() => setExportOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        <LeftPanel />

        <div className="flex-1 relative overflow-hidden">
          <Viewport3D />
          <CutActions />
          <SmartAutoCutPanel />
          <EncaixePanel />
          <PlaneCutPanel />
          <AutoSplitPanel />
          <AcabPanel />  {/* ← NOVO */}
        </div>

        <RightPanel />
      </div>

      <StatusBar />
      <ExportPanel open={exportOpen} onClose={() => setExportOpen(false)} />
      <UpgradeModal />
    </main>
    </AuthGuard>
  )
}
