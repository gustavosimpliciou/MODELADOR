// ─────────────────────────────────────────────────────────────────
// Preços dos planos por idioma/moeda.
//
// Moeda por idioma: pt → BRL (R$), en/es → USD ($).
// Os valores-base estão em BRL (produtos atuais da Kiwify) e são
// CONVERTIDOS por taxas fixas abaixo — revise periodicamente.
//
// ATENÇÃO CHECKOUT: os links de pagamento são os produtos BRL da Kiwify
// para pt e USD para en/es. Se criar produtos em outras moedas, adicione os links
// em `checkoutPromoIntl` / `checkoutNormalIntl` por plano e use-os quando lang !== 'pt'.
// ─────────────────────────────────────────────────────────────────

export const PLAN_CURRENCY = {
  pt: { locale: 'pt-BR', currency: 'BRL', rate: 1 },
  en: { locale: 'en-US', currency: 'USD', rate: 5.0 },
  es: { locale: 'en-US', currency: 'USD', rate: 5.0 },
}

export const PLANS_BASE = [
  {
    id: 'easy',
    credits: 200,
    highlight: true,
    promoBRL: 6,
    normalBRL: 12,
    checkoutPromo: 'https://pay.kiwify.com.br/mP9JdtG',
    checkoutNormal: 'https://pay.kiwify.com.br/pEUqkzU',
    checkoutPromoUSD: 'https://pay.kiwify.com/ryM08yR',
    checkoutNormalUSD: 'https://pay.kiwify.com/v9I3z1D',
    checkoutPromoEUR: 'https://pay.kiwify.com/icyfa5N',
    checkoutNormalEUR: 'https://pay.kiwify.com/edtsDMT',
  },
  {
    id: 'medium',
    credits: 565,
    highlight: false,
    promoBRL: 25,
    normalBRL: 35,
    checkoutPromo: 'https://pay.kiwify.com.br/AzX89GY',
    checkoutNormal: 'https://pay.kiwify.com.br/gqFNBuH',
    checkoutPromoUSD: 'https://pay.kiwify.com/JsYbzeK',
    checkoutNormalUSD: 'https://pay.kiwify.com/AsmjQbO',
    checkoutPromoEUR: 'https://pay.kiwify.com/XSanLFg',
    checkoutNormalEUR: 'https://pay.kiwify.com/9FBMlI3',
  },
  {
    id: 'premium',
    credits: 1500,
    highlight: false,
    promoBRL: 69,
    normalBRL: 99,
    checkoutPromo: 'https://pay.kiwify.com.br/RFJZS5v',
    checkoutNormal: 'https://pay.kiwify.com.br/YchVPRb',
    checkoutPromoUSD: 'https://pay.kiwify.com/mHzy2e9',
    checkoutNormalUSD: 'https://pay.kiwify.com/eVgZGEt',
    checkoutPromoEUR: 'https://pay.kiwify.com/vi84HQc',
    checkoutNormalEUR: 'https://pay.kiwify.com/GgJHU5O',
  },
]

function langConfig(lang) {
  return PLAN_CURRENCY[lang] || PLAN_CURRENCY.pt
}

/** Converte um valor em BRL para a moeda do idioma e formata. */
export function formatPlanPrice(brlValue, lang) {
  // Tabela fixa pedida pelo cliente para USD (en/es)
  // BRL 6->5, 12->10, 25->20, 35->35, 69->50, 99->89
  const FIXED_USD = {
    6: 5,
    12: 10,
    25: 20,
    35: 35,
    69: 50,
    99: 89,
  }
  const v = Number(brlValue)
  if ((lang === 'en' || lang === 'es') && FIXED_USD[v] !== undefined) {
    const fixed = FIXED_USD[v]
    const cfgFixed = { locale: 'en-US', currency: 'USD' }
    try { return new Intl.NumberFormat(cfgFixed.locale, { style: 'currency', currency: cfgFixed.currency }).format(fixed) } catch { return `${cfgFixed.currency} ${fixed.toFixed(2)}` }
  }
  const cfg = langConfig(lang)
  const converted = Number(brlValue) / cfg.rate
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.currency,
    }).format(converted)
  } catch {
    return `${cfg.currency} ${converted.toFixed(2)}`
  }
}

/** Planos com preços localizados; textos vêm do dicionário i18n. */
export function getLocalizedPlans(lang) {
  return PLANS_BASE.map((p) => ({
    ...p,
    title: p.id.toUpperCase(),
    promoPrice: formatPlanPrice(p.promoBRL, lang),
    normalPrice: formatPlanPrice(p.normalBRL, lang),
    checkoutPromo: lang === 'en' || lang === 'es' ? p.checkoutPromoUSD : p.checkoutPromo,
    checkoutNormal: lang === 'en' || lang === 'es' ? p.checkoutNormalUSD : p.checkoutNormal,
  }))
}
