-- ──────────────────────────────────────────────────────────────────────
-- Nativos Studio Pro — migração completa
-- Execute no Supabase: Dashboard → SQL Editor → New query → Run
-- ──────────────────────────────────────────────────────────────────────

-- ── Tabela de usuários ────────────────────────────────────────────────
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

-- O acesso é controlado pelo servidor FastAPI (service_role key).
-- Desabilitar RLS evita conflitos de política com o cliente supabase-py.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS users_email_idx
    ON public.users (email);

-- ── Tabela de projetos ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id         TEXT        PRIMARY KEY,
    user_id    TEXT        NOT NULL,
    name       TEXT        NOT NULL DEFAULT 'Projeto sem título',
    data       JSONB       NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS projects_user_id_idx
    ON public.projects (user_id);

CREATE INDEX IF NOT EXISTS projects_updated_at_idx
    ON public.projects (updated_at DESC);

-- ── Tabela de pagamentos (Kiwify) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
    id                     TEXT        PRIMARY KEY,
    user_id                TEXT,
    kiwify_transaction_id  TEXT UNIQUE,
    product                TEXT,
    value                  TEXT,
    status                 TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS payments_user_id_idx
    ON public.payments (user_id);

-- ── Tabela de histórico de créditos ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credit_history (
    id          TEXT        PRIMARY KEY,
    user_id     TEXT        NOT NULL,
    type        TEXT        NOT NULL,   -- 'purchase' | 'export' | 'free_download'
    credits     INTEGER     NOT NULL,   -- positivo (crédito) ou negativo (consumo)
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.credit_history DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS credit_history_user_id_idx
    ON public.credit_history (user_id);
