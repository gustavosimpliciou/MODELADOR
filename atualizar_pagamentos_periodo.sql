-- ═══════════════════════════════════════════════════════════════════════
-- ATUALIZAR PAGAMENTOS NO PERÍODO 01/01/2026 A 30/08/2026
-- ═══════════════════════════════════════════════════════════════════════

-- LISTAR todos os pagamentos nesse período (para ver o que tem)
SELECT 
  p.id,
  p.kiwify_transaction_id,
  p.user_id,
  p.product,
  p.value,
  p.status,
  p.created_at,
  u.email as user_email
FROM public.payments p
JOIN public.users u ON u.id = p.user_id
WHERE p.created_at >= '2026-01-01T00:00:00Z'
  AND p.created_at <= '2026-08-30T23:59:59Z'
ORDER BY p.created_at DESC;

-- ════════════════════════════════════════════════════════════════════════
-- EXEMPLO 1: Alterar status de pagamentos órfãos para 'paid'
-- ═══════════════════════════════════════════════════════════════════════
UPDATE public.payments 
SET status = 'paid'
WHERE created_at >= '2026-01-01T00:00:00Z'
  AND created_at <= '2026-08-30T23:59:59Z'
  AND status = 'paid_user_not_found';

-- ════════════════════════════════════════════════════════════════════════
-- EXEMPLO 2: Alterar plano/ créditos de todos pagamentos nesse período
-- ═══════════════════════════════════════════════════════════════════════
-- Nota: Isto atualiza o usuário associado, somando créditos baseado no plano
UPDATE public.users u
SET 
  credits = u.credits + CASE p.product 
    WHEN 'PREMIUM' THEN 1500 
    WHEN 'PRO' THEN 565   -- se product vier "PRO", trata como MEDIUM
    WHEN 'EASY' THEN 200 
    ELSE 0 
  END,
  plan = CASE p.product 
    WHEN 'PREMIUM' THEN 'premium' 
    WHEN 'PRO' THEN 'medium' 
    WHEN 'EASY' THEN 'easy' 
    ELSE u.plan 
  END,
  first_upgrade_purchased = TRUE,
  credits_expires_at = GREATEST(
    u.credits_expires_at, 
    p.created_at::timestamptz + INTERVAL '90 days'
  )
FROM public.payments p
WHERE u.id = p.user_id
  AND p.created_at >= '2026-01-01T00:00:00Z'
  AND p.created_at <= '2026-08-30T23:59:59Z';

-- ════════════════════════════════════════════════════════════════════════
-- EXEMPLO 3: Somar créditos no credit_history automaticamente
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.credit_history (user_id, type, credits, description, created_at)
SELECT 
  p.user_id,
  'purchase',
  CASE p.product 
    WHEN 'PREMIUM' THEN 1500 
    WHEN 'PRO' THEN 565   -- "PRO" vira MEDIUM = 565 créditos
    WHEN 'EASY' THEN 200 
    ELSE 0 
  END,
  'Lote: atualização manual de pagamentos 01/01/2026 a 30/08/2026',
  p.created_at::timestamptz
FROM public.payments p
WHERE p.created_at >= '2026-01-01T00:00:00Z'
  AND p.created_at <= '2026-08-30T23:59:59Z'
  AND NOT EXISTS (
    SELECT 1 FROM public.credit_history ch
    WHERE ch.user_id = p.user_id
      AND ch.type = 'purchase'
      AND ch.created_at::date = p.created_at::date
  )
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- RESUMO FINAL - Verificar resultados
-- ════════════════════════════════════════════════════════════════════════
SELECT 
  COUNT(*) as total_pagamentos_no_periodo,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as pagamentos_pagos,
  COUNT(CASE WHEN status LIKE '%user_not_found%' THEN 1 END) as pagamentos_orfãos,
  SUM(CASE WHEN value LIKE '%.%' THEN value::numeric ELSE value::numeric/100 END) as receita_total_reais
FROM public.payments
WHERE created_at >= '2026-01-01T00:00:00Z'
  AND created_at <= '2026-08-30T23:59:59Z';