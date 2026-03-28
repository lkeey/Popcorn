const GLYPHS = ['🍿', '🍿', '🍿', '✨'] as const

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let activeCount = 0
const MAX_ACTIVE = 78

function getLayer(): HTMLElement | null {
  return document.getElementById('popcorn-layer')
}

function popScale(): number {
  if (typeof window === 'undefined') {
    return 1
  }
  return window.innerWidth < 540 ? 0.7 : window.innerWidth < 720 ? 0.85 : 1
}

export function spawnPopcornBurst(originX: number, originY: number, count: number): void {
  if (reducedMotion) {
    return
  }
  const layer = getLayer()
  if (!layer) {
    return
  }

  const n = Math.min(count, 24)
  for (let i = 0; i < n; i += 1) {
    if (activeCount >= MAX_ACTIVE) {
      return
    }
    const el = document.createElement('span')
    el.className = 'popcorn-piece'
    el.setAttribute('aria-hidden', 'true')
    el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

    const size = (48 + Math.random() * 62) * popScale()
    el.style.fontSize = `${size}px`
    el.style.left = `${originX}px`
    el.style.top = `${originY}px`

    const angle = Math.random() * Math.PI * 2
    const dist = 100 + Math.random() * 260
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist + 50 + Math.random() * 90
    const rot = (Math.random() - 0.5) * 720
    const dur = 1.05 + Math.random() * 1.05

    el.style.setProperty('--tx', `${tx}px`)
    el.style.setProperty('--ty', `${ty}px`)
    el.style.setProperty('--rot', `${rot}deg`)
    el.style.setProperty('--dur', `${dur}s`)

    activeCount += 1
    layer.appendChild(el)

    const done = (): void => {
      el.removeEventListener('animationend', done)
      el.remove()
      activeCount = Math.max(0, activeCount - 1)
    }
    el.addEventListener('animationend', done)
  }
}

export function spawnPopcornFromScroll(deltaY: number): void {
  if (reducedMotion) {
    return
  }
  const layer = getLayer()
  if (!layer || activeCount >= MAX_ACTIVE) {
    return
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const scrollingDown = deltaY >= 0

  const batch = 1 + (Math.random() < 0.38 ? 1 : 0)

  for (let b = 0; b < batch; b += 1) {
    if (activeCount >= MAX_ACTIVE) {
      return
    }

    const el = document.createElement('span')
    el.className = 'popcorn-piece'
    el.setAttribute('aria-hidden', 'true')
    el.textContent = Math.random() < 0.93 ? '🍿' : '✨'
    el.style.fontSize = `${(44 + Math.random() * 56) * popScale()}px`

    let startX: number
    let startY: number
    let tx: number
    let ty: number

    const edge = Math.floor(Math.random() * 4)
    if (edge === 0) {
      startX = Math.random() * vw
      startY = scrollingDown ? -40 : vh + 40
      tx = (Math.random() - 0.5) * 140
      ty = scrollingDown ? vh + 50 + Math.random() * 140 : -(vh * 0.5 + Math.random() * 90)
    } else if (edge === 1) {
      startX = -40
      startY = Math.random() * vh
      tx = vw * 0.35 + Math.random() * vw * 0.28
      ty = (Math.random() - 0.5) * vh * 0.5 + (scrollingDown ? vh * 0.15 : -vh * 0.1)
    } else if (edge === 2) {
      startX = vw + 40
      startY = Math.random() * vh
      tx = -(vw * 0.35 + Math.random() * vw * 0.28)
      ty = (Math.random() - 0.5) * vh * 0.5 + (scrollingDown ? vh * 0.15 : -vh * 0.1)
    } else {
      startX = Math.random() * vw
      startY = vh + 50
      tx = (Math.random() - 0.5) * 220
      ty = -(vh * 0.5 + 90 + Math.random() * 110)
    }

    el.style.left = `${startX}px`
    el.style.top = `${startY}px`
    el.style.setProperty('--tx', `${tx}px`)
    el.style.setProperty('--ty', `${ty}px`)
    el.style.setProperty('--rot', `${(Math.random() - 0.5) * 900}deg`)
    el.style.setProperty('--dur', `${1.15 + Math.random() * 0.95}s`)

    activeCount += 1
    layer.appendChild(el)

    const done = (): void => {
      el.removeEventListener('animationend', done)
      el.remove()
      activeCount = Math.max(0, activeCount - 1)
    }
    el.addEventListener('animationend', done)
  }
}

export function isReducedMotion(): boolean {
  return reducedMotion
}
