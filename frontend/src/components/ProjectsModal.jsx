import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { projectsApi } from '../api/projects'

/* ── helpers ─────────────────────────────────────────────────── */
function fmt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function hexToRgb(hex = '#888') {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

/* ── profile SVG silhouette ──────────────────────────────────── */
function ProfileSilhouette({ id = 'cone', color = '#fff', size = 72 }) {
  const s = size
  const common = { fill: color, fillOpacity: 0.18, stroke: color, strokeOpacity: 0.7, strokeWidth: 1.5, strokeLinejoin: 'round', strokeLinecap: 'round' }
  switch (id) {
    case 'cone':
      return <svg width={s} height={s} viewBox="0 0 20 20"><polygon points="7,3 13,3 17,17 3,17" {...common} /></svg>
    case 'drum':
      return <svg width={s} height={s} viewBox="0 0 20 20"><rect x="3.5" y="3" width="13" height="14" rx="0.5" {...common} /></svg>
    case 'bell':
      return <svg width={s} height={s} viewBox="0 0 20 20"><path d="M 6 3 L 14 3 C 15 7 18 12 17 17 L 3 17 C 2 12 5 7 6 3 Z" {...common} /></svg>
    case 'flare':
      return <svg width={s} height={s} viewBox="0 0 20 20"><path d="M 7 3 L 13 3 L 18 17 L 2 17 Z" {...common} /></svg>
    case 'globe':
      return <svg width={s} height={s} viewBox="0 0 20 20"><ellipse cx="10" cy="10.5" rx="7" ry="7" {...common} /><line x1="7" y1="4" x2="13" y2="4" {...common} /></svg>
    case 'empire':
      return <svg width={s} height={s} viewBox="0 0 20 20"><path d="M 6.5 3 L 13.5 3 Q 17 10 17 17 L 3 17 Q 3 10 6.5 3 Z" {...common} /></svg>
    case 'torchiere':
      return <svg width={s} height={s} viewBox="0 0 20 20"><path d="M 3 3 L 17 3 Q 15 12 12 17 L 8 17 Q 5 12 3 3 Z" {...common} /></svg>
    case 'cylinder':
      return <svg width={s} height={s} viewBox="0 0 20 20"><rect x="4.5" y="3" width="11" height="14" {...common} /><ellipse cx="10" cy="3" rx="5.5" ry="1.4" {...common} /></svg>
    default:
      return <svg width={s} height={s} viewBox="0 0 20 20"><polygon points="7,3 13,3 17,17 3,17" {...common} /></svg>
  }
}

/* ── badge ───────────────────────────────────────────────────── */
function Badge({ label, value, accent }) {
  if (!value) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 3,
      background: accent ? 'rgba(255,106,0,0.15)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${accent ? 'rgba(255,106,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
      fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.04em',
      color: accent ? 'var(--accent)' : 'var(--text-secondary)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ color: 'var(--text-dim)', fontSize: 8.5 }}>{label}</span>
      {value}
    </span>
  )
}

/* ── project card ────────────────────────────────────────────── */
function ProjectCard({ project, onLoad, onDelete, loading, deleting }) {
  const [hover, setHover] = useState(false)
  const d = project.data || {}
  const lamp    = d.lampshade   || {}
  const mesh    = d.activeMesh  || null
  const tex     = d.activeTexture || null
  const mat     = d.material    || {}
  const matColor = mat.color || '#888888'
  const rgb = hexToRgb(matColor)
  const profile = lamp.profile || 'cone'

  return (
    <div
      onClick={() => !loading && !deleting && onLoad(project)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--card)',
        border: `1px solid ${hover ? 'var(--accent)' : 'var(--line)'}`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: loading ? 'wait' : 'pointer',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hover ? `0 0 0 1px rgba(255,106,0,0.2), 0 8px 24px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
      }}
    >
      {/* ── preview strip ── */}
      <div style={{
        height: 110,
        background: `radial-gradient(ellipse at 60% 40%, rgba(${rgb},0.22) 0%, rgba(0,0,0,0) 70%), var(--bg)`,
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* large faded silhouette behind */}
        <div style={{ position: 'absolute', opacity: 0.12, transform: 'scale(2.2)' }}>
          <ProfileSilhouette id={profile} color={matColor} size={72} />
        </div>
        {/* centered silhouette */}
        <ProfileSilhouette id={profile} color={matColor} size={72} />

        {/* material color dot */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 14, height: 14, borderRadius: '50%',
          background: matColor,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: `0 0 8px ${matColor}88`,
        }} title={mat.name || ''} />

        {/* loading spinner */}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 22, height: 22,
              border: '2px solid var(--line)', borderTopColor: 'var(--accent)',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }} />
          </div>
        )}
      </div>

      {/* ── info body ── */}
      <div style={{ padding: '11px 13px 13px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* name */}
        <div style={{
          fontFamily: 'var(--font-condensed)', fontSize: 14, fontWeight: 900,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--text)', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.name}
        </div>

        {/* badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Badge label="PERFIL " value={profile.toUpperCase()} accent />
          {mesh  && <Badge label="MALHA "   value={mesh.name?.toUpperCase()} />}
          {tex   && <Badge label="TEXTURA " value={tex.name?.toUpperCase()} />}
          {mat.name && <Badge label="MAT " value={mat.name.toUpperCase()} />}
        </div>

        {/* dimensions */}
        {lamp.height && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9.5,
            color: 'var(--text-dim)', letterSpacing: '0.04em',
          }}>
            ⌀{lamp.bottomDiameter}mm × {lamp.height}mm · {lamp.fitterType || '—'}
          </div>
        )}

        {/* date + delete */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>
            {fmt(project.updated_at)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project) }}
            disabled={deleting}
            title="Excluir projeto"
            style={{
              background: 'none', border: '1px solid transparent',
              borderRadius: 4, cursor: 'pointer',
              color: 'var(--text-dim)', fontSize: 13, padding: '2px 6px',
              transition: 'all 0.12s', lineHeight: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e05050'; e.currentTarget.style.color = '#e05050' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)' }}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── modal ───────────────────────────────────────────────────── */
export default function ProjectsModal() {
  const show              = useStore((s) => s.showProjectsModal)
  const setShow           = useStore((s) => s.setShowProjectsModal)
  const token             = useStore((s) => s.token)
  const setCurrentProject = useStore((s) => s.setCurrentProject)
  const loadProjectSnapshot = useStore((s) => s.loadProjectSnapshot)

  const [projects,   setProjects]   = useState([])
  const [loading,    setLoading]    = useState(false)
  const [loadingId,  setLoadingId]  = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [error,      setError]      = useState('')
  const [search,     setSearch]     = useState('')

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

  const filtered = projects.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleLoad = async (project) => {
    setLoadingId(project.id)
    try {
      loadProjectSnapshot(project.data || {})
      setCurrentProject(project.id, project.name)
      setShow(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (project) => {
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
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.15s ease both',
      }}
      onClick={() => setShow(false)}
    >
      <div
        style={{
          width: 740, maxWidth: '95vw', maxHeight: '88vh',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── header ── */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 900,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)',
            }}>
              Meus Projetos
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
              {projects.length} projeto{projects.length !== 1 ? 's' : ''} salvo{projects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* search */}
          <input
            placeholder="Buscar projeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'var(--bg)', border: '1px solid var(--line)',
              borderRadius: 5, padding: '5px 10px',
              fontFamily: 'var(--font-body)', fontSize: 12,
              color: 'var(--text)', outline: 'none', width: 180,
            }}
          />

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

        {/* ── body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <div style={{ width: 28, height: 28, border: '2px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
              Carregando projetos...
            </div>
          )}

          {error && !loading && (
            <div style={{
              padding: '10px 14px', marginBottom: 14,
              background: 'rgba(214,48,49,0.12)', border: '1px solid rgba(214,48,49,0.4)',
              borderRadius: 6, color: '#ff8888', fontFamily: 'var(--font-body)', fontSize: 12,
            }}>
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>📂</div>
              <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                {search ? 'Nenhum resultado' : 'Nenhum projeto salvo'}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>
                {search ? 'Tente outro termo de busca.' : 'Use Arquivo → Salvar Projeto para salvar seu trabalho atual.'}
              </div>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 14,
            }}>
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onLoad={handleLoad}
                  onDelete={handleDelete}
                  loading={loadingId === project.id}
                  deleting={deletingId === project.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
