-- ═══════════════════════════════════════════════════════════════════════
-- RECUPERAR COMPRAS PASSADAS - Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- Créditos por plano:
-- EASY = 200 créditos
-- MEDIUM (PRO) = 565 créditos
-- PREMIUM = 1500 créditos

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 1: PREMIUM - 1500 créditos
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
);

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
  NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 2: EASY - 200 créditos
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
);

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
  NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 3: EASY - 200 créditos
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
);

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
  NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 4: PRO (MEDIUM) - 565 créditos
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
);

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
  NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- COMPRA 5: EASY - 200 créditos
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
);

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
  NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO - Execute após inserir para confirmar
-- ═══════════════════════════════════════════════════════════════════════
SELECT 
  u.id,
  u.name,
  u.email,
  u.credits,
  u.plan,
  u.credits_expires_at,
  p.kiwify_transaction_id,
  p.product,
  p.value,
  p.status,
  p.created_at as payment_date
FROM public.users u
LEFT JOIN public.payments p ON p.user_id = u.id
WHERE u.id IN (
  '692ae6ad-9e41-4e8c-9bf4-72881eece0a3',
  '8b2a850b-a2dc-45a0-aed6-3fac17362db4',
  'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
  '022ea5bb-472a-4e96-a688-2419e5bde8a7'
)
ORDER BY p.created_at DESC;

-- Ver histórico de créditos
SELECT * FROM public.credit_history 
WHERE user_id IN (
  '692ae6ad-9e41-4e8c-9bf4-72881eece0a3',
  '8b2a850b-a2dc-45a0-aed6-3fac17362db4',
  'a05ea9d4-c2e6-4ef5-92c9-7a1342702333',
  '022ea5bb-472a-4e96-a688-2419e5bde8a7'
)
ORDER BY created_at DESC;