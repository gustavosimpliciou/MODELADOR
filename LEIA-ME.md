# ACAB + Performance — Arquivos atualizados

## Planejamento
Ver `PROMPT_ENGENHARIA.md` (diagnóstico, arquitetura, critérios de aceite).

## O que mudou

### Performance (FPS / orbit)
- `viewport-3d.tsx`: `frameloop="demand"` + `dpr={[1,1.25]}` + `invalidate` no OrbitControls
- `model-renderer.tsx`: selector granular + isolamento em modo ACAB (menos draw calls)

### ACAB sem travar ao trocar peça
- Não faz N× `updatePart` (só `mesh.visible` local)
- Cancela debounce/preview anterior
- Clone da geometria em `requestIdleCallback`
- Debounce de preview 280ms

### Qualidade do acabamento
- Novo **micro-fillet** na fronteira do corte (`applyEdgeRefine`)
- Depois Taubin localizado
- Fallback por curvatura se região de corte não for detectada

## Onde copiar no repositório

```
cortes/lib/acabamento.ts                         ← substituir
cortes/components/layout/acab-panel.tsx          ← substituir
cortes/components/layout/left-panel.tsx          ← substituir (se ainda não)
cortes/components/viewport/model-renderer.tsx    ← substituir
cortes/components/viewport/viewport-3d.tsx       ← substituir

store.ts:  adicionar 'acab' no type Tool  (ver lib/store.PATCH.ts)
page.tsx:  <AcabPanel />  (ver app/page.snippet.tsx)
```

## Teste rápido
1. Orbitar modelo → FPS deve subir vs. always-loop
2. Cortar → ACAB → popup centro inferior
3. PREMIUM + subir Suavização → borda do corte mais limpa
4. Trocar peça no painel direito → UI responde na hora (sem freeze)
5. Cancelar restaura; Aplicar persiste
