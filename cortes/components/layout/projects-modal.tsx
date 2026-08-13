"use client"

import { useCallback, useEffect, useState } from 'react'
import { Archive, Save, X, FolderOpen, Trash2, RefreshCw, Check } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { trackEvent } from '@/lib/events'
import {
  listProjects,
  saveProject,
  overwriteProject,
  deleteProject,
  restoreProject,
  MAX_SAVED_PROJECTS,
  type ProjectRow,
} from '@/lib/projects'
import { cn } from '@/lib/utils'

const ACCENT = 'oklch(0.70 0.22 42)'

interface ProjectsModalProps {
  open: boolean
  onClose: () => void
  /** Abre direto na aba "Salvar" (botão Salvar) ou na "Projetos" (botão Projetos). */
  initialMode?: 'save' | 'list'
}

export function ProjectsModal({ open, onClose, initialMode = 'list' }: ProjectsModalProps) {
  const parts = useAppStore((s) => s.parts)
  const modelMesh = useAppStore((s) => s.modelMesh)
  const hasScene = parts.length > 0 || Boolean(modelMesh)

  const [tab, setTab] = useState<'save' | 'list'>(initialMode)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err' | 'full'; msg: string } | null>(null)

  useEffect(() => {
    if (open) {
      setTab(initialMode)
      setNotice(null)
      setName('')
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMode])

  const refresh = useCallback(async () => {
    setLoading(true)
    const rows = await listProjects()
    setProjects(rows)
    setLoading(false)
  }, [])

  if (!open) return null

  const handleSaveNew = async () => {
    setBusy(true)
    setNotice(null)
    const res = await saveProject(name)
    setBusy(false)
    if (res.ok) {
      setNotice({ kind: 'ok', msg: 'Projeto salvo! Você pode retomar de onde parou a qualquer momento.' })
      setName('')
      await refresh()
      trackEvent('cut_created', { tool: 'project_saved', name: res.project.name })
    } else if (res.full) {
      setNotice({ kind: 'full', msg: res.msg })
    } else {
      setNotice({ kind: 'err', msg: res.msg })
    }
  }

  const handleOverwrite = async (p: ProjectRow) => {
    if (!window.confirm(`Sobrescrever "${p.name}" com o modelo atual?`)) return
    setBusy(true)
    const res = await overwriteProject(p.id)
    setBusy(false)
    if (res.ok) {
      setNotice({ kind: 'ok', msg: `"${p.name}" foi atualizado.` })
      await refresh()
    } else {
      setNotice({ kind: 'err', msg: res.msg })
    }
  }

  const handleLoad = async (p: ProjectRow) => {
    if (
      hasScene &&
      !window.confirm(`Carregar "${p.name}"? O modelo atual será substituído.`)
    ) return
    setBusy(true)
    setNotice(null)
    try {
      await restoreProject(p.data)
      setNotice({ kind: 'ok', msg: `Projeto "${p.name}" carregado.` })
      trackEvent('cut_created', { tool: 'project_loaded', name: p.name })
      onClose() // a cena foi restaurada — fecha o modal para o usuário continuar
    } catch (e: any) {
      setNotice({ kind: 'err', msg: `Erro ao carregar: ${e?.message ?? 'desconhecido'}` })
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (p: ProjectRow) => {
    if (!window.confirm(`Excluir "${p.name}"? Essa ação não pode ser desfeita.`)) return
    setBusy(true)
    const ok = await deleteProject(p.id)
    setBusy(false)
    if (ok) {
      setNotice({ kind: 'ok', msg: `"${p.name}" foi excluído.` })
      await refresh()
    } else {
      setNotice({ kind: 'err', msg: 'Erro ao excluir o projeto.' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog" aria-label="Meus projetos">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-[26rem] max-h-[85vh] rounded-xl border border-border animate-fade-in overflow-hidden flex flex-col"
        style={{ background: 'oklch(0.10 0 0)', boxShadow: '0 24px 48px oklch(0 0 0 / 80%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4" style={{ color: ACCENT }} />
            <span className="font-mono text-sm font-medium text-foreground uppercase tracking-wider">
              Projetos
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 pt-4">
          <button
            onClick={() => setTab('save')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all',
              tab === 'save' ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'
            )}
            style={tab === 'save' ? { background: ACCENT } : undefined}
          >
            <Save className="w-3 h-3" /> Salvar
          </button>
          <button
            onClick={() => setTab('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all',
              tab === 'list' ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground'
            )}
            style={tab === 'list' ? { background: ACCENT } : undefined}
          >
            <FolderOpen className="w-3 h-3" /> Meus projetos ({projects.length}/{MAX_SAVED_PROJECTS})
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Slot status */}
          {tab === 'save' && !hasScene && (
            <div className="px-3 py-2 rounded-lg border text-[11px] font-mono text-muted-foreground"
              style={{ borderColor: 'oklch(0.5 0 0 / 30%)', background: 'oklch(0.5 0 0 / 8%)' }}>
              Não há modelo na cena para salvar. Abra um arquivo 3D primeiro.
            </div>
          )}

          {(tab === 'save' && hasScene && projects.length === 0) && (
            <div className="px-3 py-2 rounded-lg border text-[11px] font-mono"
              style={{ borderColor: `${ACCENT}4d`, background: `${ACCENT}0f`, color: ACCENT }}>
              Você tem {MAX_SAVED_PROJECTS} slots para salvar seu trabalho e continuar depois.
            </div>
          )}

          {/* Naming */}
          {tab === 'save' && hasScene && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Nome do projeto
              </p>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNew() }}
                  placeholder="Ex.: Porta-garrafas unzinho"
                  maxLength={60}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/30"
                />
                <button
                  onClick={handleSaveNew}
                  disabled={busy || !name.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: ACCENT, color: '#000' }}
                >
                  {busy ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

          {/* Notice */}
          {notice && (
            <div
              className="px-3 py-2 rounded-lg border text-[11px] font-mono"
              style={{
                borderColor: notice.kind === 'err' ? 'oklch(0.65 0.18 28 / 50%)' : `${ACCENT}4d`,
                background:  notice.kind === 'err' ? 'oklch(0.65 0.18 28 / 8%)' : `${ACCENT}0f`,
                color:       notice.kind === 'err' ? 'oklch(0.85 0.15 28)' : ACCENT,
              }}
            >
              {notice.msg}
              <button className="ml-2 underline opacity-60" onClick={() => setNotice(null)}>×</button>
            </div>
          )}

          {/* List */}
          {tab === 'list' && (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {loading && (
                <div className="flex items-center gap-2 px-3 py-3 text-[11px] font-mono text-muted-foreground">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Carregando projetos...
                </div>
              )}
              {!loading && projects.length === 0 && (
                <div
                  className="px-3 py-4 rounded-lg border border-dashed text-center text-[11px] font-mono text-muted-foreground/70"
                  style={{ borderColor: 'oklch(0.5 0 0 / 30%)' }}
                >
                  Nenhum projeto salvo ainda.
                  <br />Use <span style={{ color: ACCENT }}>Salvar</span> para guardar seu trabalho.
                </div>
              )}
              {projects.map((p) => {
                const n = p.data?.parts?.length ?? 0
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/60 hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-medium text-foreground truncate">
                        {p.name}
                        {p.data?.version && <span className="ml-1.5 text-[9px] text-muted-foreground/50">v{n} parte(s)</span>}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground/60">
                        Atualizado {new Date(p.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleLoad(p)}
                        disabled={busy}
                        title="Retomar de onde parou"
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: `${ACCENT}1f`, color: ACCENT }}
                      >
                        <Check className="w-3 h-3" /> Abrir
                      </button>
                      <button
                        onClick={() => handleOverwrite(p)}
                        disabled={busy}
                        title="Sobrescrever com o modelo atual"
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={busy}
                        title="Excluir projeto"
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border border-border text-muted-foreground/60 hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer help */}
        <div className="px-5 py-3 border-t border-border text-[10px] font-mono text-muted-foreground/60">
          Limitado a {MAX_SAVED_PROJECTS} projetos. Para salvar um novo, apague ou sobrescreva um existente.
        </div>
      </div>
    </div>
  )
}