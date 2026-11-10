import { useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { store } from '../lib/store'
import { poseAt } from '../lib/poses'
import Stack from './Stack'

// Estúdio de luz procedural (sem HDR externo): softboxes brancos + um recorte carmesim.
function Studio({ theme }) {
  const paper = theme === 'papel'
  return (
    <Environment resolution={256} frames={1} key={theme}>
      <mesh scale={50}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={paper ? '#a9a49c' : '#070304'} side={THREE.BackSide} />
      </mesh>
      <Lightformer form="rect" intensity={paper ? 9 : 7} position={[0, 6, -1]} rotation-x={Math.PI / 2} scale={[11, 4, 1]} />
      <Lightformer form="rect" intensity={paper ? 5 : 3.2} position={[-7, 1, 3]} rotation-y={Math.PI / 2} scale={[3, 9, 1]} />
      <Lightformer form="rect" intensity={paper ? 3 : 3.4} color="#ff1f4b" position={[7, -1, 2]} rotation-y={-Math.PI / 2} scale={[2.2, 7, 1]} />
      <Lightformer form="ring" intensity={paper ? 6 : 4} position={[1, -5, 4]} rotation-x={-Math.PI / 2.4} scale={3.4} />
      <Lightformer form="rect" intensity={2} color={paper ? '#ffffff' : '#9db8ff'} position={[3, 3, 8]} scale={[5, 0.8, 1]} />
      <Lightformer form="rect" intensity={paper ? 4 : 1.4} position={[-3, -2, 9]} scale={[1, 5, 1]} />
    </Environment>
  )
}

// Renderiza sob demanda: só gera frames enquanto o objeto está em cena e a aba visível.
function Driver() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    const tick = () => {
      const t = (store.target = poseAt(window.scrollY))
      if (document.hidden) return
      if (t.presence > 0.002 || store.presenceNow > 0.004) invalidate()
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [invalidate])
  return null
}

export default function Scene({ theme, low }) {
  const [ready, setReady] = useState(false)
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, low ? 1.5 : 1.75))
  return (
    <div className={'scene' + (ready ? ' is-ready' : '')} aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 30, position: [0, 0, 9], near: 0.1, far: 60 }}
        onCreated={() => {
          store.sceneReady = true
          setReady(true)
          window.dispatchEvent(new Event('scene:ready'))
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Studio theme={theme} />
        <directionalLight position={[4, 6, 5]} intensity={theme === 'papel' ? 1.6 : 1.1} />
        <pointLight position={[0, 0, 0]} intensity={2.5} color="#ff2a50" distance={3} />
        <Stack theme={theme} low={low} />
        <Driver />
      </Canvas>
    </div>
  )
}
