import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/events'

// Single source of truth for the mesh-editor sliders' baseline values.
// Used both to seed/reset `meshParams` and to detect whether the user has
// touched the editor for the currently active mesh (see MeshLibrary.jsx).
export const DEFAULT_MESH_PARAMS = {
  density: 1.0, rotation: 0, lineThickness: 1.0, amplitude: 1.1,
  frequency: 1.0, noise: 0, scale: 0.9, openingWidth: 6.0,
  depth: 1.6, tilt: 0, randomization: 0, symmetry: 1, gradient: 0, curvature: 0,
}

// A mesh's own `params` (e.g. a tuned `density`) override the global
// defaults — this is what the editor should show as the "original"
// state right after picking that mesh from the library.
export const meshDefaultParams = (mesh) => ({ ...DEFAULT_MESH_PARAMS, ...(mesh?.params || {}) })

const LANG_KEY          = 'nativos.language'
const CREDITS_KEY       = 'nativos.credits'
const EXPIRY_KEY        = 'nativos.creditsExpiresAt'
const FREE_USED_KEY     = 'nativos.freeDownloadUsed'
const FIRST_UPGRADE_KEY = 'nativos.firstUpgradePurchased'
const TOKEN_KEY         = 'nativos.token'

const initialLang = (() => {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null
    if (v === 'pt' || v === 'en' || v === 'es') return v
  } catch (e) { void e }
  return 'pt'
})()

const ls    = (key, fallback) => { try { const v = localStorage.getItem(key); return v !== null ? v : fallback } catch (e) { return fallback } }
const lsSet = (key, val)      => { try { localStorage.setItem(key, val) } catch (e) { void e } }
const lsDel = (key)           => { try { localStorage.removeItem(key) } catch (e) { void e } }

/** Lê um timestamp (ms) do localStorage; retorna null se ausente/inválido. */
const lsExpiry = (key) => {
  const n = parseInt(ls(key, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Saldo ao qual o crédito cai quando a expiração zera (mesma regra do Cortes). */
export const EXPIRED_CREDIT_BALANCE = 100

// Fire-and-forget credits sync to Supabase
const syncCredits = (_token, credits, freeDownloadUsed, firstUpgradePurchased) => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return
    supabase.from('users').update({
      credits,
      free_download_used:      freeDownloadUsed,
      first_upgrade_purchased: firstUpgradePurchased,
    }).eq('id', user.id).then(() => {})
  }).catch(() => {})
}

export const useStore = create((set, get) => ({
  // ─── Auth ────────────────────────────────────────────────────────
  token: ls(TOKEN_KEY, null),
  user: null,
  authChecked: false,

  setAuthChecked: (v) => set({ authChecked: v }),

  // Called after successful login or register
  loginUser: (token, userData) => {
    // is_admin and credits are already resolved server-side (or in toUser)
    const credits  = userData.credits
    const freeUsed = userData.freeDownloadUsed
    const isAdmin  = !!userData.is_admin
    const expiry   = isAdmin ? null : (userData.creditsExpiresAt ?? null)
    lsSet(TOKEN_KEY, token)
    lsSet(CREDITS_KEY, String(credits))
    lsSet(FREE_USED_KEY, String(freeUsed))
    lsSet(FIRST_UPGRADE_KEY, String(userData.firstUpgradePurchased))
    if (expiry != null) lsSet(EXPIRY_KEY, String(expiry))
    else                lsDel(EXPIRY_KEY)
    set({
      token,
      user: userData,
      authChecked: true,
      credits,
      freeDownloadUsed: freeUsed,
      firstUpgradePurchased: userData.firstUpgradePurchased,
      creditsExpiresAt: expiry,
    })
    trackEvent('login', { plan: userData.plan || 'free' }, { name: userData.name })
  },

  logout: () => {
    trackEvent('logout')
    supabase.auth.signOut().catch(() => {})
    ;[TOKEN_KEY, CREDITS_KEY, FREE_USED_KEY, FIRST_UPGRADE_KEY, EXPIRY_KEY].forEach(lsDel)
    set({
      token: null, user: null, authChecked: true,
      credits: 0, freeDownloadUsed: false, firstUpgradePurchased: false,
      creditsExpiresAt: null,
    })
  },

  // ─── i18n ────────────────────────────────────────────────────────
  language: initialLang,
  setLanguage: (lang) => {
    lsSet(LANG_KEY, lang)
    set({ language: lang })
  },

  // ─── Credits / plan ──────────────────────────────────────────────
  credits: parseInt(ls(CREDITS_KEY, '0'), 10),
  creditsExpiresAt: lsExpiry(EXPIRY_KEY),
  freeDownloadUsed: ls(FREE_USED_KEY, 'false') === 'true',
  firstUpgradePurchased: ls(FIRST_UPGRADE_KEY, 'false') === 'true',
  showUpgradeModal: false,

  setShowUpgradeModal: (v) => set({ showUpgradeModal: v }),
  setCreditsExpiresAt: (ms) => {
    if (ms != null) lsSet(EXPIRY_KEY, String(ms))
    else            lsDel(EXPIRY_KEY)
    set({ creditsExpiresAt: ms })
  },

  // Opens the real Kiwify checkout in a new tab (payment happens on Kiwify;
  // credits/plan are only granted once the /api/webhook/kiwify call lands).
  // Envia user_id em `src` (TrackingParameters) para o webhook vincular mesmo
  // se o e-mail no checkout for diferente do cadastrado.
  goToCheckout: (checkoutUrl) => {
    const s = get()
    if (!checkoutUrl) return
    try {
      const url = new URL(checkoutUrl)
      if (s.user?.email) url.searchParams.set('email', s.user.email)
      if (s.user?.name) url.searchParams.set('name', s.user.name)
      // user_id no parâmetro de tracking da Kiwify (volta no webhook)
      if (s.user?.id) {
        url.searchParams.set('src', s.user.id)
        url.searchParams.set('sck', s.user.id)
      }
      window.open(url.toString(), '_blank', 'noopener,noreferrer')
    } catch (e) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
    }
    set({ showUpgradeModal: false })
  },

  // Refreshes credits/plan from Supabase (call after returning from checkout).
  refreshCredits: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: row } = await supabase
        .from('users').select('*').eq('id', user.id).single()
      if (!row) return
      const isAdmin = row.email === 'nativos3d.adm@gmail.com'
      const userData = {
        id:                    row.id,
        name:                  row.name,
        email:                 row.email,
        is_admin:              isAdmin,
        credits:               isAdmin ? 99999 : (row.credits ?? 0),
        freeDownloadUsed:      isAdmin ? false  : (row.free_download_used ?? false),
        firstUpgradePurchased: row.first_upgrade_purchased ?? false,
        plan:                  row.plan ?? 'free',
        creditsExpiresAt:      isAdmin ? null : (row.credits_expires_at ?? null),
      }
      lsSet(CREDITS_KEY, String(userData.credits))
      lsSet(FREE_USED_KEY, String(userData.freeDownloadUsed))
      lsSet(FIRST_UPGRADE_KEY, String(userData.firstUpgradePurchased))
      set({
        user: userData,
        credits: userData.credits,
        freeDownloadUsed: userData.freeDownloadUsed,
        firstUpgradePurchased: userData.firstUpgradePurchased,
      })
      await get().syncCreditExpiry(row)
    } catch (e) { void e }
  },

  // Sincroniza a expiração a partir da linha do usuário. Se o prazo já
  // venceu, reseta o saldo (EXPIRED_CREDIT_BALANCE). Admin fica sem cronômetro.
  syncCreditExpiry: async (row) => {
    const s = get()
    if (s.user?.is_admin) {
      lsDel(EXPIRY_KEY)
      set({ creditsExpiresAt: null })
      return
    }
    const raw = row?.credits_expires_at
    const ms  = raw ? Date.parse(raw) : NaN
    const expiry = Number.isFinite(ms) ? ms : null

    if (expiry != null && expiry <= Date.now()) {
      await get().resetExpiredCredits()
      return
    }

    if (expiry != null) lsSet(EXPIRY_KEY, String(expiry))
    else                lsDel(EXPIRY_KEY)
    set({ creditsExpiresAt: expiry })
  },

  // Zera o prazo vencido: saldo vai para EXPIRED_CREDIT_BALANCE (regra do Cortes).
  resetExpiredCredits: async () => {
    const s = get()
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        await supabase.from('users').update({
          credits: EXPIRED_CREDIT_BALANCE,
          credits_expires_at: null,
        }).eq('id', authUser.id)
        try {
          await supabase.from('credit_history').insert({
            id: globalThis.crypto?.randomUUID?.() ?? `exp-${Date.now()}`,
            user_id: authUser.id,
            type: 'expiry_reset',
            credits: EXPIRED_CREDIT_BALANCE - (s.credits || 0),
            description: `Crédito expirado — saldo ajustado para ${EXPIRED_CREDIT_BALANCE}`,
            created_at: new Date().toISOString(),
          })
        } catch { /* não bloqueia o reset */ }
      }
    } catch { /* não bloqueia o reset */ }

    lsSet(CREDITS_KEY, String(EXPIRED_CREDIT_BALANCE))
    lsDel(EXPIRY_KEY)
    set({ credits: EXPIRED_CREDIT_BALANCE, creditsExpiresAt: null })
  },

  // Resgata o cupom GHOOST3D no servidor (700 créditos / 20 dias / 1x por conta).
  redeemCoupon: async (code) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return { ok: false, error: 'not_authenticated' }

      const res = await fetch('/api/coupon', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        return { ok: false, error: data?.error || 'server_error' }
      }

      await get().refreshCredits()
      trackEvent('coupon_redeemed', { credits: data.credits, expires_in_days: 20 })
      return { ok: true, credits: data.credits }
    } catch (e) {
      return { ok: false, error: 'server_error' }
    }
  },

  // Returns 'free' | 'ok' | 'upgrade_required'.
  tryExport: async () => {
    const s = get()
    const EXPORT_COST = 40

    // Admin bypass — acesso ilimitado sem consumir créditos
    if (s.user?.is_admin) {
      return 'ok'
    }

    if (!s.user) {
      if (!s.freeDownloadUsed) {
        lsSet(FREE_USED_KEY, 'true')
        set({ freeDownloadUsed: true })
        return 'free'
      }
      trackEvent('download_attempt', { blocked: true, reason: 'creditos_insuficientes', source: 'studio' })
      set({ showUpgradeModal: true })
      return 'upgrade_required'
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('not authenticated')

      const { data: row, error } = await supabase
        .from('users').select('credits, free_download_used').eq('id', user.id).single()
      if (error) throw error

      if (!row.free_download_used) {
        await supabase.from('users')
          .update({ free_download_used: true }).eq('id', user.id)
        lsSet(FREE_USED_KEY, 'true')
        set({ freeDownloadUsed: true })
        return 'free'
      }

      const credits = row.credits ?? 0
      if (credits < EXPORT_COST) {
        trackEvent('download_attempt', { blocked: true, reason: 'creditos_insuficientes', source: 'studio' })
        set({ showUpgradeModal: true })
        return 'upgrade_required'
      }

      const newCredits = credits - EXPORT_COST
      await supabase.from('users')
        .update({ credits: newCredits }).eq('id', user.id)
      lsSet(CREDITS_KEY, String(newCredits))
      lsSet(FREE_USED_KEY, 'true')
      set({ credits: newCredits, freeDownloadUsed: true })
      return 'ok'
    } catch (e) {
      // Network or Supabase error — do not consume free download silently.
      // Show upgrade modal as a safe fallback; the user can retry.
      set({ showUpgradeModal: true })
      return 'upgrade_required'
    }
  },

  // ─── Lampshade geometry ──────────────────────────────────────────
  lampshade: {
    profile: 'cone',
    height: 250,
    topDiameter: 200,
    middleDiameter: 200,
    bottomDiameter: 200,
    wallThickness: 1.2,
    bellCurve: 0.5,
    segments: 180,
    smoothing: 1,
    flareAngle: 0,
    fitterType: 'E27',
    // "Modo Base" — total fill: the shade becomes a fully solid, closed
    // piece (no hollow interior, sealed at the top too) instead of a
    // thin-walled shell. Wall thickness / bottom cap do not apply here.
    solidFill: false,
  },

  setLampshade: (patch) =>
    set((s) => ({ lampshade: { ...s.lampshade, ...patch } })),

  // ─── Handle (argola) ─────────────────────────────────────────────
  showHandle: false,
  setShowHandle: (v) => set({ showHandle: v }),

  // ─── Bottom cap (Fundo da Cúpula) ────────────────────────────────
  bottomCap: {
    enabled: false,
    model: 'triangles',        // triangles | squares | drops | hexagons | diamonds | arabesque
    socketType: 'E27',         // E27 | E14 | custom
    holeDiameter: 29,          // mm
    thickness: 3,              // mm
    supports: 4,               // 2 | 3 | 4
    ventedArea: 70,            // %
    supportWidth: 10,          // mm
    // ── Bottom Alignment / Transform ──
    // Manual fine-tune of fundo orientation. Applied AS A THREE.JS
    // TRANSFORM on the fundo mesh only — the shade geometry is
    // untouched. rotationY is layered on TOP of the auto-align.
    rotationX: 0,              // 0-360° — flip base into any tilt
    rotationY: 0,              // 0-360° — spin around vertical axis
    rotationZ: 0,              // 0-360° — flip base into any tilt
    flipHorizontal: false,     // mirror across vertical plane
    flipVertical: true,        // mirror across horizontal plane (default ON)
    autoAlign: true,           // auto-detect cupola orientation and align fundo
  },

  setBottomCap: (patch) =>
    set((s) => ({ bottomCap: { ...s.bottomCap, ...patch } })),

  resetBottomTransform: () =>
    set((s) => ({ bottomCap: {
      ...s.bottomCap,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      flipHorizontal: false, flipVertical: false,
    } })),

  // ─── Active mesh ──────────────────────────────────────────────────
  activeMesh: null,
  setActiveMesh: (mesh) => set({ activeMesh: mesh }),

  // ─── Active surface texture (emboss / baixo relevo) ───────────────
  activeTexture: null,
  setActiveTexture: (tex) =>
    set((s) => ({
      activeTexture: tex,
      textureParams: tex
        ? {
            intensity: tex.defaults.intensity,
            scale: tex.defaults.scale,
            rotation: 0,
            direction: tex.defaults.direction,
            repetition: tex.defaults.repetition,
            smooth: tex.defaults.smooth,
            offset: 0,
          }
        : s.textureParams,
    })),

  textureParams: {
    intensity: 0.8,     // mm (0..3)
    scale: 1.0,         // 0.2..3
    rotation: 0,        // 0..360°
    direction: 'vertical',
    repetition: 20,     // 2..120
    smooth: 0.5,        // 0..1
    offset: 0,          // 0..360°
  },
  setTextureParams: (patch) =>
    set((s) => ({ textureParams: { ...s.textureParams, ...patch } })),
  resetTextureParams: () =>
    set((s) => ({
      textureParams: s.activeTexture
        ? {
            intensity: s.activeTexture.defaults.intensity,
            scale: s.activeTexture.defaults.scale,
            rotation: 0,
            direction: s.activeTexture.defaults.direction,
            repetition: s.activeTexture.defaults.repetition,
            smooth: s.activeTexture.defaults.smooth,
            offset: 0,
          }
        : s.textureParams,
    })),

  // ─── Mesh params ──────────────────────────────────────────────────
  meshParams: { ...DEFAULT_MESH_PARAMS },

  setMeshParams: (patch) =>
    set((s) => ({ meshParams: { ...s.meshParams, ...patch } })),

  resetMeshParams: () =>
    set((s) => ({ meshParams: meshDefaultParams(s.activeMesh) })),

  // ─── Viewport ─────────────────────────────────────────────────────
  viewMode: 'solid',
  setViewMode: (mode) => set({ viewMode: mode }),

  showGrid: true,
  setShowGrid: (v) => set({ showGrid: v }),

  orbitEnabled: true,
  setOrbitEnabled: (v) => set({ orbitEnabled: v }),

  autoRotate: true,
  setAutoRotate: (v) => set({ autoRotate: v }),

  // ─── Right panel ──────────────────────────────────────────────────
  rightPanel: 'meshes',
  setRightPanel: (tab) => set({ rightPanel: tab }),

  // ─── Mesh library ─────────────────────────────────────────────────
  meshSearchQuery: '',
  setMeshSearchQuery: (q) => set({ meshSearchQuery: q }),

  meshCategoryFilter: 'ALL',
  setMeshCategoryFilter: (c) => set({ meshCategoryFilter: c }),

  favorites: new Set(),
  toggleFavorite: (id) =>
    set((s) => {
      const favs = new Set(s.favorites)
      if (favs.has(id)) favs.delete(id)
      else favs.add(id)
      return { favorites: favs }
    }),

  // ─── Material ─────────────────────────────────────────────────────
  material: { id: 'pla', name: 'PLA', color: '#e8e0d8', roughness: 0.4, metalness: 0 },
  setMaterial: (mat) => set({ material: mat }),

  // ─── Stats ───────────────────────────────────────────────────────
  stats: {
    fps: 60,
    polygons: '0',
    faces: '0',
    printTime: '0h 0m',
    weight: '0g',
    volume: '0cm³',
  },
  setStats: (patch) => set((s) => ({ stats: { ...s.stats, ...patch } })),

  // ─── Export settings ──────────────────────────────────────────────
  exportFormat: 'STL',
  setExportFormat: (f) => set({ exportFormat: f }),

  exportQuality: 'standard',
  setExportQuality: (q) => set({ exportQuality: q }),

  // ─── Modifiers ────────────────────────────────────────────────────
  modifiers: {
    baseThickness: 2.0,
    topRing: true,
    bottomRing: false,
    ventilationHoles: 0,
    reinforcement: 0,
    threadInsert: 'none',
  },
  setModifiers: (patch) =>
    set((s) => ({ modifiers: { ...s.modifiers, ...patch } })),

  // ─── Project ──────────────────────────────────────────────────────
  currentProjectId:   null,
  currentProjectName: null,
  showProjectsModal:  false,

  setShowProjectsModal: (v) => set({ showProjectsModal: v }),
  setCurrentProject: (id, name) => set({ currentProjectId: id, currentProjectName: name }),

  resetProject: () => set({
    lampshade: {
      profile: 'cone', height: 250, topDiameter: 200, middleDiameter: 200,
      bottomDiameter: 200, wallThickness: 1.2, bellCurve: 0.5, segments: 180,
      smoothing: 1, flareAngle: 0, fitterType: 'E27',
    },
    bottomCap: {
      enabled: false, model: 'triangles', socketType: 'E27', holeDiameter: 29,
      thickness: 3, supports: 4, ventedArea: 70, supportWidth: 10,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      flipHorizontal: false, flipVertical: true, autoAlign: true,
    },
    activeMesh:    null,
    activeTexture: null,
    textureParams: {
      intensity: 0.8, scale: 1.0, rotation: 0, direction: 'vertical',
      repetition: 20, smooth: 0.5, offset: 0,
    },
    meshParams: { ...DEFAULT_MESH_PARAMS },
    material: { id: 'pla', name: 'PLA', color: '#e8e0d8', roughness: 0.4, metalness: 0 },
    modifiers: {
      baseThickness: 2.0, topRing: true, bottomRing: false,
      ventilationHoles: 0, reinforcement: 0, threadInsert: 'none',
    },
    showHandle: false,
    currentProjectId:   null,
    currentProjectName: null,
  }),

  getProjectSnapshot: () => {
    const s = get()
    return {
      lampshade:     s.lampshade,
      bottomCap:     s.bottomCap,
      activeMesh:    s.activeMesh,
      activeTexture: s.activeTexture,
      textureParams: s.textureParams,
      meshParams:    s.meshParams,
      material:      s.material,
      modifiers:     s.modifiers,
      showHandle:    s.showHandle,
    }
  },

  loadProjectSnapshot: (data) => set({
    ...(data.lampshade     && { lampshade:     data.lampshade }),
    ...(data.bottomCap     && { bottomCap:     data.bottomCap }),
    ...(data.textureParams && { textureParams: data.textureParams }),
    ...(data.meshParams    && { meshParams:    data.meshParams }),
    ...(data.material      && { material:      data.material }),
    ...(data.modifiers     && { modifiers:     data.modifiers }),
    activeMesh:    data.activeMesh    ?? null,
    activeTexture: data.activeTexture ?? null,
    showHandle:    data.showHandle    ?? false,
  }),

  // ─── Menu ──────────────────────────────────────────────────────────
  openMenu: null,
  setOpenMenu: (m) => set({ openMenu: m }),
}))
