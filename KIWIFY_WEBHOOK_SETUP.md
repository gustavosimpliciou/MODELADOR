# Configuração do Webhook Kiwify — Passo a Passo

## ⚠️ CONFIGURAÇÃO CRÍTICA — Sem isso, pagamentos não creditam usuários

---

## 1. Gere o Token Secreto

Execute no terminal (PowerShell, Git Bash, ou terminal do VS Code):

```bash
# Opção 1: OpenSSL (Linux/Mac/Git Bash)
openssl rand -hex 32

# Opção 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opção 3: Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**Copie o token gerado** — você vai usar em 3 lugares:
1. Netlify Environment Variables → `KIWIFY_WEBHOOK_TOKEN`
2. Backend `.env` → `KIWIFY_WEBHOOK_TOKEN`
3. Painel da Kiwify → URL do webhook

---

## 2. Configure no Netlify

**Acesse:** Netlify Dashboard → Seu Site → Site Settings → Environment Variables

Adicione estas 4 variáveis:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://blqvsglspdayrznnbzzf.supabase.co` |
| `SUPABASE_KEY` | `sua_service_role_key_do_supabase` |
| `SUPABASE_SERVICE_KEY` | `sua_service_role_key_do_supabase` (mesmo valor acima) |
| `KIWIFY_WEBHOOK_TOKEN` | `SEU_TOKEN_GERADO_NO_PASSO_1` |

**Importante:** Após adicionar, faça **novo deploy** (Deploy → Trigger deploy → Clear cache and deploy).

---

## 3. Configure no Painel da Kiwify

**Acesse:** https://app.kiwify.com.br → Seu Produto → Configurações → Webhooks

### URL do Webhook (Produção - Netlify)
```
https://SEU_SITE.netlify.app/api/webhook/kiwify?token=SEU_TOKEN_GERADO_NO_PASSO_1
```

**Substitua:**
- `SEU_SITE.netlify.app` → seu domínio real do Netlify
- `SEU_TOKEN_GERADO_NO_PASSO_1` → o token que você gerou

### Eventos para assinar (marque TODOS):
- ✅ `order_approved` (pedido aprovado)
- ✅ `payment_approved` (pagamento aprovado)
- ✅ `order_paid` (pedido pago)
- ✅ `order_completed` (pedido completado)

### Método HTTP:
- **POST** (padrão)

### Timeout:
- 30 segundos (padrão)

---

## 4. Teste o Webhook

### Opção A: Botão "Testar" no painel da Kiwify
1. No painel da Kiwify, na configuração do webhook, clique em **"Testar"**
2. Verifique os logs no Netlify: Functions → kiwify → Logs
3. Deve retornar: `{"ok":true,"ignored":true,"order_status":"test","event_type":"test"}`

### Opção B: Compra real de teste (RECOMENDADO)
1. Faça uma compra de teste (PIX de R$ 0,01 se possível, ou use cartão de teste)
2. Complete o pagamento
3. Verifique nos logs do Netlify:
   ```
   Kiwify webhook: usuário resolvido via tracking_user_id (email=..., tracked=USER_ID, order=...)
   Kiwify: +200 créditos / plano easy user=USER_ID via=tracking_user_id (order=ORDER_ID)
   ```

---

## 5. Verifique se Funcionou

### No Dashboard ADM (admin):
1. Acesse `/admin` no seu site
2. Vá em **Estatísticas** → **Pagamentos Recentes**
3. Deve aparecer a compra com:
   - Usuário correto (nome/email)
   - Valor em reais
   - Status: `paid` ou `approved`

### No banco de dados (Supabase):
```sql
-- Ver pagamentos recentes
SELECT * FROM public.payments ORDER BY created_at DESC LIMIT 10;

-- Ver créditos do usuário
SELECT id, name, email, credits, plan, credits_expires_at 
FROM public.users 
WHERE email = 'email_do_comprador@teste.com';

-- Ver histórico de créditos
SELECT * FROM public.credit_history 
WHERE user_id = 'USER_ID_DO_COMPRADOR' 
ORDER BY created_at DESC;
```

---

## 6. Troubleshooting Rápido

| Problema | Causa | Solução |
|----------|-------|---------|
| `401 Token inválido` | Token diferente no Netlify vs Kiwify | Copie o MESMO token nos 2 lugares |
| `usuário não encontrado` | Checkout não passou `src=USER_ID` | Atualize o frontend (build + deploy) |
| Créditos não sobem | Webhook falhou silenciosamente | Veja logs Netlify Functions → kiwify |
| Dashboard ADM vazio | `SUPABASE_SERVICE_KEY` não configurado no Netlify | Adicione a variável e re-deploy |
| `unrecognized_product` | Nome do produto na Kiwify não contém "easy"/"medium"/"premium" | Renomeie produto na Kiwify ou ajuste `detectPlan` |

---

## 7. URLs de Webhook por Ambiente

| Ambiente | URL Base | Webhook Completo |
|----------|----------|------------------|
| **Produção (Netlify)** | `https://SEU_SITE.netlify.app` | `https://SEU_SITE.netlify.app/api/webhook/kiwify?token=TOKEN` |
| **Preview (Netlify)** | `https://deploy-preview-XX--SEU_SITE.netlify.app` | `https://deploy-preview-XX--SEU_SITE.netlify.app/api/webhook/kiwify?token=TOKEN` |
| **Local (ngrok)** | `https://XXXX.ngrok-free.app` | `https://XXXX.ngrok-free.app/api/webhook/kiwify?token=TOKEN` |
| **Backend Local** | `http://localhost:8000` | `http://localhost:8000/api/webhook/kiwify?token=TOKEN` |

---

## 8. Checklist Final

- [ ] Token gerado e salvo em local seguro
- [ ] `KIWIFY_WEBHOOK_TOKEN` no Netlify = Token gerado
- [ ] `KIWIFY_WEBHOOK_TOKEN` no backend `.env` = Token gerado
- [ ] `SUPABASE_KEY` (service_role) no Netlify
- [ ] `SUPABASE_SERVICE_KEY` no Netlify (mesmo valor)
- [ ] Webhook URL na Kiwify aponta para Netlify + `?token=TOKEN`
- [ ] Eventos `order_approved`, `payment_approved`, `order_paid` assinados
- [ ] Deploy feito após configurar variáveis
- [ ] Teste de compra real realizado
- [ ] Créditos subiram na conta do usuário
- [ ] Dashboard ADM mostra a compra
- [ ] Histórico de créditos (`credit_history`) tem registro `purchase`

---

## ⚠️ IMPORTANTE: O Checkout DEVE passar o USER_ID

O frontend **já foi corrigido** para adicionar `?src=USER_ID&sck=USER_ID` na URL do checkout.

**Verifique:** Abra o checkout no navegador e veja se a URL tem:
```
https://pay.kiwify.com.br/XXXXXX?src=abc123...&sck=abc123...&email=user@test.com&name=Nome
```

Se não tiver `src` e `sck` → o build não foi atualizado. Faça novo deploy!