import { useEffect, useRef } from 'react'
import { gsap, scrollToTarget } from '../lib/motion'
import { store } from '../lib/store'
import { profile } from '../data/site'

// O "i" minúsculo com o ponto carmesim é a assinatura tipográfica do nome.
const LINES = ['DAVi', 'GOMES', 'ARAÚJO']

export default function Hero({ ready }) {
  const root = useRef(null)

  // Entrada cinematográfica
  useEffect(() => {
    if (!ready || store.reduced) return
    const q = gsap.utils.selector(root)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.fromTo(q('.char__in'), { yPercent: 118, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.045 }, 0.05)
      .fromTo(q('.hero__dot'), { scale: 0 }, { scale: 1, duration: 0.9, ease: 'back.out(3)' }, 0.85)
      .fromTo(q('[data-in]'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.7)
      .fromTo(q('.hero__rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.inOut' }, 0.4)
    return () => tl.kill()
  }, [ready])

  // Tipografia viva: largura e peso de cada letra reagem à proximidade do cursor (fonte variável).
  useEffect(() => {
    if (!ready || !store.fine || store.reduced) return
    const chars = [...root.current.querySelectorAll('.char')]
    let centers = []
    const measure = () => {
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect()
        return [r.left + r.width / 2, r.top + r.height / 2 + scrollY]
      })
    }
    const state = chars.map(() => 0)
    let mx = -9999
    let my = -9999
    const move = (e) => {
      mx = e.clientX
      my = e.clientY + scrollY
    }
    const tick = () => {
      if (!centers.length || scrollY > innerHeight) return
      const radius = Math.max(220, innerWidth * 0.2)
      chars.forEach((c, i) => {
        const d = Math.hypot(centers[i][0] - mx, centers[i][1] - my)
        const inf = Math.max(0, 1 - d / radius) ** 2
        state[i] += (inf - state[i]) * 0.14
        if (Math.abs(inf - state[i]) > 0.002 || state[i] > 0.002)
          c.style.fontVariationSettings = `'wdth' ${(106 + 19 * state[i]).toFixed(1)}, 'wght' ${(700 + 200 * state[i]).toFixed(0)}`
      })
    }
    const t = setTimeout(measure, 1800)
    window.addEventListener('resize', measure)
    window.addEventListener('pointermove', move, { passive: true })
    gsap.ticker.add(tick)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', move)
      gsap.ticker.remove(tick)
    }
  }, [ready])

  return (
    <section id="home" className="hero" data-pose="home" ref={root} aria-label="Introdução">
      <div className="hero__top">
        <p className="mono dim hero__loc" data-in>
          {profile.location}
          <br />
          {profile.coords}
        </p>
      </div>

      <h1 className="hero__title" aria-label={profile.name}>
        {LINES.map((line, li) => (
          <span className={'hero__line hero__line--' + (li + 1)} key={line} aria-hidden="true">
            {[...line].map((ch, ci) => (
              <span className="char" key={ci}>
                <span className="char__in">
                  {ch === 'i' ? (
                    <span className="hero__i">ı<i className="hero__dot" /></span>
                  ) : (
                    ch
                  )}
                </span>
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div className="hero__rule rule" aria-hidden="true" />
      <div className="hero__foot">
        <p className="mono hero__role" data-in>
          Engenheiro de Software
          <br />& Desenvolvedor Criativo
        </p>
        <p className="hero__tag" data-in>
          {profile.tagline[0]} <em className="serif">{profile.tagline[1]}</em>
          <br />
          {profile.tagline[2]}
        </p>
        <a
          className="mono hero__scroll"
          href="#about"
          data-in
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget('#about')
          }}
        >
          Role
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
