/**
 * PATCH para lib/store.ts — mudanças mínimas para o ACAB
 *
 * 1) Adicionar 'acab' no type Tool
 * 2) Garantir ação updatePart (se ainda não existir)
 *
 * NÃO substitua o store inteiro — aplique só estes trechos.
 */

// ═══════════════════════════════════════════════════════════════════
// 1. TYPE Tool  (procure a linha existente e altere)
// ═══════════════════════════════════════════════════════════════════
//
// ANTES:
//   export type Tool = 'select' | 'erase' | 'cut' | 'autosplit' | 'measure' | 'reset'
//
// DEPOIS:
export type Tool = 'select' | 'erase' | 'cut' | 'acab' | 'autosplit' | 'measure' | 'reset'


// ═══════════════════════════════════════════════════════════════════
// 2. Ação updatePart  (adicione na interface AppState e na implementação)
// ═══════════════════════════════════════════════════════════════════
//
// Na interface AppState (junto das outras ações de Partes):
//
//   updatePart: (id: string, updates: Partial<Part>) => void
//
// Na implementação do create(...):
//
//   updatePart: (id, updates) =>
//     set((state) => ({
//       parts: state.parts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
//     })),
//
// Se o seu store já tiver um método equivalente (ex: setPart / patchPart),
// altere o import no acab-panel.tsx para usar o nome correto.


// ═══════════════════════════════════════════════════════════════════
// 3. (Opcional) Estender Part em parts-manager.ts
// ═══════════════════════════════════════════════════════════════════
//
// export interface Part {
//   ...campos existentes...
//   cutFaceIndices?: number[]   // faces da tampa geradas no corte
// }
