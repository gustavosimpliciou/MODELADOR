-- ──────────────────────────────────────────────────────────────────────
-- Projetos salvos da ferramenta de cortes (até 2 por usuário)
-- Execute no Supabase: Dashboard → SQL Editor → New query → Run
--
-- Guarda o estado completo do projeto (partes, cortes, encaixes) em JSONB.
-- O limite de 2 salvamentos é imposto no cliente (cortes/lib/projects.ts).
-- ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cut_projects (
    id         TEXT        PRIMARY KEY,
    user_id    TEXT        NOT NULL,
    name       TEXT        NOT NULL DEFAULT 'Projeto sem título',
    data       JSONB       NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cut_projects DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS cut_projects_user_id_idx
    ON public.cut_projects (user_id);