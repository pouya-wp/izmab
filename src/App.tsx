import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useSoundDesign, type SoundCue } from './useSoundDesign'
import LanguageTransition from './LanguageTransition'
import SceneCanvas from './SceneCanvas'
import { Preloader, SoftCursor, ZoneClock, scroller, scrollToY } from './Chrome'
import { LensMark } from './LensMark'
import { Iris, Lines, Odometer, type IrisHandle } from './Bits'
import { languageNames, languageTags, text, type Language, type LocaleText } from './i18n'
import { extra, type ExtraText } from './i18n-extra'
import { projects, posts } from './data'

gsap.registerPlugin(ScrollTrigger)

type Copy = LocaleText & ExtraText
type Play = (cue: SoundCue) => void
const asset = (name: string) => `/${name}`
const menuIds = ['work', 'reel', 'about', 'process', 'pricing', 'journal', 'contact']
const ratios = [2.39, 4 / 5, 16 / 9, 9 / 16, 3 / 2, 16 / 9]
const postDates = ['2026-08-14', '2026-07-02', '2026-05-19']
const pad = (n: number, size = 2) => String(n).padStart(size, '0')

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

function useInView<T extends Element>(ref: RefObject<T | null>, margin = '0px 0px -15% 0px') {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || seen) return
    const io = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(node)
    return () => io.disconnect()
  }, [ref, margin, seen])
  return seen
}

/* ───────────────────────────── Header & menu ───────────────────────────── */

function Header({ copy, language, setLanguage, soundEnabled, toggleSound, play, reduced }: {
  copy: Copy; language: Language; setLanguage: (language: Language) => void
  soundEnabled: boolean; toggleSound: () => void; play: Play; reduced: boolean
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(0)
  const panel = useRef<HTMLElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const node = panel.current
    if (!node) return
    const links = node.querySelectorAll('.menu-link')
    gsap.killTweensOf([node, ...links])
    if (reduced) { gsap.set(node, { autoAlpha: open ? 1 : 0, clipPath: 'inset(0% 0% 0% 0%)' }); return }
    if (open) {
      gsap.set(node, { autoAlpha: 1 })
      gsap.fromTo(node, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .95, ease: 'expo.inOut' })
      gsap.fromTo(links, { yPercent: 120, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1, stagger: .05, delay: .3, ease: 'expo.out' })
      gsap.fromTo(node.querySelectorAll('.menu-fade'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8, stagger: .06, delay: .5, ease: 'power3.out' })
    } else {
      gsap.to(node, { clipPath: 'inset(100% 0% 0% 0%)', duration: .8, ease: 'expo.inOut', onComplete: () => gsap.set(node, { autoAlpha: 0 }) })
    }
  }, [open, reduced])
  useEffect(() => {
    if (open) scroller.lenis?.stop(); else scroller.lenis?.start()
    document.documentElement.classList.toggle('menu-open', open)
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && open) { setOpen(false); button.current?.focus() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  const close = () => { setOpen(false); play('transition') }
  return <>
    <header className="hdr">
      <a className="hdr-logo" href="#top" aria-label="IZMAB"><span>IZMAB</span></a>
      <a className="hdr-status" href="#contact"><span className="dot" /><span>{copy.available}</span></a>
      <div className="hdr-controls">
        <label className="pill pill-lang">
          <span className="visually-hidden">{copy.languageLabel}</span>
          <select aria-label={copy.languageLabel} value={language} onChange={event => { setLanguage(event.target.value as Language); play('transition') }}>
            {(Object.keys(languageNames) as Language[]).map(code => <option key={code} value={code}>{code.toUpperCase()} · {languageNames[code]}</option>)}
          </select>
        </label>
        <button className={`pill pill-sound ${soundEnabled ? 'is-on' : ''}`} type="button" onClick={toggleSound} aria-label={soundEnabled ? copy.soundOn : copy.soundOff} aria-pressed={soundEnabled}>
          <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span><span className="pill-word">{copy.soundLabel}</span>
        </button>
        <button ref={button} className={`pill pill-menu ${open ? 'is-open' : ''}`} type="button" onClick={() => { setOpen(value => !value); play('transition') }} aria-expanded={open} aria-controls="site-menu" data-magnetic>
          <span>{open ? copy.close : copy.menu}</span><span className="burger" aria-hidden="true"><i /><i /></span>
        </button>
      </div>
    </header>
    <nav ref={panel} id="site-menu" className="menu" aria-label={copy.menu} aria-hidden={!open} style={{ visibility: 'hidden' }}>
      <div className="menu-grid">
        <div className="menu-list">
          <div className="menu-top label menu-fade"><span>{copy.menu}</span><span>{copy.footerRole}</span></div>
          <ol className="menu-links">
            {menuIds.map((id, index) => <li key={id}><a className={`menu-item ${hover === index ? 'is-active' : ''}`} href={`#${id}`} onClick={close} onPointerEnter={() => setHover(index)} onFocus={() => setHover(index)} tabIndex={open ? 0 : -1}>
              <span className="menu-link"><span className="menu-no">{pad(index + 1)}</span><span className="menu-title">{copy.nav[index]}</span><span className="menu-arrow" aria-hidden="true">↗</span></span>
            </a></li>)}
          </ol>
          <div className="menu-meta label menu-fade"><a href="mailto:hello@izmab.studio" tabIndex={open ? 0 : -1}>hello@izmab.studio</a><span>IZMAB · 2026</span></div>
        </div>
        <div className="menu-stage menu-fade" aria-hidden="true">
          <div className="menu-stage-frame">
            <strong className="menu-stage-num" key={`n${hover}`}>{pad(hover + 1)}</strong>
            <span className="menu-stage-title serif" key={`t${language}${hover}`}>{copy.nav[hover]}</span>
            <span className="menu-stage-foot label">{copy.sections[hover === 6 ? 7 : hover]}</span>
          </div>
        </div>
      </div>
    </nav>
  </>
}

/* ───────────────────────────── Hero: the viewfinder ───────────────────────────── */

function Hero({ copy, started, reduced }: { copy: Copy; started: boolean; reduced: boolean }) {
  const root = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLDivElement>(null)
  const portrait = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!started || reduced) return
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .fromTo(inner.current, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
        .fromTo(mark.current, { yPercent: 18, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.8 }, .35)
        .fromTo(portrait.current, { yPercent: 8, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.8 }, .5)
        .fromTo('.hero .line-inner', { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: .08 }, .9)
        .fromTo('.hero-fade', { opacity: 0 }, { opacity: 1, duration: .8, ease: 'power2.out' }, 1.2)
    }, root)
    return () => context.revert()
  }, [started, reduced])

  useEffect(() => {
    if (reduced) return
    const context = gsap.context(() => {
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to(frame.current, { clipPath: 'inset(6% 4% 6% 4% round 20px)', ease: 'none', scrollTrigger: st })
      gsap.to(mark.current, { yPercent: 35, ease: 'none', scrollTrigger: st })
      gsap.to(portrait.current, { scale: .96, ease: 'none', scrollTrigger: st })
      gsap.to('.hero-copy', { yPercent: -40, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '55% top' } })
    }, root)
    return () => context.revert()
  }, [reduced])

  return <section id="top" className="hero" ref={root}>
    <div className="hero-frame" ref={frame}>
      <div className="hero-inner" ref={inner}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-mark" ref={mark}><LensMark enabled={!reduced} /></div>
        <div className="hero-portrait-shell" ref={portrait}><div className="hero-cutout"><img className="hero-portrait" src={asset('portrait.jpeg')} alt={copy.portraitCaption} fetchPriority="high" /></div></div>
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-copy">
          <h1 className="hero-line"><Lines lines={copy.heroLine} accent={1} /></h1>
          <p className="hero-kicker hero-fade">{copy.heroCopy}</p>
        </div>
        <a className="hero-scroll hero-fade" href="#manifesto"><span className="hero-scroll-bar" />{copy.scroll}</a>
      </div>
    </div>
  </section>
}

/* ───────────────────────────── Manifesto & marquee ───────────────────────────── */

function Manifesto({ copy, reduced }: { copy: Copy; reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const words = copy.manifesto.split(' ')
  useEffect(() => {
    if (reduced || !ref.current) return
    const context = gsap.context(() => {
      gsap.fromTo('.mf-word', { opacity: .1 }, { opacity: 1, ease: 'none', stagger: .08, scrollTrigger: { trigger: '.manifesto-text', start: 'top 82%', end: 'bottom 50%', scrub: true } })
    }, ref)
    return () => context.revert()
  }, [reduced, copy.manifesto])
  return <section id="manifesto" className="manifesto theme-paper" ref={ref}>
    <div className="manifesto-head"><span className="label">{copy.chapters[1]}</span><span className="manifesto-aside">{copy.heroKicker}</span></div>
    <p className="manifesto-text">{words.map((word, i) => <span key={i} className={`mf-word ${copy.manifestoAccent.includes(word) ? 'serif accent' : ''}`}>{word} </span>)}</p>
  </section>
}

function Marquee({ items, reduced }: { items: string[]; reduced: boolean }) {
  const rows = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    if (reduced) return
    let frame = 0, lastY = scrollY, x = 0, velocity = 0, direction = 1
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const delta = scrollY - lastY; lastY = scrollY
      if (delta) direction = delta > 0 ? 1 : -1
      velocity += (Math.min(60, Math.abs(delta)) - velocity) * .1
      x -= (.6 + velocity * .35) * direction
      rows.current.forEach((row, i) => {
        if (!row) return
        const half = row.scrollWidth / 2
        const value = ((i ? -x : x) % half + half) % half
        row.style.transform = `translate3d(${-value}px,0,0)`
      })
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduced])
  const doubled = [...items, ...items, ...items, ...items]
  return <div className="marquee theme-paper" aria-label={items.join(', ')} dir="ltr">
    {[0].map(row => <div className={`marquee-row ${row ? 'is-outline' : ''}`} key={row} ref={el => { rows.current[row] = el }} aria-hidden="true">
      {doubled.map((item, i) => <span key={i}>{item}<i className={i % 2 ? 'star' : 'disc'} /></span>)}
    </div>)}
  </div>
}

/* ───────────────────────────── Work: the frame that reframes ───────────────────────────── */

function Work({ copy, reduced, play }: { copy: Copy; reduced: boolean; play: Play }) {
  const [active, setActive] = useState(0)
  const wrap = useRef<HTMLElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const last = useRef(0)
  const playRef = useRef(play)
  playRef.current = play

  const fit = useCallback((animate: boolean) => {
    const b = box.current?.getBoundingClientRect(), f = frame.current
    if (!b || !f) return
    const r = ratios[active]
    let w = b.width, h = w / r
    if (h > b.height) { h = b.height; w = h * r }
    if (animate) gsap.to(f, { width: w, height: h, duration: 1.15, ease: 'expo.inOut', overwrite: true })
    else gsap.set(f, { width: w, height: h })
  }, [active])
  useEffect(() => { fit(!reduced) }, [fit, reduced])
  useEffect(() => {
    const node = box.current
    if (!node) return
    const ro = new ResizeObserver(() => fit(false))
    ro.observe(node)
    return () => ro.disconnect()
  }, [fit])

  useEffect(() => {
    if (reduced || !wrap.current) return
    const st = ScrollTrigger.create({ trigger: wrap.current, start: 'top top', end: 'bottom bottom', onUpdate: self => {
      const i = Math.min(projects.length - 1, Math.floor(self.progress * projects.length))
      if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
      if (i !== last.current) { last.current = i; setActive(i); playRef.current('shutter') }
    } })
    return () => st.kill()
  }, [reduced])

  useLayoutEffect(() => {
    if (reduced || !title.current) return
    const tween = gsap.fromTo(title.current.querySelectorAll('.ch'), { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1, stagger: .022, ease: 'expo.out' })
    const meta = gsap.fromTo('.work-meta > *', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, stagger: .06, delay: .25, ease: 'power3.out' })
    return () => { tween.kill(); meta.kill() }
  }, [active, reduced])

  const go = (i: number) => {
    const node = wrap.current
    if (reduced || !node) { setActive(i); return }
    const top = node.getBoundingClientRect().top + scrollY
    scrollToY(top + (i + .5) / projects.length * (node.offsetHeight - innerHeight))
  }
  const project = projects[active]
  return <section id="work" className={`work ${reduced ? 'is-static' : ''}`} ref={wrap} style={reduced ? undefined : { height: `${projects.length * 80 + 60}vh` }}>
    <div className="work-sticky">
      <div className="work-head"><span className="label">{copy.sections[0]}</span><span className="work-hint label">{copy.workHint}</span><span className="work-count">{pad(active + 1)}<span>/{pad(projects.length)}</span></span></div>
      <div className="work-stage">
        <ol className="work-index">
          {projects.map((p, i) => <li key={p.number}><button type="button" className={i === active ? 'is-active' : ''} onClick={() => go(i)} aria-current={i === active}>
            <span className="work-index-no">{p.number.slice(1)}</span><span className="work-index-title">{p.title}</span><span className="work-index-format">{p.format}</span>
          </button></li>)}
        </ol>
        <div className="work-box" ref={box}>
          <div className="work-frame" ref={frame} data-cursor data-cursor-label={project.format}>
            <SceneCanvas scene={active} reduced={reduced} />
            <span className="frame-tag">{project.format}</span>
          </div>
        </div>
      </div>
      <div className="work-foot">
        <h3 className="work-title" ref={title} key={active} aria-live="polite">{[...project.title].map((c, i) => <span className="ch-mask" key={i}><span className="ch">{c === ' ' ? ' ' : c}</span></span>)}</h3>
        <div className="work-meta"><span>{copy.projectKinds[active]}</span><span>{project.meta.slice(-4)}</span><span className="muted">{copy.workPlaceholder}</span></div>
      </div>
      <span className="work-progress"><span ref={bar} /></span>
    </div>
  </section>
}

/* ───────────────────────────── Reel ───────────────────────────── */

function Reel({ copy, reduced }: { copy: Copy; reduced: boolean }) {
  const wrap = useRef<HTMLElement>(null)
  const stats = useRef<HTMLDivElement>(null)
  const counted = useInView(stats)
  useEffect(() => {
    if (reduced || !wrap.current) return
    const context = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.reel-pin', start: 'top top', end: 'bottom bottom', scrub: true } })
      tl.fromTo('.reel-frame', { clipPath: 'inset(30% 31% 30% 31% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
        .fromTo('.reel-word.a', { xPercent: 0 }, { xPercent: -70, ease: 'power2.in', duration: 1 }, 0)
        .fromTo('.reel-word.b', { xPercent: 0 }, { xPercent: 70, ease: 'power2.in', duration: 1 }, 0)
        .fromTo('.reel-overlay', { opacity: 0 }, { opacity: 1, duration: .3 }, .7)
    }, wrap)
    return () => context.revert()
  }, [reduced])
  const [first, ...rest] = copy.sections[1].split(' ')
  return <section id="reel" className="reel" ref={wrap}>
    <div className="reel-pin" style={reduced ? undefined : { height: '240vh' }}>
      <div className="reel-sticky">
        <div className="reel-words" aria-hidden="true"><span className="reel-word a">{first}</span><span className="reel-word b serif">{rest.join(' ') || copy.reelLabel}</span></div>
        <div className="reel-frame" data-cursor data-cursor-label="Soon">
          <SceneCanvas scene={2} montage reduced={reduced} />
          <div className="reel-overlay">
            <div className="reel-center"><span className="reel-play" aria-hidden="true"><i /></span><span className="reel-note">{copy.reelPlaceholder}</span></div>
            <span className="reel-tl label">{copy.teaser}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="stats" ref={stats}>{copy.stats.map((label, index) => <div className="stat" key={index}>
      <strong><Odometer value={copy.statValues[index]} run={counted || reduced} /></strong><span className="label">{label}</span>
    </div>)}</div>
  </section>
}

/* ───────────────────────────── About: develop the negative ───────────────────────────── */

function About({ copy, reduced }: { copy: Copy; reduced: boolean }) {
  const fig = useRef<HTMLElement>(null)
  useEffect(() => {
    const node = fig.current
    if (!node) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (reduced) { node.style.setProperty('--r', '120%'); return }
    if (!fine) {
      const st = ScrollTrigger.create({ trigger: node, start: 'top 85%', end: 'bottom 40%', scrub: true, onUpdate: self => node.style.setProperty('--r', `${self.progress * 120}%`) })
      node.style.setProperty('--mx', '50%'); node.style.setProperty('--my', '35%')
      return () => st.kill()
    }
    const move = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      node.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      node.style.setProperty('--my', `${event.clientY - rect.top}px`)
    }
    const enter = () => gsap.to(node, { '--r': '190px', duration: .9, ease: 'expo.out' })
    const leave = () => gsap.to(node, { '--r': '0px', duration: .7, ease: 'power3.inOut' })
    node.addEventListener('pointermove', move); node.addEventListener('pointerenter', enter); node.addEventListener('pointerleave', leave)
    return () => { node.removeEventListener('pointermove', move); node.removeEventListener('pointerenter', enter); node.removeEventListener('pointerleave', leave) }
  }, [reduced])
  return <section id="about" className="about section theme-paper">
    <div className="about-grid">
      <div className="about-copy">
        <div className="label" data-reveal>{copy.sections[2]}</div>
        <h2 className="display" data-lines><Lines lines={copy.aboutHeading} accent={1} /></h2>
        <div className="about-prose" data-reveal>{copy.aboutParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        <ul className="skills" data-reveal>{copy.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
      </div>
      <figure className="develop" ref={fig} data-cursor data-cursor-label="Develop" data-reveal>
        <div className="develop-sprockets" aria-hidden="true" />
        <div className="develop-img">
          <img className="develop-neg" src={asset('portrait.jpeg')} alt="" aria-hidden="true" loading="lazy" />
          <img className="develop-pos" src={asset('portrait.jpeg')} alt={copy.portraitCaption} loading="lazy" />
        </div>
        <div className="develop-sprockets right" aria-hidden="true" />
        <figcaption><span>{copy.negative} / {copy.positive}</span><span className="muted">{copy.developHint}</span></figcaption>
      </figure>
    </div>
  </section>
}

/* ───────────────────────────── Process: stopping down ───────────────────────────── */

const processStops = ['1.4', '2.8', '5.6', '11']
function Process({ copy, reduced }: { copy: Copy; reduced: boolean }) {
  const wrap = useRef<HTMLElement>(null)
  const iris = useRef<IrisHandle>(null)
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const dial = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const last = useRef(0)
  useEffect(() => {
    if (reduced) { iris.current?.setOpen(.55); return }
    const st = ScrollTrigger.create({ trigger: wrap.current, start: 'top top', end: 'bottom bottom', onUpdate: self => {
      const p = Math.min(.999, self.progress)
      iris.current?.setOpen(1 - p * .86)
      if (dial.current) dial.current.style.transform = `rotate(${p * -140}deg)`
      bars.current.forEach((bar, i) => { if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p * 4 - i))})` })
      const i = Math.floor(p * 4)
      if (i !== last.current) { last.current = i; setActive(i) }
    } })
    return () => st.kill()
  }, [reduced])
  useLayoutEffect(() => {
    if (reduced) return
    const tween = gsap.fromTo('.process-current .line-inner', { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .06, ease: 'expo.out' })
    return () => { tween.kill() }
  }, [active, reduced])
  const step = copy.steps[active]
  return <section id="process" className={`process ${reduced ? 'is-static' : ''}`} ref={wrap} style={reduced ? undefined : { height: '420vh' }}>
    <div className="process-sticky">
      <div className="process-grid">
        <div className="process-copy">
          <div className="label">{copy.sections[3]}</div>
          {reduced
            ? <ol className="process-all">{copy.steps.map((s, i) => <li key={i}><span className="process-stop">f/{processStops[i]}</span><h3>{s.title}</h3><p>{s.body}</p></li>)}</ol>
            : <div className="process-current" key={active}>
              <span className="process-num"><span className="line"><span className="line-inner">{pad(active + 1)}</span></span></span>
              <h3><span className="line"><span className="line-inner">{step.title}</span></span></h3>
              <p><span className="line"><span className="line-inner">{step.body}</span></span></p>
            </div>}
          {!reduced && <ol className="process-steps">{copy.steps.map((s, i) => <li key={i} className={i === active ? 'is-active' : ''}>
            <span className="process-stop">f/{processStops[i]}</span><span className="process-step-name">{s.title}</span><span className="process-bar"><span ref={el => { bars.current[i] = el }} /></span>
          </li>)}</ol>}
        </div>
        <div className="process-lens">
          <div className="lens-dial" ref={dial} aria-hidden="true">{['1.4', '2', '2.8', '4', '5.6', '8', '11', '16', '22'].map((f, i) => <span key={f} style={{ transform: `rotate(${i * 22 - 88}deg) translateY(calc(var(--lens) * -0.56))` }}>{f}</span>)}</div>
          <Iris ref={iris} label={`${copy.apertureLabel} f/${processStops[active]}`} />
          <div className="lens-readout"><span>{copy.apertureLabel}</span><strong>f/{processStops[reduced ? 1 : active]}</strong></div>
          <span className="lens-index" aria-hidden="true" />
        </div>
      </div>
    </div>
  </section>
}

/* ───────────────────────────── Packages: three slates ───────────────────────────── */

function Pricing({ copy, play }: { copy: Copy; play: Play }) {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref)
  return <section id="pricing" className="pricing section theme-paper">
    <div className="section-head" data-reveal><h2 className="section-title">{copy.sections[4]}</h2><span className="label">{copy.plansNote}</span></div>
    <div className={`slates ${seen ? 'is-seen' : ''}`} ref={ref}>
      {copy.plans.map((plan, index) => <article className={`slate ${index === 1 ? 'is-featured' : ''}`} key={index} onPointerEnter={() => play('clap')} style={{ ['--i' as string]: index }}>
        <div className="slate-clap" aria-hidden="true"><span className="clap-arm" /><span className="clap-base" /></div>
        <div className="slate-body">
          <div className="slate-grid eyebrow">
            <span><small>{copy.slate.prod}</small>IZMAB</span><span><small>{copy.slate.roll}</small>{pad(index + 1, 3)}</span>
            <span><small>{copy.slate.scene}</small>{plan.tag}</span><span><small>{copy.slate.take}</small>{index + 1}</span>
          </div>
          <h3>{plan.name}</h3>
          <strong className="slate-price">{plan.price}</strong>
          <ul>{plan.items.map(item => <li key={item}>{item}</li>)}</ul>
          <a className="slate-cta" href="#contact" data-magnetic><span>{copy.bookThis}</span><span aria-hidden="true">↗</span></a>
        </div>
      </article>)}
    </div>
  </section>
}

/* ───────────────────────────── Journal ───────────────────────────── */

function Journal({ copy, language }: { copy: Copy; language: Language }) {
  const preview = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(-1)
  const dateFormat = new Intl.DateTimeFormat(languageTags[language], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  useEffect(() => {
    const node = preview.current
    if (!node || !window.matchMedia('(hover: hover)').matches) return
    const xTo = gsap.quickTo(node, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(node, 'y', { duration: .6, ease: 'power3' })
    const move = (event: PointerEvent) => { xTo(event.clientX); yTo(event.clientY) }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return <section id="journal" className="journal section theme-paper">
    <div className="section-head" data-reveal><h2 className="section-title">{copy.sections[5]}</h2></div>
    <div className="journal-list" onPointerLeave={() => setHover(-1)}>
      {posts.map((post, index) => <article className={`journal-row ${hover === index ? 'is-hover' : ''}`} key={index} data-reveal onPointerEnter={() => setHover(index)} data-cursor data-cursor-label="Read">
        <span className="label">{dateFormat.format(new Date(`${postDates[index]}T00:00:00Z`))}</span>
        <h3>{copy.postTitles[index]}</h3>
        <span className="label">{post.read.split(' ')[0]} {copy.readMinutes} →</span>
      </article>)}
    </div>
    <div className={`journal-preview ${hover >= 0 ? 'is-on' : ''}`} ref={preview} aria-hidden="true">
      {[0, 1, 2].map(i => <div key={i} className={`jp jp-${i} ${hover === i ? 'is-active' : ''}`} />)}
    </div>
  </section>
}

/* ───────────────────────────── Feed: contact sheet ───────────────────────────── */

const sheetFrames = [
  { pos: '50% 22%', grade: 'bw', mark: '' }, { pos: '46% 30%', grade: 'red', mark: 'circle' }, { pos: '54% 18%', grade: 'warm', mark: '' },
  { pos: '50% 60%', grade: 'bw', mark: 'cross' }, { pos: '42% 25%', grade: 'cool', mark: '' }, { pos: '58% 28%', grade: 'red', mark: '' },
  { pos: '50% 40%', grade: 'warm', mark: 'star' }, { pos: '48% 20%', grade: 'bw', mark: '' }, { pos: '53% 35%', grade: 'cool', mark: '' },
  { pos: '50% 26%', grade: 'red', mark: '' },
]
function Feed({ copy, reduced }: { copy: Copy; reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (reduced || !ref.current) return
    const context = gsap.context(() => {
      gsap.fromTo('.sheet-strip.a', { xPercent: 0 }, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.sheet-strip.b', { xPercent: -22 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, ref)
    return () => context.revert()
  }, [reduced])
  return <section id="feed" className="feed" ref={ref}>
    <div className="section-head section" data-reveal><h2 className="section-title">{copy.sheetLabel}</h2><span className="label">@izmab · {copy.sheetNote}</span></div>
    {['a', 'b'].map((row, r) => <div className={`sheet-strip ${row}`} key={row} dir="ltr" aria-hidden="true">
      {[...sheetFrames, ...sheetFrames.slice(0, 4)].map((f, i) => {
        const frame = r ? sheetFrames[(i + 5) % sheetFrames.length] : f
        return <div className={`sheet-frame g-${frame.grade}`} key={i}>
          <span className="sheet-img" style={{ backgroundPosition: frame.pos }} />
          <span className="sheet-no">{12 + i + r * 14}{i % 2 ? 'A' : ''}</span>
          {frame.mark === 'circle' && <svg className="sheet-mark" viewBox="0 0 100 100"><path d="M50 8C78 6 94 28 92 52 90 78 66 94 44 92 20 90 6 70 8 46 10 24 30 10 56 9" /></svg>}
          {frame.mark === 'cross' && <svg className="sheet-mark" viewBox="0 0 100 100"><path d="M18 20 82 84M84 18 20 82" /></svg>}
          {frame.mark === 'star' && <svg className="sheet-mark small" viewBox="0 0 100 100"><path d="M50 10 61 40 92 40 67 59 76 90 50 71 24 90 33 59 8 40 39 40Z" /></svg>}
        </div>
      })}
    </div>)}
  </section>
}

/* ───────────────────────────── Contact: the slate ───────────────────────────── */

function Contact({ copy, language }: { copy: Copy; language: Language }) {
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    const values = new FormData(event.currentTarget)
    const body = copy.fields.map((field, index) => `${field}: ${values.get(['name', 'email', 'project', 'dates'][index]) || ''}`).join('\n')
    setStatus(copy.emailPrepared)
    window.location.href = `mailto:hello@izmab.studio?subject=${encodeURIComponent('IZMAB — project enquiry')}&body=${encodeURIComponent(body)}`
  }
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText('hello@izmab.studio'); setCopied(true); window.setTimeout(() => setCopied(false), 1600) } catch { /* clipboard unavailable */ }
  }
  return <section id="contact" className="contact section theme-paper">
    <div className="label" data-reveal>{copy.sections[7]}</div>
    <h2 className="contact-heading" data-lines><Lines lines={copy.contactHeading} accent={1} /></h2>
    <div className="contact-grid">
      <div className="contact-details" data-reveal>
        <div className="detail"><span className="label">Email</span><span className="detail-row"><a href="mailto:hello@izmab.studio" className="detail-big">hello@izmab.studio</a><button type="button" className="pill" onClick={copyEmail} aria-live="polite">{copied ? copy.copied : copy.copy}</button></span></div>
        <div className="detail"><span className="label">{copy.localTime}</span><span className="detail-big"><ZoneClock zone="Asia/Yerevan" locale={languageTags[language]} /></span></div>
        <div className="detail"><span className="label">{copy.studio}</span><span className="detail-big">{copy.nextOpening}</span></div>
      </div>
      <form className="contact-form" onSubmit={submit} data-reveal>
        {copy.fields.map((label, index) => <label key={index}>
          <span className="label">{label}</span>
          <input name={['name', 'email', 'project', 'dates'][index]} type={index === 1 ? 'email' : 'text'} placeholder={copy.placeholders[index]} autoComplete={index === 0 ? 'name' : index === 1 ? 'email' : 'off'} required={index < 3} data-cursor="text" />
        </label>)}
        <button className="action" type="submit" data-magnetic><span>{copy.prepareEmail}</span><span className="action-dot" aria-hidden="true">↗</span></button>
        {status && <p className="form-note" role="status">{status}</p>}
      </form>
    </div>
  </section>
}

/* ───────────────────────────── Departure: the gift ───────────────────────────── */

function Gift({ copy, play, reduced }: { copy: Copy; play: Play; reduced: boolean }) {
  const wrap = useRef<HTMLElement>(null)
  const route = useRef<SVGPathElement>(null)
  const plane = useRef<SVGGElement>(null)
  const playRef = useRef(play)
  playRef.current = play
  useEffect(() => {
    const path = route.current, craft = plane.current
    if (!path || !craft || !wrap.current) return
    const length = path.getTotalLength()
    const place = (p: number) => {
      const at = Math.max(.001, p) * length
      const a = path.getPointAtLength(Math.max(0, at - 1)), b = path.getPointAtLength(at)
      craft.setAttribute('transform', `translate(${b.x} ${b.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI})`)
      path.style.strokeDashoffset = String(length * (1 - p))
    }
    path.style.strokeDasharray = `${length}`
    if (reduced) { place(1); return }
    const context = gsap.context(() => {
      const state = { p: 0 }
      let stamped = false
      const tl = gsap.timeline({ scrollTrigger: { trigger: wrap.current, start: 'top top', end: 'bottom bottom', scrub: 1 } })
      tl.to(state, { p: 1, duration: .62, ease: 'power1.inOut', onUpdate: () => place(state.p) }, 0)
        .fromTo('.gift-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .1 }, 0)
        .fromTo('.gift-heading .line-inner', { yPercent: 110 }, { yPercent: 0, stagger: .06, duration: .18, ease: 'power3.out' }, .04)
        .fromTo('.gift-note', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .14 }, .2)
        .fromTo('.ararat', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .3 }, .35)
        .fromTo('.ararat-fill, .ararat-snow', { opacity: 0 }, { opacity: 1, duration: .2 }, .5)
        .fromTo('.route-pin', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .08, transformOrigin: '50% 50%' }, .6)
        .fromTo('.ticket', { y: 140, rotate: -8, opacity: 0 }, { y: 0, rotate: -2, opacity: 1, duration: .22, ease: 'power3.out' }, .3)
        .fromTo('.ticket-stamp', { scale: 2.6, rotate: -40, opacity: 0 }, { scale: 1, rotate: -14, opacity: 1, duration: .08, ease: 'back.out(2)', onStart: () => { if (!stamped) { stamped = true; playRef.current('stamp') } } }, .72)
        .to('.ticket-stub', { x: 26, rotate: 7, duration: .14, ease: 'power2.out' }, .84)
      place(0)
    }, wrap)
    return () => context.revert()
  }, [reduced])
  return <section id="gift" className={`gift ${reduced ? 'is-static' : ''}`} ref={wrap} aria-label={copy.giftEyebrow}>
    <div className="gift-sticky">
      <svg className="gift-map" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><pattern id="gift-grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="rgba(244,241,238,.05)" /></pattern></defs>
        <rect width="1600" height="900" fill="url(#gift-grid)" />
        <path className="route-ghost" d="M150 760C520 120 1240 40 1460 790" />
        <path ref={route} className="route" d="M150 760C520 120 1240 40 1460 790" />
        <path className="ararat-fill" d="M880 900 1060 790 1110 800 1170 760 1250 640 1290 620 1330 640 1420 745 1500 800 1600 850V900Z" />
        <path className="ararat" pathLength={1} d="M880 900 1060 790 1110 800 1170 760 1250 640 1290 620 1330 640 1420 745 1500 800 1600 850" />
        <path className="ararat-snow" d="M1225 676 1250 640 1290 620 1330 640 1356 671 1336 662 1318 676 1296 660 1272 678 1252 664Z" />
        <circle className="route-start" cx="150" cy="760" r="7" />
        <g className="route-pin"><circle cx="1460" cy="790" r="26" className="pin-ring" /><circle cx="1460" cy="790" r="8" /></g>
        <text x="150" y="805" className="route-label">{copy.giftRoute}</text>
        <text x="1425" y="798" className="route-label end" textAnchor="end">{copy.routeEnd}</text>
        <g ref={plane} className="plane"><path d="M-18 0 9 -4 16 0 9 4Z M-2 -1 -10 -16 -4 -16 6 -1Z M-2 1 -10 16 -4 16 6 1Z M-16 -1 -21 -7 -18 -7 -12 -1Z M-16 1 -21 7 -18 7 -12 1Z" /></g>
      </svg>
      <div className="gift-content">
        <div className="gift-copy">
          <div className="label gift-eyebrow">{copy.giftEyebrow}</div>
          <h2 className="gift-heading"><Lines lines={copy.giftHeading} accent={1} /></h2>
          <p className="gift-note">{copy.giftNote}</p>
        </div>
        <div className="ticket" onPointerEnter={() => play('hover')}>
          <div className="ticket-main">
            <div className="ticket-row eyebrow"><span>IZMAB AIR · 2026</span><span>{copy.ticketOneWay} ↗</span></div>
            <div className="ticket-route"><span>{copy.giftRoute}</span><strong aria-hidden="true">✈</strong><span className="accent">{copy.giftDestination}</span></div>
            <div className="ticket-row eyebrow"><span>{copy.ticketTagline}</span><span className="armenia-flag" aria-label="Armenia"><i /><i /><i /></span></div>
            <div className="ticket-barcode" aria-hidden="true" />
          </div>
          <div className="ticket-stub"><span className="eyebrow">EVN</span><strong>AM</strong><span className="eyebrow">SEAT 1A</span></div>
          <span className="ticket-stamp" aria-hidden="true">AM<small>2026</small></span>
        </div>
      </div>
    </div>
  </section>
}

/* ───────────────────────────── Credits & footer ───────────────────────────── */

function Footer({ copy, reduced }: { copy: Copy; reduced: boolean }) {
  return <footer id="credits" className="credits">
    <div className="credits-roll">
      <p className="label credits-title" data-reveal>{copy.creditsTitle}</p>
      {copy.credits.map(([role, name]) => <div className="credit" key={role} data-reveal><span>{role}</span><strong>{name}</strong></div>)}
    </div>
    <a className="footer-mark" href="#top" aria-label={copy.backToTop}><LensMark enabled={!reduced} label={copy.backToTop} /></a>
    <div className="gift-signature"><span>A gift From Bro</span><span>happy emigration</span></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} IZMAB — {copy.footerRole}</span><span>{copy.endLabel} · FIN</span><a href="#top">↑ {copy.backToTop}</a></div>
  </footer>
}

/* ───────────────────────────── App ───────────────────────────── */

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const requested = new URLSearchParams(window.location.search).get('lang')
      if (requested && requested in text) return requested as Language
      const stored = localStorage.getItem('izmab-language')
      return stored && stored in text ? stored as Language : 'en'
    } catch { return 'en' }
  })
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null)
  const transitionOrigin = useRef<Language>(language)
  const copy = useMemo<Copy>(() => ({ ...text[language], ...extra[language] }), [language])
  const reduced = useReducedMotion()
  const sound = useSoundDesign()
  const rootRef = useRef<HTMLDivElement>(null)
  const [showLeader] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try { return !sessionStorage.getItem('izmab-leader') } catch { return true }
  })
  const [started, setStarted] = useState(!showLeader)
  const [leaderGone, setLeaderGone] = useState(!showLeader)
  const onLeaderOpen = useCallback(() => setStarted(true), [])
  const onLeaderDone = useCallback(() => {
    try { sessionStorage.setItem('izmab-leader', '1') } catch { /* private mode */ }
    setLeaderGone(true)
  }, [])
  useEffect(() => { if (leaderGone) setStarted(true) }, [leaderGone])

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ duration: 1.15, anchors: true, smoothWheel: true, touchMultiplier: 1.2 })
    scroller.lenis = lenis
    const sync = () => ScrollTrigger.update()
    const tick = (time: number) => lenis.raf(time * 1000)
    lenis.on('scroll', sync)
    gsap.ticker.add(tick)
    return () => { lenis.off('scroll', sync); gsap.ticker.remove(tick); lenis.destroy(); scroller.lenis = null }
  }, [reduced])
  useEffect(() => {
    if (leaderGone) { scroller.lenis?.start(); document.documentElement.classList.remove('is-loading'); gsap.ticker.lagSmoothing(0) }
    else { scroller.lenis?.stop(); document.documentElement.classList.add('is-loading') }
  }, [leaderGone, reduced])

  useEffect(() => {
    document.documentElement.lang = languageTags[language]
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr'
    document.title = `IZMAB — ${copy.footerRole}`
    const url = new URL(window.location.href)
    url.searchParams.set('lang', language)
    window.history.replaceState(null, '', url)
    try { localStorage.setItem('izmab-language', language) } catch { /* private browsing */ }
  }, [language, copy.footerRole])

  useEffect(() => {
    if (!window.location.hash) return
    const id = decodeURIComponent(window.location.hash.slice(1))
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }), 300)
    return () => window.clearTimeout(timer)
  }, [])

  // Generic reveals: [data-reveal] rises in, [data-lines] slides each line up from its own mask.
  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return
    const context = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
        gsap.fromTo(element, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } })
      })
      root.querySelectorAll<HTMLElement>('[data-lines]').forEach(element => {
        gsap.fromTo(element.querySelectorAll('.line-inner'), { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } })
      })
      gsap.utils.toArray<HTMLElement>('.credit').forEach(credit => {
        gsap.fromTo(credit, { y: 80 }, { y: -40, ease: 'none', scrollTrigger: { trigger: credit, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, root)
    let mounted = true
    void document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh() })
    return () => { mounted = false; context.revert() }
  }, [language, reduced])

  // The header reads dark-on-paper whenever a paper section sits under it.
  useEffect(() => {
    let frame = 0, last = -1, light = false
    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (scrollY === last) return
      last = scrollY
      const under = document.elementsFromPoint(innerWidth / 2, 40).some(el => el.closest('.theme-paper') && !el.closest('.hdr'))
      if (under !== light) { light = under; document.documentElement.classList.toggle('hdr-light', light) }
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); document.documentElement.classList.remove('hdr-light') }
  }, [])

  // Magnetic controls lean toward the pointer.
  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let current: HTMLElement | null = null
    const move = (event: PointerEvent) => {
      const el = (event.target as Element).closest?.<HTMLElement>('[data-magnetic]') ?? null
      if (current && current !== el) { gsap.to(current, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }); current = null }
      if (!el) return
      current = el
      const rect = el.getBoundingClientRect()
      gsap.to(el, { x: (event.clientX - rect.left - rect.width / 2) * .28, y: (event.clientY - rect.top - rect.height / 2) * .38, duration: .5, ease: 'power3.out' })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [reduced])

  const onLanguage = useCallback((value: Language) => {
    if (value === language || pendingLanguage) return
    if (reduced) { setLanguage(value); return }
    transitionOrigin.current = language
    setPendingLanguage(value)
  }, [language, pendingLanguage, reduced])
  const commitLanguage = useCallback(() => { if (pendingLanguage) setLanguage(pendingLanguage) }, [pendingLanguage])
  const finishLanguage = useCallback(() => setPendingLanguage(null), [])

  return <>
    <div className={`site lang-${language}`} ref={rootRef} dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <Header copy={copy} language={language} setLanguage={onLanguage} soundEnabled={sound.enabled} toggleSound={() => { void sound.toggle() }} play={sound.play} reduced={reduced} />
      <main>
        <Hero copy={copy} started={started} reduced={reduced} />
        <Manifesto copy={copy} reduced={reduced} />
        <Marquee items={copy.ticker} reduced={reduced} />
        <Work copy={copy} reduced={reduced} play={sound.play} />
        <Reel copy={copy} reduced={reduced} />
        <About copy={copy} reduced={reduced} />
        <Process copy={copy} reduced={reduced} />
        <Pricing copy={copy} play={sound.play} />
        <Journal copy={copy} language={language} />
        <Feed copy={copy} reduced={reduced} />
        <Contact copy={copy} language={language} />
        <Gift copy={copy} play={sound.play} reduced={reduced} />
      </main>
      <Footer copy={copy} reduced={reduced} />
    </div>
    {!reduced && <SoftCursor />}
    {!leaderGone && <Preloader label={copy.loading} skip={copy.skip} onOpen={onLeaderOpen} onDone={onLeaderDone} />}
    {pendingLanguage && <LanguageTransition from={transitionOrigin.current} to={pendingLanguage} commit={commitLanguage} finish={finishLanguage} reduced={reduced} />}
  </>
}
