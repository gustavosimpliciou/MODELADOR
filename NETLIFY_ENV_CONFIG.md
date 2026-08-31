# Configuração de Variáveis de Ambiente no Netlify

## ⚠️ CRÍTICO: Configure estas variáveis no painel do Netlify ANTES de deployar

### Acesse: Netlify Dashboard → Seu Site → Site Settings → Environment Variables

---

## Variáveis Obrigatórias para Netlify Functions

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `SUPABASE_URL` | `https://blqvsglspdayrznnbzzf.supabase.co` | URL do projeto Supabase |
| `SUPABASE_KEY` | `sua_service_role_key` | **Service Role Key** do Supabase (Settings → API) |
| `SUPABASE_SERVICE_KEY` | `sua_service_role_key` | Mesmo valor que `SUPABASE_KEY` (usado pelo webhook) |
| `KIWIFY_WEBHOOK_TOKEN` | `abw1j1a77ay` | Token compartilhado com a Kiwify |

---

## Como obter as chaves:

### 1. Supabase Service Role Key
1. Acesse: https://supabase.com/dashboard/project/blqvsglspdayrznnbzzf/settings/api
2. Copie a **`service_role`** key (NÃO a `anon` key)
3. Cole em `SUPABASE_KEY` e `SUPABASE_SERVICE_KEY`

### 2. Kiwify Webhook Token
1. Gere um token aleatório forte (ex: `openssl rand -hex 32`)
2. Configure no painel da Kiwify:
   - Webhook URL: `https://SEU_DOMINIO_NETLIFY.netlify.app/api/webhook/kiwify?token=SEU_TOKEN_AQUI`
   - Eventos: `order_approved`, `payment_approved`, `order_paid`
3. Cole o mesmo token em `KIWIFY_WEBHOOK_TOKEN`

---

## Variáveis Opcionais (Frontend)

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `REACT_APP_BACKEND_URL` | `https://SEU_DOMINIO_NETLIFY.netlify.app` | URL do backend para chamadas de API |

---

## Checklist de Deploy

- [ ] `SUPABASE_URL` configurado
- [ ] `SUPABASE_KEY` (service_role) configurado
- [ ] `SUPABASE_SERVICE_KEY` configurado (mesmo valor)
- [ ] `KIWIFY_WEBHOOK_TOKEN` configurado
- [ ] Token IDÊNTICO configurado no painel da Kiwify
- [ ] Webhook URL na Kiwify aponta para: `https://SEU_DOMINIO.netlify.app/api/webhook/kiwify?token=SEU_TOKEN`
- [ ] Deploy feito após configurar as variáveis
- [ ] Teste de compra real verificado (creditos subiram + dashboard ADM atualizou)

---

## URLs dos Webhooks por Plataforma

### Netlify (Produção)
```
https://SEU_SITE.netlify.app/api/webhook/kiwify?token=SEU_TOKEN
```

### Vercel (se usado)
```
https://SEU_PROJETO.vercel.app/api/webhook/kiwify?token=SEU_TOKEN
```

### Backend Local (desenvolvimento)
```
http://localhost:8000/api/webhook/kiwify?token=SEU_TOKEN
```

---

## Testando o Webhook

Após configurar, use o botão "Testar webhook" no painel da Kiwify OU faça uma compra de teste (PIX de R$ 0,01 se possível).

Verifique nos logs do Netlify Functions:
1. Acesse: Netlify Dashboard → Functions → kiwify → Logs
2. Deve aparecer: `ok: true, credits_added: X, plan: Y, resolved_by: tracking_user_id`

Se aparecer `ignored: true, reason: 'usuário não encontrado'` → o `src`/`sck` não foi passado no checkout.

---

## Troubleshooting

### "Token inválido" (401)
- Token no Netlify ≠ Token na Kiwify
- Verifique se não há espaços extras

### "Usuário não encontrado"
- O frontend NÃO está passando `src=USER_ID` no checkout
- Verifique se o build atualizado foi deployado
- Teste: abra o checkout e veja se a URL tem `?src=...&sck=...`

### Créditos não sobem mas pagamento aparece no dashboard ADM
- Webhook processou mas falhou ao atualizar usuário
- Verifique logs do Netlify Function para erros de Supabase

### Dashboard ADM não mostra pagamentos
- Função `admin.js` não tem `SUPABASE_SERVICE_KEY`
- Verifique se a variável está no Netlify (não no frontend!)