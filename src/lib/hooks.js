import { useEffect, useState, useCallback, useRef } from 'react'
import { gsap } from './motion'
import { store } from './store'

const THEMES = ['vinho', 'papel']
const THEME_COLOR = { vinho: '#0c0608', papel: '#ebe9e4' }

export function useTheme() {
  const [theme, setTheme] = useState(() => (THEMES.includes(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : 'vinho'))
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
    try {
      localStorage.setItem('dga-theme', theme)
    } catch {}
  }, [theme])
  const toggle = useCallback(() => setTheme((t) => (t === 'vinho' ? 'papel' : 'vinho')), [])
  return [theme, toggle, setTheme]
}

export function useMediaQuery(query) {
  const [match, setMatch] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const mq = matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

// Botão magnético: o elemento é atraído pelo cursor.
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !store.fine || store.reduced) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => (xTo(0), yTo(0))
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return ref
}

export function useClock(timeZone) {
  const fmt = () => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone])
  return time
}
