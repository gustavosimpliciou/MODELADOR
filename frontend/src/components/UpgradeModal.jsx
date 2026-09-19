import { useStore } from '../store/useStore'

// Preços e checkouts reais na Kiwify. Enquanto o usuário nunca comprou
// (first_purchase / firstUpgradePurchased === false) mostramos o preço
// promocional e o link de checkout "_promo"; depois disso, o preço normal.
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
  {
    icon: '💰',
    title: 'COMO FUNCIONAM OS CRÉDITOS?',
    desc: 'Cada download consome 40 créditos. Você continua criando e editando normalmente.',
  },
  {
    icon: '⬇️',
    title: 'CRIE SEM LIMITES',
    desc: 'Projete, edite e visualize quantos modelos quiser.',
  },
  {
    icon: '🛡️',
    title: 'SEGURANÇA TOTAL',
    desc: 'Pagamento 100% seguro e dados protegidos.',
  },
  {
    icon: '🔒',
    title: 'SEM MENSALIDADE',
    desc: 'Sem cobranças recorrentes. Pague apenas o que usar.',
  },
]

const PAYMENT_METHODS = ['PIX', 'VISA', 'Mastercard', 'American Express', 'Mercado Pago']

export default function UpgradeModal() {
  const showUpgradeModal    = useStore((s) => s.showUpgradeModal)
  const setShowUpgradeModal = useStore((s) => s.setShowUpgradeModal)
  const goToCheckout        = useStore((s) => s.goToCheckout)
  const firstUpgradePurchased = useStore((s) => s.firstUpgradePurchased)
  const user                = useStore((s) => s.user)

  // Admin tem acesso total — nunca exibe o modal de upgrade
  if (user?.email === 'nativos3d.adm@gmail.com') return null

  if (!showUpgradeModal) return null

  // Antes da primeira compra aprovada: preços promocionais. Depois: preço normal.
  const isPromo = !firstUpgradePurchased

  return (
    <div
      onClick={() => setShowUpgradeModal(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d0d0d',
          border: '1px solid #222',
          borderRadius: 14,
          maxWidth: 960, width: '100%',
          padding: '36px 32px 28px',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
        }}
      >
        {/* Close */}
        <button
          onClick={() => setShowUpgradeModal(false)}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 36, height: 36,
            background: 'rgba(255,255,255,0.06)', border: '1px solid #333',
            borderRadius: 8, color: '#999', fontSize: 20,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}
        >×</button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{
            fontFamily: 'var(--font-condensed)', fontSize: 42, fontWeight: 900,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#fff', margin: 0, lineHeight: 1,
          }}>
            ESCOLHA SEU{' '}
            <span style={{ color: '#ff6a00' }}>PLANO</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#777',
            marginTop: 8, marginBottom: 0,
          }}>
            Desbloqueie todo o potencial da Nativos Studio
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          {PLANS.map(plan => (
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
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          borderTop: '1px solid #1e1e1e',
          paddingTop: 20,
        }}>
          {FOOTER_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-condensed)', fontSize: 11, fontWeight: 800,
                  color: '#ff6a00', letterSpacing: '0.06em', marginBottom: 3,
                }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#666', lineHeight: 1.4 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div style={{
          marginTop: 16,
          borderTop: '1px solid #1a1a1a',
          paddingTop: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 14, flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 11, color: '#555',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            🔒 Pagamento 100% seguro
          </span>
          <span style={{ color: '#2a2a2a' }}>|</span>
          {PAYMENT_METHODS.map((m) => (
            <span key={m} style={{
              fontFamily: 'var(--font-condensed)', fontSize: 11, fontWeight: 700,
              color: '#555', letterSpacing: '0.04em',
              padding: '2px 8px',
              border: '1px solid #2a2a2a',
              borderRadius: 4,
            }}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlanCard({ plan, isPromo, onSelect }) {
  const price = isPromo ? plan.promoPrice : plan.normalPrice
  const badge = isPromo ? '🔥 PROMOÇÃO DE PRIMEIRA COMPRA' : 'PREÇO NORMAL'
  return (
    <div style={{
      flex: 1, minWidth: 0,
      border: `2px solid ${plan.highlight ? '#ff6a00' : '#2a2a2a'}`,
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: '#131313',
    }}>
      {/* Badge bar */}
      <div style={{
        background: '#ff6a00',
        padding: '7px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-condensed)', fontSize: 10.5, fontWeight: 900,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#000',
        textAlign: 'center',
      }}>
        {badge}
      </div>

      <div style={{ padding: '20px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Plan title */}
        <div style={{
          fontFamily: 'var(--font-condensed)', fontSize: 26, fontWeight: 900,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#ff6a00', marginBottom: 8,
        }}>
          {plan.title}
        </div>

        {/* Original price (crossed out, only during promo) */}
        {isPromo && (
          <div style={{
            fontFamily: 'var(--font-condensed)', fontSize: 15, fontWeight: 600,
            color: '#555', textDecoration: 'line-through', marginBottom: 2,
          }}>
            {plan.normalPrice}
          </div>
        )}

        {/* Price */}
        <div style={{
          fontFamily: 'var(--font-condensed)', fontSize: 36, fontWeight: 900,
          color: '#fff', lineHeight: 1.05, marginBottom: 4,
        }}>
          {price}
        </div>

        {/* Credits */}
        <div style={{
          fontFamily: 'var(--font-condensed)', fontSize: 14, fontWeight: 800,
          color: '#ff6a00', letterSpacing: '0.08em', marginBottom: 20,
        }}>
          {plan.creditLabel}
        </div>

        {/* Features */}
        <ul style={{ flex: 1, margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 22 }}>
          {plan.features.map((f, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              fontFamily: 'var(--font-body)', fontSize: 12, color: '#ccc', lineHeight: 1.3,
            }}>
              <span style={{ color: '#ff6a00', fontWeight: 900, flexShrink: 0, marginTop: 1, fontSize: 13 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onSelect}
          style={{
            width: '100%', padding: '12px',
            background: plan.highlight ? '#ff6a00' : 'transparent',
            border: `2px solid ${plan.highlight ? '#ff6a00' : '#555'}`,
            borderRadius: 6,
            color: plan.highlight ? '#000' : '#fff',
            fontFamily: 'var(--font-condensed)', fontSize: 13, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#ff6a00'
            e.currentTarget.style.borderColor = '#ff6a00'
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = plan.highlight ? '#ff6a00' : 'transparent'
            e.currentTarget.style.borderColor = plan.highlight ? '#ff6a00' : '#555'
            e.currentTarget.style.color = plan.highlight ? '#000' : '#fff'
          }}
        >
          ESCOLHER PLANO
        </button>
      </div>
    </div>
  )
}
