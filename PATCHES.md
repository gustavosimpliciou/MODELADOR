# ACAB — Guia de Integração

## Arquivos novos (copiar para o projeto)

```
cortes/lib/acabamento.ts
cortes/components/layout/acab-panel.tsx
```

## 1. `lib/store.ts`

### Tool type
```ts
// ANTES
export type Tool = 'select' | 'erase' | 'cut' | 'autosplit' | 'measure' | 'reset'

// DEPOIS
export type Tool = 'select' | 'erase' | 'cut' | 'acab' | 'autosplit' | 'measure' | 'reset'
```

### Garantir que existe `updatePart`
O store já possui atualização de partes via algo como:
```ts
updatePart: (id, updates) => set((state) => ({
  parts: state.parts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
})),
```
Se o nome for diferente (`setPart`, etc.), alinhar no `acab-panel.tsx`.

## 2. `components/layout/left-panel.tsx`

Adicionar import do ícone e a ferramenta ACAB:

```tsx
import { MousePointerClick, Scissors, Sparkles, RotateCcw } from 'lucide-react'

// Dentro do array tools:
const tools = [
  { id: 'select' as Tool, icon: <MousePointerClick className="w-4 h-4" />, label: 'Smart', description: t.tool_smart_desc },
  { id: 'cut' as Tool,    icon: <Scissors className="w-4 h-4" />,          label: 'Corte',  description: t.tool_cut_desc },
  { id: 'acab' as Tool,   icon: <Sparkles className="w-4 h-4" />,          label: 'Acab',   description: 'Acabamento do contorno de corte' },
]
```

Manter o mesmo `ToolButton` e estilo. Desabilitar ACAB quando `parts.length < 1` (ou `< 2` se a peça original conta).

## 3. `app/page.tsx`

```tsx
import { AcabPanel } from '@/components/layout/acab-panel'

// Dentro do viewport container, junto dos outros painéis:
<AcabPanel />
```

## 4. `lib/parts-manager.ts` (opcional, recomendado)

Estender a interface `Part` para gravar faces de corte no futuro:

```ts
export interface Part {
  // ...campos existentes
  /** Faces geradas pelo último corte (cap) — usadas pelo ACAB. */
  cutFaceIndices?: number[]
}
```

Quando o pipeline de corte aplicar caps, popular `cutFaceIndices` com os índices das faces da tampa. Isso torna a identificação da região **exata** (método `tagged`).

## 5. Viewport — fit camera (opcional)

No `viewport-3d.tsx`, escutar:

```ts
useEffect(() => {
  const handler = (e: CustomEvent<{ partId: string }>) => {
    const part = useAppStore.getState().parts.find(p => p.id === e.detail.partId)
    if (!part || !controlsRef.current) return
    const box = new THREE.Box3().setFromObject(part.mesh)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3()).length()
    // animar camera.position e controls.target em direção ao center
  }
  window.addEventListener('acab:fit-part', handler as any)
  return () => window.removeEventListener('acab:fit-part', handler as any)
}, [])
```

## 6. Highlight da região (opcional, fase 2)

Usar `buildMaskPreviewGeometry` / `buildBoundaryLineGeometry` de `acabamento.ts` no viewport quando `activeTool === 'acab'`.
