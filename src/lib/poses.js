// Coreografia do objeto 3D: cada seção ([data-pose]) define uma pose; o scroll interpola entre elas.
// Sem estado: a pose é função pura da posição de scroll, então funciona em qualquer ponto da página.
//   x, y  → posição em frações de meia-tela (x = 1 é a borda direita)
//   s     → escala · rx/ry/rz → rotação · explode → separação das camadas
//   twist → torção helicoidal · assemble → montagem progressiva · ghost → linhas de projeto
//   presence → 0 esconde o objeto (e pausa a renderização)

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (t) => t * t * (3 - 2 * t)

export const basePose = { x: 0, y: 0, s: 1, rx: 0.4, ry: 0, rz: 0, explode: 0, twist: 0.4, assemble: 1.2, ghost: 0, presence: 1, spin: 1 }

// p = progresso local da seção (0..1) · m = layout retrato (celular)
const P = {
  home: (p, m) =>
    m
      ? { x: 0.3, y: 0.28, s: 0.9, rx: 0.5, ry: -0.6, rz: 0.16, explode: 0.1, twist: 0.6 }
      : { x: 0.6, y: 0.03, s: 0.82, rx: 0.46, ry: -0.6, rz: 0.16, explode: 0.1, twist: 0.6 },
  about: (p, m) =>
    m
      ? { x: 1.5, y: 0.3, s: 0.5, rx: 1, ry: 1, presence: 0 }
      : { x: 1.02, y: 0.05 - p * 0.1, s: 1.0, rx: 1.05, ry: 0.4 + p * 1.4, rz: -0.25, explode: 0.3, twist: 0.25, spin: 0.4 },
  expertise: (p, m) =>
    m
      ? { x: 0.84, y: 0.05, s: 0.62, rx: 0.3, ry: -0.5 + p * 1.2, explode: 1, twist: 0.12, ghost: 0.7, spin: 0.25 }
      : { x: 0.56, y: -0.02, s: 0.78, rx: 0.3, ry: -0.6 + p * 1.1, explode: 0.9, twist: 0.12, ghost: 0.75, spin: 0.25 },
  work: () => ({ x: 1.3, y: 0.9, s: 0.4, rx: 1.2, ry: 2, presence: 0 }),
  approach: (p, m) => ({
    x: m ? 0.74 : 0.6,
    y: 0,
    s: m ? 0.72 : 0.84,
    rx: 0.36,
    ry: -0.8 + p * 2.4,
    explode: 0.75 - 0.7 * smooth(clamp(p * 1.25 - 0.25)),
    twist: 0.05 + 0.6 * smooth(clamp(p * 1.4 - 0.4)),
    assemble: p * 1.3,
    ghost: 1 - 0.85 * smooth(clamp(p * 1.5 - 0.5)),
    spin: 0.2,
  }),
  contact: (p, m) =>
    m
      ? { x: 0.3, y: -0.5, s: 0.85, rx: 0.6, ry: 0.8, rz: 0.12, explode: 0.06, twist: 0.9 }
      : { x: 0.66, y: -0.3, s: 0.84, rx: 0.52, ry: 0.9, rz: 0.12, explode: 0.06, twist: 0.9 },
}

let stops = []
let vh = 1
let portrait = false

export function measurePoses() {
  vh = innerHeight
  portrait = innerWidth / innerHeight < 0.85
  stops = [...document.querySelectorAll('[data-pose]')].map((el) => {
    const r = el.getBoundingClientRect()
    const top = r.top + scrollY
    let a = top - vh * 0.3
    let b = top + r.height - vh * 0.8
    if (b < a) a = b = (a + b) / 2
    return { id: el.dataset.pose, top, h: r.height, a, b }
  })
}

const get = (s, y) => ({ ...basePose, ...P[s.id](clamp((y - s.top) / Math.max(1, s.h - vh)), portrait) })

export function poseAt(y) {
  if (!stops.length) return basePose
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i]
    const n = stops[i + 1]
    if (y <= s.b || !n) return get(s, y)
    if (y < n.a) {
      const t = smooth((y - s.b) / (n.a - s.b))
      const A = get(s, y)
      const B = get(n, y)
      const out = {}
      for (const k in A) out[k] = A[k] + (B[k] - A[k]) * t
      return out
    }
  }
  return basePose
}
