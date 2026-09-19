"use client"

import { useUserStore, ADMIN_EMAIL } from '@/lib/user-store'

// ─── Planos — mesmos valores e links do Modelador 3D ──────────────────────────
const PLANS = [
  {
    id: 'easy',
    title: 'EASY',
    credits: 200,
    creditLabel: '200 CRÉDITOS',
    highlight: true,
    promoPrice: 'R$ 6,00',
    normalPrice: 'R$ 12,00',
    checkoutPromo:  'https://pay.kiwify.com.br/mP9JdtG',
    checkoutNormal: 'https://pay.kiwify.com.br/pEUqkzU',
    features: [
      'Ferramenta completa de criação 3D',
      'Exportação STL e OBJ',
      'Acesso à biblioteca de modelos',
      'Acesso a texturas',
      'Templates de projetos',
      'Atualizações inclusas',
      'Suporte padrão',
    ],
  },
  {
    id: 'medium',
    title: 'MEDIUM',
    credits: 565,
    creditLabel: '565 CRÉDITOS',
    highlight: false,
    promoPrice: 'R$ 25,00',
    normalPrice: 'R$ 35,00',
    checkoutPromo:  'https://pay.kiwify.com.br/AzX89GY',
    checkoutNormal: 'https://pay.kiwify.com.br/gqFNBuH',
    features: [
      'Ferramenta completa de criação 3D',
      'Exportação STL e OBJ',
      'Biblioteca de modelos premium',
      'Todos os modelos 3D',
      'Texturas premium',
      'Templates exclusivos',
      'Prioridade de processamento',
      'Suporte prioritário',
      'Atualizações antecipadas',
    ],
  },
  {
    id: 'premium',
    title: 'PREMIUM',
    credits: 1500,
    creditLabel: '1500 CRÉDITOS',
    highlight: false,
    promoPrice: 'R$ 69,00',
    normalPrice: 'R$ 99,00',
    checkoutPromo:  'https://pay.kiwify.com.br/RFJZS5v',
    checkoutNormal: 'https://pay.kiwify.com.br/YchVPRb',
    features: [
      'Ferramenta completa de criação 3D',
      'Exportação STL e OBJ',
      'Biblioteca premium completa',
      'Todos os modelos 3D',
      'Texturas premium ilimitadas',
      'Recursos beta e exclusivos',
      'Suporte prioritário',
      'Atualizações antecipadas',
      'Comercial liberado',
    ],
  },
]

const FOOTER_ITEMS = [
  { icon: '💰', title: 'COMO FUNCIONAM OS CRÉDITOS?', desc: 'Cada download consome 40 créditos. Você continua criando e editando normalmente.' },
  { icon: '⬇️', title: 'CRIE SEM LIMITES',            desc: 'Projete, edite e visualize quantos modelos quiser.' },
  { icon: '🛡️', title: 'SEGURANÇA TOTAL',              desc: 'Pagamento 100% seguro e dados protegidos.' },
  { icon: '🔒', title: 'SEM MENSALIDADE',               desc: 'Sem cobranças recorrentes. Pague apenas o que usar.' },
]

const PAYMENT_METHODS = ['PIX', 'VISA', 'Mastercard', 'American Express', 'Mercado Pago']

// Orange accent used throughout the Cortes app
const ACCENT = 'oklch(0.70 0.22 42)'

export function UpgradeModal() {
  const showUpgradeModal    = useUserStore((s) => s.showUpgradeModal)
  const setShowUpgradeModal = useUserStore((s) => s.setShowUpgradeModal)
  const goToCheckout        = useUserStore((s) => s.goToCheckout)
  const firstUpgradePurchased = useUserStore((s) => s.firstUpgradePurchased)
  const user                = useUserStore((s) => s.user)

  if (user?.email === ADMIN_EMAIL) return null
  if (!showUpgradeModal) return null

  const isPromo = !firstUpgradePurchased

  return (
    <div
      onClick={() => setShowUpgradeModal(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.90)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'oklch(0.07 0 0)',
          border: '1px solid oklch(0.18 0 0)',
          borderRadius: 14,
          maxWidth: 980, width: '100%',
          padding: '36px 32px 28px',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.95)',
        }}
      >
        {/* Close */}
        <button
          onClick={() => setShowUpgradeModal(false)}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 36, height: 36,
            background: 'oklch(0.14 0 0)', border: '1px solid oklch(0.22 0 0)',
            borderRadius: 8, color: 'oklch(0.5 0 0)', fontSize: 20,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Fechar"
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{
            fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 38, fontWeight: 900,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#fff', margin: 0, lineHeight: 1,
          }}>
            ESCOLHA SEU{' '}
            <span style={{ color: ACCENT }}>PLANO</span>
          </h2>
          <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: 'oklch(0.45 0 0)', marginTop: 8, marginBottom: 0 }}>
            Créditos compartilhados entre o Modelador 3D e a Ferramenta de Corte
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPromo={isPromo}
              onSelect={() => goToCheckout(isPromo ? plan.checkoutPromo : plan.checkoutNormal)}
            />
          ))}
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: 24,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          borderTop: '1px solid oklch(0.14 0 0)', paddingTop: 20,
        }}>
          {FOOTER_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 800, color: ACCENT, letterSpacing: '0.06em', marginBottom: 3 }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: 'sans-serif', fontSize: 11, color: 'oklch(0.40 0 0)', lineHeight: 1.4 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div style={{
          marginTop: 16, borderTop: '1px solid oklch(0.12 0 0)', paddingTop: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: 'sans-serif', fontSize: 11, color: 'oklch(0.35 0 0)', display: 'flex', alignItems: 'center', gap: 4 }}>
            🔒 Pagamento 100% seguro
          </span>
          <span style={{ color: 'oklch(0.18 0 0)' }}>|</span>
          {PAYMENT_METHODS.map((m) => (
            <span key={m} style={{
              fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
              color: 'oklch(0.35 0 0)', letterSpacing: '0.04em',
              padding: '2px 8px',
              border: '1px solid oklch(0.18 0 0)', borderRadius: 4,
            }}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: typeof PLANS[0]
  isPromo: boolean
  onSelect: () => void
}

function PlanCard({ plan, isPromo, onSelect }: PlanCardProps) {
  const price = isPromo ? plan.promoPrice : plan.normalPrice
  const badge = isPromo ? '🔥 PROMOÇÃO DE PRIMEIRA COMPRA' : 'PREÇO NORMAL'

  return (
    <div style={{
      flex: 1, minWidth: 0,
      border: `2px solid ${plan.highlight ? ACCENT : 'oklch(0.18 0 0)'}`,
      borderRadius: 10, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'oklch(0.09 0 0)',
    }}>
      {/* Badge */}
      <div style={{
        background: ACCENT, padding: '7px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: 10, fontWeight: 900,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', textAlign: 'center',
      }}>
        {badge}
      </div>

      <div style={{ padding: '20px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <div style={{
          fontFamily: 'monospace', fontSize: 26, fontWeight: 900,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8,
        }}>
          {plan.title}
        </div>

        {/* Crossed-out original price (promo only) */}
        {isPromo && (
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'oklch(0.35 0 0)', textDecoration: 'line-through', marginBottom: 2 }}>
            {plan.normalPrice}
          </div>
        )}

        {/* Price */}
        <div style={{ fontFamily: 'monospace', fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: 4 }}>
          {price}
        </div>

        {/* Credits */}
        <div style={{
          fontFamily: 'monospace', fontSize: 13, fontWeight: 800,
          color: ACCENT, letterSpacing: '0.08em', marginBottom: 18,
        }}>
          {plan.creditLabel}
        </div>

        {/* Features */}
        <ul style={{ flex: 1, margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {plan.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: 'sans-serif', fontSize: 12, color: 'oklch(0.65 0 0)', lineHeight: 1.3 }}>
              <span style={{ color: ACCENT, fontWeight: 900, flexShrink: 0, marginTop: 1, fontSize: 12 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onSelect}
          style={{
            width: '100%', padding: '12px',
            background: plan.highlight ? ACCENT : 'transparent',
            border: `2px solid ${plan.highlight ? ACCENT : 'oklch(0.35 0 0)'}`,
            borderRadius: 6,
            color: plan.highlight ? '#000' : '#fff',
            fontFamily: 'monospace', fontSize: 12, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = ACCENT
            e.currentTarget.style.borderColor = ACCENT
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = plan.highlight ? ACCENT : 'transparent'
            e.currentTarget.style.borderColor = plan.highlight ? ACCENT : 'oklch(0.35 0 0)'
            e.currentTarget.style.color = plan.highlight ? '#000' : '#fff'
          }}
        >
          ESCOLHER PLANO
        </button>
      </div>
    </div>
  )
}
