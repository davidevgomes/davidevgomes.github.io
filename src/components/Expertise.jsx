import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, scrollToTarget } from '../lib/motion'
import { store } from '../lib/store'
import { useMediaQuery } from '../lib/hooks'
import { expertise } from '../data/site'

const N = expertise.length

// Cada categoria é uma camada do objeto 3D. No desktop a seção fica presa (sticky) e o scroll
// percorre as camadas da base ao topo; passar o cursor ou focar destaca a camada correspondente.
export default function Expertise() {
  const root = useRef(null)
  const desktop = useMediaQuery('(min-width: 960px)')
  const [scrollIdx, setScrollIdx] = useState(0)
  const [hoverIdx, setHoverIdx] = useState(null)
  const [inside, setInside] = useState(false)
  const active = hoverIdx ?? scrollIdx

  useEffect(() => {
    store.activeLayer = inside ? active : -1
  }, [active, inside])

  useEffect(() => {
    const triggers = []
    if (desktop) {
      triggers.push(
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 45%',
          end: 'bottom 60%',
          onToggle: (self) => setInside(self.isActive),
        }),
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => setScrollIdx(Math.min(N - 1, Math.floor(self.progress * N))),
        }),
      )
    } else {
      root.current.querySelectorAll('.layer').forEach((el) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top 58%',
            end: 'bottom 58%',
            onToggle: (self) => {
              if (self.isActive) setScrollIdx(+el.dataset.i)
              setInside(ScrollTrigger.isInViewport(root.current, 0.2))
            },
          }),
        )
      })
    }
    return () => {
      triggers.forEach((t) => t.kill())
      store.activeLayer = -1
    }
  }, [desktop])

  const jump = (i) => {
    if (!desktop) return
    const r = root.current.getBoundingClientRect()
    const span = r.height - innerHeight
    scrollToTarget(r.top + scrollY + span * ((i + 0.5) / N))
  }

  // lista exibida do topo (IA) para a base (infra), como a pilha
  const order = expertise.map((e, i) => ({ ...e, i })).reverse()

  return (
    <section id="expertise" className="expertise" data-pose="expertise" ref={root} aria-labelledby="expertise-title">
      <div className="expertise__sticky">
        <div className="section-head mono">
          <span><span className="idx">03</span> — Competências</span>
          <span className="dim">Cinco camadas, um sistema</span>
        </div>

        <div className="expertise__body">
          <div className="expertise__intro">
            <h2 id="expertise-title" className="display h-lg" data-reveal="lines">
              A pilha
              <br />
              <em className="serif accent">inteira.</em>
            </h2>
            <p className="body" data-reveal="fade">
              Transito entre as áreas da tecnologia — da infraestrutura que hospeda um sistema à interface que as pessoas usam.
              Cada camada do objeto ao lado é uma delas; no centro, a ideia que todas sustentam.
            </p>
          </div>

          <ol className="layers" onMouseLeave={() => setHoverIdx(null)}>
            {order.map((e) => {
              const on = active === e.i
              return (
                <li key={e.id} className={'layer' + (on ? ' is-active' : '')} data-i={e.i}>
                  <button
                    className="layer__head"
                    onMouseEnter={() => store.fine && setHoverIdx(e.i)}
                    onFocus={() => setHoverIdx(e.i)}
                    onBlur={() => setHoverIdx(null)}
                    onClick={() => jump(e.i)}
                    aria-expanded={desktop ? on : true}
                  >
                    <span className="mono layer__idx">L{e.i + 1}</span>
                    <span className="layer__title">{e.title}</span>
                    <span className="layer__mark" aria-hidden="true" />
                  </button>
                  <div className="layer__panel">
                    <div className="layer__inner">
                      <p className="layer__blurb">{e.blurb}</p>
                      <ul className="layer__items mono">
                        {e.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <p className="mono dim expertise__hint" aria-hidden="true">
          <span>Base → topo</span>
          <span className="expertise__progress"><i style={{ transform: `scaleX(${(scrollIdx + 1) / N})` }} /></span>
          <span>{String(scrollIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
        </p>
      </div>
    </section>
  )
}
