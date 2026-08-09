# POR QUE O PAINEL NÃO APARECIA

Na sua captura o botão **ACAB** está laranja (ativo), mas o popup não existe
na tela. Isso só acontece por um motivo:

  → O componente <AcabPanel /> NÃO está montado no page.tsx

O botão do menu lateral só muda `activeTool` para `'acab'.
Quem DESENHA o popup é o <AcabPanel />. Sem ele no JSX, nada aparece.

═══════════════════════════════════════════════════════════════
FAÇA EXATAMENTE ISTO (3 passos, 2 minutos)
═══════════════════════════════════════════════════════════════

### PASSO 1 — store.ts
Arquivo: cortes/lib/store.ts

Procure a linha:
  export type Tool = 'select' | 'erase' | 'cut' | ...

Mude para incluir acab:
  export type Tool = 'select' | 'erase' | 'cut' | 'acab' | 'autosplit' | 'measure' | 'reset'

### PASSO 2 — page.tsx  ★ O MAIS IMPORTANTE ★
Arquivo: cortes/app/page.tsx

A) No topo, com os outros imports, adicione:
   import { AcabPanel } from '@/components/layout/acab-panel'

B) Dentro do div do viewport (onde já estão PlaneCutPanel, AutoSplitPanel…),
   adicione a linha:

   <AcabPanel />

Fica assim:

   <div className="flex-1 relative overflow-hidden">
     <Viewport3D />
     <CutActions />
     <SmartAutoCutPanel />
     <EncaixePanel />
     <PlaneCutPanel />
     <AutoSplitPanel />
     <AcabPanel />          ← ESTA LINHA É OBRIGATÓRIA
   </div>

### PASSO 3 — copiar os 2 arquivos
  cortes/lib/acabamento.ts
  cortes/components/layout/acab-panel.tsx

Reinicie: pnpm dev

═══════════════════════════════════════════════════════════════
COMO FICA QUANDO FUNCIONA
═══════════════════════════════════════════════════════════════

Ao clicar ACAB, um popup aparece no CENTRO INFERIOR da tela
(mesmo lugar/estilo do painel de Corte), com:

  • Seletor de peça
  • SUTIL | PREMIUM | SUAVE | CUSTOM
  • Slider Suavização (%)
  • Slider Raio do contorno (mm)
  • Slider Iterações
  • Preservar detalhes / volume
  • Botões: Orig · Cancelar · Aplicar

Arraste pelo cabeçalho. Minimize com −. Feche com X.

═══════════════════════════════════════════════════════════════
SE AINDA NÃO APARECER
═══════════════════════════════════════════════════════════════

1. F12 → Console → copie qualquer erro vermelho
2. Confirme no page.tsx que <AcabPanel /> existe (Ctrl+F)
3. Confirme que o import não tem typo no caminho
