"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  FolderOpen,
  Download,
  Settings,
  Grid3x3,
  Axis3d,
  Wifi,
  Lock,
  LockOpen,
  LogOut,
} from 'lucide-react'
import { invalidate } from '@react-three/fiber'
import { useAppStore } from '@/lib/store'
import { loadModel } from '@/lib/model-loader'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/lang-store'
import { ConfigModal } from './config-modal'

interface TopBarProps {
  onExport?: () => void
}

export function TopBar({ onExport }: TopBarProps) {
  const t = useT()
  const {
    setStatus,
    registerModelAsPart,
    setModelInfo,
    setOriginalGeometry,
    modelMesh,
    showGrid,
    showAxes,
    showWireframe,
    toggleGrid,
    toggleAxes,
    toggleWireframe,
    allowCutPartSelection,
    toggleCutPartSelection,
    status,
  } = useAppStore()

  const [configOpen, setConfigOpen] = useState(false)
  const [quitOpen,   setQuitOpen]   = useState(false)

  // ── Ref estável para o <input type="file"> ───────────────────────────────────
  // O input fica sempre no DOM (offscreen, NÃO display:none) e é clicado via
  // ref.current.click() no onClick do botão. Usamos addEventListener nativo
  // em vez de onChange do React para garantir que o evento seja capturado
  // independente de re-renders ou quirks do sistema de eventos sintéticos.
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Carregamento do arquivo ──────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setStatus('loading', t.loading_file(file.name))
    try {
      const { mesh, info, wasDecimated } = await loadModel(file)
      registerModelAsPart(mesh, info.name)
      setModelInfo(info)
      setOriginalGeometry(mesh.geometry.clone())
      const decimNote = wasDecimated ? t.decimated_note : ''
      setStatus('loaded', t.loaded_file(info.name, decimNote))
      invalidate()
    } catch (err: any) {
      setStatus('error', t.load_error(err?.message ?? 'Erro desconhecido'))
    }
  }, [setStatus, registerModelAsPart, setModelInfo, setOriginalGeometry, t])

  // ── Listener nativo no input — mais confiável que onChange do React ──────────
  // React's onChange às vezes não dispara em inputs de arquivo dentro de labels
  // com overflow:hidden ou após certos re-renders. addEventListener nativo
  // garante que o evento sempre chegue, independente do contexto do browser.
  useEffect(() => {
    const input = fileInputRef.current
    if (!input) return
    const handler = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      target.value = '' // permite selecionar o mesmo arquivo novamente
      if (file) processFile(file)
    }
    input.addEventListener('change', handler)
    return () => input.removeEventListener('change', handler)
  }, [processFile])

  // ── Quit — faz logout e volta para o login da aplicação principal ────────────
  const handleQuit = () => {
    setQuitOpen(false)
    // Resetar estado local
    useAppStore.getState().resetAll()
    useAppStore.setState({
      modelMesh: null, modelInfo: null, originalGeometry: null,
      parts: [], activePartId: null, cutParts: [], activeCutPartId: null,
      status: 'idle',
      statusMessage: t.status_idle,
    })
    // Limpar sessão Supabase do localStorage (Cortes não tem Supabase instalado,
    // mas o token fica no localStorage — limpar faz o app principal mostrar login)
    try {
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith('sb-') || k === 'nativos.token'
      )
      keys.forEach((k) => localStorage.removeItem(k))
    } catch {}
    // Redirecionar para o app principal (que vai detectar sessão nula → login)
    window.location.href = '/'
  }

  return (
    <>
      <header
        className="flex items-center h-11 px-4 border-b border-border shrink-0 z-10"
        style={{ background: 'oklch(0.08 0 0)' }}
      >
        {/* Input oculto associado ao label abaixo via id.
            <label htmlFor> é o único método 100% confiável em iframes —
            não depende de .click() JavaScript nem de permissões especiais. */}
        {/* O input fica dentro do label — o browser propaga o clique do label
            diretamente ao input filho sem nenhum lookup externo.
            É a abordagem mais confiável em qualquer browser/iframe. */}

        {/* ← Voltar ao Studio */}
        <button
          onClick={() => { window.location.href = '/' }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-secondary mr-3"
          title="Voltar ao Nativos Studio"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="hidden md:block">Studio</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-6">
          <LogoMark />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-foreground uppercase font-mono">
              NATIVOS
            </span>
            <span className="text-[10px] font-mono tracking-widest" style={{ color: 'oklch(0.70 0.22 42)' }}>
              CUT
            </span>
          </div>
          <div
            className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border"
            style={{
              color: 'oklch(0.70 0.22 42)',
              borderColor: 'oklch(0.70 0.22 42 / 30%)',
              background: 'oklch(0.70 0.22 42 / 8%)',
            }}
          >
            PRO
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border mr-4" />

        {/* Main actions */}
        <div className="flex items-center gap-1">
          {/*
            Input sempre no DOM, fora da árvore de qualquer botão/label,
            posicionado offscreen (NÃO display:none — isso bloqueia eventos).
            O listener nativo 'change' (no useEffect acima) captura o arquivo.
            O botão abaixo chama .click() via ref — funciona porque o arquivo
            picker JÁ abre no browser do usuário (confirmado pelo screenshot).
          */}
          <input
            ref={fileInputRef}
            id="cortes-file-input"
            type="file"
            accept=".stl,.obj,.ply,.glb,.gltf"
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: '-200px',
              left: '-200px',
              width: '1px',
              height: '1px',
              opacity: 0,
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono',
              'transition-all duration-150 cursor-pointer select-none',
              !modelMesh
                ? 'text-background font-medium hover:opacity-90'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
            style={!modelMesh ? { background: 'oklch(0.70 0.22 42)', color: 'oklch(0.08 0 0)' } : undefined}
            title={`${t.open} (Ctrl+O)`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{t.open}</span>
          </button>

          <TopBarBtn
            icon={<Download className="w-3.5 h-3.5" />}
            label={t.export}
            shortcut="Ctrl+E"
            disabled={!modelMesh}
            onClick={onExport}
          />
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border mx-3" />

        {/* View toggles */}
        <div className="flex items-center gap-1">
          <ViewToggleBtn icon={<Grid3x3 className="w-3.5 h-3.5" />} label={t.grid} active={showGrid} onClick={toggleGrid} />
          <ViewToggleBtn icon={<Axis3d className="w-3.5 h-3.5" />} label={t.axes} active={showAxes} onClick={toggleAxes} />
          <ViewToggleBtn icon={<Wifi className="w-3.5 h-3.5 rotate-90" />} label={t.wireframe} active={showWireframe} onClick={toggleWireframe} />
          <ViewToggleBtn
            icon={allowCutPartSelection ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            label={allowCutPartSelection ? `${t.parts_toggle} ✓` : t.parts_toggle}
            active={allowCutPartSelection}
            onClick={toggleCutPartSelection}
            title={allowCutPartSelection ? 'Seleção de peças: LIBERADA' : 'Seleção de peças: BLOQUEADA'}
          />
        </div>

        {/* Flex spacer */}
        <div className="flex-1" />

        {/* Loading indicator */}
        {status === 'loading' && (
          <div className="flex items-center gap-2 mr-4 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'oklch(0.70 0.22 42)' }} />
            <span className="text-xs font-mono text-muted-foreground">{t.loading_indicator}</span>
          </div>
        )}

        {/* Config + Sair */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setConfigOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={t.settings}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] hidden md:block">{t.config}</span>
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            onClick={() => setQuitOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={t.quit}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] hidden md:block">{t.quit}</span>
          </button>
        </div>
      </header>

      {/* Config modal */}
      <ConfigModal open={configOpen} onClose={() => setConfigOpen(false)} />

      {/* Quit confirmation */}
      {quitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQuitOpen(false)} />
          <div
            className="relative flex flex-col gap-4 p-5 rounded-2xl border w-72 shadow-2xl"
            style={{
              background: 'oklch(0.09 0 0 / 98%)',
              borderColor: 'oklch(0.22 0 0)',
              boxShadow: '0 16px 64px oklch(0 0 0 / 70%)',
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-mono font-semibold text-foreground">{t.quit_title}</span>
              <span className="text-xs font-mono text-muted-foreground">{t.quit_message}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setQuitOpen(false)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                {t.quit_cancel}
              </button>
              <button
                onClick={handleQuit}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-mono text-white bg-destructive hover:opacity-90 transition-opacity font-medium"
              >
                {t.quit_confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="shrink-0" aria-hidden="true">
      <polygon points="11,1 21,6.5 21,15.5 11,21 1,15.5 1,6.5" stroke="oklch(0.70 0.22 42)" strokeWidth="1.5" fill="none" />
      <line x1="11" y1="1" x2="11" y2="21" stroke="oklch(0.70 0.22 42 / 40%)" strokeWidth="1" />
      <line x1="1" y1="11" x2="21" y2="11" stroke="oklch(0.70 0.22 42 / 40%)" strokeWidth="1" />
      <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" fill="oklch(0.70 0.22 42)" opacity="0.8" />
    </svg>
  )
}

interface TopBarBtnProps {
  icon: React.ReactNode
  label: string
  shortcut?: string
  onClick?: () => void
  disabled?: boolean
  highlight?: boolean
}

function TopBarBtn({ icon, label, shortcut, onClick, disabled, highlight }: TopBarBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150',
        disabled
          ? 'text-muted-foreground/30 cursor-not-allowed'
          : highlight
          ? 'text-background font-medium hover:opacity-90'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      )}
      style={!disabled && highlight ? { background: 'oklch(0.70 0.22 42)', color: 'oklch(0.08 0 0)' } : undefined}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

interface ViewToggleBtnProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  title?: string
}

function ViewToggleBtn({ icon, label, active, onClick, title }: ViewToggleBtnProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition-all duration-150',
        active
          ? 'text-foreground bg-secondary'
          : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50'
      )}
      title={title ?? label}
    >
      {icon}
      <span className="hidden lg:block">{label}</span>
    </button>
  )
}
