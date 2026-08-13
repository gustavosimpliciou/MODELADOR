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
import { AcabPanel } from '@/components/layout/acab-panel'
import { ExportPanel } from '@/components/layout/export-panel'
import { ProjectsModal } from '@/components/layout/projects-modal'
import { UpgradeModal } from '@/components/upgrade-modal'
import { EncaixeWelcome } from '@/components/encaixe-welcome'
import { Viewport3D } from '@/components/viewport/viewport-3d'
import { AuthGuard } from '@/components/auth-guard'

export default function NativosCut() {
  const [exportOpen, setExportOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [projectsMode, setProjectsMode] = useState<'save' | 'list'>('list')

  return (
    <AuthGuard>
    <main
      className="flex flex-col h-dvh w-screen overflow-hidden select-none"
      style={{ background: 'oklch(0.08 0 0)' }}
    >
      {/* Barra superior */}
      <TopBar
        onExport={() => setExportOpen(true)}
        onSave={() => { setProjectsMode('save'); setProjectsOpen(true) }}
        onProjects={() => { setProjectsMode('list'); setProjectsOpen(true) }}
      />

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
          {/* Painel de acabamento localizado na região do corte */}
          <AcabPanel />
        </div>

        {/* Painel de informações - direita */}
        <RightPanel />
      </div>

      {/* Barra de status */}
      <StatusBar />

      {/* Modal de exportação */}
      <ExportPanel open={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Modal de projetos salvos (máx 2, retomar de onde parou) */}
      <ProjectsModal open={projectsOpen} initialMode={projectsMode} onClose={() => setProjectsOpen(false)} />

      {/* Modal de upgrade de créditos — mesmo sistema do Modelador 3D */}
      <UpgradeModal />

      {/* Popup de novidades (Encaixe 2.0) — aparece uma vez por usuário */}
      <EncaixeWelcome />
    </main>
    </AuthGuard>
  )
}
