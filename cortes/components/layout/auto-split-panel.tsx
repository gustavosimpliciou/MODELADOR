"use client"

import { useState } from 'react'
import { Wand2, ScanLine, Boxes, Pin } from 'lucide-react'
import * as THREE from 'three'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'
import { useAppStore } from '@/lib/store'
import {
  planAutoSplit,
  performSplit,
  makePinPositions,
  type SplitAxis,
} from '@/lib/auto-split'
import { cn } from '@/lib/utils'

const AXES: { id: SplitAxis | 'auto'; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'x', label: 'X' },
  { id: 'y', label: 'Y' },
  { id: 'z', label: 'Z' },
]

// Paleta para distinguir as peças no modo explodido (sem roxo/violeta)
const PALETTE = ['#ff6600', '#00b4d8', '#43aa8b', '#f9c74f', '#ef476f', '#4d96ff', '#f3722c', '#90be6d']

export function AutoSplitPanel() {
  const {
    activeTool,
    modelMesh,
    modelInfo,
    autoSplitPlan,
    setAutoSplitPlan,
    setModelMesh,
    setModelInfo,
    addCutPart,
    setStatus,
    pushHistory,
    clearSelection,
  } = useAppStore()

  const [axis, setAxis] = useState<SplitAxis | 'auto'>('auto')
  const [maxCuts, setMaxCuts] = useState(3)
  const [sensitivity, setSensitivity] = useState(0.5)
  const [usePins, setUsePins] = useState(true)
  const [pinDiameter, setPinDiameter] = useState(4)
  const [pinDepth, setPinDepth] = useState(6)
  const [pinTolerance, setPinTolerance] = useState(0.15)
  const [pinCount, setPinCount] = useState(2)
  const [spacing, setSpacing] = useState(0.25)
  const [busy, setBusy] = useState(false)

  if (activeTool !== 'autosplit' || !modelMesh) return null

  const handleAnalyze = () => {
    if (!modelMesh) return
    setBusy(true)
    setStatus('selecting', 'Analisando geometria — buscando seções mínimas...')
    setTimeout(() => {
      try {
        const geo = modelMesh.geometry as THREE.BufferGeometry
        const plan = planAutoSplit(geo, { axis, maxCuts, sensitivity })
        setAutoSplitPlan(plan)
        const n = plan.cuts.length
        setStatus(
          'loaded',
          n > 0
            ? `${n} corte(s) sugerido(s) no eixo ${plan.axis.toUpperCase()} — revise e execute`
            : 'Nenhum pescoço encontrado. Aumente a sensibilidade.',
        )
      } catch (err) {
        console.log('[v0] Erro na análise Auto Split:', (err as Error).message)
        setStatus('error', 'Falha ao analisar a geometria.')
      } finally {
        setBusy(false)
      }
    }, 40)
  }

  const handleExecute = () => {
    if (!modelMesh) return
    setBusy(true)
    pushHistory()
    setStatus('cutting', 'Dividindo modelo e gerando pinos de alinhamento...')

    setTimeout(() => {
      try {
        const geo = modelMesh.geometry as THREE.BufferGeometry
        const plan = autoSplitPlan ?? planAutoSplit(geo, { axis, maxCuts, sensitivity })

        if (plan.cuts.length === 0) {
          setStatus('error', 'Nenhum corte sugerido. Ajuste a sensibilidade e analise novamente.')
          setBusy(false)
          return
        }

        const pieces = performSplit(geo, plan)
        if (pieces.length < 2) {
          setStatus('error', 'Não foi possível dividir — os planos não interceptam o sólido.')
          setBusy(false)
          return
        }

        const normal = new THREE.Vector3(plan.normal[0], plan.normal[1], plan.normal[2])
        const sortedCuts = [...plan.cuts].sort((a, b) => a.coord - b.coord)

        // ── Pinos de alinhamento (furos via CSG + dowel separado) ──────────
        const dowels: { pos: THREE.Vector3; quat: THREE.Quaternion; radius: number; height: number }[] = []
        let pinsOk = true

        if (usePins) {
          try {
            const evaluator = new Evaluator()
            evaluator.attributes = ['position', 'normal']
            const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
            const rHole = pinDiameter / 2 + pinTolerance
            const rDowel = pinDiameter / 2
            const holeH = pinDepth * 2 + Math.max(pinDepth * 0.2, 0.5)
            const dowelH = pinDepth * 2 - 0.4

            for (let k = 0; k < sortedCuts.length && k + 1 < pieces.length; k++) {
              const cut = sortedCuts[k]
              const positions = makePinPositions(plan, cut, pinCount)

              for (const p of positions) {
                const holeGeo = new THREE.CylinderGeometry(rHole, rHole, holeH, 28)
                holeGeo.deleteAttribute('uv')
                const holeBrush = new Brush(holeGeo)
                holeBrush.position.copy(p)
                holeBrush.quaternion.copy(quat)
                holeBrush.updateMatrixWorld()

                // Subtrai o furo das duas peças adjacentes (k e k+1)
                for (const pi of [k, k + 1]) {
                  const pieceBrush = new Brush(pieces[pi])
                  pieceBrush.updateMatrixWorld()
                  const out = evaluator.evaluate(pieceBrush, holeBrush, SUBTRACTION)
                  pieces[pi] = out.geometry
                }

                dowels.push({ pos: p.clone(), quat: quat.clone(), radius: rDowel, height: dowelH })
                holeGeo.dispose()
              }
            }
          } catch (err) {
            console.log('[v0] CSG de pinos falhou, seguindo sem furos:', (err as Error).message)
            pinsOk = false
          }
        }

        // ── Monta as peças no viewport (base fica como modelo principal) ────
        const geoBox = new THREE.Box3().setFromBufferAttribute(
          geo.getAttribute('position') as THREE.BufferAttribute,
        )
        const size = new THREE.Vector3()
        geoBox.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        const spread = maxDim * spacing

        pieces.forEach((g) => {
          g.computeVertexNormals()
          g.computeBoundingBox()
          g.computeBoundingSphere()
        })

        // Peça 0 (base) → modelo principal
        const mainMat = (modelMesh.material as THREE.MeshStandardMaterial).clone()
        mainMat.side = THREE.DoubleSide
        mainMat.needsUpdate = true
        const mainMesh = new THREE.Mesh(pieces[0], mainMat)
        mainMesh.position.copy(modelMesh.position)
        mainMesh.rotation.copy(modelMesh.rotation)
        mainMesh.scale.copy(modelMesh.scale)
        setModelMesh(mainMesh)

        if (modelInfo) {
          const bb = pieces[0].boundingBox
          const s = new THREE.Vector3()
          bb?.getSize(s)
          const count = pieces[0].getAttribute('position')?.count ?? 0
          setModelInfo({
            ...modelInfo,
            vertices: count,
            faces: Math.floor(count / 3),
            width: bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
            height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
            depth: bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth,
          })
        }

        // Peças 1..n → partes separadas coloridas, afastadas (exploded)
        for (let i = 1; i < pieces.length; i++) {
          const color = PALETTE[i % PALETTE.length]
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide,
          })
          const mesh = new THREE.Mesh(pieces[i], mat)
          mesh.position.copy(modelMesh.position)
          mesh.rotation.copy(modelMesh.rotation)
          mesh.scale.copy(modelMesh.scale)
          mesh.position.add(normal.clone().multiplyScalar(spread * i))
          addCutPart({
            id: `auto-${Date.now()}-${i}`,
            name: `Peça ${i + 1}`,
            mesh,
            faceIndices: [],
            color,
          })
        }

        // Pinos (dowels) → peças cilíndricas separadas, no vão da junta
        dowels.forEach((d, i) => {
          const dGeo = new THREE.CylinderGeometry(d.radius, d.radius, d.height, 28)
          const m = new THREE.Matrix4().compose(d.pos, d.quat, new THREE.Vector3(1, 1, 1))
          dGeo.applyMatrix4(m)
          dGeo.computeVertexNormals()
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#c0c4cc'),
            roughness: 0.35,
            metalness: 0.6,
            side: THREE.DoubleSide,
          })
          const mesh = new THREE.Mesh(dGeo, mat)
          mesh.position.copy(modelMesh.position)
          mesh.rotation.copy(modelMesh.rotation)
          mesh.scale.copy(modelMesh.scale)
          addCutPart({
            id: `pin-${Date.now()}-${i}`,
            name: `Pino ${i + 1}`,
            mesh,
            faceIndices: [],
            color: '#c0c4cc',
          })
        })

        setAutoSplitPlan(null)
        clearSelection()

        const pinMsg = usePins
          ? pinsOk
            ? ` · ${dowels.length} pino(s) de alinhamento`
            : ' · pinos ignorados (falha no booleano)'
          : ''
        setStatus('loaded', `Divisão automática concluída — ${pieces.length} peças${pinMsg}`)
      } catch (err) {
        console.log('[v0] Erro na execução Auto Split:', (err as Error).message)
        setStatus('error', 'Falha ao dividir o modelo.')
      } finally {
        setBusy(false)
      }
    }, 60)
  }

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto">
      <div
        className="flex flex-col gap-3 p-3 rounded-xl border w-[380px]"
        style={{
          background: 'oklch(0.10 0 0 / 95%)',
          backdropFilter: 'blur(16px)',
          borderColor: 'oklch(0.22 0 0)',
          boxShadow: '0 8px 32px oklch(0 0 0 / 60%)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Wand2 className="w-3.5 h-3.5" />
            Divisão automática
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/50">seção mínima</span>
        </div>

        {/* Eixo */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/70 w-14">Eixo</span>
          <div className="flex gap-1 flex-1">
            {AXES.map((ax) => (
              <button
                key={ax.id}
                onClick={() => setAxis(ax.id)}
                className={cn(
                  'flex-1 rounded py-1.5 text-xs font-mono font-medium transition-all duration-150',
                  axis === ax.id
                    ? 'text-background'
                    : 'border border-border text-muted-foreground hover:text-foreground',
                )}
                style={axis === ax.id ? { background: 'oklch(0.70 0.22 42)' } : undefined}
                aria-pressed={axis === ax.id}
              >
                {ax.label}
              </button>
            ))}
          </div>
        </div>

        {/* Máximo de cortes */}
        <SliderRow
          label="Cortes"
          value={maxCuts}
          min={1}
          max={8}
          step={1}
          onChange={setMaxCuts}
          display={`${maxCuts}`}
        />

        {/* Sensibilidade */}
        <SliderRow
          label="Sensib."
          value={sensitivity}
          min={0}
          max={1}
          step={0.05}
          onChange={setSensitivity}
          display={`${Math.round(sensitivity * 100)}%`}
        />

        {/* Espaçamento explodido */}
        <SliderRow
          label="Explodir"
          value={spacing}
          min={0}
          max={0.6}
          step={0.02}
          onChange={setSpacing}
          display={`${Math.round(spacing * 100)}%`}
        />

        {/* Pinos */}
        <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-2">
          <button
            onClick={() => setUsePins((v) => !v)}
            className="flex items-center justify-between"
            aria-pressed={usePins}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <Pin className="w-3 h-3" />
              Pinos de alinhamento
            </span>
            <span
              className={cn(
                'relative w-8 h-4 rounded-full transition-colors duration-150',
                usePins ? '' : 'bg-secondary',
              )}
              style={usePins ? { background: 'oklch(0.70 0.22 42)' } : undefined}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all duration-150',
                  usePins ? 'left-4' : 'left-0.5',
                )}
              />
            </span>
          </button>

          {usePins && (
            <div className="flex flex-col gap-2 pt-1 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/70 w-14">Qtd/junta</span>
                <div className="flex gap-1 flex-1">
                  {[1, 2].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPinCount(c)}
                      className={cn(
                        'flex-1 rounded py-1 text-[11px] font-mono transition-all duration-150',
                        pinCount === c
                          ? 'text-background'
                          : 'border border-border text-muted-foreground hover:text-foreground',
                      )}
                      style={pinCount === c ? { background: 'oklch(0.55 0.02 250)' } : undefined}
                    >
                      {c} pino{c > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
              <SliderRow label="Ø (mm)" value={pinDiameter} min={1} max={16} step={0.5} onChange={setPinDiameter} display={pinDiameter.toFixed(1)} />
              <SliderRow label="Prof (mm)" value={pinDepth} min={2} max={30} step={0.5} onChange={setPinDepth} display={pinDepth.toFixed(1)} />
              <SliderRow label="Folga (mm)" value={pinTolerance} min={0} max={0.6} step={0.01} onChange={setPinTolerance} display={pinTolerance.toFixed(2)} />
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyze}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <ScanLine className="w-3.5 h-3.5" />
            Analisar
          </button>
          <button
            onClick={handleExecute}
            disabled={busy}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 selection-glow transition-all duration-150 disabled:opacity-50"
            style={{ background: 'oklch(0.70 0.22 42)' }}
          >
            <Boxes className="w-4 h-4" />
            Dividir
          </button>
        </div>
      </div>
    </div>
  )
}

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display: string
}

function SliderRow({ label, value, min, max, step, onChange, display }: SliderRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-muted-foreground/70 w-14">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 cursor-pointer"
        style={{ accentColor: 'oklch(0.70 0.22 42)' }}
        aria-label={label}
      />
      <span className="text-[10px] font-mono tabular-nums w-10 text-right" style={{ color: 'oklch(0.70 0.22 42)' }}>
        {display}
      </span>
    </div>
  )
}
