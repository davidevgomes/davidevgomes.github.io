import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { initScroll, initReveals, gsap, ScrollTrigger, lenis } from './lib/motion'
import { store, isLowEnd, hasWebGL } from './lib/store'
import { useTheme } from './lib/hooks'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Cursor from './components/Cursor'
import Hero from './components/Hero'
import About from './components/About'
import Expertise from './components/Expertise'
import Work from './components/Work'
import Approach from './components/Approach'
import Contact from './components/Contact'
import { SoundInvite } from './components/Sound'
import { bindSounds } from './audio/bindings'
import { audio } from './audio/engine'

// O bundle 3D (three + R3F) carrega em paralelo, fora do caminho crítico.
const Scene = lazy(() => import('./three/Scene'))

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [ready, setReady] = useState(false)
  const webgl = useMemo(hasWebGL, [])
  const low = useMemo(isLowEnd, [])

  useEffect(() => {
    if (!store.reduced) document.documentElement.classList.add('js-motion')
    const stop = initScroll()
    lenis?.stop()
    return stop
  }, [])

  useEffect(() => {
    if (!ready) return
    lenis?.start()
    const revert = initReveals()
    const unbind = bindSounds()
    if (store.debug) window.__audio = audio
    gsap.to(store.intro, { v: 1, duration: store.reduced ? 0 : 2.4, ease: 'expo.out' })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      revert()
      unbind()
    }
  }, [ready])

  return (
    <div className="app">
      <a className="skip" href="#about">Pular para o conteúdo</a>
      <div className="gridlines" aria-hidden="true"><i /><i /><i /><i /></div>
      <Loader onDone={() => setReady(true)} />
      <Nav ready={ready} theme={theme} onToggleTheme={toggleTheme} />
      {webgl && (
        <Suspense fallback={null}>
          <Scene theme={theme} low={low} />
        </Suspense>
      )}
      <main id="conteudo">
        <Hero ready={ready} />
        <About />
        <Expertise />
        <Work />
        <Approach />
        <Contact />
      </main>
      <SoundInvite ready={ready} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </div>
  )
}
