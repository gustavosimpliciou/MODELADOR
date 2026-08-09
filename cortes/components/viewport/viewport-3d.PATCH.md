# Patch mínimo em viewport-3d.tsx (performance)

## 1. Canvas: demand frameloop + dpr conservador

Procure:
```tsx
<Canvas
  frameloop="always"
  ...
  dpr={[1, 1.5]}
```

Substitua por:
```tsx
<Canvas
  frameloop="demand"
  ...
  dpr={[1, 1.25]}
```

## 2. OrbitControls: invalidate a cada mudança

Procure o `<OrbitControls ... />` e adicione handlers:

```tsx
import { invalidate } from '@react-three/fiber' // se ainda não importado

<OrbitControls
  ref={controlsRef}
  makeDefault
  enableDamping
  dampingFactor={0.08}
  onStart={() => invalidate()}
  onChange={() => invalidate()}
  onEnd={() => invalidate()}
  // ...demais props existentes
/>
```

## 3. SmartCutInteraction (opcional mas recomendado)

Evite `const { ... } = useAppStore()` sem selector.
Prefira seletores individuais:
```tsx
const modelMesh = useAppStore(s => s.modelMesh)
const activeTool = useAppStore(s => s.activeTool)
// etc.
```

Isso evita re-render a cada FPS update (`setFps`).
