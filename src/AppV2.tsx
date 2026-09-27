import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useSoundDesign, type SoundCue } from './useSoundDesign'
import DepthPortrait from './DepthPortrait'
import LanguageTransition from './LanguageTransition'
import ElasticWorkSurface from './ElasticWorkSurface'
import HeroLight from './HeroLight'
import NeonSign from './NeonSign'
import { languageNames, languageTags, text, type Language, type LocaleText } from './i18n'
import { projects, posts } from './data'

gsap.registerPlugin(ScrollTrigger)
const FilmAtmosphere = lazy(() => import('./WaterAtmosphere'))
const asset = (name: string) => `/${name}`
const sectionIds = ['work', 'reel', 'about', 'process', 'pricing', 'journal', 'feed', 'contact']
const postDates = ['2026-08-14', '2026-07-02', '2026-05-19']

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

function Header({ copy, language, setLanguage, soundEnabled, toggleSound, play, reduced }: {
  copy: LocaleText; language: Language; setLanguage: (language: Language) => void
  soundEnabled: boolean; toggleSound: () => void; play: (cue: SoundCue) => void; reduced: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeMenuIndex, setActiveMenuIndex] = useState(0)
  const menuRef = useRef<HTMLElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menuItems = sectionIds.filter(id => id !== 'feed')
  useEffect(() => {
    const panel = menuRef.current
    if (!panel) return
    const origin = language === 'fa' ? '5% 5%' : '95% 5%'
    if (reduced) {
      gsap.set(panel, { clipPath: menuOpen ? `circle(150% at ${origin})` : `circle(0% at ${origin})`, visibility: menuOpen ? 'visible' : 'hidden' })
      return
    }
    gsap.killTweensOf(panel)
    if (menuOpen) {
      gsap.set(panel, { visibility: 'visible' })
      gsap.to(panel, { clipPath: `circle(150% at ${origin})`, duration: 1.05, ease: 'power4.inOut' })
      gsap.fromTo(panel.querySelectorAll('.menu-links a'), { y: 48, opacity: 0, rotateX: -22 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.85, stagger: 0.065, delay: 0.22, ease: 'power3.out' })
      gsap.fromTo(panel.querySelector('.menu-stage'), { opacity: 0, x: 90, rotateY: -12 }, { opacity: 1, x: 0, rotateY: 0, duration: 1.05, delay: .35, ease: 'power3.out' })
    } else {
      gsap.to(panel, { clipPath: `circle(0% at ${origin})`, duration: 0.82, ease: 'power4.inOut', onComplete: () => gsap.set(panel, { visibility: 'hidden' }) })
    }
  }, [menuOpen, reduced, language])

  useEffect(() => {
    if (!menuOpen || reduced || !menuRef.current) return
    const elements = menuRef.current.querySelectorAll('.menu-preview-number, .menu-preview-title')
    const animation = gsap.fromTo(elements, { opacity: 0, y: 26, rotateX: -16 }, { opacity: 1, y: 0, rotateX: 0, duration: .46, stagger: .07, ease: 'power3.out' })
    return () => { animation.kill() }
  }, [activeMenuIndex, menuOpen, reduced])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    window.dispatchEvent(new CustomEvent('izmab:menu', { detail: menuOpen }))
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  const closeMenu = () => { setMenuOpen(false); play('transition') }
  return <>
    <header className="site-header site-header-v2">
      <a className="availability eyebrow" href="#contact" data-cursor="link"><span className="status-dot" /><span>{copy.available}</span></a>
      <div className="header-controls">
        <label className="language-control eyebrow" data-cursor="link">
          <span className="visually-hidden">{copy.languageLabel}</span>
          <select aria-label={copy.languageLabel} value={language} onChange={event => { setLanguage(event.target.value as Language); play('transition') }}>
            {(Object.keys(languageNames) as Language[]).map(code => <option key={code} value={code}>{code.toUpperCase()} · {languageNames[code]}</option>)}
          </select>
        </label>
        <button className={`sound-control eyebrow ${soundEnabled ? 'is-on' : ''}`} type="button" onClick={toggleSound} aria-label={soundEnabled ? copy.soundOn : copy.soundOff} aria-pressed={soundEnabled} title={soundEnabled ? copy.soundOn : copy.soundOff}>
          <span className="sound-bars" aria-hidden="true"><i /><i /><i /></span><span className="sound-word">{copy.soundLabel}</span>
        </button>
        <button ref={menuButton} className="menu-toggle eyebrow" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-controls="site-menu" data-cursor="link">
          <span>{menuOpen ? copy.close : copy.menu}</span><span className="menu-toggle-dot" />
        </button>
      </div>
    </header>
    <nav ref={menuRef} id="site-menu" className="menu-panel menu-panel-v2" style={{ pointerEvents: menuOpen ? 'auto' : 'none' }} aria-label={copy.menu} aria-hidden={!menuOpen}>
      <div className="menu-inner">
        <div className="menu-list"><div className="menu-list-top eyebrow"><span>IZMAB / {copy.menu}</span><span>01—07</span></div>
          <div className="menu-links">
            {menuItems.map((id, index) => <a className={activeMenuIndex === index ? 'is-active' : ''} key={id} href={`#${id}`} onClick={closeMenu} onPointerEnter={() => { setActiveMenuIndex(index); play('hover') }} onFocus={() => setActiveMenuIndex(index)} tabIndex={menuOpen ? 0 : -1} data-cursor="link"><span className="eyebrow">{String(index + 1).padStart(2, '0')}</span><span className="menu-link-title">{copy.nav[index]}</span><span className="menu-link-arrow" aria-hidden="true">↗</span></a>)}
          </div>
          <div className="menu-meta eyebrow"><a href="mailto:hello@izmab.studio" tabIndex={menuOpen ? 0 : -1}>hello@izmab.studio</a><span>IZMAB · 2026</span></div>
        </div>
        <div className="menu-stage" aria-hidden="true"><div className="menu-stage-top eyebrow"><span>IZMAB / {copy.frame}</span><span>{String(activeMenuIndex + 1).padStart(2, '0')} / 07</span></div>
          <div className="menu-preview" key={`${language}-${activeMenuIndex}`}><strong className="menu-preview-number">{String(activeMenuIndex + 1).padStart(2, '0')}</strong><span className="menu-preview-title">{copy.nav[activeMenuIndex]}</span></div>
          <div className="menu-stage-bottom eyebrow"><span>{copy.sections[activeMenuIndex === 6 ? 7 : activeMenuIndex]}</span><span>↗</span></div>
        </div>
      </div>
    </nav>
  </>
}

function Hero({ copy, markRef, portraitRef, reduced }: { copy: LocaleText; markRef: RefObject<HTMLImageElement | null>; portraitRef: RefObject<HTMLDivElement | null>; reduced: boolean }) {
  return <section id="top" className="hero hero-v2">
    <div className="hero-glow" aria-hidden="true" />
    <img className="hero-mark" ref={markRef} src={asset('izmab-wordmark.svg')} alt="IZMAB" />
    <DepthPortrait portraitRef={portraitRef} reduced={reduced} />
    <div className="hero-shade" aria-hidden="true" />
    <div className="hero-copy"><p className="eyebrow" data-hero-copy>{copy.heroKicker}</p><p data-hero-copy>{copy.heroCopy}</p></div>
    <a className="hero-scroll eyebrow" href="#work" data-cursor="link">{copy.scroll}</a>
  </section>
}

function Ticker({ copy, reduced }: { copy: LocaleText; reduced: boolean }) {
  return <div className="ticker" aria-label={copy.ticker.join(', ')}><div className={`ticker-track ${reduced ? 'is-still' : ''}`} aria-hidden="true">
    {[...copy.ticker, ...copy.ticker].map((item, index) => <span key={index} className={index % 2 ? 'accent' : ''}>{item}<i /></span>)}
  </div></div>
}

function Work({ copy, wrapRef, trackRef, index, reduced }: { copy: LocaleText; wrapRef: RefObject<HTMLElement | null>; trackRef: RefObject<HTMLDivElement | null>; index: number; reduced: boolean }) {
  return <section id="work" className="work-section" ref={wrapRef}><div className="work-sticky">
    <div className="section-topline eyebrow"><span>01 — {copy.sections[0]}</span><span className="accent">{String(index).padStart(3, '0')} / 006</span></div>
    <div className="work-track" ref={trackRef}>{projects.map((project, i) => <article className="work-card" key={project.number}>
      <div className="work-visual"><ElasticWorkSurface index={i} reduced={reduced} /><div className="placeholder-lines" aria-hidden="true" /><span className="work-placeholder eyebrow">{copy.workPlaceholder}</span><span className="work-number eyebrow">{project.number}</span><span className="work-format eyebrow">{project.format}</span></div>
      <div className="work-caption"><h3>{project.title}</h3><span className="eyebrow">{copy.projectKinds[i]} · {project.meta.slice(-4)}</span></div>
    </article>)}</div>
  </div></section>
}

function Reel({ copy }: { copy: LocaleText }) {
  return <section id="reel" className="section-pad reel-section"><div className="container">
    <div data-reveal className="eyebrow section-label">02 — {copy.sections[1]}</div>
    <div className="reel-frame" aria-label={copy.reelPlaceholder}>
      <div className="reel-center"><div className="reel-play eyebrow" aria-hidden="true">◉</div><span className="eyebrow">{copy.reelPlaceholder}</span></div>
      <span className="reel-rec eyebrow">REC ● 4K · 24FPS · LOG</span><span className="reel-progress" />
      <span className="reel-index eyebrow">02 / {copy.reelLabel}</span>
    </div>
    <div className="stats-grid">{copy.stats.map((label, index) => <div data-reveal key={index}><strong>{copy.statValues[index]}</strong><span className="eyebrow">{label}</span></div>)}</div>
  </div></section>
}

function About({ copy }: { copy: LocaleText }) {
  return <section id="about" className="section-pad border-top"><div className="container about-grid">
    <div><div data-reveal className="eyebrow section-label">03 — {copy.sections[2]}</div>
      <h2 data-reveal className="display-heading">{copy.aboutHeading[0]}<br />{copy.aboutHeading[1]}</h2>
      <div data-reveal className="about-prose">{copy.aboutParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <div data-reveal className="skills">{copy.skills.map(skill => <span className="eyebrow" key={skill}>{skill}</span>)}</div>
    </div>
    <figure data-reveal className="about-image"><img src={asset('portrait.jpeg')} alt={copy.portraitCaption} loading="lazy" /><figcaption className="eyebrow">{copy.portraitCaption}</figcaption></figure>
  </div></section>
}

function Process({ copy, wrapRef, active, progress }: { copy: LocaleText; wrapRef: RefObject<HTMLElement | null>; active: number; progress: number }) {
  return <section id="process" className="process-section border-top" ref={wrapRef}><div className="process-sticky"><div className="container process-grid">
    <div><div className="eyebrow section-label">04 — {copy.sections[3]}</div><div className="step-list">
      {copy.steps.map((step, index) => <div className={`step ${index === active ? 'is-active' : ''}`} key={index}>
        <span className="eyebrow accent">{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.body}</p></div>
      </div>)}
    </div></div>
    <div className="process-frame">
      {copy.steps.map((_, index) => <div className={`process-image ${index === active ? 'is-active' : ''}`} key={index}><span className="eyebrow">{copy.frame} {String(index + 1).padStart(2, '0')} — {copy.workPlaceholder}</span></div>)}
      <span className="process-seq eyebrow">{copy.scrub}</span><span className="process-progress" style={{ width: `${progress * 100}%` }} />
    </div>
  </div></div></section>
}

function Pricing({ copy }: { copy: LocaleText }) {
  return <section id="pricing" className="section-pad border-top"><div className="container">
    <div data-reveal className="section-topline eyebrow"><span>05 — {copy.sections[4]}</span><span>{copy.plansNote}</span></div>
    <div className="plans-grid">{copy.plans.map((plan, index) => <article data-reveal className={`plan ${index === 1 ? 'is-featured' : ''}`} key={index}>
      <div className="plan-top eyebrow"><span>{plan.tag}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
      <div><h3>{plan.name}</h3><span className="eyebrow">{plan.price}</span></div>
      <ul>{plan.items.map(item => <li key={item}>{item}</li>)}</ul>
      <a className="plan-link eyebrow" href="#contact" data-cursor="link"><span>{copy.bookThis}</span><span aria-hidden="true">↗</span></a>
    </article>)}</div>
  </div></section>
}

function Journal({ copy, language }: { copy: LocaleText; language: Language }) {
  const dateFormat = new Intl.DateTimeFormat(languageTags[language], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return <section id="journal" className="section-pad border-top"><div className="container">
    <div data-reveal className="eyebrow section-label">06 — {copy.sections[5]}</div>
    <div className="journal-list">{posts.map((post, index) => <article data-reveal className="journal-row" key={index}>
      <span className="eyebrow">{dateFormat.format(new Date(`${postDates[index]}T00:00:00Z`))}</span><h3>{copy.postTitles[index]}</h3><span className="eyebrow accent">{post.read.split(' ')[0]} {copy.readMinutes}</span>
    </article>)}</div>
  </div></section>
}

function Feed({ copy }: { copy: LocaleText }) {
  return <section id="feed" className="section-pad feed-section border-top"><div className="container section-topline eyebrow"><span>07 — {copy.sections[6]}</span><span className="accent">@izmab →</span></div>
    <div className="feed-grid">{Array.from({ length: 6 }, (_, index) => <div className="feed-placeholder eyebrow" key={index}>{copy.feedPlaceholder} {String(index + 1).padStart(2, '0')} — {copy.comingSoon}</div>)}</div>
  </section>
}

function Contact({ copy }: { copy: LocaleText }) {
  const [status, setStatus] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    const values = new FormData(event.currentTarget)
    const body = copy.fields.map((field, index) => `${field}: ${values.get(['name', 'email', 'project', 'dates'][index]) || ''}`).join('\n')
    setStatus(copy.emailPrepared)
    window.location.href = `mailto:hello@izmab.studio?subject=${encodeURIComponent('IZMAB — project enquiry')}&body=${encodeURIComponent(body)}`
  }
  return <section id="contact" className="section-pad contact-section border-top"><div className="container contact-grid">
    <div><div data-reveal className="eyebrow section-label">08 — {copy.sections[7]}</div><h2 data-reveal className="display-heading">{copy.contactHeading[0]}<br />{copy.contactHeading[1]}</h2>
      <div data-reveal className="contact-details eyebrow"><a href="mailto:hello@izmab.studio" data-cursor="link">hello@izmab.studio</a><span>{copy.nextOpening}</span></div>
    </div>
    <form data-reveal className="contact-form" onSubmit={submit}>
      {copy.fields.map((label, index) => <label key={index}><span className="eyebrow">{label}</span><input name={['name', 'email', 'project', 'dates'][index]} type={index === 1 ? 'email' : 'text'} placeholder={copy.placeholders[index]} autoComplete={index === 0 ? 'name' : index === 1 ? 'email' : 'off'} required={index < 3} data-cursor="text" /></label>)}
      <button className="send-button eyebrow" type="submit" data-cursor="link"><span>{copy.prepareEmail}</span><span aria-hidden="true">↗</span></button>
      {status && <p className="form-note" role="status">{status}</p>}
    </form>
  </div></section>
}

function Gift({ copy, play }: { copy: LocaleText; play: (cue: SoundCue) => void }) {
  return <section id="gift" className="gift-sequence" aria-label={copy.giftEyebrow}>
    <div className="gift-sticky"><div className="gift-content container">
      <div className="gift-copy"><div className="eyebrow gift-eyebrow">09 — {copy.giftEyebrow}</div>
        <h2 className="gift-heading"><span className="gift-heading-line">{copy.giftHeading[0]}</span><span className="gift-heading-line accent">{copy.giftHeading[1]}</span></h2>
        <p className="gift-note">{copy.giftNote}</p>
      </div>
      <div className="gift-ticket" onPointerEnter={() => play('hover')}>
        <div className="ticket-top eyebrow"><span>IZMAB / 2026</span><span>{copy.ticketOneWay} ↗</span></div>
        <div className="ticket-route"><span>{copy.giftRoute}</span><strong>→</strong><span>{copy.giftDestination}</span></div>
        <div className="ticket-bottom eyebrow"><span>{copy.ticketTagline}</span><span className="armenia-flag" aria-label="Armenia"><i /><i /><i /></span></div>
        <span className="gift-stamp" aria-hidden="true">AM<br /><small>2026</small></span>
      </div>
    </div><div className="gift-sprockets" aria-hidden="true" /></div>
  </section>
}

function Footer({ copy }: { copy: LocaleText }) {
  return <footer className="footer footer-v2"><a href="#top" aria-label={copy.backToTop} data-cursor="link"><img src={asset('izmab-wordmark.svg')} alt="IZMAB" loading="lazy" /></a>
    <div className="gift-signature"><span>A gift From Bro</span><span>happy emigration</span></div>
    <div className="footer-bottom eyebrow"><span>© {new Date().getFullYear()} IZMAB — {copy.footerRole}</span><a href="#top" data-cursor="link">↑ {copy.backToTop}</a></div>
  </footer>
}

export default function AppV2() {
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
  const copy = text[language]
  const reduced = useReducedMotion()
  const sound = useSoundDesign()
  const playRef = useRef(sound.play)
  playRef.current = sound.play
  const rootRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLImageElement>(null)
  const portraitRef = useRef<HTMLDivElement>(null)
  const workWrapRef = useRef<HTMLElement>(null)
  const workTrackRef = useRef<HTMLDivElement>(null)
  const processWrapRef = useRef<HTMLElement>(null)
  const [workIndex, setWorkIndex] = useState(1)
  const [activeStep, setActiveStep] = useState(0)
  const [processProgress, setProcessProgress] = useState(0)

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ duration: 1.18, anchors: true, smoothWheel: true, touchMultiplier: 1.2 })
    const sync = () => ScrollTrigger.update()
    const tick = (time: number) => lenis.raf(time * 1000)
    const menu = (event: Event) => { if ((event as CustomEvent<boolean>).detail) lenis.stop(); else lenis.start() }
    lenis.on('scroll', sync)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    window.addEventListener('izmab:menu', menu)
    return () => { window.removeEventListener('izmab:menu', menu); lenis.off('scroll', sync); gsap.ticker.remove(tick); lenis.destroy() }
  }, [reduced])

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
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }), 250)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (reduced) {
      gsap.set(root.querySelectorAll('[data-reveal], [data-hero-copy], .gift-heading-line, .gift-ticket, .gift-stamp'), { clearProps: 'all' })
      return
    }
    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })
      hero.fromTo(markRef.current, { opacity: 0, scale: 1.07 }, { opacity: 1, scale: 1, duration: 1.1 })
        .fromTo(portraitRef.current, { opacity: 0, y: 35, scale: 1.025 }, { opacity: 1, y: 0, scale: 1, duration: 1.2 }, 0.1)
        .fromTo(root.querySelectorAll('[data-hero-copy]'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.75, stagger: 0.1 }, 0.5)

      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element, index) => {
        gsap.fromTo(element, { opacity: 0, y: 26 }, {
          opacity: 1, y: 0, duration: 0.82, delay: (index % 3) * 0.04,
          ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        })
      })
      gsap.fromTo('.reel-progress', { width: '0%' }, { width: '78%', ease: 'none', scrollTrigger: { trigger: '.reel-frame', start: 'top 85%', end: 'bottom 20%', scrub: 1 } })

      const gift = gsap.timeline({ scrollTrigger: { trigger: '.gift-sequence', start: 'top 75%', end: 'bottom bottom', scrub: 1 } })
      gift.fromTo('.gift-eyebrow', { opacity: 0, x: -25 }, { opacity: 1, x: 0, duration: 0.25 })
        .fromTo('.gift-heading-line', { opacity: 0, y: 90, rotateX: -35 }, { opacity: 1, y: 0, rotateX: 0, stagger: 0.16, duration: 0.45, ease: 'power3.out' }, 0.1)
        .fromTo('.gift-note', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, 0.38)
        .fromTo('.gift-ticket', { opacity: 0, y: 120, rotation: -9, scale: 0.85 }, { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.5, ease: 'power3.out' }, 0.24)
        .fromTo('.gift-stamp', { opacity: 0, scale: 2.4, rotation: -35 }, { opacity: 1, scale: 1, rotation: -12, duration: 0.25, ease: 'back.out(1.8)' }, 0.65)

      ScrollTrigger.create({ trigger: '.gift-sequence', start: 'top 55%', once: true, onEnter: () => playRef.current('stamp') })
      sectionIds.forEach(id => ScrollTrigger.create({ trigger: `#${id}`, start: 'top 52%', onEnter: () => playRef.current('transition') }))

      media.add('(min-width: 801px)', () => {
        gsap.to(markRef.current, { y: 70, scale: 1.025, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })
        const wrap = workWrapRef.current, track = workTrackRef.current
        if (wrap && track) {
          gsap.to(track, { x: () => -Math.max(0, track.scrollWidth - window.innerWidth + 48), ease: 'none', scrollTrigger: {
            trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true,
            onUpdate: self => setWorkIndex(Math.min(projects.length, Math.floor(self.progress * projects.length) + 1)),
          } })
        }
        const process = processWrapRef.current
        if (process) ScrollTrigger.create({ trigger: process, start: 'top top', end: 'bottom bottom', onUpdate: self => {
          const progress = Math.min(0.999, self.progress)
          setProcessProgress(progress)
          setActiveStep(Math.floor(progress * copy.steps.length))
        } })
      })
    }, root)

    let mounted = true
    void document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh() })
    return () => { mounted = false; media.revert(); context.revert() }
  }, [language, reduced, copy.steps.length])

  const onLanguage = useCallback((value: Language) => {
    if (value === language || pendingLanguage) return
    if (reduced) { setLanguage(value); return }
    transitionOrigin.current = language
    setPendingLanguage(value)
  }, [language, pendingLanguage, reduced])
  const commitLanguage = useCallback(() => { if (pendingLanguage) setLanguage(pendingLanguage) }, [pendingLanguage])
  const finishLanguage = useCallback(() => setPendingLanguage(null), [])
  return <><div className={`site-shell lang-${language}`} ref={rootRef} dir={language === 'fa' ? 'rtl' : 'ltr'}>
    {!reduced && <Suspense fallback={null}><FilmAtmosphere reduced={reduced} /></Suspense>}
    <Header copy={copy} language={language} setLanguage={onLanguage} soundEnabled={sound.enabled} toggleSound={() => { void sound.toggle() }} play={sound.play} reduced={reduced} />
    <main>
      <Hero copy={copy} markRef={markRef} portraitRef={portraitRef} reduced={reduced} /><Ticker copy={copy} reduced={reduced} />
      <Work copy={copy} wrapRef={workWrapRef} trackRef={workTrackRef} index={workIndex} reduced={reduced} />
      <NeonSign language={language} reduced={reduced} /><Reel copy={copy} /><About copy={copy} /><Process copy={copy} wrapRef={processWrapRef} active={activeStep} progress={processProgress} />
      <Pricing copy={copy} /><Journal copy={copy} language={language} /><Feed copy={copy} /><Contact copy={copy} />
      <Gift copy={copy} play={sound.play} />
    </main>
    <Footer copy={copy} />
  </div>
  <HeroLight reduced={reduced} />
  {pendingLanguage && <LanguageTransition from={transitionOrigin.current} to={pendingLanguage} commit={commitLanguage} finish={finishLanguage} reduced={reduced} />}
  </>
}
