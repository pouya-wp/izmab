import { useCallback, useEffect, useRef, useState } from 'react'
import { SFX_SPRITE } from './sfxSprite'

/*
 * Sound design with real, designed interface sounds (SND by Dentsu — see public/sfx/CREDITS.txt), mixed soft:
 * gentle taps on hover, a rounded select on click, soft typing for the form, swipes for movement, transitions
 * between sections, rhythmic taps as lists land, mechanical detents on the aperture ring and a warm celebration
 * for the big moments. Every sound is panned by where it happens on screen and lightly varied in pitch and level,
 * so repeats never sound mechanical. The sprite (~290 kB) loads only when the visitor turns sound on.
 */
export type SoundCue = 'hover' | 'click' | 'transition' | 'stamp' | 'clap' | 'shutter' | 'pop' | 'cascade' | 'impact' | 'key' | 'detent' | 'open' | 'close'
type CueOptions = { x?: number; pitch?: number; count?: number }

const pick = (base: string, n = 5) => `${base}_0${1 + Math.floor(Math.random() * n)}`

class Sampler {
  context: AudioContext
  master: GainNode
  buffer: AudioBuffer | null = null
  ready: Promise<void>

  constructor() {
    const context = new AudioContext()
    this.context = context
    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -20; compressor.ratio.value = 2.5; compressor.attack.value = .005; compressor.release.value = .25
    this.master = context.createGain()
    this.master.gain.value = 1
    this.master.connect(compressor).connect(context.destination)
    this.ready = fetch('/sfx/izmab-sfx.mp3')
      .then(response => response.arrayBuffer())
      .then(data => context.decodeAudioData(data))
      .then(buffer => { this.buffer = buffer })
  }

  /** Play one sound from the sprite: level in 0..1, pan -1..1, rate for a touch of pitch variation. */
  play(name: string, level: number, pan = 0, rate = 1, delay = 0) {
    const entry = SFX_SPRITE[name]
    if (!this.buffer || !entry) return
    const [offset, duration] = entry
    const t = this.context.currentTime + delay
    const source = this.context.createBufferSource()
    source.buffer = this.buffer
    source.playbackRate.value = rate
    const gain = this.context.createGain()
    gain.gain.value = level
    const panner = this.context.createStereoPanner()
    panner.pan.value = Math.max(-1, Math.min(1, pan * .6))
    source.connect(gain).connect(panner).connect(this.master)
    source.start(t, offset, duration + .04)
  }
}

export function useSoundDesign() {
  const [enabled, setEnabled] = useState(false)
  const sampler = useRef<Sampler | null>(null)
  const last = useRef<Record<string, number>>({})

  const play = useCallback((cue: SoundCue, options: CueOptions = {}) => {
    const s = sampler.current
    if (!enabled || !s || s.context.state !== 'running') return
    const now = performance.now()
    const gap = cue === 'hover' ? 90 : cue === 'key' ? 35 : cue === 'detent' ? 45 : cue === 'cascade' ? 500 : cue === 'transition' ? 600 : 60
    if (now - (last.current[cue] ?? 0) < gap) return
    last.current[cue] = now
    const pan = options.x === undefined ? 0 : (options.x / innerWidth) * 2 - 1
    const vary = (amount = .04) => 1 + (Math.random() - .5) * amount
    switch (cue) {
      case 'hover': s.play(`tap_0${1 + ((options.pitch ?? Math.floor(Math.random() * 5)) % 5)}`, .42 * vary(.2), pan, vary()); break
      case 'pop': s.play(pick('tap'), .5, pan, vary()); break
      case 'click': s.play('select', .5, pan, vary(.03)); break
      case 'key': s.play(pick('type'), .45 * vary(.3), pan, vary(.08)); break
      case 'detent': s.play(pick('mech_tap'), .2 * vary(.2), pan, vary(.06)); break
      case 'transition': s.play('transition_up', .22, pan, vary(.02)); break
      case 'shutter': s.play(pick('swipe'), .3, pan, vary(.04)); s.play(pick('mech_tap'), .16, pan, 1, .05); break
      case 'clap': s.play('button', .38, pan, .94); break
      case 'cascade': {
        const count = Math.min(options.count ?? 4, 6)
        for (let i = 0; i < count; i++) s.play(`tap_0${1 + (i % 5)}`, .32 * vary(.2), pan + (i - count / 2) * .08, vary(.03), i * (.075 + Math.random() * .03))
        break
      }
      case 'open': s.play('transition_up', .36, pan); s.play(pick('swipe'), .2, pan, .9, .04); break
      case 'close': s.play('transition_down', .34, pan); break
      case 'stamp': case 'impact': s.play('celebration', .42, pan); break
    }
  }, [enabled])

  const toggle = useCallback(async () => {
    if (enabled) { sampler.current?.play('toggle_off', .45); setEnabled(false); return }
    try {
      sampler.current ??= new Sampler()
      const s = sampler.current
      await s.context.resume()
      await s.ready
      setEnabled(true)
      s.play('toggle_on', .45)
      s.play('transition_up', .24, 0, 1, .12)
    } catch {
      setEnabled(false)
    }
  }, [enabled])

  // Global layer: soft taps on hover, a rounded select on click, typing in the form, swipes on fast scrolls.
  useEffect(() => {
    if (!enabled) return
    const pitchOf = (el: Element) => ((el.textContent ?? '').length + (el.getAttribute('href')?.length ?? 0)) % 5
    const over = (event: PointerEvent) => {
      const el = (event.target as Element).closest?.('a, button, select, [data-sfx], [data-cursor-label]')
      if (!el || (event.relatedTarget instanceof Node && el.contains(event.relatedTarget))) return
      play('hover', { x: event.clientX, pitch: pitchOf(el) })
    }
    const click = (event: MouseEvent) => { if ((event.target as Element).closest?.('a, button, select, [data-sfx]')) play('click', { x: event.clientX }) }
    const key = (event: KeyboardEvent) => { if ((event.target as Element).closest?.('input, textarea') && (event.key.length === 1 || event.key === 'Backspace')) play('key', { x: innerWidth / 2 }) }
    let frame = 0, lastY = scrollY, speed = 0, lastSwipe = 0
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const delta = Math.abs(scrollY - lastY); lastY = scrollY
      speed += (Math.min(delta, 120) - speed) * .2
      if (speed > 55 && now - lastSwipe > 700) { lastSwipe = now; sampler.current?.play(pick('swipe'), .14, 0, .9 + Math.random() * .1) }
    }
    frame = requestAnimationFrame(tick)
    document.addEventListener('pointerover', over)
    document.addEventListener('click', click)
    document.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerover', over); document.removeEventListener('click', click); document.removeEventListener('keydown', key)
    }
  }, [enabled, play])

  useEffect(() => {
    const visibility = () => { const s = sampler.current; if (!s) return; if (document.hidden) void s.context.suspend(); else if (enabled) void s.context.resume() }
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [enabled])

  useEffect(() => () => { const s = sampler.current; sampler.current = null; void s?.context.close() }, [])
  return { enabled, toggle, play }
}
