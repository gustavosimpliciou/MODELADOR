-- ──────────────────────────────────────────────────────────────────────
-- Central de atividades — log unificado de uso da ferramenta
-- Execute no Supabase: Dashboard → SQL Editor → New query → Run
--
-- Registra o que cada usuário faz no modelador (Studio) e na ferramenta
-- de corte (Cortes): login, logout, upload, download/export (e tentativas),
-- cortes gerados e upgrades. Consultado pelo Dashboard ADM.
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_events (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     TEXT,
    user_name   TEXT,
    user_email  TEXT,
    tool        TEXT        NOT NULL DEFAULT 'cortes',  -- 'cortes' | 'studio'
    event       TEXT        NOT NULL,                   -- login | logout | upload | download | download_attempt | cut_created | upgrade
    details     JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A inserção é feita pelo cliente (anon key) e a consulta pelo Dashboard
-- ADM (service key via Netlify Function). RLS desativado segue o padrão
-- das demais tabelas do projeto.
ALTER TABLE public.user_events DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS user_events_created_at_idx
    ON public.user_events (created_at DESC);

CREATE INDEX IF NOT EXISTS user_events_user_idx
    ON public.user_events (user_name, user_email);

CREATE INDEX IF NOT EXISTS user_events_event_idx
    ON public.user_events (event);
