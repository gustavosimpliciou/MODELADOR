import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'
import { LANGUAGES } from '../i18n/translations'
import { projectsApi } from '../api/projects'

// ─── Tiny modals ──────────────────────────────────────────────────────

function Overlay({ onClick, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.12s ease both',
      }}
      onClick={onClick}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: '28px 28px 22px',
          width: 340,
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function NewProjectConfirm({ onConfirm, onCancel }) {
  return (
    <Overlay onClick={onCancel}>
      <h3 style={{
        fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 900,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--text)', marginBottom: 12,
      }}>
        Novo Projeto
      </h3>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)',
        lineHeight: 1.55, marginBottom: 24,
      }}>
        Tem certeza que deseja iniciar um novo projeto?<br />
        O trabalho atual não salvo será perdido.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 20px',
            background: 'var(--card)', border: '1px solid var(--line)',
            borderRadius: 4, cursor: 'pointer',
            fontFamily: 'var(--font-condensed)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--text-secondary)', transition: 'all 0.12s',
          }}
        >
          Não
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '8px 20px',
            background: 'var(--accent)', border: 'none',
            borderRadius: 4, cursor: 'pointer',
            fontFamily: 'var(--font-condensed)', fontSize: 12, fontWeight: 900,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#000', transition: 'opacity 0.12s',
          }}
        >
          Sim, resetar
        </button>
      </div>
    </Overlay>
  )
}

function SaveNameDialog({ defaultName, saving, onSave, onCancel }) {
  const [name, setName] = useState(defaultName || 'Projeto sem título')
  return (
    <Overlay onClick={onCancel}>
      <h3 style={{
        fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 900,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--text)', marginBottom: 18,
      }}>
        Salvar Projeto
      </h3>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSave(name.trim())}
        placeholder="Nome do projeto"
        style={{
          width: '100%', padding: '10px 12px',
          background: '#0d0d0d', border: '1px solid var(--line)',
          borderRadius: 5, color: 'var(--text)',
          fontFamily: 'var(--font-body)', fontSize: 13,
          outline: 'none', marginBottom: 20, boxSizing: 'border-box',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
        onBlur={(e)  => { e.target.style.borderColor = 'var(--line)' }}
      />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 20px', background: 'var(--card)',
            border: '1px solid var(--line)', borderRadius: 4, cursor: 'pointer',
            fontFamily: 'var(--font-condensed)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={saving || !name.trim()}
          style={{
            padding: '8px 20px', background: saving ? '#333' : 'var(--accent)',
            border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-condensed)', fontSize: 12, fontWeight: 900,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: saving ? '#666' : '#000',
          }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </Overlay>
  )
}

// ─── Main Navbar ───────────────────────────────────────────────────────

export default function Navbar() {
  const openMenu            = useStore((s) => s.openMenu)
  const setOpenMenu         = useStore((s) => s.setOpenMenu)
  const setViewMode         = useStore((s) => s.setViewMode)
  const setShowGrid         = useStore((s) => s.setShowGrid)
  const showGrid            = useStore((s) => s.showGrid)
  const autoRotate          = useStore((s) => s.autoRotate)
  const setAutoRotate       = useStore((s) => s.setAutoRotate)
  const language            = useStore((s) => s.language)
  const setLanguage         = useStore((s) => s.setLanguage)
  const credits             = useStore((s) => s.credits)
  const freeDownloadUsed    = useStore((s) => s.freeDownloadUsed)
  const setShowUpgradeModal = useStore((s) => s.setShowUpgradeModal)
  const user                = useStore((s) => s.user)
  const token               = useStore((s) => s.token)
  const logout              = useStore((s) => s.logout)
  const resetProject        = useStore((s) => s.resetProject)
  const setShowProjectsModal = useStore((s) => s.setShowProjectsModal)
  const getProjectSnapshot  = useStore((s) => s.getProjectSnapshot)
  const currentProjectId    = useStore((s) => s.currentProjectId)
  const currentProjectName  = useStore((s) => s.currentProjectName)
  const setCurrentProject   = useStore((s) => s.setCurrentProject)
  const t = useT()

  // ── Local UI state ────────────────────────────────────────────────
  const [showConfirmNew,  setShowConfirmNew]  = useState(false)
  const [showSaveDialog,  setShowSaveDialog]  = useState(false)
  const [isSaving,        setIsSaving]        = useState(false)
  const [saveOk,          setSaveOk]          = useState(false)

  const creditsColor = !freeDownloadUsed
    ? 'var(--accent)'
    : credits >= 80 ? 'var(--accent)'
    : credits >= 40 ? '#f0c040'
    : '#e05050'

  // ── File menu items ───────────────────────────────────────────────
  const MENUS = {
    file: {
      label: t('nav.file'),
      items: [
        { id: 'new',      label: 'Novo Projeto' },
        { id: 'projects', label: 'Projetos' },
        { id: 'save',     label: 'Salvar Projeto' },
      ],
    },
    help: {
      label: t('nav.help'),
      items: [
        { id: 'docs',      label: t('nav.help.docs') },
        { id: 'shortcuts', label: t('nav.help.shortcuts') },
        { id: 'about',     label: t('nav.help.about') },
        { id: 'bug',       label: t('nav.help.bug') },
      ],
    },
  }

  // ── Save logic ────────────────────────────────────────────────────
  const doSave = async (name) => {
    setIsSaving(true)
    try {
      const snapshot = getProjectSnapshot()
      const result   = await projectsApi.save(token, currentProjectId || null, name, snapshot)
      setCurrentProject(result.id, result.name)
      setShowSaveDialog(false)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 2000)
    } catch (e) {
      console.error('Save failed:', e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = () => {
    if (!token) return
    if (!currentProjectName) {
      setShowSaveDialog(true)
    } else {
      doSave(currentProjectName)
    }
  }

  // ── Action dispatcher ─────────────────────────────────────────────
  const handleAction = (action) => {
    setOpenMenu(null)
    if (action === 'new')      { setShowConfirmNew(true); return }
    if (action === 'projects') { setShowProjectsModal(true); return }
    if (action === 'save')     { handleSave(); return }
    const viewMap = { solid: 'solid', wireframe: 'wireframe', render: 'render', technical: 'technical' }
    if (viewMap[action]) setViewMode(viewMap[action])
    if (action === 'grid')       setShowGrid(!showGrid)
    if (action === 'autoRotate') setAutoRotate(!autoRotate)
  }

  return (
    <>
      <nav style={{
        height: 38, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        background: 'var(--panel)',
        borderBottom: '1px solid var(--line)',
        padding: '0 10px',
        gap: 2,
        position: 'relative',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
          <img
            src="/logo.png" alt="Nativos Studio Pro"
            loading="eager" decoding="sync" fetchpriority="high"
            style={{
              width: 24, height: 24, objectFit: 'contain',
              filter: 'drop-shadow(0 0 6px rgba(255,106,0,0.6))',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-condensed)', fontSize: 13, fontWeight: 800,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)',
          }}>
            Nativos Studio
          </span>
          <span style={{
            fontFamily: 'var(--font-condensed)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--accent)', marginLeft: -4,
          }}>
            Pro
          </span>
          {/* Current project name */}
          {currentProjectName && (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 11,
              color: 'var(--text-dim)', marginLeft: 4,
            }}>
              — {currentProjectName}
            </span>
          )}
          {/* Saved indicator */}
          {saveOk && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--success)', marginLeft: 2,
              animation: 'fadeIn 0.2s ease both',
            }}>
              ✓ Salvo
            </span>
          )}
          {/* Saving spinner */}
          {isSaving && (
            <div style={{
              width: 10, height: 10, marginLeft: 4,
              border: '1.5px solid var(--line)', borderTopColor: 'var(--accent)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
          )}
        </div>

        {/* Menus */}
        {Object.entries(MENUS).map(([key, menu]) => (
          <div key={key} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
              style={{
                padding: '5px 10px',
                background: openMenu === key ? 'rgba(255,255,255,0.05)' : 'none',
                border: 'none', borderRadius: 2,
                fontFamily: 'var(--font-body)', fontSize: 12,
                color: openMenu === key ? 'var(--text)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'color 0.15s',
              }}
            >
              {menu.label}
            </button>

            {openMenu === key && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  onClick={() => setOpenMenu(null)}
                />
                <div style={{
                  position: 'absolute', top: '100%', left: 0,
                  minWidth: 180, marginTop: 4,
                  background: 'var(--panel)',
                  border: '1px solid var(--line)', borderRadius: 3,
                  padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  zIndex: 100, animation: 'fadeIn 0.12s ease both',
                }}>
                  {menu.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAction(item.id)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        width: '100%', padding: '6px 10px',
                        background: 'none', border: 'none', borderRadius: 2,
                        fontFamily: 'var(--font-body)', fontSize: 12,
                        color: 'var(--text)', cursor: 'pointer', transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,106,0,0.1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* Credits badge */}
        <button
          onClick={() => setShowUpgradeModal(true)}
          title="Seus créditos — clique para ver planos"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', marginRight: 6,
            background: 'var(--card)',
            border: `1px solid ${freeDownloadUsed && credits < 40 ? '#e05050' : 'var(--line)'}`,
            borderRadius: 3, cursor: 'pointer', transition: 'border-color 0.15s',
          }}
        >
          <span style={{ fontSize: 12 }}>🪙</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
            color: creditsColor, letterSpacing: '0.04em',
          }}>
            {!freeDownloadUsed ? 'FREE' : `${credits} créditos`}
          </span>
        </button>

        {/* Language selector */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2, padding: 2, marginRight: 10,
          background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 3,
        }}>
          {LANGUAGES.map((lng) => {
            const active = language === lng.code
            return (
              <button
                key={lng.code}
                onClick={() => setLanguage(lng.code)}
                title={lng.full}
                style={{
                  padding: '3px 8px',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#000' : 'var(--text-secondary)',
                  border: 'none', borderRadius: 2,
                  fontFamily: 'var(--font-condensed)', fontSize: 10.5, fontWeight: 800,
                  letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                {lng.name}
              </button>
            )
          })}
        </div>

        {/* Right side — user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user && (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)',
              maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.name}
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
            v0.2.0
          </span>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--success)', boxShadow: '0 0 6px var(--success)',
          }} />
          {user && (
            <button
              onClick={logout}
              title="Sair"
              style={{
                padding: '3px 8px', background: 'transparent',
                border: '1px solid var(--line)', borderRadius: 2,
                fontFamily: 'var(--font-condensed)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.12s', marginLeft: 2,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e05050'; e.currentTarget.style.color = '#e05050' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              Sair
            </button>
          )}
        </div>
      </nav>

      {/* New Project confirm dialog */}
      {showConfirmNew && (
        <NewProjectConfirm
          onConfirm={() => { resetProject(); setShowConfirmNew(false) }}
          onCancel={() => setShowConfirmNew(false)}
        />
      )}

      {/* Save Name dialog */}
      {showSaveDialog && (
        <SaveNameDialog
          defaultName={currentProjectName || ''}
          saving={isSaving}
          onSave={doSave}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
    </>
  )
}
