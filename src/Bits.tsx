import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'

/* A seven-blade aperture drawn from geometry: the opening is a rotating heptagon and each blade edge runs from
 * one vertex, along the polygon side, out to the barrel. setOpen(0..1) is cheap enough to call on every scroll frame. */
const N = 7, C = 200, R = 188
export type IrisHandle = { setOpen: (open: number) => void }
export const Iris = forwardRef<IrisHandle, { label: string }>(function Iris({ label }, ref) {
  const fill = useRef<SVGPathElement>(null)
  const edges = useRef<SVGPathElement>(null)
  const setOpen = (open: number) => {
    const r = 18 + open * (R - 26)
    const phase = (1 - open) * 1.1
    const v = Array.from({ length: N }, (_, i) => { const a = phase + i * Math.PI * 2 / N; return [C + Math.cos(a) * r, C + Math.sin(a) * r] })
    const poly = v.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('') + 'Z'
    fill.current?.setAttribute('d', `M${C - R} ${C}a${R} ${R} 0 1 0 ${R * 2} 0a${R} ${R} 0 1 0 ${-R * 2} 0Z${poly}`)
    const lines = v.map(([x, y], i) => {
      const [nx, ny] = v[(i + 1) % N]
      let dx = nx - x, dy = ny - y
      const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len
      const ox = x - C, oy = y - C
      const b = dx * ox + dy * oy
      const t = -b + Math.sqrt(Math.max(0, b * b - (ox * ox + oy * oy - R * R)))
      return `M${(x - dx * 0).toFixed(2)} ${y.toFixed(2)}L${(x + dx * t).toFixed(2)} ${(y + dy * t).toFixed(2)}`
    }).join('')
    edges.current?.setAttribute('d', lines)
  }
  useImperativeHandle(ref, () => ({ setOpen }))
  useEffect(() => { setOpen(1) }, [])
  return <svg className="iris" viewBox="0 0 400 400" role="img" aria-label={label}>
    <defs>
      <radialGradient id="iris-glow"><stop offset="0" stopColor="#ff2a55" /><stop offset=".35" stopColor="#a1001f" /><stop offset="1" stopColor="#120004" /></radialGradient>
      <linearGradient id="iris-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a2a2e" /><stop offset=".45" stopColor="#0d0d0f" /><stop offset=".55" stopColor="#1b1b1f" /><stop offset="1" stopColor="#060607" /></linearGradient>
    </defs>
    <circle cx={C} cy={C} r={R} fill="url(#iris-glow)" />
    <path ref={fill} fill="url(#iris-metal)" fillRule="evenodd" />
    <path ref={edges} fill="none" stroke="rgba(244,241,238,.22)" strokeWidth="1.2" />
    <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(244,241,238,.3)" strokeWidth="1" />
    <circle cx={C} cy={C} r={R + 7} fill="none" stroke="rgba(244,241,238,.12)" strokeWidth="6" strokeDasharray="1.5 6" />
  </svg>
})

/* Odometer digits: each numeral is a column of 0–9 that rolls into place. Works for Latin and Persian digits. */
const latin = '0123456789', persian = '۰۱۲۳۴۵۶۷۸۹'
export function Odometer({ value, run }: { value: string; run: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const columns = node.querySelectorAll<HTMLElement>('.odo-col')
    if (!run) { gsap.set(columns, { yPercent: 0 }); return }
    columns.forEach((col, i) => {
      const digit = Number(col.dataset.digit)
      gsap.fromTo(col, { yPercent: 0 }, { yPercent: -(digit + 10) * (100 / 20), duration: 1.6 + i * .25, ease: 'expo.out', delay: .1 })
    })
  }, [run, value])
  const runs = value.match(/[0-9۰-۹]+|[^0-9۰-۹]+/g) ?? []
  return <span className="odo" ref={ref} role="img" aria-label={value}>
    {runs.map((run, r) => {
      const set = latin.includes(run[0]) ? latin : persian.includes(run[0]) ? persian : null
      if (!set) return <span key={r} className="odo-static" aria-hidden="true">{run}</span>
      return <span key={r} className="odo-num" dir="ltr" aria-hidden="true">{[...run].map((char, i) => {
        const digit = set.indexOf(char)
        return <span key={i} className="odo-digit"><span className="odo-col" data-digit={digit}>{[...set, ...set].map((d, j) => <span key={j}>{d}</span>)}</span><span className="odo-ghost">{char}</span></span>
      })}</span>
    })}
  </span>
}

/* Split a heading into masked lines; each line slides up from behind its own edge. */
export function Lines({ lines, className = '', accent = -1 }: { lines: string[]; className?: string; accent?: number }) {
  return <>{lines.map((line, i) => <span className={`line ${className}`} key={i}><span className={`line-inner ${i === accent ? 'serif accent' : ''}`}>{line}</span></span>)}</>
}
