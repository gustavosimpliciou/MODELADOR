import { useEffect, useRef } from 'react'

// Animação de partículas copiada do Site Geneseez (Hero).
// Modo `background`: ocupa a tela inteira do elemento pai (absolute inset-0),
// responde a resize e segue o mouse na tela inteira — ideal como fundo da
// tela de escolha de ferramenta.
export default function ParticleAnimation({ isDark = false, containerMode = false, background = false }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const particlesRef = useRef([])
  const activationPointsRef = useRef([])
  const lastParticleTimeRef = useRef(0)

  // `background` = tela cheia atrás do conteúdo (usa a lógica full-screen do original:
  // 50 partículas, distância 200, mouse na janela inteira), mas renderizado como
  // absolute atrás (z-0) em vez de fixed por cima (z-10).
  const useWindowSize = !containerMode || background

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: true })
    const container = containerRef.current
    const particles = particlesRef.current
    const maxParticles = useWindowSize ? 50 : 20
    const maxDistance = useWindowSize ? 200 : 100
    const fadeTime = 2500
    const particleInterval = useWindowSize ? 60 : 40
    const numActivationPoints = useWindowSize ? 10 : 6

    let animationFrameId
    let containerRect = null

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (useWindowSize) {
        // Tela inteira — responsivo a qualquer resize/orientação
        const w = window.innerWidth
        const h = window.innerHeight
        canvas.width = Math.floor(w * dpr)
        canvas.height = Math.floor(h * dpr)
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        containerRect = { width: w, height: h, left: 0, top: 0 }
      } else {
        containerRect = container.getBoundingClientRect()
        const w = Math.max(1, Math.floor(containerRect.width))
        const h = Math.max(1, Math.floor(containerRect.height))
        canvas.width = Math.floor(w * dpr)
        canvas.height = Math.floor(h * dpr)
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }

      initializeActivationPoints()
    }

    const getContainerDimensions = () => {
      if (useWindowSize) {
        return { w: window.innerWidth, h: window.innerHeight }
      }
      if (containerRect && containerRect.width > 0) {
        return { w: containerRect.width, h: containerRect.height }
      }
      const r = container.getBoundingClientRect()
      return { w: r.width || 400, h: r.height || 400 }
    }

    const getRandomPosition = (section) => {
      const { w, h } = getContainerDimensions()
      const spread = 0.4

      switch (section) {
        case 'top':
          return { x: Math.random() * w, y: Math.random() * (h * spread) }
        case 'middle':
          return { x: Math.random() * w, y: (h * 0.3) + Math.random() * (h * 0.4) }
        case 'bottom':
          return { x: Math.random() * w, y: (h * (1 - spread)) + Math.random() * (h * spread) }
        case 'left':
          return { x: Math.random() * (w * spread), y: Math.random() * h }
        case 'right':
          return { x: (w * (1 - spread)) + Math.random() * (w * spread), y: Math.random() * h }
        default:
          return { x: Math.random() * w, y: Math.random() * h }
      }
    }

    const initializeActivationPoints = () => {
      const sections = ['top', 'middle', 'bottom', 'left', 'right']

      activationPointsRef.current = Array(numActivationPoints).fill(null).map((_, index) => {
        const section = sections[index % sections.length]
        const pos = getRandomPosition(section)
        return {
          x: pos.x,
          y: pos.y,
          lastTrigger: Date.now(),
          interval: 1500 + Math.random() * 1000,
          section
        }
      })
    }

    class ParticleClass {
      constructor(x, y) {
        this.x = x
        this.y = y
        this.vx = (Math.random() - 0.5) * (useWindowSize ? 1.5 : 1.0)
        this.vy = (Math.random() - 0.5) * (useWindowSize ? 1.5 : 1.0)
        this.opacity = 0.9
        // Um pouco menores que o original (original full: 1.5–4.5px)
        this.size = Math.random() * (useWindowSize ? 2 : 1.4) + 1.0
        this.createdAt = Date.now()
        this.element = document.createElement('div')
        this.element.className = isDark ? 'particle-dark' : 'particle'
        this.element.style.width = `${this.size}px`
        this.element.style.height = `${this.size}px`
        container.appendChild(this.element)
        this.updatePosition()
      }

      updatePosition() {
        const { w, h } = getContainerDimensions()
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > w) this.vx *= -0.8
        if (this.y < 0 || this.y > h) this.vy *= -0.8

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`
        this.element.style.opacity = String(this.opacity)
      }
    }

    const createParticle = (x, y) => {
      const now = Date.now()

      if (now - lastParticleTimeRef.current > particleInterval) {
        if (particles.length >= maxParticles) {
          const oldestParticle = particles.shift()
          if (oldestParticle?.element.parentNode) {
            oldestParticle.element.parentNode.removeChild(oldestParticle.element)
          }
        }

        particles.push(new ParticleClass(
          x + (Math.random() - 0.5) * 50,
          y + (Math.random() - 0.5) * 50
        ))
        lastParticleTimeRef.current = now
      }
    }

    const updateActivationPoints = () => {
      const now = Date.now()
      activationPointsRef.current.forEach(point => {
        if (now - point.lastTrigger >= point.interval) {
          createParticle(point.x, point.y)
          point.lastTrigger = now

          const newPos = getRandomPosition(point.section)
          point.x += (newPos.x - point.x) * 0.05
          point.y += (newPos.y - point.y) * 0.05
        }
      })
    }

    const drawConnections = () => {
      if (!ctx) return

      const { w, h } = getContainerDimensions()
      ctx.clearRect(0, 0, w, h)
      const now = Date.now()
      const maxDistanceSq = maxDistance * maxDistance

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        const age = now - particle.createdAt

        if (age > fadeTime) {
          particle.opacity = Math.max(0, 0.8 * (1 - (age - fadeTime) / 500))

          if (particle.opacity <= 0) {
            if (particle.element.parentNode) {
              particle.element.parentNode.removeChild(particle.element)
            }
            particles.splice(i, 1)
            continue
          }
        }

        particle.updatePosition()
      }

      if (particles.length < 3) return

      ctx.lineWidth = 0.7
      const maxConnections = Math.min(particles.length, 15)

      for (let i = 0; i < Math.min(particles.length, maxConnections); i++) {
        for (let j = i + 1; j < Math.min(particles.length, maxConnections + i); j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distanceSq = dx * dx + dy * dy

          if (distanceSq < maxDistanceSq) {
            const distance = Math.sqrt(distanceSq)
            const opacity = (1 - (distance / maxDistance)) * 0.3
            const color = isDark ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
            ctx.strokeStyle = color
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      updateActivationPoints()
      drawConnections()
      animationFrameId = requestAnimationFrame(animate)
    }

    // Segue o mouse na TELA INTEIRA (sem restrição de bounds quando full-screen)
    const handleMouseMove = (e) => {
      if (useWindowSize) {
        for (let i = 0; i < 5; i++) {
          createParticle(
            e.clientX + (Math.random() - 0.5) * 80,
            e.clientY + (Math.random() - 0.5) * 80
          )
        }
      } else {
        const rect = container.getBoundingClientRect()
        containerRect = rect
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          for (let i = 0; i < 5; i++) {
            createParticle(
              x + (Math.random() - 0.5) * 80,
              y + (Math.random() - 0.5) * 80
            )
          }
        }
      }
    }

    const handleTouchMove = (e) => {
      const t = e.touches[0]
      if (!t) return
      if (useWindowSize) {
        for (let i = 0; i < 5; i++) {
          createParticle(
            t.clientX + (Math.random() - 0.5) * 80,
            t.clientY + (Math.random() - 0.5) * 80
          )
        }
      } else {
        const rect = container.getBoundingClientRect()
        containerRect = rect
        const x = t.clientX - rect.left
        const y = t.clientY - rect.top

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          for (let i = 0; i < 5; i++) {
            createParticle(
              x + (Math.random() - 0.5) * 80,
              y + (Math.random() - 0.5) * 80
            )
          }
        }
      }
    }

    initializeActivationPoints()

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('orientationchange', resizeCanvas)

    let resizeObserver = null
    if (!useWindowSize && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resizeCanvas())
      resizeObserver.observe(container)
    }

    resizeCanvas()
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('orientationchange', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      if (resizeObserver) resizeObserver.disconnect()

      particles.forEach(particle => {
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element)
        }
      })
      particlesRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, containerMode, background, useWindowSize])

  if (background) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          overflow: 'hidden', pointerEvents: 'none',
          width: '100%', height: '100%',
        }}
      >
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      </div>
    )
  }

  if (containerMode) {
    return (
      <div ref={containerRef} className="absolute inset-0 overflow-hidden z-0" style={{ pointerEvents: 'auto' }}>
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden z-10" style={{ pointerEvents: 'auto' }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
    </div>
  )
}
