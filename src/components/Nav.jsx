import { useEffect, useState } from 'react'
import { ScrollTrigger, scrollToTarget, lenis } from '../lib/motion'
import { useClock } from '../lib/hooks'
import { nav, profile, contact } from '../data/site'
import { SoundControl } from './Sound'

const SECTIONS = ['home', 'about', 'expertise', 'work', 'approach', 'contact']
const LABEL = { home: 'Início', about: 'Sobre', expertise: 'Competências', work: 'Projetos', approach: 'Abordagem', contact: 'Contato' }

export default function Nav({ ready, theme, onToggleTheme }) {
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const time = useClock(profile.timezone)

  useEffect(() => {
    const triggers = SECTIONS.map((id) =>
      ScrollTrigger.create({
        trigger: '#' + id,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(id),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', esc)
    }
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    // aguarda o menu liberar o scroll antes de animar
    requestAnimationFrame(() => scrollToTarget(id === 'home' ? 0 : '#' + id))
    history.replaceState(null, '', id === 'home' ? ' ' : '#' + id)
  }

  return (
    <>
      <header className={'topbar' + (ready ? ' is-in' : '')}>
        <a className="brand" href="#home" onClick={go('home')} aria-label="Davi Gomes Araújo — início">
          <span className="brand__mark" aria-hidden="true">d<i />g</span>
          <span className="brand__name mono">Davi Gomes Araújo</span>
        </a>
        <p className="topbar__clock mono dim" aria-label={`Hora local em ${profile.location}: ${time}`}>
          Maricá, BR <span className="topbar__time">{time}</span>
        </p>
        <div className="topbar__right">
        <SoundControl />
        <button
          className="theme mono"
          onClick={onToggleTheme}
          aria-label={`Alternar tema. Tema atual: ${theme}`}
          data-cursor={theme === 'vinho' ? 'Papel' : 'Vinho'}
        >
          <span className={theme === 'vinho' ? 'is-on' : ''}>Vinho</span>
          <i aria-hidden="true" />
          <span className={theme === 'papel' ? 'is-on' : ''}>Papel</span>
        </button>
        </div>
      </header>

      <nav className={'dock' + (ready ? ' is-in' : '')} aria-label="Navegação principal">
        <ul className="dock__list">
          {nav.map((n, i) => (
            <li key={n.id}>
              <a href={'#' + n.id} onClick={go(n.id)} className={'dock__link mono' + (active === n.id ? ' is-active' : '')} aria-current={active === n.id ? 'true' : undefined}>
                <span className="dock__num">{String(i + 1).padStart(2, '0')}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="dock__mobile mono">
          <span className="dock__current"><i aria-hidden="true" />{LABEL[active]}</span>
          <button className="dock__menu" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu">
            {open ? 'Fechar' : 'Menu'}
          </button>
        </div>
      </nav>

      <div id="menu" className={'menu' + (open ? ' is-open' : '')} aria-hidden={!open} inert={!open}>
        <ul className="menu__list">
          {nav.map((n, i) => (
            <li key={n.id} style={{ '--i': i }}>
              <a href={'#' + n.id} onClick={go(n.id)} className="menu__link display">
                <span className="mono accent">{String(i + 1).padStart(2, '0')}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="menu__foot mono">
          <a href={'mailto:' + contact.email}>{contact.email}</a>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a>
          <a href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </div>
    </>
  )
}
