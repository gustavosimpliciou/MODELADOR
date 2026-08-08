# Patch — AutoCut PREMIUM Cut Refinement (4ª etapa)

## O que mudou

Refinação **premium** das bordas do corte:

1. **Fairing + Catmull-Rom** no contorno → elimina dentes de serra
2. **Micro-fillet real** (1–2 anéis de faces com perfil arredondado)
3. **Taubin restrito** na faixa da borda → shading contínuo
4. **safeRadius adaptativo** — nunca deforma encaixes/detalhes finos

## Arquivos

| Arquivo | Ação |
|---------|------|
| `cortes/lib/cut-refinement.ts` | **NOVO / reescrito** — algoritmo premium |
| `cortes/components/layout/smart-autocut-panel.tsx` | Integração no preview + apply + slider |
| `cortes/lib/store.ts` | Stage `'refined'` |
| `cortes/lib/smartcut-pipeline.ts` | Só documentação |

## Como aplicar

Na raiz do repo MODELADOR:

```bash
tar -xzf autocut-refinement-patch.tar.gz
```

## Uso

Painel AutoCut → **Avançado** → **Refinação de Corte**

- **0** = OFF (comportamento antigo)
- **~40** = padrão premium (recomendado)
- **70+** = mais arredondado (sempre limitado pelo safeRadius)

A refinação roda:
- Após **Gerar Tampas** (aparece no preview)
- De novo no **Aplicar** (garante resultado final)

## O que NÃO foi alterado

- Seleção / SmartCut (continua fluida)
- `computeOpenCut` / `generateCaps` / algoritmo de corte
- Encaixes / lógica de planos
