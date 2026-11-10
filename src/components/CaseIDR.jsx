import { useState } from 'react'
import { idr } from '../data/site'
import BrowserFrame from './BrowserFrame'

// Diagramas esquemáticos para os sistemas internos (sem captura pública) — não são telas reais.
function Glyph({ type }) {
  const common = { viewBox: '0 0 320 200', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, role: 'img' }
  if (type === 'gps')
    return (
      <svg {...common} aria-label="Diagrama: rota de campo com pontos de localização">
        <g opacity=".28">{[40, 80, 120, 160].map((y) => <path key={y} d={`M0 ${y}H320`} />)}{[64, 128, 192, 256].map((x) => <path key={x} d={`M${x} 0V200`} />)}</g>
        <path className="glyph-draw" d="M28 160 L84 122 L120 138 L172 84 L214 96 L262 44" strokeWidth="1.6" />
        {[[28, 160], [84, 122], [120, 138], [172, 84], [214, 96]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.5" fill="var(--bg)" />)}
        <circle cx="262" cy="44" r="6" fill="var(--accent)" stroke="none" />
        <circle className="glyph-ping" cx="262" cy="44" r="6" stroke="var(--accent)" />
      </svg>
    )
  if (type === 'kiosk')
    return (
      <svg {...common} aria-label="Diagrama: tablet restrito a um único aplicativo">
        <rect x="70" y="28" width="180" height="144" rx="12" />
        <rect x="82" y="40" width="156" height="120" rx="4" opacity=".4" />
        <rect x="118" y="66" width="84" height="68" rx="6" stroke="var(--accent)" strokeWidth="1.6" />
        <path d="M148 98v-8a12 12 0 0 1 24 0v8" stroke="var(--accent)" strokeWidth="1.6" />
        <rect x="142" y="98" width="36" height="24" rx="3" fill="var(--accent)" stroke="none" />
        <g opacity=".3"><rect x="92" y="50" width="16" height="16" rx="3" /><rect x="212" y="50" width="16" height="16" rx="3" /><rect x="92" y="134" width="16" height="16" rx="3" /><rect x="212" y="134" width="16" height="16" rx="3" /></g>
      </svg>
    )
  return (
    <svg {...common} aria-label="Diagrama: lista de ocorrências com situação">
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(40 ${34 + i * 36})`}>
          <rect width="240" height="26" rx="4" opacity={i === 1 ? 1 : 0.4} stroke={i === 1 ? 'var(--accent)' : 'currentColor'} />
          <circle cx="14" cy="13" r="4" fill={i === 1 ? 'var(--accent)' : 'currentColor'} stroke="none" opacity={i === 1 ? 1 : 0.5} />
          <path d={`M30 13h${[90, 120, 70, 104][i]}`} opacity=".6" />
          <path d="M196 13h30" opacity=".35" />
        </g>
      ))}
    </svg>
  )
}

export default function CaseIDR() {
  const [open, setOpen] = useState(0)

  return (
    <article className="case idr section" aria-labelledby="idr-title">
      <header className="case__head">
        <p className="mono case__idx"><span className="accent">{idr.index}</span> — Estudo de caso · Setor público</p>
        <h3 id="idr-title" className="display h-xl case__title" data-reveal="lines">
          Instituto
          <br />
          Darcy Ribeiro
        </h3>
        <p className="case__kicker serif" data-reveal="fade">{idr.kicker}</p>
      </header>

      <a className="case__cover" href={idr.url} target="_blank" rel="noreferrer" data-cursor="Visitar" aria-label="Visitar o site do Instituto Darcy Ribeiro (abre em nova aba)">
        <BrowserFrame url="idr.marica.rj.gov.br">
          <div className="case__cover-img" data-reveal="img">
            <img src={idr.cover.src} width="1800" height="1125" alt={idr.cover.alt} loading="lazy" decoding="async" />
          </div>
        </BrowserFrame>
      </a>

      <div className="grid case__intro">
        <dl className="case__meta">
          {idr.meta.map(([k, v]) => (
            <div key={k} data-reveal="fade">
              <dt className="mono dim">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="case__story">
          <div data-reveal="fade">
            <h4 className="mono dim">O contexto</h4>
            <p className="lead">{idr.context}</p>
          </div>
          <div data-reveal="fade">
            <h4 className="mono dim">Minha contribuição</h4>
            <p className="body">{idr.contribution}</p>
          </div>
          <a className="link mono" href={idr.url} target="_blank" rel="noreferrer" data-reveal="fade">
            idr.marica.rj.gov.br <span className="arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="solutions">
        <div className="section-head mono">
          <span>Soluções desenvolvidas</span>
          <span className="dim">{String(idr.solutions.length).padStart(2, '0')} entregas</span>
        </div>
        <ul className="solutions__list">
          {idr.solutions.map((s, i) => {
            const on = open === i
            return (
              <li key={s.name} className={'sol' + (on ? ' is-open' : '')} onMouseEnter={() => matchMedia('(hover: hover)').matches && setOpen(i)}>
                <button className="sol__head" onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} aria-controls={'sol-' + i}>
                  <span className="mono sol__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sol__name">{s.name}</span>
                  <span className="mono dim sol__kind">{s.kind}</span>
                  <span className="sol__plus" aria-hidden="true" />
                </button>
                <div className="sol__panel" id={'sol-' + i} inert={!on}>
                  <div className="sol__inner">
                    <div className="sol__text">
                      <p className="mono accent">{s.role}</p>
                      <p>{s.text}</p>
                      {s.url ? (
                        <a className="link mono" href={s.url} target="_blank" rel="noreferrer">
                          Abrir plataforma <span className="arrow" aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <p className="mono dim">Sistema interno — sem acesso público</p>
                      )}
                    </div>
                    <div className={'sol__media' + (s.img ? '' : ' sol__media--glyph') + (s.portrait ? ' sol__media--portrait' : '')}>
                      {s.img ? <img src={s.img} width="1800" height="1125" alt={'Tela: ' + s.name} loading="lazy" decoding="async" /> : <Glyph type={s.glyph} />}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="idr__gallery">
        {idr.gallery.map((g, i) => (
          <figure key={g.src} className={'idr__shot idr__shot--' + (i + 1)}>
            <a href={g.url} target="_blank" rel="noreferrer" data-cursor="Abrir" aria-label={g.label + ' (abre em nova aba)'}>
              <BrowserFrame url={g.url.replace('https://', '')}>
                <div data-reveal="img">
                  <img src={g.src} width="1800" height="1125" alt={g.alt} loading="lazy" decoding="async" />
                </div>
              </BrowserFrame>
            </a>
            <img className="idr__mobile" data-speed={i ? 0.8 : -0.8} src={g.src.replace('.webp', '-m.webp')} width="780" height="1688" alt={g.label + ' — versão mobile'} loading="lazy" decoding="async" />
            <figcaption className="mono dim">
              <span>{g.label}</span>
              <span>Desktop + mobile</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </article>
  )
}
