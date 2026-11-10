import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../lib/store'
import { basePose } from '../lib/poses'
import { ringGeometry, ringOutline } from './geometry'
import { machinedMaterial, liquidMaterial } from './materials'

// "The Stack" — a assinatura 3D. Cinco camadas usinadas (as disciplinas, da infraestrutura à IA)
// em torno de um núcleo líquido (a ideia). A ordem segue data/site.js → expertise.
const LAYERS = [
  { r: 1.05, n: 4, hole: 0.58, h: 0.36, bevel: 0.06, mat: { color: '#34363c', roughness: 0.34, freq: 120, amp: 0.55 } },
  { r: 0.95, n: 3, hole: 0.5, h: 0.2, bevel: 0.05, mat: { color: '#7a0f27', roughness: 0.26, freq: 190, amp: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.2 } },
  { r: 1.13, n: 5, hole: 0.66, h: 0.13, bevel: 0.045, mat: { color: '#efece7', roughness: 0.07, freq: 220, amp: 0.22, top: 0.5 } },
  { r: 0.84, n: 4, hole: 0.52, h: 0.3, bevel: 0.06, mat: { color: '#0d0c0e', roughness: 0.16, metalness: 0.85, freq: 90, amp: 0.6, clearcoat: 1, clearcoatRoughness: 0.08 } },
  { r: 0.66, n: 2.4, hole: 0.56, h: 0.22, bevel: 0.07, mat: { color: '#d9d5d0', roughness: 0.18, freq: 260, amp: 0.35, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [120, 620] } },
]
const GAP = 0.055
const TOTAL = LAYERS.reduce((a, l) => a + l.h, 0) + GAP * (LAYERS.length - 1)
const BASE_Y = (() => {
  let y = -TOTAL / 2
  return LAYERS.map((l) => {
    const c = y + l.h / 2
    y += l.h + GAP
    return c
  })
})()

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (t) => t * t * (3 - 2 * t)

export default function Stack({ theme, low }) {
  const group = useRef()
  const rings = useRef([])
  const core = useRef()
  const axis = useRef()

  const built = useMemo(() => {
    const segU = low ? 110 : 200
    const layers = LAYERS.map((l) => ({
      geo: ringGeometry({ ...l, segU, corner: low ? 4 : 7 }),
      outline: ringOutline({ ...l, seg: low ? 72 : 128 }),
      mat: machinedMaterial({ emissive: '#f0214a', emissiveIntensity: 0, ...l.mat }),
      line: new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    }))
    const coreGeo = new THREE.IcosahedronGeometry(0.33, low ? 14 : 30)
    const coreMat = liquidMaterial({ color: '#ee1a43', roughness: 0.1, iridescence: 0.7, iridescenceIOR: 1.5, clearcoat: 1, emissive: '#5a0015', emissiveIntensity: 0.55 })
    const axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -1.9, 0), new THREE.Vector3(0, 1.9, 0)])
    const axisMat = new THREE.LineDashedMaterial({ transparent: true, opacity: 0, dashSize: 0.05, gapSize: 0.05, depthWrite: false })
    return { layers, coreGeo, coreMat, axisGeo, axisMat }
  }, [low])

  useEffect(() => {
    axis.current?.computeLineDistances()
    return () => {
      built.layers.forEach((l) => (l.geo.dispose(), l.outline.dispose(), l.mat.dispose(), l.line.dispose()))
      built.coreGeo.dispose()
      built.coreMat.dispose()
    }
  }, [built])

  const cur = useRef({ ...basePose, presence: 1 })
  const st = useRef({ px: 0, py: 0, lag: LAYERS.map(() => 0), act: LAYERS.map(() => 0), t: 0, energy: 0 })
  const ink = useMemo(() => new THREE.Color(), [])
  const accent = useMemo(() => new THREE.Color(), [])
  useEffect(() => {
    ink.set(theme === 'papel' ? '#100c0c' : '#f1e9e4')
    accent.set(theme === 'papel' ? '#c20f33' : '#ff3358')
  }, [theme, ink, accent])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = st.current
    const c = cur.current
    const target = store.target || basePose
    const reduced = store.reduced
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4.5)
    for (const key in c) c[key] += (target[key] - c[key]) * k
    if (!reduced) s.t += dt
    store.presenceNow = c.presence

    const { viewport } = state
    const unit = Math.min(viewport.height, viewport.width * 1.2) * 0.3
    const intro = store.intro.v
    const pk = 1 - Math.exp(-dt * 3)
    s.px += (store.pointer.x - s.px) * pk
    s.py += (store.pointer.y - s.py) * pk
    s.energy += (Math.min(store.pointer.speed, 1) - s.energy) * (1 - Math.exp(-dt * 2))
    store.pointer.speed *= Math.exp(-dt * 6)

    const g = group.current
    g.position.set((c.x * viewport.width) / 2, (c.y * viewport.height) / 2 + (1 - intro) * -0.6, 0)
    g.scale.setScalar(Math.max(0.0001, unit * c.s * c.presence * (0.6 + 0.4 * intro)))
    g.rotation.set(c.rx - s.py * 0.22, c.ry + s.px * 0.45 + s.t * 0.11 * c.spin + (1 - intro) * 2.4, c.rz + s.px * 0.05)

    const active = store.activeLayer
    built.layers.forEach((L, i) => {
      const m = rings.current[i]
      if (!m) return
      // cada camada segue o ponteiro com um atraso diferente → a pilha torce como uma mola
      s.lag[i] += (store.pointer.x - s.lag[i]) * (1 - Math.exp(-dt * (1.2 + i * 0.9)))
      s.act[i] += ((active === i ? 1 : 0) - s.act[i]) * (1 - Math.exp(-dt * 6))
      const asm = smooth(clamp(c.assemble * LAYERS.length - i - 0.6))
      const bob = Math.sin(s.t * 0.9 + i * 1.7) * 0.012 * (1 + c.explode * 3)
      m.position.set(s.act[i] * 0.16, BASE_Y[i] + (i - 2) * c.explode * 0.46 + bob, s.act[i] * 0.16)
      m.rotation.y = i * c.twist * 0.42 + (s.lag[i] - s.px) * 1.5 + Math.sin(s.t * 0.35 + i) * 0.05
      m.rotation.z = Math.sin(s.t * 0.5 + i * 2.1) * 0.012 * c.explode
      // o sólido desce até o contorno de projeto (que já marca a posição final)
      m.children[0].position.y = (1 - asm) * 1.5
      m.children[0].rotation.y = (1 - asm) * 1.2
      m.children[0].scale.setScalar(Math.max(0.0001, asm) * (1 + s.act[i] * 0.05))
      L.mat.emissiveIntensity = s.act[i] * 0.22
      const dim = active >= 0 ? 0.35 + 0.65 * s.act[i] : 1
      L.line.opacity = c.ghost * (0.28 + 0.72 * Math.max(s.act[i], 1 - asm)) * dim
      L.line.color.copy(ink).lerp(accent, Math.max(s.act[i], (1 - asm) * 0.8))
    })

    const u = built.coreMat.userData.uniforms
    u.uTime.value = s.t + s.energy * 0.6
    u.uAmp.value = 0.07 + c.explode * 0.05 + s.energy * 0.1
    core.current.scale.setScalar(1 + c.explode * 0.35)
    core.current.position.y = Math.sin(s.t * 0.7) * 0.02
    core.current.rotation.y = -s.t * 0.2

    built.axisMat.opacity = c.ghost * 0.5
    built.axisMat.color.copy(ink)
  })

  return (
    <group ref={group}>
      {built.layers.map((L, i) => (
        <group key={i} ref={(el) => (rings.current[i] = el)}>
          <mesh geometry={L.geo} material={L.mat} />
          <lineSegments geometry={L.outline} material={L.line} />
        </group>
      ))}
      <mesh ref={core} geometry={built.coreGeo} material={built.coreMat} />
      <line ref={axis} geometry={built.axisGeo} material={built.axisMat} />
    </group>
  )
}
