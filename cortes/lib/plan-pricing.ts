/**
 * Preços dos planos por idioma/moeda (Espelho do Modelador 3D).
 *
 * Moeda por idioma: pt → BRL (R$), en → USD ($), es → EUR (€, Espanha).
 * Valores-base em BRL (produtos atuais da Kiwify), CONVERTIDOS por taxas
 * fixas — revise periodicamente.
 *
 * ATENÇÃO CHECKOUT: os links são os produtos BRL da Kiwify para todos os
 * idiomas (cobrança em R$). Com produtos em USD/EUR, adicione os links por
 * plano/idioma e selecione pelo `lang`.
 */

export type PlanLang = 'pt' | 'en' | 'es'

interface CurrencyConfig {
  locale: string
  currency: string
  rate: number
}

export const PLAN_CURRENCY: Record<PlanLang, CurrencyConfig> = {
  pt: { locale: 'pt-BR', currency: 'BRL', rate: 1 },
  en: { locale: 'en-US', currency: 'USD', rate: 5.0 },
  es: { locale: 'es-ES', currency: 'EUR', rate: 5.4 },
}

export interface PlanBase {
  id: 'easy' | 'medium' | 'premium'
  credits: number
  highlight: boolean
  promoBRL: number
  normalBRL: number
  checkoutPromo: string
  checkoutNormal: string
}

export const PLANS_BASE: PlanBase[] = [
  {
    id: 'easy',
    credits: 200,
    highlight: true,
    promoBRL: 6,
    normalBRL: 12,
    checkoutPromo: 'https://pay.kiwify.com.br/mP9JdtG',
    checkoutNormal: 'https://pay.kiwify.com.br/pEUqkzU',
  },
  {
    id: 'medium',
    credits: 565,
    highlight: false,
    promoBRL: 25,
    normalBRL: 35,
    checkoutPromo: 'https://pay.kiwify.com.br/AzX89GY',
    checkoutNormal: 'https://pay.kiwify.com.br/gqFNBuH',
  },
  {
    id: 'premium',
    credits: 1500,
    highlight: false,
    promoBRL: 69,
    normalBRL: 99,
    checkoutPromo: 'https://pay.kiwify.com.br/RFJZS5v',
    checkoutNormal: 'https://pay.kiwify.com.br/YchVPRb',
  },
]

function langConfig(lang: string): CurrencyConfig {
  return (PLAN_CURRENCY as Record<string, CurrencyConfig>)[lang] ?? PLAN_CURRENCY.pt
}

/** Converte um valor em BRL para a moeda do idioma e formata. */
export function formatPlanPrice(brlValue: number, lang: string): string {
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

export interface LocalizedPlan extends PlanBase {
  title: string
  promoPrice: string
  normalPrice: string
}

/** Planos com preços localizados; textos vêm do dicionário i18n. */
export function getLocalizedPlans(lang: string): LocalizedPlan[] {
  return PLANS_BASE.map((p) => ({
    ...p,
    title: p.id.toUpperCase(),
    promoPrice: formatPlanPrice(p.promoBRL, lang),
    normalPrice: formatPlanPrice(p.normalBRL, lang),
  }))
}
