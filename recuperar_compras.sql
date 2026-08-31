-- ═══════════════════════════════════════════════════════════════════════
-- RECUPERAR COMPRAS PASSADAS - Completo (payments + users + credit_history + user_events)
-- ═══════════════════════════════════════════════════════════════════════

-- Créditos por plano:
-- EASY = 200 créditos
-- MEDIUM (PRO) = 565 créditos
-- PREMIUM = 1500 créditos

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 1: PREMIUM - 1500 créditos - Usuario: 692ae6ad-9e41-4e8c-9bf4-72881eece0a3
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO public.payments (
  id, user_id, kiwify_transaction_id, product, value, status, created_at
) VALUES (
  gen_random_uuid(),
  '692ae6ad-9e41-4e8c-9bf4-72881eece0a3',
  'loylznV',
  'PREMIUM',
  '6900',
  'paid',
  '2026-01-15T10:30:00Z'
)
ON CONFLICT (kiwify_transaction_id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  product = EXCLUDED.product,
  value = EXCLUDED.value,
  status = 'paid',
  created_at = EXCLUDED.created_at;

UPDATE public.users 
SET credits = credits + 1500,
    plan = 'premium',
    first_upgrade_purchased = true,
    credits_expires_at = '2026-01-15T10:30:00Z'::timestamptz + INTERVAL '90 days'
WHERE id = '692ae6ad-9e41-4e8c-9bf4-72881eece0a3';

INSERT INTO public.credit_history (id, user_id, type, credits, description, created_at)
VALUES (
  gen_random_uuid(),
  '692ae6ad-9e41-4e8c-9bf4-72881eece0a3',
  'purchase',
  1500,
  'Compra aprovada: PREMIUM (pedido loylznV) - INSERIDO MANUALMENTE',
  '2026-01-15T10:30:00Z'::timestamptz
)
ON CONFLICT DO NOTHING;

INSERT INTO public.user_events (user_id, user_name, user_email, tool, event, details, created_at)
SELECT 
  u.id, u.name, u.email,
  'studio', 'upgrade',
  jsonb_build_object(
    'plan', 'premium', 
    'credits', 1500, 
    'product', 'PREMIUM', 
    'order_id', 'loylznV', 
    'resolved_by', 'manual_recovery'
  ),
  '2026-01-15T10:30:00Z'::timestamptz
FROM public.users u WHERE u.id = '692ae6ad-9e41-4e8c-9bf4-72881eece0a3'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 2: EASY - 200 créditos - Usuario: 8b2a850b-a2dc-45a0-aed6-3fac17362db4
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO public.payments (
  id, user_id, kiwify_transaction_id, product, value, status, created_at
) VALUES (
  gen_random_uuid(),
  '8b2a850b-a2dc-45a0-aed6-3fac17362db4',
  'jOKtICj',
  'EASY',
  '600',
  'paid',
  '2026-01-16T14:20:00Z'
)
ON CONFLICT (kiwify_transaction_id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  product = EXCLUDED.product,
  value = EXCLUDED.value,
  status = 'paid',
  created_at = EXCLUDED.created_at;

UPDATE public.users 
SET credits = credits + 200,
    plan = 'easy',
    first_upgrade_purchased = true,
    credits_expires_at = '2026-01-16T14:20:00Z'::timestamptz + INTERVAL '90 days'
WHERE id = '8b2a850b-a2dc-45a0-aed6-3fac17362db4';

INSERT INTO public.credit_history (id, user_id, type, credits, description, created_at)
VALUES (
  gen_random_uuid(),
  '8b2a850b-a2dc-45a0-aed6-3fac17362db4',
  'purchase',
  200,
  'Compra aprovada: EASY (pedido jOKtICj) - INSERIDO MANUALMENTE',
  '2026-01-16T14:20:00Z'::timestamptz
)
ON CONFLICT DO NOTHING;

INSERT INTO public.user_events (user_id, user_name, user_email, tool, event, details, created_at)
SELECT 
  u.id, u.name, u.email,
  'studio', 'upgrade',
  jsonb_build_object(
    'plan', 'easy', 
    'credits', 200, 
    'product', 'EASY', 
    'order_id', 'jOKtICj', 
    'resolved_by', 'manual_recovery'
  ),
  '2026-01-16T14:20:00Z'::timestamptz
FROM public.users u WHERE u.id = '8b2a850b-a2dc-45a0-aed6-3fac17362db4'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 3: EASY - 200 créditos - Usuario: a05ea9d4-c2e6-4ef5-92c9-7a1342702333
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO public.payments (
  id, user_id, kiwify_transaction_id, product, value, status, created_at
) VALUES (
  gen_random_uuid(),
  'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
  'w3TS3ET',
  'EASY',
  '600',
  'paid',
  '2026-01-16T14:20:00Z'
)
ON CONFLICT (kiwify_transaction_id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  product = EXCLUDED.product,
  value = EXCLUDED.value,
  status = 'paid',
  created_at = EXCLUDED.created_at;

UPDATE public.users 
SET credits = credits + 200,
    plan = 'easy',
    first_upgrade_purchased = true,
    credits_expires_at = '2026-01-16T14:20:00Z'::timestamptz + INTERVAL '90 days'
WHERE id = 'a05ea9d4-c2e6-4ef5-92c9-7a1342702333';

INSERT INTO public.credit_history (id, user_id, type, credits, description, created_at)
VALUES (
  gen_random_uuid(),
  'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
  'purchase',
  200,
  'Compra aprovada: EASY (pedido w3TS3ET) - INSERIDO MANUALMENTE',
  '2026-01-16T14:20:00Z'::timestamptz
)
ON CONFLICT DO NOTHING;

INSERT INTO public.user_events (user_id, user_name, user_email, tool, event, details, created_at)
SELECT 
  u.id, u.name, u.email,
  'studio', 'upgrade',
  jsonb_build_object(
    'plan', 'easy', 
    'credits', 200, 
    'product', 'EASY', 
    'order_id', 'w3TS3ET', 
    'resolved_by', 'manual_recovery'
  ),
  '2026-01-16T14:20:00Z'::timestamptz
FROM public.users u WHERE u.id = 'a05ea9d4-c2e6-4ef5-92c9-7a1342702333'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 4: PRO (MEDIUM) - 565 créditos - Usuario: a05ea9d4-c2e6-4ef5-92c9-7a1342702333
-- Nota: "PRO" no sistema = plano MEDIUM
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO public.payments (
  id, user_id, kiwify_transaction_id, product, value, status, created_at
) VALUES (
  gen_random_uuid(),
  'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
  '0t8cs3I',
  'PRO',
  '2500',
  'paid',
  '2026-01-16T14:20:00Z'
)
ON CONFLICT (kiwify_transaction_id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  product = EXCLUDED.product,
  value = EXCLUDED.value,
  status = 'paid',
  created_at = EXCLUDED.created_at;

UPDATE public.users 
SET credits = credits + 565,
    plan = 'medium',
    first_upgrade_purchased = true,
    credits_expires_at = '2026-01-16T14:20:00Z'::timestamptz + INTERVAL '90 days'
WHERE id = 'a05ea9d4-c2e6-4ef5-92c9-7a1342702333';

INSERT INTO public.credit_history (id, user_id, type, credits, description, created_at)
VALUES (
  gen_random_uuid(),
  'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
  'purchase',
  565,
  'Compra aprovada: PRO (MEDIUM) (pedido 0t8cs3I) - INSERIDO MANUALMENTE',
  '2026-01-16T14:20:00Z'::timestamptz
)
ON CONFLICT DO NOTHING;

INSERT INTO public.user_events (user_id, user_name, user_email, tool, event, details, created_at)
SELECT 
  u.id, u.name, u.email,
  'studio', 'upgrade',
  jsonb_build_object(
    'plan', 'medium', 
    'credits', 565, 
    'product', 'PRO', 
    'order_id', '0t8cs3I', 
    'resolved_by', 'manual_recovery'
  ),
  '2026-01-16T14:20:00Z'::timestamptz
FROM public.users u WHERE u.id = 'a05ea9d4-c2e6-4ef5-92c9-7a1342702333'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 5: EASY - 200 créditos - Usuario: 022ea5bb-472a-4e96-a688-2419e5bde8a7
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO public.payments (
  id, user_id, kiwify_transaction_id, product, value, status, created_at
) VALUES (
  gen_random_uuid(),
  '022ea5bb-472a-4e96-a688-2419e5bde8a7',
  'A4o4XIt',
  'EASY',
  '600',
  'paid',
  '2026-01-16T14:20:00Z'
)
ON CONFLICT (kiwify_transaction_id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  product = EXCLUDED.product,
  value = EXCLUDED.value,
  status = 'paid',
  created_at = EXCLUDED.created_at;

UPDATE public.users 
SET credits = credits + 200,
    plan = 'easy',
    first_upgrade_purchased = true,
    credits_expires_at = '2026-01-16T14:20:00Z'::timestamptz + INTERVAL '90 days'
WHERE id = '022ea5bb-472a-4e96-a688-2419e5bde8a7';

INSERT INTO public.credit_history (id, user_id, type, credits, description, created_at)
VALUES (
  gen_random_uuid(),
  '022ea5bb-472a-4e96-a688-2419e5bde8a7',
  'purchase',
  200,
  'Compra aprovada: EASY (pedido A4o4XIt) - INSERIDO MANUALMENTE',
  '2026-01-16T14:20:00Z'::timestamptz
)
ON CONFLICT DO NOTHING;

INSERT INTO public.user_events (user_id, user_name, user_email, tool, event, details, created_at)
SELECT 
  u.id, u.name, u.email,
  'studio', 'upgrade',
  jsonb_build_object(
    'plan', 'easy', 
    'credits', 200, 
    'product', 'EASY', 
    'order_id', 'A4o4XIt', 
    'resolved_by', 'manual_recovery'
  ),
  '2026-01-16T14:20:00Z'::timestamptz
FROM public.users u WHERE u.id = '022ea5bb-472a-4e96-a688-2419e5bde8a7'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO COMPLETA - Execute após inserir para confirmar tudo
-- ═══════════════════════════════════════════════════════════════════════
-- 1. Pagamentos inseridos
SELECT 
  p.kiwify_transaction_id,
  p.product,
  p.value,
  p.status,
  p.created_at,
  u.email as user_email,
  u.credits,
  u.plan
FROM public.payments p
JOIN public.users u ON u.id = p.user_id
WHERE p.kiwify_transaction_id IN ('loylznV','jOKtICj','w3TS3ET','0t8cs3I','A4o4XIt')
ORDER BY p.created_at;

-- 2. Créditos dos usuários
SELECT id, name, email, credits, plan, credits_expires_at, first_upgrade_purchased
FROM public.users
WHERE id IN (
  '692ae6ad-9e41-4e8c-9bf4-72881eece0a3',
  '8b2a850b-a2dc-45a0-aed6-3fac17362db4',
  'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
  '022ea5bb-472a-4e96-a688-2419e5bde8a7'
);

-- 3. Histórico de créditos
SELECT user_id, type, credits, description, created_at
FROM public.credit_history
WHERE user_id IN (
  '692ae6ad-9e41-4e8c-9bf4-72881eece0a3',
  '8b2a850b-a2dc-45a0-aed6-3fac17362db4',
  'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
  '022ea5bb-472a-4e96-a688-2419e5bde8a7'
)
ORDER BY created_at DESC;

-- 4. Eventos de upgrade (para gráficos de atividade)
SELECT user_id, user_name, user_email, tool, event, details, created_at
FROM public.user_events
WHERE event = 'upgrade' 
  AND user_id IN (
    '692ae6ad-9e41-4e8c-9bf4-72881eece0a3',
    '8b2a850b-a2dc-45a0-aed6-3fac17362db4',
    'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
    '022ea5bb-472a-4e96-a688-2419e5bde8a7'
  )
ORDER BY created_at DESC;

-- 5. Resumo para dashboard (o que o /api/admin/stats retorna)
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  SUM(u.credits) as total_credits,
  COUNT(CASE WHEN u.credits > 0 THEN 1 END) as users_with_credits,
  SUM(CASE 
    WHEN p.status IN ('paid','approved','completed','confirmed','success','order_approved','payment_approved','payment_confirmed','paid_linked_auto','paid_linked_manual') 
    OR p.status LIKE '%user_not_found%' 
    THEN CASE 
      WHEN p.value LIKE '%.%' THEN p.value::numeric 
      ELSE p.value::numeric / 100 
    END 
    ELSE 0 
  END) as total_revenue,
  COUNT(CASE 
    WHEN p.status IN ('paid','approved','completed','confirmed','success','order_approved','payment_approved','payment_confirmed','paid_linked_auto','paid_linked_manual') 
    OR p.status LIKE '%user_not_found%' 
    THEN 1 
  END) as total_paid_count
FROM public.users u
LEFT JOIN public.payments p ON p.user_id = u.id;