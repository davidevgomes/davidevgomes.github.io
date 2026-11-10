import { ScrollTrigger, gsap } from '../lib/motion'
import { store } from '../lib/store'
import { audio } from './engine'

// Liga os sons às interações que já existem, por delegação de eventos — os componentes não mudam.
// Tudo aqui é inofensivo com o áudio desligado (audio.play simplesmente não faz nada).
const HOVER = 'a, button, .sol, .dp-feature, [data-sound]'

export function bindSounds() {
  let hovered = null
  const over = (e) => {
    if (!store.fine) return
    const el = e.target.closest?.(HOVER)
    if (el === hovered) return // só ao entrar no elemento, nunca enquanto o cursor permanece nele
    hovered = el
    if (!el) return
    // no desktop, passar o cursor abre a apresentação do projeto
    if (el.classList.contains('sol')) return audio.play(el.classList.contains('is-open') ? 'hover' : 'open')
    audio.play('hover')
  }

  const click = (e) => {
    const el = e.target.closest?.('a, button')
    if (!el || el.closest('.sound')) return // o controle de som cuida do próprio retorno
    const c = el.classList
    if (c.contains('dock__link') || c.contains('menu__link') || c.contains('brand')) return audio.play('select')
    if (c.contains('dock__menu')) return audio.play(el.getAttribute('aria-expanded') === 'true' ? 'menuClose' : 'menuOpen')
    if (c.contains('sol__head')) return audio.play(el.getAttribute('aria-expanded') === 'true' ? 'close' : 'open')
    if (c.contains('theme')) return audio.play('theme', document.documentElement.dataset.theme === 'vinho')
    if (c.contains('channel__copy')) return audio.play('copy')
    if (c.contains('layer__head')) return // o som da camada vem da mudança no objeto 3D
    audio.play('click')
  }

  document.addEventListener('pointerover', over, { passive: true })
  document.addEventListener('click', click, true)

  // mudança de seção: um movimento de ar + a trilha abre ou fecha um pouco
  let first = true
  const sections = ['home', 'about', 'expertise', 'work', 'approach', 'contact'].map((id) =>
    ScrollTrigger.create({
      trigger: '#' + id,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (!self.isActive) return
        audio.setScene(id)
        if (!first) audio.play('section')
        first = false
      },
    }),
  )

  // peças da montagem (Abordagem) e telas do Dashpoint, no momento em que a animação acontece
  const steps = gsap.utils.toArray('.step').map((el, i) => ScrollTrigger.create({ trigger: el, start: 'top 62%', onEnter: () => audio.play('assemble', i) }))
  const feats = gsap.utils.toArray('.dp-feature').map((el) =>
    ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && audio.play('feature') }),
  )

  // camada do objeto 3D em destaque (Competências): acompanha o estado que a cena lê
  let layer = -1
  const watch = () => {
    if (store.activeLayer === layer) return
    layer = store.activeLayer
    if (layer >= 0) audio.play('layer', layer)
  }
  gsap.ticker.add(watch)

  return () => {
    document.removeEventListener('pointerover', over)
    document.removeEventListener('click', click, true)
    gsap.ticker.remove(watch)
    ;[...sections, ...steps, ...feats].forEach((t) => t.kill())
  }
}
