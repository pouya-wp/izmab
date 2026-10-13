import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Sound design, modelled on a product-film mix: round "bubble" pops for things appearing and hovering, crisp
 * high ticks for typing and UI, airy whooshes for movement, rhythmic tick cascades when lists land, a warm pad
 * underneath, and a glassy impact with shimmer for the big moments. Everything is synthesised (no files), goes
 * through a short reverb and a compressor, and is panned by where it happens on screen. Nothing plays until the
 * visitor turns sound on.
 */
export type SoundCue = 'hover' | 'click' | 'transition' | 'stamp' | 'clap' | 'shutter' | 'pop' | 'cascade' | 'impact' | 'key' | 'open' | 'close'
type CueOptions = { x?: number; pitch?: number; count?: number }

// A major-pentatonic ladder around the pad's key, so pops always sit in tune with it.
export const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51]

export class Engine {
  context: AudioContext
  master: GainNode
  dry: GainNode
  wet: GainNode
  padFilter: BiquadFilterNode
  padGain: GainNode
  airGain: GainNode
  airFilter: BiquadFilterNode
  noise: AudioBuffer

  constructor(context: AudioContext = new AudioContext()) {
    this.context = context
    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -18; compressor.ratio.value = 3; compressor.attack.value = .004; compressor.release.value = .2
    this.master = context.createGain()
    this.master.gain.value = .9
    this.master.connect(compressor).connect(context.destination)
    this.dry = context.createGain(); this.dry.connect(this.master)
    const reverb = context.createConvolver()
    reverb.buffer = this.impulse(1.8)
    this.wet = context.createGain(); this.wet.gain.value = .28
    this.wet.connect(reverb).connect(this.master)
    this.noise = this.noiseBuffer(2)
    // The pad: three detuned voices of a soft chord under a slow, breathing low-pass.
    this.padFilter = context.createBiquadFilter(); this.padFilter.type = 'lowpass'; this.padFilter.frequency.value = 1100; this.padFilter.Q.value = .6
    this.padGain = context.createGain(); this.padGain.gain.value = 0
    // Voiced in the mids like the reference bed (≈260–1300 Hz), with the lows rolled off so it never booms.
    const padHigh = context.createBiquadFilter(); padHigh.type = 'highpass'; padHigh.frequency.value = 200; padHigh.Q.value = .5
    this.padFilter.connect(padHigh).connect(this.padGain); this.padGain.connect(this.dry); this.padGain.connect(this.wet)
    for (const [frequency, detune] of [[261.63, -6], [392, 4], [523.25, -3], [659.25, 7], [783.99, -4]]) {
      const osc = context.createOscillator(); osc.type = 'triangle'; osc.frequency.value = frequency; osc.detune.value = detune
      const voice = context.createGain(); voice.gain.value = .11
      osc.connect(voice).connect(this.padFilter); osc.start()
    }
    const lfo = context.createOscillator(); lfo.frequency.value = .07
    const depth = context.createGain(); depth.gain.value = 380
    lfo.connect(depth).connect(this.padFilter.frequency); lfo.start()
    // Air: filtered noise whose level follows scroll speed, the soft whoosh of moving through the page.
    const air = context.createBufferSource(); air.buffer = this.noise; air.loop = true
    this.airFilter = context.createBiquadFilter(); this.airFilter.type = 'bandpass'; this.airFilter.frequency.value = 900; this.airFilter.Q.value = .7
    this.airGain = context.createGain(); this.airGain.gain.value = 0
    air.connect(this.airFilter).connect(this.airGain).connect(this.dry); air.start()
  }

  impulse(seconds: number) {
    const { sampleRate } = this.context, length = Math.floor(sampleRate * seconds)
    const buffer = this.context.createBuffer(2, length, sampleRate)
    for (let c = 0; c < 2; c++) { const data = buffer.getChannelData(c); for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2) }
    return buffer
  }
  noiseBuffer(seconds: number) {
    const length = Math.floor(this.context.sampleRate * seconds)
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }
  out(pan = 0, wet = .3) {
    const panner = this.context.createStereoPanner(); panner.pan.value = Math.max(-1, Math.min(1, pan))
    const send = this.context.createGain(); send.gain.value = wet
    panner.connect(this.dry); panner.connect(send).connect(this.wet)
    return panner
  }
  /** A round, pitched pop: a sine that drops in pitch, with a soft click on the front. */
  pop(frequency: number, level: number, pan = 0, delay = 0, length = .09) {
    const t = this.context.currentTime + delay
    const osc = this.context.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency * 1.6, t); osc.frequency.exponentialRampToValueAtTime(frequency, t + .025); osc.frequency.exponentialRampToValueAtTime(frequency * .82, t + length)
    const gain = this.context.createGain()
    gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(level, t + .006); gain.gain.exponentialRampToValueAtTime(.0001, t + length)
    osc.connect(gain).connect(this.out(pan, .35)); osc.start(t); osc.stop(t + length + .02)
    this.tick(level * .25, 3200, pan, delay, .012)
  }
  /** A crisp tick: a few milliseconds of band-passed noise. */
  tick(level: number, frequency: number, pan = 0, delay = 0, length = .028) {
    const t = this.context.currentTime + delay
    const source = this.context.createBufferSource(); source.buffer = this.noise
    const filter = this.context.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = 1.4
    const gain = this.context.createGain()
    gain.gain.setValueAtTime(level, t); gain.gain.exponentialRampToValueAtTime(.0001, t + length)
    source.connect(filter).connect(gain).connect(this.out(pan, .18))
    source.start(t, Math.random() * 1.5, length + .02)
  }
  /** A whoosh: noise swept through a band-pass, swelling and fading. */
  whoosh(level: number, from: number, to: number, length: number, pan = 0, delay = 0) {
    const t = this.context.currentTime + delay
    const source = this.context.createBufferSource(); source.buffer = this.noise
    const filter = this.context.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = 1.1
    filter.frequency.setValueAtTime(from, t); filter.frequency.exponentialRampToValueAtTime(to, t + length)
    const gain = this.context.createGain()
    gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(level, t + length * .45); gain.gain.exponentialRampToValueAtTime(.0001, t + length)
    source.connect(filter).connect(gain).connect(this.out(pan, .45))
    source.start(t, Math.random(), length + .05)
  }
  /** The landing: a glassy body, a low thump and a bright shimmer that tails into the reverb. */
  impact(level: number, pan = 0) {
    const t = this.context.currentTime
    for (const [frequency, share, length] of [[560, 1, .5], [1120, .45, .35], [1680, .25, .25], [62, .9, .32]]) {
      const osc = this.context.createOscillator(); osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency * (frequency < 100 ? 1.8 : 1), t); osc.frequency.exponentialRampToValueAtTime(frequency, t + .04)
      const gain = this.context.createGain()
      gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(level * share, t + .005); gain.gain.exponentialRampToValueAtTime(.0001, t + length)
      osc.connect(gain).connect(this.out(pan, .5)); osc.start(t); osc.stop(t + length + .05)
    }
    this.whoosh(level * .5, 9000, 5000, .45, pan)
    SCALE.slice(4).forEach((frequency, i) => this.pop(frequency * 2, level * .12, pan + (i - 1.5) * .25, .05 + i * .045, .3))
  }
  /** Rhythmic ticks, the sound of cards landing one after another. */
  cascade(count: number, pan = 0) {
    for (let i = 0; i < count; i++) {
      this.tick(.09, 5300 + Math.random() * 300, pan + (Math.random() - .5) * .5, i * (.085 + Math.random() * .04), .024)
      if (i === count - 1) this.pop(SCALE[5], .05, pan, i * .1 + .04, .12)
    }
  }
}

export function useSoundDesign() {
  const [enabled, setEnabled] = useState(false)
  const engine = useRef<Engine | null>(null)
  const last = useRef<Record<string, number>>({})

  const play = useCallback((cue: SoundCue, options: CueOptions = {}) => {
    const e = engine.current
    if (!enabled || !e || e.context.state !== 'running') return
    const now = performance.now()
    const gap = cue === 'hover' ? 70 : cue === 'key' ? 30 : cue === 'cascade' ? 400 : 40
    if (now - (last.current[cue] ?? 0) < gap) return
    last.current[cue] = now
    const pan = options.x === undefined ? 0 : (options.x / innerWidth) * 2 - 1
    const note = SCALE[Math.abs(Math.round(options.pitch ?? Math.random() * 8)) % SCALE.length]
    switch (cue) {
      case 'hover': e.pop(note, .07, pan); break
      case 'pop': e.pop(note * .5, .12, pan, 0, .12); break
      case 'click': e.tick(.22, 6200, pan); e.pop(note * .5, .06, pan, .005, .06); break
      case 'key': e.tick(.11 + Math.random() * .06, 4800 + Math.random() * 2600, pan, 0, .02 + Math.random() * .02); break
      case 'transition': e.whoosh(.12, 400, 3200, .55, pan); break
      case 'shutter': e.whoosh(.14, 2400, 600, .32, pan); e.tick(.2, 5600, pan, .02); e.tick(.16, 4200, pan, .09); break
      case 'clap': e.tick(.35, 2200, pan, 0, .06); e.pop(140, .12, pan, 0, .08); break
      case 'cascade': e.cascade(options.count ?? 5, pan); break
      case 'open': e.whoosh(.16, 300, 4200, .7, pan); e.pop(SCALE[2], .06, pan, .22, .25); break
      case 'close': e.whoosh(.14, 4200, 300, .55, pan); break
      case 'stamp': case 'impact': e.impact(.32, pan); break
    }
  }, [enabled])

  const toggle = useCallback(async () => {
    if (enabled) {
      const e = engine.current
      if (e) e.padGain.gain.setTargetAtTime(0, e.context.currentTime, .3)
      setEnabled(false)
      return
    }
    try {
      engine.current ??= new Engine()
      const e = engine.current
      await e.context.resume()
      setEnabled(true)
      // The video's "drop": a breath of silence, then the pad rises under a landing impact.
      e.padGain.gain.setTargetAtTime(.04, e.context.currentTime + .25, 1.6)
      window.setTimeout(() => e.impact(.26), 180)
    } catch {
      setEnabled(false)
    }
  }, [enabled])

  // Global layer: pops on hover, ticks on click and typing, air on scroll, a pad that opens up with movement.
  useEffect(() => {
    if (!enabled) return
    const pitchOf = (el: Element) => { const s = (el.textContent ?? '').length + (el.getAttribute('href')?.length ?? 0); return s % SCALE.length }
    const over = (event: PointerEvent) => {
      const target = event.target as Element
      const el = target.closest?.('a, button, select, [data-sfx], [data-cursor-label]')
      if (!el || (event.relatedTarget instanceof Node && el.contains(event.relatedTarget))) return
      play('hover', { x: event.clientX, pitch: pitchOf(el) })
    }
    const click = (event: MouseEvent) => { if ((event.target as Element).closest?.('a, button, select, [data-sfx]')) play('click', { x: event.clientX }) }
    const key = (event: KeyboardEvent) => { if ((event.target as Element).closest?.('input, textarea') && (event.key.length === 1 || event.key === 'Backspace')) play('key', { x: innerWidth / 2 }) }
    let frame = 0, lastY = scrollY, speed = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const e = engine.current
      if (!e) return
      const delta = Math.abs(scrollY - lastY); lastY = scrollY
      speed += (Math.min(delta, 80) - speed) * .08
      const t = e.context.currentTime
      e.airGain.gain.setTargetAtTime(Math.min(.09, speed * .0022), t, .08)
      e.airFilter.frequency.setTargetAtTime(600 + speed * 40, t, .1)
      e.padFilter.frequency.setTargetAtTime(1000 + speed * 40, t, .3)
    }
    frame = requestAnimationFrame(tick)
    document.addEventListener('pointerover', over)
    document.addEventListener('click', click)
    document.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerover', over); document.removeEventListener('click', click); document.removeEventListener('keydown', key)
      const e = engine.current
      if (e) { e.airGain.gain.setTargetAtTime(0, e.context.currentTime, .1) }
    }
  }, [enabled, play])

  // Pause the bed when the tab is hidden.
  useEffect(() => {
    const visibility = () => { const e = engine.current; if (!e) return; if (document.hidden) void e.context.suspend(); else if (enabled) void e.context.resume() }
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [enabled])

  useEffect(() => () => { const e = engine.current; engine.current = null; void e?.context.close() }, [])
  return { enabled, toggle, play }
}
