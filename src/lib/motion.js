import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { store } from './store'
import { measurePoses } from './poses'

gsap.registerPlugin(ScrollTrigger, SplitText)
export { gsap, ScrollTrigger, SplitText }

export let lenis = null

// Scroll suave (Lenis) sincronizado ao ScrollTrigger + rastreamento do ponteiro.
export function initScroll() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)

  if (!store.reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t) => lenis?.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
  }
  // Modo de depuração (?debug): pula o loader e expõe um salto direto para seções.
  if (store.debug) window.__store = store
  if (store.debug)
    window.__go = (sel, off = 0) => {
      const y = typeof sel === 'number' ? sel : document.querySelector(sel).getBoundingClientRect().top + scrollY + off
      lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)
      return Math.round(y)
    }

  const onMove = (e) => {
    const p = store.pointer
    const x = (e.clientX / innerWidth) * 2 - 1
    const y = -((e.clientY / innerHeight) * 2 - 1)
    p.speed = Math.min(1.5, p.speed + Math.hypot(x - p.x, y - p.y) * 2.2)
    p.x = x
    p.y = y
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  ScrollTrigger.addEventListener('refresh', measurePoses)
  const ro = new ResizeObserver(() => measurePoses())
  ro.observe(document.body)
  measurePoses()

  return () => {
    window.removeEventListener('pointermove', onMove)
    ScrollTrigger.removeEventListener('refresh', measurePoses)
    ro.disconnect()
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (el == null && typeof target !== 'number') return
  if (lenis) lenis.scrollTo(typeof target === 'number' ? target : el, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts })
  else if (typeof target === 'number') window.scrollTo({ top: target })
  else el.scrollIntoView({ block: 'start' })
}

// Sistema de revelações declarativo: data-reveal="lines | chars | fade | img" e data-speed (parallax).
export function initReveals() {
  if (store.reduced) return () => {}
  const splits = []
  const ctx = gsap.context(() => {
    gsap.utils.toArray('[data-reveal="lines"], [data-reveal="chars"]').forEach((el) => {
      const chars = el.dataset.reveal === 'chars'
      const delay = parseFloat(el.dataset.delay || 0)
      gsap.set(el, { visibility: 'visible' })
      splits.push(
        SplitText.create(el, {
          type: chars ? 'words,chars' : 'lines',
          mask: chars ? 'words' : 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(chars ? self.chars : self.lines, {
              yPercent: 115,
              duration: chars ? 1 : 1.15,
              ease: 'expo.out',
              stagger: chars ? 0.022 : 0.085,
              delay,
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            }),
        }),
      )
    })

    ScrollTrigger.batch('[data-reveal="fade"]', {
      start: 'top 92%',
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, overwrite: true }),
    })

    gsap.utils.toArray('[data-reveal="img"]').forEach((el) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' })
      const img = el.querySelector('img')
      if (img) tl.to(img, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0.1)
    })

    gsap.utils.toArray('[data-speed]').forEach((el) => {
      const sp = parseFloat(el.dataset.speed)
      gsap.fromTo(el, { yPercent: sp * 12 }, { yPercent: -sp * 12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
  })
  return () => {
    ctx.revert()
    splits.forEach((s) => s.revert())
  }
}
