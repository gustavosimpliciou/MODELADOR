# CORREÇÃO — Painel ACAB vazio / sem parâmetros

## O que aconteceu

O botão **ACAB** apareceu no menu lateral, mas o **painel com os parâmetros** não abriu.

Causa mais comum: faltou montar o `<AcabPanel />` no `page.tsx` e/ou adicionar `'acab'` no tipo `Tool` do store.

---

## Checklist (faça nesta ordem)

### 1. Arquivo do núcleo (obrigatório)
Copie para o projeto:
```
cortes/lib/acabamento.ts
cortes/components/layout/acab-panel.tsx
```

### 2. Store — adicione 'acab' no tipo Tool
Arquivo: `cortes/lib/store.ts`

Procure:
```ts
export type Tool = 'select' | 'erase' | 'cut' | 'autosplit' | 'measure' | 'reset'
```

Troque por:
```ts
export type Tool = 'select' | 'erase' | 'cut' | 'acab' | 'autosplit' | 'measure' | 'reset'
```

### 3. Page — monte o painel (OBRIGATÓRIO)
Arquivo: `cortes/app/page.tsx`

No topo, junto dos outros imports:
```tsx
import { AcabPanel } from '@/components/layout/acab-panel'
```

Dentro do `<div className="flex-1 relative overflow-hidden">`, junto dos outros painéis:
```tsx
<AcabPanel />
```

Exemplo:
```tsx
<div className="flex-1 relative overflow-hidden">
  <Viewport3D />
  <CutActions />
  <SmartAutoCutPanel />
  <EncaixePanel />
  <PlaneCutPanel />
  <AutoSplitPanel />
  <AcabPanel />   {/* ← ESTA LINHA */}
</div>
```

### 4. Left panel
Substitua ou confirme que o botão ACAB chama:
```tsx
setActiveTool('acab')
```

### 5. Reinicie o dev server
```bash
# pare o servidor (Ctrl+C) e suba de novo
pnpm dev
```

---

## O que você deve ver ao clicar em ACAB

Um painel flutuante à esquerda do viewport com:

- Seletor de peça
- Predefinições: **SUTIL · PREMIUM · SUAVE · PERSONALIZADO**
- Slider **Suavização** (0–70%)
- Slider **Raio de influência** (0.05–1.50 mm)
- Slider **Iterações** (1–4)
- Checkboxes: Preservar detalhes / Preservar volume
- Botões: Ver original · Cancelar · **Aplicar**

---

## Se ainda não aparecer

1. Abra o Console do browser (F12) e veja se há erro vermelho
2. Confirme que `activeTool` vira `'acab'` ao clicar (React DevTools ou um `console.log`)
3. Me envie o erro do console que eu corrijo na hora
