import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type Lenis from 'lenis'

export const scroller: { lenis: Lenis | null } = { lenis: null }
export function scrollToY(y: number) {
  if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 1.4 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
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

/* A quiet cursor: a small dot that opens into a labelled disc over media and anything with a cursor label. */
export function SoftCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const pointer = { x: -100, y: -100 }, pos = { x: -100, y: -100 }
    let frame = 0
    const move = (event: PointerEvent) => {
      if (pointer.x < -50) { pos.x = event.clientX; pos.y = event.clientY }
      pointer.x = event.clientX; pointer.y = event.clientY
      node.classList.add('is-on')
      const target = (event.target as Element).closest?.('[data-cursor-label]')
      const text = target?.getAttribute('data-cursor-label') ?? ''
      if (label.current && label.current.textContent !== text) label.current.textContent = text
      node.classList.toggle('is-open', !!text)
      node.classList.toggle('is-link', !text && !!(event.target as Element).closest?.('a, button, select'))
    }
    const leave = () => node.classList.remove('is-on')
    const tick = () => {
      frame = requestAnimationFrame(tick)
      pos.x += (pointer.x - pos.x) * .22; pos.y += (pointer.y - pos.y) * .22
      node.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`
    }
    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(frame); document.documentElement.classList.remove('has-cursor'); window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave) }
  }, [])
  return <div className="cursor" ref={ref} aria-hidden="true"><span className="cursor-disc"><span ref={label} /></span></div>
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
