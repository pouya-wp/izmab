import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type Lenis from 'lenis'

export const scroller: { lenis: Lenis | null } = { lenis: null }
export function scrollToY(y: number) {
  if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 1.4 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

const FPS = 24
export function timecode(seconds: number) {
  const total = Math.max(0, Math.floor(seconds * FPS))
  const f = total % FPS, s = Math.floor(total / FPS) % 60, m = Math.floor(total / FPS / 60) % 60, h = Math.floor(total / FPS / 3600)
  return [h, m, s, f].map(n => String(n).padStart(2, '0')).join(':')
}

/** A running camera clock written straight to the DOM, so it never re-renders React. */
export function RunningTimecode({ offset = 0 }: { offset?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => { frame = requestAnimationFrame(tick); if (ref.current) ref.current.textContent = timecode(offset + (now - start) / 1000) }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [offset])
  return <span ref={ref} className="tc">00:00:00:00</span>
}

/* Academy leader: 3 · 2 · 1, a sweep, a flash, and the shutter opens on the hero. */
export function Preloader({ label, skip, onOpen, onDone }: { label: string; skip: string; onOpen: () => void; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(3)
  const done = useRef(onDone)
  done.current = onDone
  const open = useRef(onOpen)
  open.current = onOpen
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const counter = { v: 0 }
    const pct = node.querySelector<HTMLElement>('.leader-pct')
    const timeline = gsap.timeline({ paused: true, onComplete: () => done.current() })
    timeline
      .to(counter, { v: 3, duration: 2.1, ease: 'none', onUpdate: () => {
        const v = counter.v
        node.style.setProperty('--sweep', `${(v % 1) * 360}deg`)
        setCount(Math.max(1, 3 - Math.floor(v)))
        if (pct) pct.textContent = String(Math.min(100, Math.round(v / 3 * 100))).padStart(3, '0')
      } })
      .call(() => open.current())
      .to(node.querySelector('.leader-flash'), { opacity: 1, duration: .06 })
      .to(node.querySelector('.leader-flash'), { opacity: 0, duration: .25 })
      .to(node.querySelectorAll('.leader-shutter'), { scaleY: 0, duration: .9, ease: 'expo.inOut', stagger: 0 }, '<')
      .to(node.querySelector('.leader-face'), { opacity: 0, scale: 1.3, duration: .5, ease: 'power2.in' }, '<')
      .set(node, { display: 'none' })
    const skipNow = () => timeline.progress(1)
    const skipButton = node.querySelector('.leader-skip')
    skipButton?.addEventListener('click', skipNow)
    // Start counting only once type and the hero portrait are in, so the countdown never stutters or skips.
    const loaded = new Promise<void>(resolve => { if (document.readyState === 'complete') resolve(); else window.addEventListener('load', () => resolve(), { once: true }) })
    let cancelled = false
    void Promise.race([Promise.all([document.fonts.ready, loaded]), new Promise(resolve => window.setTimeout(resolve, 3000))])
      .then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      .then(() => { if (!cancelled) timeline.play() })
    return () => { cancelled = true; skipButton?.removeEventListener('click', skipNow); timeline.kill() }
  }, [])
  return <div className="leader" ref={ref} role="status" aria-label={label}>
    <div className="leader-shutter top" /><div className="leader-shutter bottom" />
    <div className="leader-face">
      <div className="leader-cross" />
      <div className="leader-dial"><div className="leader-sweep" /><span className="leader-ring" /><span className="leader-ring inner" /><strong>{count}</strong></div>
      <div className="leader-meta eyebrow"><span>IZMAB — {label}</span><span><b className="leader-pct">000</b>%</span></div>
      <div className="leader-meta top eyebrow"><span>PICTURE START</span><span>24 FPS · 2.39:1</span></div>
    </div>
    <div className="leader-flash" />
    <button type="button" className="leader-skip eyebrow">{skip} →</button>
  </div>
}

/* Viewfinder cursor: four focus brackets that wrap whatever they rest on. */
export function ViewfinderCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const node = ref.current, point = dot.current
    if (!node || !point) return
    document.documentElement.classList.add('has-vf')
    const pointer = { x: innerWidth / 2, y: innerHeight / 2 }
    const box = { x: pointer.x - 18, y: pointer.y - 18, w: 36, h: 36 }
    let target: Element | null = null, frame = 0, visible = false, pressed = false
    const move = (event: PointerEvent) => {
      pointer.x = event.clientX; pointer.y = event.clientY
      if (!visible) { visible = true; node.classList.add('is-on'); point.classList.add('is-on') }
      const el = (event.target as Element).closest?.('a, button, select, [data-cursor]')
      target = el && (el as HTMLElement).dataset.cursor !== 'text' ? el : null
      const text = target?.getAttribute('data-cursor-label') ?? ''
      if (label.current && label.current.textContent !== text) label.current.textContent = text
      node.classList.toggle('has-label', !!text)
      node.classList.toggle('is-locked', !!target)
    }
    const leave = () => { visible = false; node.classList.remove('is-on'); point.classList.remove('is-on') }
    const down = () => { pressed = true }
    const up = () => { pressed = false }
    const tick = () => {
      frame = requestAnimationFrame(tick)
      let tx = pointer.x - 18, ty = pointer.y - 18, tw = 36, th = 36
      if (target) {
        const rect = target.getBoundingClientRect()
        const big = rect.width * rect.height > innerWidth * innerHeight * .12
        if (!big) { const pad = 8; tx = rect.left - pad; ty = rect.top - pad; tw = rect.width + pad * 2; th = rect.height + pad * 2 }
        else { tx = pointer.x - 44; ty = pointer.y - 44; tw = 88; th = 88 }
      }
      if (pressed) { tx += 4; ty += 4; tw -= 8; th -= 8 }
      const k = .2
      box.x += (tx - box.x) * k; box.y += (ty - box.y) * k; box.w += (tw - box.w) * k; box.h += (th - box.h) * k
      node.style.transform = `translate3d(${box.x}px,${box.y}px,0)`
      node.style.width = `${box.w}px`; node.style.height = `${box.h}px`
      point.style.transform = `translate3d(${pointer.x - 3}px,${pointer.y - 3}px,0)`
    }
    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down); window.addEventListener('pointerup', up)
    return () => {
      cancelAnimationFrame(frame); document.documentElement.classList.remove('has-vf')
      window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up)
    }
  }, [])
  return <>
    <div className="vf" ref={ref} aria-hidden="true"><i /><i /><i /><i /><span ref={label} className="vf-label" /></div>
    <div className="vf-dot" ref={dot} aria-hidden="true" />
  </>
}

/* The page as a timeline: chapter, scrub bar with chapter ticks, and a timecode for the scroll position. */
export function TimelineHud({ ids, chapters }: { ids: string[]; chapters: string[] }) {
  const chapterRef = useRef<HTMLSpanElement>(null)
  const tcRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const [ticks, setTicks] = useState<number[]>([])
  const chaptersRef = useRef(chapters)
  chaptersRef.current = chapters
  useEffect(() => {
    let frame = 0, lastY = -1, lastH = -1
    const measure = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      setTicks(ids.map(id => { const el = document.getElementById(id); return el && max > 0 ? Math.min(1, (el.getBoundingClientRect().top + scrollY) / max) : 0 }))
    }
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const y = scrollY, h = document.documentElement.scrollHeight
      if (y === lastY && h === lastH) return
      if (h !== lastH) measure()
      lastY = y; lastH = h
      const max = h - innerHeight
      const p = max > 0 ? y / max : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      if (tcRef.current) tcRef.current.textContent = timecode(p * 248)
      let current = 0
      ids.forEach((id, index) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .5) current = index })
      const name = `${String(current + 1).padStart(2, '0')} ${chaptersRef.current[current] ?? ''}`
      if (chapterRef.current && chapterRef.current.textContent !== name) chapterRef.current.textContent = name
    }
    frame = requestAnimationFrame(tick)
    window.addEventListener('resize', measure)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', measure) }
  }, [ids])
  return <div className="hud eyebrow" aria-hidden="true">
    <span className="hud-rec"><i />REC</span>
    <span className="hud-chapter" ref={chapterRef} />
    <span className="hud-track"><span className="hud-bar" ref={barRef} />{ticks.map((t, i) => <i key={i} style={{ insetInlineStart: `${t * 100}%` }} />)}</span>
    <span className="hud-tc">TC <span ref={tcRef}>00:00:00:00</span></span>
  </div>
}

/* Film grain: one tiny noise tile, generated once, jittered by CSS. */
export function Grain() {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 160
    const context = canvas.getContext('2d')
    if (!context) return
    const image = context.createImageData(160, 160)
    for (let i = 0; i < image.data.length; i += 4) { const v = Math.random() * 255; image.data[i] = image.data[i + 1] = image.data[i + 2] = v; image.data[i + 3] = 22 }
    context.putImageData(image, 0, 0)
    setUrl(canvas.toDataURL())
  }, [])
  return <div className="grain" aria-hidden="true" style={url ? { backgroundImage: `url(${url})` } : undefined} />
}

/** Live clock in a given IANA zone, ticking once a second. */
export function ZoneClock({ zone, locale }: { zone: string; locale: string }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(id) }, [])
  let text = ''
  try { text = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: zone }).format(now) }
  catch { text = now.toLocaleTimeString() }
  return <time className="zone-clock">{text}</time>
}
