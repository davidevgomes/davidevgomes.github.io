import * as THREE from 'three'

// Raio de uma superelipse (squircle) no ângulo t. n = 2 é círculo; n maior, mais quadrado.
const sq = (t, n) => Math.pow(Math.pow(Math.abs(Math.cos(t)), n) + Math.pow(Math.abs(Math.sin(t)), n), -1 / n)

/**
 * Anel usinado: perfil de retângulo arredondado varrido ao longo de uma superelipse.
 * Gera também aS (distância ao longo do perfil) e aTan (tangente do perfil), usados pelo
 * shader para desenhar as ranhuras de torno em toda a superfície.
 */
export function ringGeometry({ r = 1, n = 4, hole = 0.55, h = 0.3, bevel = 0.05, segU = 180, corner = 6 }) {
  const ro = r
  const ri = r * hole
  const hh = h / 2
  const b = Math.min(bevel, hh * 0.92, ((ro - ri) / 2) * 0.92)
  const prof = []
  const arc = (cx, cy, a0, a1) => {
    for (let i = 0; i <= corner; i++) {
      const a = a0 + ((a1 - a0) * i) / corner
      prof.push([cx + Math.cos(a) * b, cy + Math.sin(a) * b])
    }
  }
  const wall = (k, y0, y1, steps = 3) => {
    for (let i = 1; i < steps; i++) prof.push([k, y0 + ((y1 - y0) * i) / steps])
  }
  arc(ro - b, hh - b, Math.PI / 2, 0)
  wall(ro, hh - b, -hh + b)
  arc(ro - b, -hh + b, 0, -Math.PI / 2)
  arc(ri + b, -hh + b, -Math.PI / 2, -Math.PI)
  wall(ri, -hh + b, hh - b)
  arc(ri + b, hh - b, Math.PI, Math.PI / 2)

  const V = prof.length
  // distância acumulada e tangente ao longo do perfil
  const S = [0]
  for (let v = 1; v < V; v++) S.push(S[v - 1] + Math.hypot(prof[v][0] - prof[v - 1][0], prof[v][1] - prof[v - 1][1]))
  const T = prof.map((_, v) => {
    const a = prof[(v + V - 1) % V]
    const c = prof[(v + 1) % V]
    const l = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1
    return [(c[0] - a[0]) / l, (c[1] - a[1]) / l]
  })

  const pos = new Float32Array(segU * V * 3)
  const aS = new Float32Array(segU * V)
  const aTan = new Float32Array(segU * V * 3)
  for (let u = 0; u < segU; u++) {
    const t = (u / segU) * Math.PI * 2
    const q = sq(t, n)
    const cx = Math.cos(t) * q
    const cz = Math.sin(t) * q
    for (let v = 0; v < V; v++) {
      const i = u * V + v
      pos.set([cx * prof[v][0], prof[v][1], cz * prof[v][0]], i * 3)
      aS[i] = S[v]
      aTan.set([Math.cos(t) * T[v][0], T[v][1], Math.sin(t) * T[v][0]], i * 3)
    }
  }
  const idx = []
  for (let u = 0; u < segU; u++) {
    const u1 = (u + 1) % segU
    for (let v = 0; v < V; v++) {
      const v1 = (v + 1) % V
      const A = u * V + v, B = u1 * V + v, C = u * V + v1, D = u1 * V + v1
      idx.push(A, B, C, B, D, C)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aS', new THREE.BufferAttribute(aS, 1))
  geo.setAttribute('aTan', new THREE.BufferAttribute(aTan, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

// Contornos (topo e base) do anel, para as linhas de projeto.
export function ringOutline({ r = 1, n = 4, h = 0.3, seg = 120 }) {
  const pts = []
  for (const y of [h / 2, -h / 2])
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * Math.PI * 2
      const t1 = ((i + 1) / seg) * Math.PI * 2
      pts.push(Math.cos(t0) * sq(t0, n) * r, y, Math.sin(t0) * sq(t0, n) * r)
      pts.push(Math.cos(t1) * sq(t1, n) * r, y, Math.sin(t1) * sq(t1, n) * r)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return geo
}
