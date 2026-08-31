# Checklist de Migrações do Banco de Dados (Supabase)

## ⚠️ Execute estes SQLs no Supabase SQL Editor ANTES de testar pagamentos

Acesse: https://supabase.com/dashboard/project/blqvsglspdayrznnbzzf/sql/new

---

## 1. Tabelas Base (setup_tables.sql) — **OBRIGATÓRIO**
```sql
-- Copie e cole o conteúdo de backend/setup_tables.sql
-- Cria: users, projects, payments, credit_history
-- Desabilita RLS (controlado pelo backend)
```

---

## 2. Tabela de Eventos (setup_events_table.sql) — **OBRIGATÓRIO**
```sql
-- Copie e cole o conteúdo de backend/setup_events_table.sql
-- Cria: user_events (para dashboard ADM)
-- Desabilita RLS
```

---

## 3. Coluna de Expiração de Créditos (add_credit_expiry.sql) — **CRÍTICO PARA PAGAMENTOS**
```sql
-- Copie e cole o conteúdo de backend/add_credit_expiry.sql
-- Adiciona: credits_expires_at na tabela users
-- Backfill para usuários que já pagaram
-- Índice para performance
```

**SEM ESTA MIGRAÇÃO:** O webhook falhará ao tentar salvar `credits_expires_at` e os créditos não serão creditados!

---

## 4. Correção RLS + Sync Users (fix_rls_and_sync_users.sql) — **RECOMENDADO**
```sql
-- Copie e cole o conteúdo de backend/fix_rls_and_sync_users.sql
-- Garante RLS desabilitado em todas as tabelas
-- Sincroniza usuários do Supabase Auth → public.users
-- Cria índices necessários
```

---

## 5. Tabela de Projetos (setup_projects_table.sql) — Se não fez o #1
```sql
-- Copie e cole o conteúdo de backend/setup_projects_table.sql
-- Cria tabela projects com índices
```

---

## Ordem de Execução Recomendada

1. `setup_tables.sql` (cria todas as tabelas base)
2. `setup_events_table.sql` (cria user_events)
3. `add_credit_expiry.sql` (**ESSENCIAL para webhook funcionar**)
4. `fix_rls_and_sync_users.sql` (corrige RLS e sincroniza usuários existentes)
5. `setup_projects_table.sql` (se projects não foi criado no #1)

---

## Verificação Pós-Migração

Execute no SQL Editor:

```sql
-- Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Deve incluir: credits_expires_at | timestamp with time zone | YES | NULL

-- Verificar se RLS está desabilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'payments', 'credit_history', 'user_events', 'projects');

-- rowsecurity deve ser 'f' (false) para todas

-- Verificar usuários sincronizados
SELECT count(*) as total_users FROM public.users;

-- Verificar pagamentos órfãos (para debug)
SELECT * FROM public.payments WHERE status = 'paid_user_not_found' ORDER BY created_at DESC;
```

---

## Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `column credits_expires_at does not exist` | Migração #3 não rodou | Execute `add_credit_expiry.sql` |
| `permission denied for table users` | RLS habilitado | Execute `fix_rls_and_sync_users.sql` |
| `duplicate key value violates unique constraint` | Tentando inserir user_id duplicado | Usuário já existe, não é erro |
| Webhook retorna 500 | Coluna faltando ou RLS bloqueando | Execute migrações #3 e #4 |