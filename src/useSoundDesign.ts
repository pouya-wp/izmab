import { useCallback, useEffect, useRef, useState } from 'react'

export type SoundCue = 'hover' | 'click' | 'transition' | 'stamp' | 'clap' | 'shutter'

function tone(context: AudioContext, frequency: number, duration: number, level: number, delay = 0) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, context.currentTime + delay)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.82, context.currentTime + delay + duration)
  gain.gain.setValueAtTime(0.0001, context.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(level, context.currentTime + delay + 0.014)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(context.currentTime + delay)
  oscillator.stop(context.currentTime + delay + duration + 0.02)
}

function noise(context: AudioContext, duration: number, level: number, cutoff: number, delay = 0) {
  const length = Math.ceil(context.sampleRate * duration)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4)
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = buffer
  filter.type = 'bandpass'; filter.frequency.value = cutoff; filter.Q.value = .8
  gain.gain.value = level
  source.connect(filter).connect(gain).connect(context.destination)
  source.start(context.currentTime + delay)
}

function playCue(context: AudioContext, cue: SoundCue) {
  if (context.state !== 'running') return
  if (cue === 'hover') tone(context, 720, 0.09, 0.014)
  if (cue === 'click') { tone(context, 190, 0.13, 0.035); tone(context, 570, 0.11, 0.018, 0.025) }
  if (cue === 'transition') { tone(context, 440, 0.16, 0.014); tone(context, 660, 0.2, 0.012, 0.07) }
  if (cue === 'clap') { noise(context, .09, .5, 2200); tone(context, 140, .08, .03) }
  if (cue === 'shutter') { noise(context, .04, .35, 3800); noise(context, .05, .3, 2600, .07) }
  if (cue === 'stamp') { tone(context, 170, 0.2, 0.045); tone(context, 510, 0.33, 0.022, 0.09); tone(context, 760, 0.4, 0.014, 0.17) }
}

export function useSoundDesign() {
  const [enabled, setEnabled] = useState(false)
  const context = useRef<AudioContext | null>(null)
  const lastHover = useRef(0)

  const play = useCallback((cue: SoundCue) => {
    if (enabled && context.current) playCue(context.current, cue)
  }, [enabled])

  const toggle = useCallback(async () => {
    if (enabled) { setEnabled(false); return }
    try {
      context.current ??= new AudioContext()
      await context.current.resume()
      setEnabled(true)
      playCue(context.current, 'transition')
    } catch {
      setEnabled(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element
      const interactive = target.closest?.('a, button, input, select, [data-sfx]')
      if (!interactive || (event.relatedTarget instanceof Node && interactive.contains(event.relatedTarget))) return
      const now = performance.now()
      if (now - lastHover.current < 130) return
      lastHover.current = now
      play('hover')
    }
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element).closest?.('a, button, [data-sfx]')) play('click')
    }
    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('click', onClick)
    }
  }, [enabled, play])

  useEffect(() => () => {
    const active = context.current
    context.current = null
    void active?.close()
  }, [])
  return { enabled, toggle, play }
}
