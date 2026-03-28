import './style.css'
import { isReducedMotion, spawnPopcornBurst, spawnPopcornFromScroll } from './popcorn'

const finePointer =
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

function setupReveal(): void {
  const els = document.querySelectorAll<HTMLElement>('.reveal')
  if (!els.length) {
    return
  }

  if (isReducedMotion()) {
    for (const el of els) {
      el.classList.add('is-visible')
    }
    return
  }

  const obs = new IntersectionObserver(
    (entries, observer) => {
      for (const e of entries) {
        if (!e.isIntersecting) {
          continue
        }
        e.target.classList.add('is-visible')
        observer.unobserve(e.target)

        const section = e.target.closest('section')
        if (section && !section.dataset.popcornBurst) {
          section.dataset.popcornBurst = '1'
          const r = section.getBoundingClientRect()
          const cx = r.left + r.width / 2
          const cy = r.top + r.height * 0.25
          spawnPopcornBurst(cx, cy, 18 + Math.floor(Math.random() * 5))
        }
      }
    },
    { root: null, threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )

  for (const el of els) {
    obs.observe(el)
  }
}

function setupParallaxAndProgress(): void {
  const layers = document.querySelectorAll<HTMLElement>('.parallax-layer')
  const bar = document.querySelector<HTMLElement>('#read-progress-bar')

  let targetMouseX = 0
  let targetMouseY = 0
  let smoothX = 0
  let smoothY = 0
  let rafScheduled = false

  const apply = (): void => {
    rafScheduled = false
    const y = window.scrollY

    if (!isReducedMotion() && layers.length) {
      const lerp = 0.09
      smoothX += (targetMouseX - smoothX) * lerp
      smoothY += (targetMouseY - smoothY) * lerp

      for (const el of layers) {
        const depth = Number.parseFloat(el.dataset.parallaxDepth ?? '0.1')
        const m = Number.parseFloat(el.dataset.parallaxMouse ?? '16')
        const drift = y * depth * 0.14
        const ty = y * depth
        el.style.transform = `translate3d(${drift + smoothX * m}px, ${ty + smoothY * m * 0.72}px, 0)`
      }
    }

    if (bar) {
      const doc = document.documentElement
      const maxScroll = doc.scrollHeight - window.innerHeight
      const p = maxScroll > 0 ? y / maxScroll : 0
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`
    }
  }

  const schedule = (): void => {
    if (rafScheduled) {
      return
    }
    rafScheduled = true
    requestAnimationFrame(apply)
  }

  window.addEventListener('scroll', schedule, { passive: true })

  if (!isReducedMotion() && finePointer) {
    window.addEventListener(
      'mousemove',
      (ev: MouseEvent) => {
        targetMouseX = (ev.clientX / window.innerWidth) * 2 - 1
        targetMouseY = (ev.clientY / window.innerHeight) * 2 - 1
        schedule()
      },
      { passive: true },
    )
  }

  schedule()
}

function setupScrollPopcorn(): void {
  if (isReducedMotion()) {
    return
  }

  let lastY = window.scrollY
  let lastSpawn = 0
  const INTERVAL_MS = 280

  window.addEventListener(
    'scroll',
    () => {
      const now = performance.now()
      if (now - lastSpawn < INTERVAL_MS) {
        lastY = window.scrollY
        return
      }
      const y = window.scrollY
      const delta = y - lastY
      lastY = y
      if (Math.abs(delta) < 8) {
        return
      }
      lastSpawn = now
      spawnPopcornFromScroll(delta)
    },
    { passive: true },
  )
}

function setupDemoButton(): void {
  const btn = document.getElementById('demo-burst')
  if (!btn) {
    return
  }
  btn.addEventListener('click', () => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight * 0.35
    spawnPopcornBurst(cx, cy, 20)
  })
}

setupReveal()
setupParallaxAndProgress()
setupScrollPopcorn()
setupDemoButton()
