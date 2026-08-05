-- ══════════════════════════════════════════════════════════════════════
-- Nativos Studio Pro — Correção de RLS + Sincronização de Usuários
-- Execute no Supabase: Dashboard → SQL Editor → New query → colar → Run
-- ══════════════════════════════════════════════════════════════════════

-- ── 1. Garante que todas as tabelas existam ───────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id                      TEXT PRIMARY KEY,
    name                    TEXT        NOT NULL,
    email                   TEXT UNIQUE NOT NULL,
    password_hash           TEXT        NOT NULL DEFAULT '',
    credits                 INTEGER     NOT NULL DEFAULT 0,
    free_download_used      BOOLEAN     NOT NULL DEFAULT FALSE,
    first_upgrade_purchased BOOLEAN     NOT NULL DEFAULT FALSE,
    plan                    TEXT        NOT NULL DEFAULT 'free',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reset_token             TEXT,
    reset_token_expiry      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.projects (
    id         TEXT        PRIMARY KEY,
    user_id    TEXT        NOT NULL,
    name       TEXT        NOT NULL DEFAULT 'Projeto sem título',
    data       JSONB       NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id                     TEXT        PRIMARY KEY,
    user_id                TEXT,
    kiwify_transaction_id  TEXT UNIQUE,
    product                TEXT,
    value                  TEXT,
    status                 TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_history (
    id          TEXT        PRIMARY KEY,
    user_id     TEXT        NOT NULL,
    type        TEXT        NOT NULL,
    credits     INTEGER     NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Desativa RLS em todas as tabelas do backend ────────────────────
-- O acesso é controlado pelo servidor FastAPI, não por políticas de linha.
ALTER TABLE public.users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_history DISABLE ROW LEVEL SECURITY;

-- ── 3. Sincroniza usuários do Auth → tabela users ─────────────────────
-- Copia todos os usuários cadastrados no Supabase Auth para public.users.
-- ON CONFLICT DO NOTHING: não sobrescreve quem já tem perfil.
INSERT INTO public.users (
    id,
    name,
    email,
    password_hash,
    credits,
    free_download_used,
    first_upgrade_purchased,
    plan,
    created_at
)
SELECT
    id::TEXT,
    COALESCE(
        NULLIF(raw_user_meta_data->>'name', ''),
        NULLIF(raw_user_meta_data->>'full_name', ''),
        split_part(email, '@', 1)
    ) AS name,
    email,
    ''      AS password_hash,
    0       AS credits,
    FALSE   AS free_download_used,
    FALSE   AS first_upgrade_purchased,
    'free'  AS plan,
    created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ── 4. Cria índices se não existirem ──────────────────────────────────
CREATE INDEX IF NOT EXISTS users_email_idx        ON public.users (email);
CREATE INDEX IF NOT EXISTS projects_user_id_idx   ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON public.projects (updated_at DESC);
CREATE INDEX IF NOT EXISTS payments_user_id_idx   ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS credit_history_user_id_idx ON public.credit_history (user_id);

-- ── Verificação: quantos usuários foram sincronizados? ─────────────────
SELECT COUNT(*) AS total_usuarios FROM public.users;
