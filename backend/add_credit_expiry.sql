-- ──────────────────────────────────────────────────────────────────────
-- Nativos Studio — Expiração de créditos comprados
-- Execute no Supabase: Dashboard → SQL Editor → New query → Run
-- ──────────────────────────────────────────────────────────────────────

-- 1) Nova coluna: quando o crédito comprado expira (NULL = sem cronômetro)
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS credits_expires_at TIMESTAMPTZ;

-- 2) Índice opcional para consultas por expiração
CREATE INDEX IF NOT EXISTS users_credits_expires_at_idx
    ON public.users (credits_expires_at);

-- 3) Backfill: quem JÁ pagou (Kiwify) ganha expiração = pagamento + 90 dias.
--    Usa o pagamento mais recente de cada usuário.
UPDATE public.users u
SET credits_expires_at = p.latest_paid_at + INTERVAL '90 days'
FROM (
    SELECT user_id, MAX(created_at) AS latest_paid_at
    FROM public.payments
    WHERE user_id IS NOT NULL
      AND (LOWER(status) LIKE '%paid%' OR LOWER(status) LIKE '%approved%')
    GROUP BY user_id
) p
WHERE u.id = p.user_id
  AND u.first_upgrade_purchased = TRUE
  AND u.credits_expires_at IS NULL;

-- 4) Conta de teste do proprietário (não pagou) — cronômetro a partir de hoje
UPDATE public.users
SET credits_expires_at = NOW() + INTERVAL '90 days'
WHERE email = 'simpliciou@icloud.com'
  AND credits_expires_at IS NULL;

-- 5) Regra: quem JÁ passou do prazo cai para 100 créditos (uma única vez,
--    pois o prazo é limpo logo em seguida).
UPDATE public.users
SET credits = 100,
    credits_expires_at = NULL
WHERE credits_expires_at IS NOT NULL
  AND credits_expires_at <= NOW();
