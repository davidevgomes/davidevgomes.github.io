import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { audio } from '../audio/engine'

const useAudio = () => useSyncExternalStore((fn) => audio.subscribe(fn), audio.getSnapshot)

const Bars = () => (
  <span className="sound__bars" aria-hidden="true">
    <i /><i /><i /><i />
  </span>
)

// Controle de som da barra superior: liga/desliga + painel com volumes independentes.
export function SoundControl() {
  const s = useAudio()
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    if (!open) return
    const out = (e) => !root.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', out)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', out)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className={'sound' + (s.active ? ' is-on' : '')} ref={root}>
      <button className="sound__toggle mono" onClick={() => audio.toggle()} aria-pressed={s.active} aria-label={s.active ? 'Desativar som' : 'Ativar som'} data-cursor={s.active ? 'Silenciar' : 'Ativar som'}>
        <Bars />
        <span>{s.active ? 'Som' : 'Mudo'}</span>
      </button>
      <button className="sound__more" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="sound-panel" aria-label="Ajustar volumes">
        <span aria-hidden="true" />
      </button>
      <div id="sound-panel" className={'sound__panel' + (open ? ' is-open' : '')} inert={!open}>
        {[
          ['music', 'Música'],
          ['sfx', 'Efeitos'],
        ].map(([kind, label]) => (
          <label key={kind} className="sound__row mono">
            <span>{label}</span>
            <input type="range" min="0" max="1" step="0.01" value={s[kind]} onChange={(e) => audio.setVolume(kind, +e.target.value)} onPointerUp={() => kind === 'sfx' && audio.play('click')} style={{ '--v': s[kind] }} aria-label={'Volume: ' + label} />
            <span className="sound__val">{Math.round(s[kind] * 100)}</span>
          </label>
        ))}
        {!s.active && <p className="sound__hint">O som está desligado. Ative para ouvir.</p>}
      </div>
    </div>
  )
}

// Convite discreto, logo após a entrada. Nunca bloqueia a navegação e some sozinho.
export function SoundInvite({ ready }) {
  const s = useAudio()
  const [show, setShow] = useState(false)
  const returning = s.decided && s.on // já tinha ativado em outra visita: o navegador exige um novo clique

  useEffect(() => {
    if (!ready || s.active || (s.decided && !s.on)) return
    const a = setTimeout(() => setShow(true), 1600)
    const b = setTimeout(() => setShow(false), 16000)
    return () => (clearTimeout(a), clearTimeout(b))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  const visible = show && !s.active
  return (
    <div className={'invite' + (visible ? ' is-in' : '')} role="region" aria-label="Experiência sonora" inert={!visible}>
      <Bars />
      <p className="invite__text">
        <strong>{returning ? 'Retomar o som' : 'Explorar com áudio'}</strong>
        <span>Trilha ambiente e sons de interface. Melhor com fones.</span>
      </p>
      <button className="btn btn--accent invite__yes" onClick={() => (audio.enable(), setShow(false))}>
        {returning ? 'Retomar' : 'Ativar som'}
      </button>
      <button className="mono invite__no" onClick={() => (returning || audio.disable(), setShow(false))}>
        Agora não
      </button>
    </div>
  )
}
