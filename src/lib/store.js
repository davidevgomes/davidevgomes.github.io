// Estado mutável compartilhado entre DOM e cena 3D (lido a cada frame, sem re-render do React).
const mq = (q) => typeof matchMedia !== 'undefined' && matchMedia(q).matches

export const store = {
  pointer: { x: 0, y: 0, speed: 0 }, // -1..1
  target: null, // pose-alvo calculada a partir do scroll (lib/poses.js)
  activeLayer: -1, // camada destacada na seção Expertise
  intro: { v: 0 }, // 0→1 na entrada
  sceneReady: false,
  presenceNow: 1, // presença atual (amortecida) do objeto — usada para pausar a renderização
  reduced: mq('(prefers-reduced-motion: reduce)'),
  fine: mq('(hover: hover) and (pointer: fine)'),
  debug: typeof location !== 'undefined' && /[?&]debug\b/.test(location.search),
}

export const isLowEnd = () => {
  if (typeof navigator === 'undefined') return false
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || innerWidth < 760
  return mobile || (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
}

export const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
