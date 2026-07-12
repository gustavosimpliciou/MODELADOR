import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { projectsApi } from '../api/projects'

function fmt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ProjectsModal() {
  const show               = useStore((s) => s.showProjectsModal)
  const setShow            = useStore((s) => s.setShowProjectsModal)
  const token              = useStore((s) => s.token)
  const setCurrentProject  = useStore((s) => s.setCurrentProject)
  const loadProjectSnapshot = useStore((s) => s.loadProjectSnapshot)

  const [projects,  setProjects]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [deletingId,setDeletingId]= useState(null)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!show) return
    setError('')
    setLoading(true)
    projectsApi.list(token)
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [show, token])

  if (!show) return null

  const handleLoad = async (project) => {
    setLoadingId(project.id)
    try {
      const full = await projectsApi.load(token, project.id)
      loadProjectSnapshot(full.data || {})
      setCurrentProject(full.id, full.name)
      setShow(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (project, e) => {
    e.stopPropagation()
    if (!window.confirm(`Excluir "${project.name}"?`)) return
    setDeletingId(project.id)
    try {
      await projectsApi.delete(token, project.id)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.15s ease both',
      }}
      onClick={() => setShow(false)}
    >
      <div
        style={{
          width: 520, maxHeight: '80vh',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 900,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)',
            }}>
              Meus Projetos
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)', marginTop: 2,
            }}>
              {projects.length} projeto{projects.length !== 1 ? 's' : ''} salvos
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-dim)', fontSize: 18, lineHeight: 1, padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              Carregando...
            </div>
          )}

          {error && !loading && (
            <div style={{
              padding: '10px 14px', marginBottom: 12,
              background: 'rgba(214,48,49,0.12)',
              border: '1px solid rgba(214,48,49,0.4)',
              borderRadius: 6, color: '#ff8888',
              fontFamily: 'var(--font-body)', fontSize: 12,
            }}>
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              color: 'var(--text-dim)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
              <div style={{
                fontFamily: 'var(--font-condensed)', fontSize: 13, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Nenhum projeto salvo
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11 }}>
                Use Arquivo → Salvar Projeto para salvar seu trabalho atual.
              </div>
            </div>
          )}

          {!loading && projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleLoad(project)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', marginBottom: 6,
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 6, cursor: 'pointer',
                transition: 'border-color 0.12s, background 0.12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.background  = 'rgba(255,106,0,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.background  = 'var(--card)'
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  color: 'var(--text)', marginBottom: 3,
                }}>
                  {project.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)',
                }}>
                  Salvo em {fmt(project.updated_at)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {loadingId === project.id && (
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid var(--line)', borderTopColor: 'var(--accent)',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                )}
                <button
                  onClick={(e) => handleDelete(project, e)}
                  disabled={deletingId === project.id}
                  title="Excluir projeto"
                  style={{
                    background: 'none', border: '1px solid transparent',
                    borderRadius: 4, cursor: 'pointer',
                    color: 'var(--text-dim)', fontSize: 13, padding: '3px 7px',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#e05050'
                    e.currentTarget.style.color       = '#e05050'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.color       = 'var(--text-dim)'
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
