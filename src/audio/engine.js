// Identidade sonora do portfólio — 100% procedural (Web Audio API).
// Não há arquivos de áudio: a trilha ambiente é gerada em tempo real (nunca repete igual, não tem
// emenda de loop) e cada efeito é sintetizado na hora. Um único AudioContext, criado só depois de
// um gesto do visitante.
//
//   trilha  → pad (acordes lentos) + sub + ar (ruído filtrado) + pulso + notas-detalhe com eco
//   efeitos → hover, click, select, menu, section, open/close, layer, assemble, theme, copy…
//   mix     → barramentos separados (música / efeitos), reverb compartilhado, limitador na saída,
//             ducking leve da música nos efeitos importantes.

const KEY = 'dga-audio'
const DEFAULTS = { on: false, music: 0.7, sfx: 0.7 }
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12)
const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]

// Ré menor / dórico: quatro acordes abertos que se revezam bem devagar.
const CHORDS = [
  [38, 45, 53, 60, 64], // Dm9
  [34, 41, 50, 57, 65], // Bbmaj7
  [41, 48, 57, 64, 67], // Fmaj9
  [36, 43, 52, 57, 62], // C6/9
]
const SCALE = [74, 77, 79, 81, 84, 86, 89] // pentatônica de ré menor, registro agudo
const CHORD_TIME = 15
const XFADE = 6.5
// Cada seção deixa a trilha um pouco mais aberta ou mais fechada.
const SCENES = { home: 900, about: 700, expertise: 1050, work: 560, approach: 820, contact: 1150 }

class AudioEngine {
  constructor() {
    let saved = null
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    } catch {}
    this.prefs = { ...DEFAULTS, ...(saved || {}) }
    this.decided = !!saved // o visitante já escolheu alguma vez?
    this.active = false
    this.ctx = null
    this.listeners = new Set()
    this.last = {}
    this.timers = []
    this.chordIndex = 0
  }

  // ——— estado ———
  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  emit() {
    this.snapshot = { ...this.prefs, active: this.active, decided: this.decided }
    this.listeners.forEach((fn) => fn())
  }
  getSnapshot = () => this.snapshot || (this.snapshot = { ...this.prefs, active: this.active, decided: this.decided })
  save() {
    this.decided = true
    try {
      localStorage.setItem(KEY, JSON.stringify(this.prefs))
    } catch {}
  }

  // ——— ligar / desligar (sempre a partir de um gesto do visitante) ———
  async enable(silent = false) {
    this.prefs.on = true
    this.save()
    try {
      this.build()
      await this.ctx.resume()
    } catch {
      this.emit()
      return
    }
    this.active = true
    const t = this.ctx.currentTime
    this.fade.gain.cancelScheduledValues(t)
    this.fade.gain.setValueAtTime(Math.max(this.fade.gain.value, 0.0001), t)
    this.fade.gain.linearRampToValueAtTime(1, t + 4.5) // entrada gradual
    this.startAmbient()
    if (!silent) this.play('enable')
    this.emit()
  }
  disable(remember = true) {
    if (remember) {
      this.prefs.on = false
      this.save()
    }
    this.active = false
    this.stopAmbient()
    if (this.ctx) {
      const t = this.ctx.currentTime
      this.fade.gain.cancelScheduledValues(t)
      this.fade.gain.setValueAtTime(this.fade.gain.value, t)
      this.fade.gain.linearRampToValueAtTime(0, t + 1.6) // saída gradual
      clearTimeout(this.sleep)
      this.sleep = setTimeout(() => !this.active && this.ctx.suspend(), 1900)
    }
    this.emit()
  }
  toggle() {
    return this.active ? this.disable() : this.enable()
  }
  setVolume(kind, v) {
    this.prefs[kind] = Math.min(1, Math.max(0, v))
    this.save()
    if (this.ctx) this[kind === 'music' ? 'music' : 'sfx'].gain.setTargetAtTime(this.prefs[kind] ** 2, this.ctx.currentTime, 0.05)
    this.emit()
  }

  // ——— grafo ———
  build() {
    if (this.ctx) return
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = (this.ctx = new Ctx({ latencyHint: 'interactive' }))
    const gain = (v) => {
      const n = ctx.createGain()
      n.gain.value = v
      return n
    }
    // saída com limitador (evita clipping quando efeitos se somam)
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -12
    limiter.knee.value = 10
    limiter.ratio.value = 8
    limiter.attack.value = 0.004
    limiter.release.value = 0.22
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 1024
    limiter.connect(this.analyser)
    limiter.connect(ctx.destination)
    this.master = gain(0.9)
    this.master.connect(limiter)

    this.music = gain(this.prefs.music ** 2)
    this.fade = gain(0)
    this.music.connect(this.fade).connect(this.master)
    this.sfx = gain(this.prefs.sfx ** 2)
    this.sfx.connect(this.master)

    // reverb: resposta ao impulso gerada (ruído com decaimento) — sem arquivo
    const len = Math.floor(ctx.sampleRate * 4.2)
    const ir = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
    }
    this.reverb = ctx.createConvolver()
    this.reverb.buffer = ir
    this.musicVerb = gain(0.75)
    this.sfxVerb = gain(0.32)
    this.reverb.connect(this.musicVerb).connect(this.music)
    this.reverb.connect(this.sfxVerb).connect(this.sfx)
    this.sfxSend = gain(1)
    this.sfxSend.connect(this.reverb)

    // pad → filtro que "respira"
    this.padFilter = ctx.createBiquadFilter()
    this.padFilter.type = 'lowpass'
    this.padFilter.frequency.value = SCENES.home
    this.padFilter.Q.value = 0.6
    this.pad = gain(1)
    this.pad.connect(this.padFilter)
    this.padFilter.connect(this.music)
    this.padFilter.connect(this.reverb)
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.043
    const lfoDepth = gain(190)
    lfo.connect(lfoDepth).connect(this.padFilter.frequency)
    lfo.start()

    // eco para as notas-detalhe
    this.echo = ctx.createDelay(1.5)
    this.echo.delayTime.value = 0.47
    const fb = gain(0.42)
    const echoTone = ctx.createBiquadFilter()
    echoTone.type = 'lowpass'
    echoTone.frequency.value = 2400
    this.echo.connect(echoTone).connect(fb).connect(this.echo)
    this.echoIn = gain(1)
    this.echoIn.connect(this.music)
    this.echoIn.connect(this.echo)
    this.echo.connect(this.music)
    this.echo.connect(this.reverb)

    // ruído branco reutilizável
    const nlen = ctx.sampleRate * 2
    this.noiseBuf = ctx.createBuffer(1, nlen, ctx.sampleRate)
    const nd = this.noiseBuf.getChannelData(0)
    for (let i = 0; i < nlen; i++) nd[i] = Math.random() * 2 - 1

    // "ar": ruído agudo quase inaudível, com volume oscilando devagar
    const air = ctx.createBufferSource()
    air.buffer = this.noiseBuf
    air.loop = true
    const airBand = ctx.createBiquadFilter()
    airBand.type = 'bandpass'
    airBand.frequency.value = 5200
    airBand.Q.value = 0.7
    const airGain = gain(0.006)
    const airLfo = ctx.createOscillator()
    airLfo.frequency.value = 0.07
    const airDepth = gain(0.004)
    airLfo.connect(airDepth).connect(airGain.gain)
    air.connect(airBand).connect(airGain).connect(this.music)
    air.start()
    airLfo.start()
  }

  // ——— trilha ambiente ———
  startAmbient() {
    if (this.ambientOn) return
    this.ambientOn = true
    const chordLoop = () => {
      if (!this.ambientOn) return
      this.chord(CHORDS[this.chordIndex++ % CHORDS.length], this.ctx.currentTime + 0.05)
      this.timers.push(setTimeout(chordLoop, CHORD_TIME * 1000))
    }
    const detailLoop = () => {
      if (!this.ambientOn) return
      this.detail()
      this.timers.push(setTimeout(detailLoop, rand(4500, 11000)))
    }
    const pulseLoop = () => {
      if (!this.ambientOn) return
      this.pulse()
      this.timers.push(setTimeout(pulseLoop, 3750))
    }
    chordLoop()
    this.timers.push(setTimeout(detailLoop, 5000), setTimeout(pulseLoop, 8000))
  }
  stopAmbient() {
    this.ambientOn = false
    this.timers.forEach(clearTimeout)
    this.timers = []
  }
  chord(notes, t) {
    const ctx = this.ctx
    const end = t + CHORD_TIME + XFADE
    notes.forEach((n, i) => {
      const v = ctx.createGain()
      const peak = (i === 0 ? 0.11 : 0.05) / (1 + i * 0.12)
      v.gain.setValueAtTime(0, t)
      v.gain.linearRampToValueAtTime(peak, t + XFADE)
      v.gain.setValueAtTime(peak, t + CHORD_TIME)
      v.gain.linearRampToValueAtTime(0, end)
      v.connect(this.pad)
      const types = i === 0 ? ['sine', 'triangle'] : ['sawtooth', 'triangle']
      types.forEach((type, k) => {
        const o = ctx.createOscillator()
        o.type = type
        o.frequency.value = midi(n)
        o.detune.value = (k ? 7 : -6) + rand(-3, 3)
        o.connect(v)
        o.start(t)
        o.stop(end + 0.1)
      })
    })
  }
  detail() {
    const t = this.ctx.currentTime + 0.05
    const count = Math.random() < 0.35 ? 2 : 1
    for (let i = 0; i < count; i++) this.bell(midi(pick(SCALE)), t + i * rand(0.28, 0.6), 0.022, this.echoIn, 3.2)
  }
  pulse() {
    const ctx = this.ctx
    const t = ctx.currentTime + 0.05
    const o = ctx.createOscillator()
    const v = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = midi(57)
    v.gain.setValueAtTime(0, t)
    v.gain.linearRampToValueAtTime(0.018, t + 0.03)
    v.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
    o.connect(v).connect(this.echoIn)
    o.start(t)
    o.stop(t + 1)
  }
  setScene(id) {
    if (!this.ctx || !SCENES[id]) return
    this.padFilter.frequency.setTargetAtTime(SCENES[id], this.ctx.currentTime, 1.6)
  }

  // ——— blocos de síntese ———
  bell(f, t, g, dest, dur = 1.6) {
    const ctx = this.ctx
    const v = ctx.createGain()
    v.gain.setValueAtTime(0, t)
    v.gain.linearRampToValueAtTime(g, t + 0.012)
    v.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    v.connect(dest)
    ;[
      [1, 'sine', 1],
      [2.01, 'sine', 0.22],
      [3.02, 'triangle', 0.07],
    ].forEach(([ratio, type, amp]) => {
      const o = ctx.createOscillator()
      const og = ctx.createGain()
      o.type = type
      o.frequency.value = f * ratio
      og.gain.value = amp
      o.connect(og).connect(v)
      o.start(t)
      o.stop(t + dur + 0.05)
    })
  }
  tone({ f, f2, dur = 0.1, g = 0.1, type = 'sine', attack = 0.004, t, verb = 0 }) {
    const ctx = this.ctx
    const o = ctx.createOscillator()
    const v = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(f, t)
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur)
    v.gain.setValueAtTime(0, t)
    v.gain.linearRampToValueAtTime(g, t + attack)
    v.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(v).connect(this.sfx)
    if (verb) {
      const s = ctx.createGain()
      s.gain.value = verb
      v.connect(s).connect(this.sfxSend)
    }
    o.start(t)
    o.stop(t + dur + 0.03)
  }
  noise({ f, f2, q = 1, dur = 0.3, g = 0.05, type = 'bandpass', attack = 0.02, t, verb = 0 }) {
    const ctx = this.ctx
    const s = ctx.createBufferSource()
    s.buffer = this.noiseBuf
    s.loop = true
    const filt = ctx.createBiquadFilter()
    filt.type = type
    filt.Q.value = q
    filt.frequency.setValueAtTime(f, t)
    if (f2) filt.frequency.exponentialRampToValueAtTime(f2, t + dur)
    const v = ctx.createGain()
    v.gain.setValueAtTime(0, t)
    v.gain.linearRampToValueAtTime(g, t + attack)
    v.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    s.connect(filt).connect(v).connect(this.sfx)
    if (verb) {
      const send = ctx.createGain()
      send.gain.value = verb
      v.connect(send).connect(this.sfxSend)
    }
    s.start(t, Math.random())
    s.stop(t + dur + 0.03)
  }
  duck(amount = 0.72, time = 0.5) {
    const t = this.ctx.currentTime
    const base = this.prefs.music ** 2
    this.music.gain.cancelScheduledValues(t)
    this.music.gain.setTargetAtTime(base * amount, t, 0.04)
    this.music.gain.setTargetAtTime(base, t + time, 0.25)
  }

  // ——— biblioteca de efeitos ———
  play(name, arg = 0) {
    if (!this.active || !this.ctx || this.ctx.state !== 'running') return
    const now = performance.now()
    const gap = name === 'hover' ? 70 : 45
    if (now - (this.last[name] || 0) < gap) return // controle de repetição
    this.last[name] = now
    const t = this.ctx.currentTime + 0.005
    const fx = FX[name]
    if (fx) fx(this, t, arg)
  }
}

const FX = {
  // toque curtíssimo e delicado ao entrar em um elemento interativo
  hover: (a, t) => a.tone({ f: midi(pick([86, 89, 91])), f2: midi(84), dur: 0.05, g: 0.028, t }),
  // clique tátil: corpo grave + estalo
  click: (a, t) => {
    a.tone({ f: 420, f2: 190, dur: 0.09, g: 0.11, t })
    a.noise({ f: 3800, q: 0.8, dur: 0.03, g: 0.05, attack: 0.001, type: 'highpass', t })
  },
  // seleção de navegação: duas notas ascendentes
  select: (a, t) => {
    a.bell(midi(81), t, 0.06, a.sfx, 0.7)
    a.bell(midi(86), t + 0.075, 0.06, a.sfx, 0.9)
    a.duck(0.8, 0.4)
  },
  menuOpen: (a, t) => {
    a.noise({ f: 500, f2: 4200, q: 1.4, dur: 0.55, g: 0.05, attack: 0.12, t, verb: 0.5 })
    a.tone({ f: midi(62), f2: midi(74), dur: 0.5, g: 0.05, attack: 0.08, t, verb: 0.4 })
    a.duck(0.7, 0.6)
  },
  menuClose: (a, t) => {
    a.noise({ f: 3800, f2: 420, q: 1.4, dur: 0.45, g: 0.045, attack: 0.03, t, verb: 0.4 })
    a.tone({ f: midi(74), f2: midi(62), dur: 0.4, g: 0.045, attack: 0.02, t })
  },
  // mudança de seção: passagem de ar + profundidade
  section: (a, t) => {
    a.noise({ f: 380, f2: 1700, q: 0.9, dur: 0.95, g: 0.035, attack: 0.3, t, verb: 0.7 })
    a.tone({ f: 96, f2: 62, dur: 0.7, g: 0.07, attack: 0.05, t })
    a.duck(0.82, 0.7)
  },
  // abrir/fechar a apresentação de um projeto
  open: (a, t) => {
    ;[74, 81, 86].forEach((n, i) => a.bell(midi(n), t + i * 0.055, 0.045, a.sfx, 0.9))
    a.noise({ f: 900, f2: 3000, q: 1, dur: 0.3, g: 0.02, attack: 0.08, t })
    a.duck(0.8, 0.45)
  },
  close: (a, t) => {
    a.bell(midi(81), t, 0.035, a.sfx, 0.5)
    a.bell(midi(74), t + 0.06, 0.035, a.sfx, 0.6)
  },
  // camada do objeto 3D em destaque: a nota sobe com a camada (base → topo)
  layer: (a, t, i) => {
    const n = [62, 65, 69, 72, 77][Math.max(0, Math.min(4, i))]
    a.bell(midi(n), t, 0.07, a.sfx, 1.1)
    a.tone({ f: midi(n - 12), dur: 0.25, g: 0.05, t, verb: 0.5 })
    a.duck(0.82, 0.4)
  },
  // peça encaixando na montagem do objeto (Abordagem)
  assemble: (a, t, i) => {
    const f = midi([50, 53, 57, 60, 62, 65, 69][Math.max(0, Math.min(6, i))])
    a.tone({ f: f * 2.76, dur: 0.18, g: 0.035, t, verb: 0.6 })
    a.tone({ f: f * 5.4, dur: 0.09, g: 0.02, t })
    a.tone({ f, f2: f * 0.5, dur: 0.22, g: 0.09, t })
    a.noise({ f: 2600, q: 2, dur: 0.05, g: 0.04, attack: 0.001, t })
  },
  // troca de tema: brilho descendo (vinho) ou subindo (papel)
  theme: (a, t, up) => {
    const seq = up ? [74, 79, 86, 91] : [91, 86, 79, 74]
    seq.forEach((n, i) => a.bell(midi(n), t + i * 0.06, 0.035, a.sfx, 0.8))
    a.noise({ f: up ? 800 : 5000, f2: up ? 5000 : 800, q: 1.2, dur: 0.5, g: 0.025, attack: 0.1, t, verb: 0.5 })
  },
  copy: (a, t) => {
    a.bell(midi(86), t, 0.05, a.sfx, 0.4)
    a.bell(midi(93), t + 0.09, 0.05, a.sfx, 0.7)
  },
  feature: (a, t) => a.tone({ f: midi(69), f2: midi(76), dur: 0.14, g: 0.05, t, verb: 0.5 }),
  // som de ativação: acorde que abre
  enable: (a, t) => {
    ;[62, 69, 74, 81].forEach((n, i) => a.bell(midi(n), t + 0.15 + i * 0.11, 0.05, a.sfx, 2.2))
    a.noise({ f: 300, f2: 2400, q: 0.8, dur: 1.4, g: 0.03, attack: 0.6, t, verb: 0.8 })
  },
}

export const audio = new AudioEngine()

// A aba ficou oculta → silencia e suspende; voltou → retoma (sem novo gesto, o contexto já foi liberado).
if (typeof document !== 'undefined')
  document.addEventListener('visibilitychange', () => {
    if (!audio.ctx || !audio.prefs.on) return
    if (document.hidden) audio.disable(false)
    else audio.enable(true)
  })
