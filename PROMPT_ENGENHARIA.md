# PROMPT DE ENGENHARIA — Performance + ACAB (Nativos CUT)

## Contexto do sistema
Aplicação Next.js 15 + React 19 + R3F + Three.js + Zustand para corte 3D de
malhas (STL/OBJ/PLY/GLB). Pipeline: import → seleção/corte → PARTS → ACAB → export/slice.

Sintomas reportados:
1. FPS ~15 e micro-stutters ao orbitar a peça
2. Travamento ao trocar de peça no painel direito enquanto `activeTool === 'acab'`
3. ACAB não aplica refinamento utilizável na região de corte
4. Necessidade de bordas de corte sutilmente arredondadas (fillet localizado)

## Objetivos mensuráveis
| Métrica | Alvo |
|---|---|
| Orbit idle/interact | ≥ 45–60 FPS em GPU integrada moderna |
| Troca de peça em ACAB | < 100 ms até UI responsiva; processamento async |
| Aplicar ACAB | Preview em < 300 ms para malhas ≤ 200k tris; nunca freeze da UI |
| Geometria | Manifold preservado; Δvolume ≤ 2.5%; só região de corte |

## Diagnóstico técnico

### A) FPS baixo no orbit
Causas prováveis:
- `Canvas frameloop="always"` → GPU sempre ativa
- Componentes assinando o store inteiro (`useAppStore()` sem selector)
- `invalidate()` em cascata a cada update de Part
- Wireframe overlay + múltiplos previews ativos
- `dpr` alto desnecessário em máquinas fracas

### B) Freeze ao trocar peça no ACAB
Causas:
- `isolatePart` chama `updatePart` N vezes (1 por peça) → N re-renders Zustand
- `geometry.clone()` síncrono de malha grande no main thread
- `runAcabamento` completo disparado imediatamente na troca
- Debounce anterior não cancelado (work empilhado)

### C) ACAB ineficaz
Causas:
- Detecção planar-cap pode falhar em tampas ruidosas pós-corte
- Intensidade/raio padrão podem ser baixos demais para percepção
- Falta etapa específica de **edge refine / micro-fillet** na fronteira do corte
- Sem fallback quando máscara fica vazia (usuário vê “nada acontece”)

## Arquitetura da solução

### 1. Performance de render (viewport)
1.1. `frameloop="demand"` + `invalidate()` apenas em:
     - pointer move em OrbitControls (start/change/end)
     - mudanças de geometria/seleção/preview
1.2. Selectors granulares em PartMesh / SmartCutInteraction
1.3. Em modo ACAB: renderizar só a peça ativa (já parcialmente feito via isolate)
1.4. Cap `dpr` em `[1, 1.25]` quando FPS < 30 (adaptive)

### 2. ACAB — fluxo sem bloqueio
```
setActivePartId(id)
  → cancel pending timers / AbortSignal
  → mesh.visible local (sem flood de updatePart)
  → snapshot geometry async (chunk / idle)
  → identifyCutRegion (leve)
  → NÃO rodar smooth até slider ou “PREMIUM” estável (debounce ≥ 200ms)
  → runAcabamento em requestIdleCallback / Worker
  → preview swap atômico
```

### 3. Geometria — edge refine profissional
Pipeline ACAB v2:
1. identifyCutRegion (tagged → planar-cap → boundary)
2. expandInfluenceMask (raio mm, falloff smoothstep, preserveDetails)
3. **edgeRefineBoundary** (NOVO):
   - extrai anel de arestas da fronteira da região de corte
   - para cada vértice de borda: deslocamento suave na bissetriz das normals
     adjacentes (micro-fillet), amplitude ∝ intensity × radiusMm
   - NÃO move vértices com weight≈0
4. Taubin ponderado (λ/μ) nas iterações restantes
5. preserveVolume (correção cúbica limitada)
6. validateGeometry (degenerate, NaN, non-manifold, ΔV)

Princípio: MENOS É MAIS — fillet sutil, contorno limpo, silhueta intacta.

### 4. Robustez UX
- Troca de peça: UI nunca espera o smooth
- Cancelar sempre restaura snapshot
- Aplicar: pushHistory + swap final
- Mensagens claras se região não detectada (ainda permite modo “borda aberta”)

### 5. Ordem de implementação
Fase 1 — ACAB não-bloqueante + edge refine (lib + panel)
Fase 2 — ModelRenderer selectors + visibility sem store flood
Fase 3 — Canvas demand frameloop + invalidate on controls
Fase 4 — Validação manual dos fluxos (orbit, troca peça, apply, cancel)

### 6. Critérios de aceite
- [ ] Orbit fluido sem micro-freeze perceptível
- [ ] Trocar peça no painel direito em ACAB não trava a UI
- [ ] Preview ACAB mostra borda de corte mais limpa/arredondada sutilmente
- [ ] Cancelar restaura original
- [ ] Aplicar persiste e undo via history funciona
- [ ] Sem regressão em PlaneCut / SmartCut

### 7. Fora de escopo (agora)
- Worker WASM completo
- Remesh global
- Fillet CAD exato (NURBS) — aproximação discreta é suficiente
