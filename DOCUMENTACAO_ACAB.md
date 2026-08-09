# ACAB — Documentação Técnica Completa

## Visão geral

O **ACAB** é uma etapa intermediária entre CORTE e SLICING que refina **somente** a região gerada pelo corte, de forma sutil e controlada. Não é um smooth global.

Fluxo:

```
MODELO → CORTE → PARTS → seleciona 1 peça → ACAB → geometria final → SLICING
```

---

## 1. Como a região de corte foi identificada

`identifyCutRegion()` em `lib/acabamento.ts` usa 4 estratégias em ordem:

| Prioridade | Método | Quando |
|---|---|---|
| A | **tagged** | `Part.cutFaceIndices` gravado no momento do corte (recomendado) |
| B | **planar-cap** | Detecta região coesa de faces com normals alinhados (dot > 0.97), coplanares, área entre 1%–55% da superfície |
| C | **boundary-expand** | Arestas de borda (edge count = 1) — malhas ainda abertas |
| D | **fallback-none** | Nenhuma região → máscara zerada → geometria intocada |

O método B é o principal para peças já tampadas pelo pipeline de cap existente.

---

## 2. Como a máscara de influência funciona

1. Vértices da região de corte recebem peso `1.0`
2. `expandInfluenceMask()` faz BFS na conectividade da malha
3. Distância geodésica aproximada até `radiusMm`
4. Falloff **smoothstep** (suave nas bordas da máscara)
5. Se `preserveDetails`: curvatura local reduz o peso em vértices de alto detalhe

Resultado: `Float32Array` de pesos 0..1 por vértice.  
Peso ≈ 0 → **vértice nunca se move**.

---

## 3. Algoritmo de suavização

**Taubin smoothing ponderado** (λ / μ alternados):

- λ ≈ `+0.33 × intensity`
- μ ≈ `−0.34 × intensity`
- Iterações controladas (1–4, default 1–2)

Por que Taubin e não Laplacian puro?
- Laplacian encolhe a superfície
- Taubin (passo negativo) compensa o shrinkage

Cada deslocamento é multiplicado pelo **peso da máscara**.  
Vértices fora da máscara são restaurados byte-a-byte ao original no final.

---

## 4. Como impede alteração fora da região

1. Máscara com pesos zero fora da faixa de influência
2. Passes de smooth só aplicam delta onde `weight > ε`
3. **Restauração forçada**: após todos os passes, qualquer vértice com `weight < 1e-4` recebe exatamente a posição original
4. Limites hard de intensity (≤ 70%) e radius (≤ 1.5 mm)

---

## 5. Como o preview funciona

- Snapshot do geometry original é clonado ao selecionar a peça
- Mudanças de slider disparam preview com **debounce 180 ms**
- Processamento via `requestIdleCallback` / `setTimeout(0)` para não bloquear o frame
- Preview aplica a geo resultante **temporariamente** na mesh da peça
- Toggle "Ver original / Ver acabamento" alterna entre snapshot e preview
- Cancelar descarta preview e restaura original

---

## 6. Processamento assíncrono

Versão atual:
- Debounce + idle callback no main thread (seguro para peças típicas de miniatura)

Próxima evolução (já prevista na arquitetura modular):
- Mover `runAcabamento` para Web Worker transferindo `positions` / `indices` / `weights` como ArrayBuffers

O núcleo em `acabamento.ts` é **puro** (sem DOM/Three objects além de BufferGeometry), facilitando a portagem.

---

## 7. Como o original é preservado

```
Seleciona peça
   ↓
originalGeoRef = geometry.clone()   ← nunca mutado
   ↓
preview opera em clones
   ↓
Cancelar → mesh.geometry = originalGeoRef
Aplicar  → mesh.geometry = preview.clone() + pushHistory()
```

O original só é descartado **depois** de APLICAR (e mesmo assim o histórico permite undo).

---

## 8. Undo / Redo

- Antes de APLICAR: `pushHistory()` grava snapshot completo do store (incluindo `parts`)
- O sistema de history já existente no `store.ts` cobre undo/redo (Ctrl+Z)
- ACAB registra entrada `'ACAB'` em `part.cutHistory`

---

## 9. Validação após acabamento

`validateGeometry()` verifica:

- Triângulos degenerados (área ≈ 0 ou índices iguais)
- Valores NaN/Infinity
- Variação de volume > 2.5% → **rejeita**
- Arestas non-manifold (count > 2)

Se inválido: preview não aplica, mostra mensagem:
> "Não foi possível aplicar este acabamento com segurança. Reduza a intensidade ou o raio."

---

## 10. Limites de segurança

| Parâmetro | Min | Max | Default Premium |
|---|---|---|---|
| Intensidade | 0% | **70%** | 28% |
| Raio | 0.05 mm | **1.50 mm** | 0.30 mm |
| Iterações | 1 | **4** | 2 |
| Δ volume máximo | — | **2.5%** | — |

---

## 11. Proteção de performance

- **Uma peça por vez** — demais ocultas (`visible: false`), fora do processamento
- Só a peça ativa entra em `runAcabamento`
- Debounce de preview
- Idle scheduling
- Dispose de geometrias de preview anteriores
- Sem smooth global, sem recalcular todas as peças

---

## 12. Arquivos modificados / criados

### Novos
| Arquivo | Função |
|---|---|
| `cortes/lib/acabamento.ts` | Núcleo: identificação, máscara, Taubin, validação, presets |
| `cortes/components/layout/acab-panel.tsx` | UI do painel ACAB |
| `cortes/components/layout/left-panel.tsx` | Versão com botão ACAB |
| `cortes/PATCHES.md` | Guia de integração no store/page |
| `DOCUMENTACAO_ACAB.md` | Este documento |

### A editar no repo existente
| Arquivo | Mudança |
|---|---|
| `lib/store.ts` | Adicionar `'acab'` ao type `Tool` |
| `app/page.tsx` | `<AcabPanel />` |
| `lib/parts-manager.ts` | (opcional) `cutFaceIndices?: number[]` |

---

## 13. Como testar

### Modelo simples (cubo / esfera cortada por plano)
1. Importar STL simples
2. Plane Cut no meio
3. Entrar em **ACAB** → selecionar uma metade
4. Preset **SUTIL** → deve notar suavização mínima na face do corte
5. Alternar original/acabamento
6. Aplicar → undo (Ctrl+Z) deve reverter

### Modelo complexo (miniatura com detalhes)
1. SmartCut ou AutoCut gerando várias peças
2. ACAB em uma peça só — verificar que outras somem do viewport
3. **PREMIUM** vs **SUAVE** — Suave mais visível, sem derreter olhos/acessórios
4. Subir intensity ao máximo (70%) + radius alto → validação de volume deve bloquear se exagerar

### Múltiplas peças
1. Cortar em 4+ partes
2. ACAB peça 02 → aplicar
3. ACAB peça 04 → aplicar
4. Confirmar que peça 02 permanece com acabamento e peça 01/03 intactas

### Casos de borda
- Entrar em ACAB sem peças → botão desabilitado
- Peça sem região de corte detectável → status "Nenhuma região…" e geometria inalterada
- Cancelar no meio do preview → original restaurado + todas peças visíveis de novo

---

## Princípio final

> **MENOS É MAIS.**  
> Na dúvida entre alterar muito ou pouco → sempre pouco.  
> O ACAB refina o **corte**, não remodela a peça.
