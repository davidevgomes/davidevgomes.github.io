import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { store } from '../lib/store'

// Cursor personalizado (só em ponteiros finos). Elementos com data-cursor="Texto" exibem um rótulo.
export default function Cursor() {
  const root = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (!store.fine || store.reduced) return
    const el = root.current
    document.documentElement.classList.add('has-cursor')
    const xTo = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3.out' })
    const move = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
      const t = e.target.closest?.('[data-cursor], a, button, [role="button"]')
      const text = t?.dataset?.cursor
      el.classList.toggle('is-label', !!text)
      el.classList.toggle('is-link', !!t && !text)
      if (text) label.current.textContent = text
    }
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <span className="cursor__dot" />
      <span className="cursor__ring"><span className="cursor__label" ref={label} /></span>
    </div>
  )
}
