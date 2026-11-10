import { useState } from 'react'
import { scrollToTarget } from '../lib/motion'
import { useMagnetic, useClock } from '../lib/hooks'
import { contact, profile } from '../data/site'

export default function Contact() {
  const cta = useMagnetic(0.3)
  const time = useClock(profile.timezone)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      location.href = 'mailto:' + contact.email
    }
  }

  const channels = [
    { label: 'E-mail', value: contact.email, href: 'mailto:' + contact.email, cursor: 'Escrever' },
    { label: 'WhatsApp', value: contact.whatsappLabel, href: contact.whatsapp, ext: true, cursor: 'Conversar' },
    { label: 'GitHub', value: contact.githubLabel, href: contact.github, ext: true, cursor: 'Abrir' },
    contact.linkedin && { label: 'LinkedIn', value: contact.linkedinLabel || 'Perfil', href: contact.linkedin, ext: true, cursor: 'Abrir' },
  ].filter(Boolean)

  return (
    <section id="contact" className="section contact" data-pose="contact" aria-labelledby="contact-title">
      <div className="section-head mono">
        <span><span className="idx">06</span> — Contato</span>
        <span className="dim">Vamos construir algo</span>
      </div>

      <h2 id="contact-title" className="display h-xl contact__title">
        <span data-reveal="lines">Tem uma ideia?</span>
        <span data-reveal="lines">Vamos torná-la</span>
        <span data-reveal="lines"><em className="serif accent">real.</em></span>
      </h2>

      <div className="contact__row">
        <p className="lead contact__text" data-reveal="lines">
          Estou sempre interessado em novos desafios, projetos interessantes e oportunidades de desenvolver soluções que façam a diferença.
        </p>
        <div data-reveal="fade">
          <a ref={cta} className="btn btn--accent contact__cta" href={'mailto:' + contact.email + '?subject=' + encodeURIComponent('Vamos construir algo')}>
            <span className="dot" /> Iniciar conversa <span className="arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <ul className="channels">
        {channels.map((c) => (
          <li key={c.label} className="channel" data-reveal="fade">
            <a href={c.href} target={c.ext ? '_blank' : undefined} rel={c.ext ? 'noreferrer' : undefined} data-cursor={c.cursor} className="channel__link">
              <span className="mono dim channel__label">{c.label}</span>
              <span className="channel__value">{c.value}</span>
              <span className="channel__arrow arrow" aria-hidden="true">↗</span>
            </a>
            {c.label === 'E-mail' && (
              <button className="mono channel__copy" onClick={copy} aria-live="polite">
                {copied ? 'Copiado ✓' : 'Copiar'}
              </button>
            )}
          </li>
        ))}
      </ul>

      <footer className="footer mono">
        <span>© {new Date().getFullYear()} Davi Gomes Araújo</span>
        <span className="dim">{profile.location} · {time}</span>
        <span className="dim">React · Three.js · GSAP</span>
        <button className="link" onClick={() => scrollToTarget(0, { duration: 2 })}>
          Voltar ao topo <span className="arrow" aria-hidden="true">↑</span>
        </button>
      </footer>
    </section>
  )
}
