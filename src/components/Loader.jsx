import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { store } from '../lib/store'

const sceneReady = () =>
  new Promise((res) => {
    if (store.sceneReady) return res()
    window.addEventListener('scene:ready', res, { once: true })
  })
const timeout = (ms) => new Promise((res) => setTimeout(res, ms))

export default function Loader({ onDone }) {
  const root = useRef(null)
  const num = useRef(null)
  const bar = useRef(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (store.reduced || store.debug) {
      setGone(true)
      onDone()
      return
    }
    const o = { v: 0 }
    const paint = () => {
      num.current.textContent = String(Math.round(o.v)).padStart(3, '0')
      bar.current.style.transform = `scaleX(${o.v / 100})`
    }
    const tl = gsap.timeline()
    tl.to(o, { v: 68, duration: 1.3, ease: 'power2.out', onUpdate: paint })
    Promise.race([Promise.all([document.fonts.ready, sceneReady()]), timeout(4500)]).then(() => {
      tl.to(o, { v: 100, duration: 0.55, ease: 'power2.inOut', onUpdate: paint })
        .to(root.current.querySelectorAll('[data-out]'), { yPercent: -120, opacity: 0, duration: 0.6, ease: 'power3.in', stagger: 0.04 })
        .add(onDone, '-=0.15')
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.15')
        .add(() => setGone(true))
    })
    return () => tl.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null
  return (
    <div className="loader" ref={root} role="status" aria-live="polite" aria-label="Carregando portfólio">
      <div className="loader__row mono">
        <span data-out>Davi Gomes Araújo</span>
        <span data-out className="dim">Portfólio — 2026</span>
      </div>
      <div className="loader__num" data-out aria-hidden="true">
        <span ref={num}>000</span>
      </div>
      <div className="loader__row mono">
        <span data-out className="dim">Montando a pilha</span>
        <span className="loader__bar"><i ref={bar} /></span>
      </div>
    </div>
  )
}
