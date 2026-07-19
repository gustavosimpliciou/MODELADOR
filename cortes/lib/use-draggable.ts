"use client"

import { useState, useRef, useCallback } from 'react'

export interface DraggableResult {
  /** onMouseDown handler to attach to the drag handle element */
  onHandleMouseDown: (e: React.MouseEvent<HTMLElement>) => void
  /** When null, use default CSS positioning. When set, use fixed positioning. */
  pos: { x: number; y: number } | null
}

/**
 * useDraggable — makes a panel draggable from a header handle.
 *
 * Usage:
 *   const { pos, onHandleMouseDown } = useDraggable()
 *
 *   // Outer panel wrapper:
 *   <div
 *     data-draggable
 *     className={pos ? '' : 'absolute bottom-28 left-1/2 -translate-x-1/2 z-20'}
 *     style={pos ? { position: 'fixed', left: pos.x, top: pos.y, zIndex: 20 } : {}}
 *   >
 *     // Drag handle:
 *     <div onMouseDown={onHandleMouseDown} style={{ cursor: 'grab' }}>...</div>
 *   </div>
 */
export function useDraggable(): DraggableResult {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const drag = useRef({ active: false, ox: 0, oy: 0, ex: 0, ey: 0 })

  const onHandleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // Only respond to primary button
    if (e.button !== 0) return
    e.preventDefault()

    const panel = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-draggable]')
    if (!panel) return

    const rect = panel.getBoundingClientRect()
    drag.current = { active: true, ox: e.clientX, oy: e.clientY, ex: rect.left, ey: rect.top }

    const onMove = (mv: MouseEvent) => {
      if (!drag.current.active) return
      setPos({
        x: drag.current.ex + mv.clientX - drag.current.ox,
        y: drag.current.ey + mv.clientY - drag.current.oy,
      })
    }

    const onUp = () => {
      drag.current.active = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  return { pos, onHandleMouseDown }
}
