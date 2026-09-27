import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { languageNames, type Language } from './i18n'

const flagColors: Record<Language, string[]> = {
  en: ['#012169'],
  fa: ['#239f40', '#ffffff', '#da0000'],
  hy: ['#d90012', '#0033a0', '#f2a800'],
  ru: ['#ffffff', '#0039a6', '#d52b1e'],
}

function Flag({ code }: { code: Language }) {
  if (code === 'en') return <svg viewBox="0 0 60 40" aria-hidden="true"><rect width="60" height="40" fill="#012169"/><path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="9"/><path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" strokeWidth="4"/><path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13"/><path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="6"/></svg>
  return <svg viewBox="0 0 60 40" aria-hidden="true">{flagColors[code].map((color, index) => <rect key={index} x="0" y={index * 40 / 3} width="60" height={40 / 3 + .1} fill={color} />)}</svg>
}

export default function LanguageTransition({ from, to, commit, finish, reduced }: {
  from: Language; to: Language; commit: () => void; finish: () => void; reduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reduced) { commit(); finish(); return }
    const host = ref.current
    if (!host) return
    const bars = host.querySelectorAll('.language-flag-bar')
    const timeline = gsap.timeline({ onComplete: finish })
    timeline.set(host, { visibility: 'visible' })
      .fromTo(bars, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: .62, stagger: .065, ease: 'power4.inOut' })
      .fromTo('.language-transition-word', { opacity: 0, y: 60, rotateX: -35 }, { opacity: 1, y: 0, rotateX: 0, duration: .48, ease: 'power3.out' }, .31)
      .fromTo('.language-transition-seal', { opacity: 0, scale: .6, rotation: -15 }, { opacity: 1, scale: 1, rotation: 0, duration: .55, ease: 'back.out(1.5)' }, .28)
      .call(commit, [], .61)
      .to('.language-transition-word', { opacity: 0, y: -50, duration: .25 }, 1.08)
      .to('.language-transition-seal', { opacity: 0, scale: 1.2, duration: .25 }, 1.08)
      .to(bars, { scaleX: 0, transformOrigin: 'right center', duration: .62, stagger: .06, ease: 'power4.inOut' }, 1.09)
    return () => { timeline.kill() }
  }, [commit, finish, reduced])
  return <div ref={ref} className="language-transition" aria-live="polite" aria-label={`${languageNames[from]} → ${languageNames[to]}`}>
    <div className="language-flag-bars" aria-hidden="true">{to === 'en' ? <div className="language-flag-bar language-union-jack"><svg viewBox="0 0 120 60" preserveAspectRatio="none"><rect width="120" height="60" fill="#012169"/><path d="M0 0 120 60M120 0 0 60" stroke="#fff" strokeWidth="15"/><path d="M0 0 120 60M120 0 0 60" stroke="#c8102e" strokeWidth="7"/><path d="M60 0v60M0 30h120" stroke="#fff" strokeWidth="19"/><path d="M60 0v60M0 30h120" stroke="#c8102e" strokeWidth="9"/></svg></div> : flagColors[to].map((color, index) => <div key={index} className="language-flag-bar" style={{ background: color }} />)}</div>
    <div className="language-transition-seal"><Flag code={to} /><span>{to.toUpperCase()}</span></div>
    <div className="language-transition-center"><span className="language-transition-word">{languageNames[to]}</span><span className="language-transition-code">{from.toUpperCase()} <b>→</b> {to.toUpperCase()}</span></div>
  </div>
}
