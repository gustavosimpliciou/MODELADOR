# Patch — AutoCut 4ª etapa: REFINAÇÃO DE CORTE

## Arquivos neste pacote

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `cortes/lib/cut-refinement.ts` | **NOVO** | Módulo isolado da etapa de refinação |
| `cortes/components/layout/smart-autocut-panel.tsx` | modificado | Integração no painel + slider de intensidade |
| `cortes/lib/store.ts` | modificado | Tipo `AutoCutPipelineStage` inclui `'refined'` |
| `cortes/lib/smartcut-pipeline.ts` | modificado | Apenas comentário documentando a 4ª etapa |

## Como aplicar

Na raiz do repositório:

```bash
# Opção 1 — copiar os arquivos
cp -r path/to/patch/cortes/* cortes/

# Opção 2 — a partir do tar.gz
tar -xzf autocut-refinement-patch.tar.gz -C /caminho/do/seu/repo
```

Depois:

```bash
cd cortes
# se usar pnpm/npm/yarn no frontend Cortes
pnpm install   # ou npm / yarn (não há deps novas)
```

## O que mudou no fluxo

```
Calcular Corte → Gerar Tampas → Aplicar Corte → [Refinação de Corte] → Resultado
```

- Intensidade **0** = OFF (comportamento idêntico ao anterior)
- Padrão = **18** (micro-acabamento sutil)
- Controle em: painel AutoCut → **Avançado** → **Refinação de Corte**

## O que NÃO foi alterado

- `computeOpenCut`
- `generateCaps`
- `addCapsToShell`
- Lógica principal de seleção / SmartCut / encaixes

A refinação é um pós-processador isolado.
