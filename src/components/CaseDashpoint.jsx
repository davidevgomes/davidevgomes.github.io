import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { store } from '../lib/store'
import { dashpoint as dp } from '../data/site'
import BrowserFrame from './BrowserFrame'

// Smartphone em CSS 3D real (preserve-3d): corpo com espessura, tela e reflexo.
function Phone({ src, alt, className = '', children }) {
  return (
    <div className={'phone ' + className}>
      {[...Array(7)].map((_, i) => (
        <i key={i} className="phone__edge" style={{ transform: `translateZ(${-(i + 1) * 1.6}px)` }} aria-hidden="true" />
      ))}
      <div className="phone__body">
        {children || <img src={src} width="600" height="1333" alt={alt} loading="lazy" decoding="async" />}
        <span className="phone__glare" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function CaseDashpoint() {
  const root = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = root.current
    const q = gsap.utils.selector(el)
    const triggers = q('.dp-feature').map((f, i) =>
      ScrollTrigger.create({ trigger: f, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setActive(i) }),
    )
    if (store.reduced) return () => triggers.forEach((t) => t.kill())

    const ctx = gsap.context(() => {
      // trio de celulares gira com o scroll
      gsap.fromTo(
        q('.dp__trio'),
        { rotateY: -26, rotateX: 16, yPercent: 10 },
        { rotateY: 22, rotateX: 0, yPercent: -8, ease: 'none', scrollTrigger: { trigger: q('.dp__stage')[0], start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
      )
      // a rota fecha a volta e a área vira território
      gsap
        .timeline({ scrollTrigger: { trigger: q('.dp__hero')[0], start: 'top 70%', end: 'bottom 85%', scrub: 0.6 } })
        .fromTo(q('.dp__route'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', duration: 1 })
        .fromTo(q('.dp__area'), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.9)
        .fromTo(q('.dp__start'), { scale: 1 }, { scale: 1.8, duration: 0.2, yoyo: true, repeat: 1, transformOrigin: 'center' }, 0.95)
      gsap.fromTo(q('.dp__title span'), { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: q('.dp__title')[0], start: 'top 85%', once: true } })
    }, el)

    // inclinação pelo ponteiro
    let off
    if (store.fine) {
      const tilt = q('.dp__tilt')[0]
      const rx = gsap.quickTo(tilt, 'rotateX', { duration: 0.9, ease: 'power3.out' })
      const ry = gsap.quickTo(tilt, 'rotateY', { duration: 0.9, ease: 'power3.out' })
      const move = () => (ry(store.pointer.x * 10), rx(store.pointer.y * 6))
      window.addEventListener('pointermove', move, { passive: true })
      off = () => window.removeEventListener('pointermove', move)
    }
    return () => {
      triggers.forEach((t) => t.kill())
      ctx.revert()
      off?.()
    }
  }, [])

  return (
    <article className="case dp" ref={root} aria-labelledby="dp-title">
      <div className="dp__hero">
        <svg className="dp__territory" viewBox="0 0 800 600" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="dp-hach" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
              <rect width="8" height="18" fill="#ff6b35" />
            </pattern>
          </defs>
          <path className="dp__area" d="M150 420 L176 250 Q188 178 270 168 L470 138 Q560 128 582 210 L612 380 Q624 462 540 472 L240 494 Q160 498 150 420 Z" fill="url(#dp-hach)" />
          <path className="dp__route" d="M150 420 L176 250 Q188 178 270 168 L470 138 Q560 128 582 210 L612 380 Q624 462 540 472 L240 494 Q160 498 150 420 Z" pathLength="1" />
          <circle className="dp__start" cx="150" cy="420" r="13" />
        </svg>

        <header className="dp__head">
          <p className="mono dp__idx"><span>{dp.index}</span> — Estudo de caso · Produto próprio</p>
          <h3 id="dp-title" className="dp__title" aria-label="Dashpoint">
            <span aria-hidden="true">{dp.name[0]}</span>
            <span aria-hidden="true" className="dp__sol">{dp.name[1]}</span>
          </h3>
          <p className="dp__slogan" data-reveal="fade">{dp.slogan}</p>
          <p className="mono dp__kicker" data-reveal="fade">{dp.kicker}</p>
        </header>

        <div className="dp__stage">
          <div className="dp__tilt">
            <div className="dp__trio">
              <Phone className="phone--l" src={dp.hero[0]} alt="Dashpoint — tela de missões" />
              <Phone className="phone--c" src={dp.hero[1]} alt="Dashpoint — mapa de territórios" />
              <Phone className="phone--r" src={dp.hero[2]} alt="Dashpoint — perfil do corredor" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid case__intro dp__intro">
        <dl className="case__meta">
          {dp.meta.map(([k, v]) => (
            <div key={k} data-reveal="fade">
              <dt className="mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="case__story">
          <div data-reveal="fade">
            <h4 className="mono">O problema</h4>
            <p className="lead">{dp.context}</p>
          </div>
          <div data-reveal="fade">
            <h4 className="mono">A proposta</h4>
            <p className="body">{dp.contribution}</p>
          </div>
          <a className="btn dp__btn" href={dp.url} target="_blank" rel="noreferrer" data-reveal="fade">
            <span className="dot" /> Visitar {dp.urlLabel} <span className="arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="dp__features">
        <div className="dp__sticky" aria-hidden="true">
          <div className="dp__sticky-stage">
            <Phone className={'phone--solo phone--f' + (active % 2)}>
              {dp.features.map((f, i) => (
                <img key={f.img} src={f.img} width="600" height="1333" alt="" loading="lazy" decoding="async" className={active === i ? 'is-on' : ''} />
              ))}
            </Phone>
            <p className="mono dp__count">
              <span>{String(active + 1).padStart(2, '0')}</span> / {String(dp.features.length).padStart(2, '0')}
            </p>
          </div>
        </div>
        <ol className="dp__list">
          {dp.features.map((f, i) => (
            <li key={f.title} className={'dp-feature' + (active === i ? ' is-active' : '')}>
              <span className="mono dp-feature__num">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="dp-feature__title">{f.title}</h4>
              <p className="dp-feature__text">{f.text}</p>
              <img className="dp-feature__img" src={f.img} width="600" height="1333" alt={'Tela do Dashpoint: ' + f.title} loading="lazy" decoding="async" />
            </li>
          ))}
        </ol>
      </div>

      <a className="dp__site" href={dp.url} target="_blank" rel="noreferrer" data-cursor="Visitar" aria-label="Visitar o site do Dashpoint (abre em nova aba)">
        <BrowserFrame url={dp.urlLabel}>
          <div data-reveal="img">
            <img src="/img/dashpoint-site.webp" width="1800" height="1125" alt="Site oficial do Dashpoint" loading="lazy" decoding="async" />
          </div>
        </BrowserFrame>
      </a>
    </article>
  )
}
