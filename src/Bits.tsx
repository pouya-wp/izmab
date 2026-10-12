import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'

/* A seven-blade aperture drawn from geometry. The opening is a rotating heptagon; the outside is split into
 * pinwheel wedges, one per blade, each lit by its angle to a light at the top left, so the blades change shade
 * as they turn. Through the opening the portrait darkens as the lens stops down, as exposure would.
 * setOpen(0..1) is cheap enough to call on every scroll frame. */
const N = 7, C = 200, R = 150
export type IrisHandle = { setOpen: (open: number) => void }
export const Iris = forwardRef<IrisHandle, { label: string }>(function Iris({ label }, ref) {
  const blades = useRef<(SVGPolygonElement | null)[]>([])
  const rim = useRef<SVGPathElement>(null)
  const edges = useRef<SVGPathElement>(null)
  const shade = useRef<SVGCircleElement>(null)
  const setOpen = (open: number) => {
    const r = 12 + open * (R - 14)
    const phase = (1 - open) * 1.2 - Math.PI / 2
    const v = Array.from({ length: N }, (_, i) => { const a = phase + i * Math.PI * 2 / N; return [C + Math.cos(a) * r, C + Math.sin(a) * r] })
    const d = v.map(([x, y], i) => { const [nx, ny] = v[(i + 1) % N]; const l = Math.hypot(nx - x, ny - y) || 1; return [(nx - x) / l, (ny - y) / l] })
    const K = R * 3, light = -Math.PI * .75
    let lines = ''
    for (let j = 0; j < N; j++) {
      const k = (j + 1) % N
      const [x, y] = v[k], [ax, ay] = d[j], [bx, by] = d[k]
      blades.current[j]?.setAttribute('points', `${x.toFixed(2)},${y.toFixed(2)} ${(x + ax * K).toFixed(2)},${(y + ay * K).toFixed(2)} ${(x + bx * K).toFixed(2)},${(y + by * K).toFixed(2)}`)
      const mid = Math.atan2(ay + by, ax + bx)
      const lit = .5 + .5 * Math.cos(mid - light)
      const l = Math.round(20 + lit * 34)
      blades.current[j]?.setAttribute('fill', `rgb(${l + 3},${l},${l - 3})`)
      const ox = x - C, oy = y - C, b = ax * ox + ay * oy
      const t = -b + Math.sqrt(Math.max(0, b * b - (ox * ox + oy * oy - R * R)))
      lines += `M${x.toFixed(2)} ${y.toFixed(2)}L${(x + ax * t).toFixed(2)} ${(y + ay * t).toFixed(2)}`
    }
    edges.current?.setAttribute('d', lines)
    rim.current?.setAttribute('d', v.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('') + 'Z')
    shade.current?.setAttribute('opacity', String((1 - open) * .62))
  }
  useImperativeHandle(ref, () => ({ setOpen }))
  useEffect(() => { setOpen(1) }, [])
  const ticks = 2 * Math.PI * 183 / 120
  return <svg className="iris" viewBox="0 0 400 400" role="img" aria-label={label}>
    <defs>
      <clipPath id="iris-clip"><circle cx={C} cy={C} r={R} /></clipPath>
      <radialGradient id="iris-depth" cx="50%" cy="50%" r="50%"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".55" /></radialGradient>
      <linearGradient id="iris-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset=".38" stopColor="#fff" stopOpacity="0" /><stop offset=".8" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".05" /></linearGradient>
      <linearGradient id="iris-barrel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2724" /><stop offset=".5" stopColor="#121110" /><stop offset="1" stopColor="#1c1a18" /></linearGradient>
    </defs>
    <circle cx={C} cy={C} r={197} fill="url(#iris-barrel)" />
    <circle cx={C} cy={C} r={183} fill="none" stroke="rgba(236,230,220,.35)" strokeWidth="7" strokeDasharray={`1 ${(ticks - 1).toFixed(3)}`} />
    <circle cx={C} cy={C} r={170} fill="#0b0a09" />
    <circle cx={C} cy={C} r={R + 4} fill="none" stroke="rgba(236,230,220,.14)" strokeWidth="1" />
    <g clipPath="url(#iris-clip)">
      <image href="/portrait.jpeg" x={C - R * 1.3} y={C - R * .92} width={R * 2.6} height={R * 2.6} preserveAspectRatio="xMidYMin slice" />
      <circle ref={shade} cx={C} cy={C} r={R} fill="#000" opacity="0" />
      {Array.from({ length: N }, (_, i) => <polygon key={i} ref={el => { blades.current[i] = el }} />)}
      <circle cx={C} cy={C} r={R} fill="url(#iris-depth)" />
      <path ref={edges} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth="1.4" />
      <path ref={rim} fill="none" stroke="rgba(255,236,220,.35)" strokeWidth="1" />
    </g>
    <circle cx={C} cy={C} r={R} fill="url(#iris-glass)" pointerEvents="none" />
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
