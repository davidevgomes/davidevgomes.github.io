import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { store } from '../lib/store'
import { approach } from '../data/site'

// Enquanto os passos avançam, o objeto 3D é montado camada por camada sobre as linhas de projeto.
export default function Approach() {
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    const steps = [...el.querySelectorAll('.step')]
    const triggers = steps.map((s) =>
      ScrollTrigger.create({ trigger: s, start: 'top 62%', end: 'bottom 62%', toggleClass: { targets: s, className: 'is-active' }, onEnter: () => s.classList.add('is-done') , onLeaveBack: () => s.classList.remove('is-done') }),
    )
    let tween
    if (!store.reduced)
      tween = gsap.fromTo(
        el.querySelector('.steps__fill'),
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el.querySelector('.steps'), start: 'top 62%', end: 'bottom 62%', scrub: true } },
      )
    return () => {
      triggers.forEach((t) => t.kill())
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [])

  return (
    <section id="approach" className="section approach" data-pose="approach" ref={root} aria-labelledby="approach-title">
      <div className="section-head mono">
        <span><span className="idx">05</span> — Além do código</span>
        <span className="dim">Minha abordagem</span>
      </div>

      <h2 id="approach-title" className="display h-xl approach__title">
        <span data-reveal="lines">{approach.title[0]}</span>
        <span data-reveal="lines" className="approach__strike">{approach.title[1]}</span>
        <span data-reveal="lines">{approach.title[2]}</span>
        <span data-reveal="lines"><em className="serif accent">{approach.title[3]}</em></span>
      </h2>

      <div className="approach__body">
        <p className="body approach__note" data-reveal="fade">
          Código é uma parte do trabalho. Antes dele vem o problema; depois dele, a operação. Atuo no caminho inteiro.
        </p>
        <div className="steps">
          <span className="steps__rail" aria-hidden="true"><i className="steps__fill" /></span>
          <ol>
            {approach.steps.map((s, i) => (
              <li className="step" key={s.verb}>
                <span className="step__node" aria-hidden="true" />
                <span className="mono step__num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="step__verb">{s.verb}</h3>
                <p className="step__text">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
