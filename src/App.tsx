import { useEffect, useRef, useState, type FormEvent } from 'react'
import { nav, ticker, projects, stats, skills, steps, plans, posts } from './data'

const asset = (name: string) => `/${name}`

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

function Atmosphere({ reduced }: { reduced: boolean }) {
  useEffect(() => {
    if (reduced) return
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 128
    const context = canvas.getContext('2d')
    if (!context) return
    const image = context.createImageData(128, 128)
    for (let index = 0; index < image.data.length; index += 4) {
      const value = Math.random() * 255
      image.data[index] = image.data[index + 1] = image.data[index + 2] = value
      image.data[index + 3] = 40 + Math.random() * 150
    }
    context.putImageData(image, 0, 0)
    document.documentElement.style.setProperty('--grain-image', `url(${canvas.toDataURL()})`)
  }, [reduced])

  return <>
    <div className="grain-layer" aria-hidden="true" />
    <div className="light-leak-layer" aria-hidden="true" />
  </>
}

function Cursor({ reduced }: { reduced: boolean }) {
  const cursor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const element = cursor.current
    if (!element) return
    const target = { x: -80, y: -80 }
    const position = { x: -80, y: -80 }
    let frame = 0
    const onMove = (event: MouseEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      const hit = (event.target as Element).closest?.('[data-cursor]')
      const kind = hit?.getAttribute('data-cursor') ?? ''
      element.dataset.kind = kind
      element.textContent = ({ view: 'VIEW', play: 'PLAY', read: 'READ' } as Record<string, string>)[kind] ?? ''
    }
    const animate = () => {
      position.x += (target.x - position.x) * 0.18
      position.y += (target.y - position.y) * 0.18
      element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`
      frame = requestAnimationFrame(animate)
    }
    document.documentElement.classList.add('custom-cursor')
    window.addEventListener('mousemove', onMove, { passive: true })
    animate()
    return () => {
      document.documentElement.classList.remove('custom-cursor')
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [reduced])

  return <div className="cursor-dot" ref={cursor} aria-hidden="true" />
}

function Loader({ reduced }: { reduced: boolean }) {
  const [count, setCount] = useState(() => {
    try { return sessionStorage.getItem('izmab-loaded') ? 100 : 0 } catch { return 0 }
  })
  const [done, setDone] = useState(count === 100 || reduced)

  useEffect(() => {
    if (reduced) { setDone(true); return }
    if (done) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1200)
      setCount(Math.round((1 - (1 - progress) ** 2) * 100))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else {
        setDone(true)
        try { sessionStorage.setItem('izmab-loaded', '1') } catch { /* storage may be unavailable */ }
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [done, reduced])

  if (done) return null
  return <div className="loader" role="status" aria-label="Loading site">
    <span className="eyebrow">Loading frames</span>
    <span className="loader-count" aria-hidden="true">{count}</span>
  </div>
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggle = () => setMenuOpen(value => !value)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return <>
    <header className="site-header">
      <a className="availability eyebrow" href="#contact" data-cursor="link"><span className="status-dot" /><span>Available · 2026</span></a>
      <button className="menu-toggle eyebrow" type="button" onClick={toggle} aria-expanded={menuOpen} aria-controls="site-menu" data-cursor="link">
        <span>{menuOpen ? 'Close' : 'Menu'}</span><span className="menu-toggle-dot" />
      </button>
    </header>
    <nav id="site-menu" className={`menu-panel ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation" aria-hidden={!menuOpen}>
      <div className="menu-links">
        {nav.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1} data-cursor="link"><span className="eyebrow">{item.number}</span><span>{item.label}</span></a>)}
      </div>
      <div className="menu-meta eyebrow">
        <a href="mailto:hello@izmab.studio" tabIndex={menuOpen ? 0 : -1}>hello@izmab.studio</a>
        <span>Shooting worldwide</span>
      </div>
    </nav>
  </>
}

function Hero({ markRef, portraitRef }: { markRef: React.RefObject<HTMLImageElement | null>, portraitRef: React.RefObject<HTMLImageElement | null> }) {
  return <section id="top" className="hero">
    <div className="hero-glow" aria-hidden="true" />
    <img className="hero-mark" ref={markRef} src={asset('izmab-wordmark.svg')} alt="IZMAB" />
    <img className="hero-portrait" ref={portraitRef} src={asset('portrait.jpeg')} alt="Portrait of the photographer" fetchPriority="high" />
    <div className="hero-shade" aria-hidden="true" />
    <div className="hero-copy">
      <p data-reveal className="eyebrow">Cinematic &amp; trend-led video. Artistic stills. One camera, one operator, no filler.</p>
      <p data-reveal>I shoot films that hold attention and photographs that hold still. Brand work, music, portraits — cut for the platform they live on.</p>
    </div>
    <a className="hero-scroll eyebrow" href="#work" data-cursor="link">Scroll</a>
  </section>
}

function Ticker({ reduced }: { reduced: boolean }) {
  return <div className="ticker" aria-label={ticker.join(', ')}>
    <div className={`ticker-track ${reduced ? 'is-still' : ''}`} aria-hidden="true">
      {[...ticker, ...ticker].map((label, index) => <span key={index} className={index % 4 === 1 || index % 4 === 3 ? 'accent' : ''}>{label}<i /></span>)}
    </div>
  </div>
}

function Work({ wrapRef, trackRef, index }: { wrapRef: React.RefObject<HTMLElement | null>, trackRef: React.RefObject<HTMLDivElement | null>, index: number }) {
  return <section id="work" className="work-section" ref={wrapRef}>
    <div className="work-sticky">
      <div className="section-topline eyebrow"><span>01 — Selected work</span><span className="accent">{String(index).padStart(3, '0')} / 006</span></div>
      <div className="work-track" ref={trackRef}>
        {projects.map(project => <article className="work-card" key={project.number}>
          <div className="work-visual">
            <div className="placeholder-lines" aria-hidden="true" />
            <span className="work-placeholder eyebrow">Project still — replace</span>
            <span className="work-number eyebrow">{project.number}</span>
            <span className="work-format eyebrow">{project.format}</span>
          </div>
          <div className="work-caption"><h3>{project.title}</h3><span className="eyebrow">{project.meta}</span></div>
        </article>)}
      </div>
    </div>
  </section>
}

function Reel() {
  return <section id="reel" className="section-pad reel-section"><div className="container">
    <div data-reveal className="eyebrow section-label">02 — Showreel 2026</div>
    <div className="reel-frame" aria-label="Showreel video placeholder">
      <div className="reel-center"><div className="reel-play eyebrow">Reel</div><span className="eyebrow">Reel placeholder — drop 02:14 master here</span></div>
      <span className="reel-rec eyebrow">REC ● 4K · 24FPS · LOG</span><span className="reel-progress" />
    </div>
    <div className="stats-grid">{stats.map(item => <div data-reveal key={item.label}><strong>{item.value}</strong><span className="eyebrow">{item.label}</span></div>)}</div>
  </div></section>
}

function About() {
  return <section id="about" className="section-pad border-top"><div className="container about-grid">
    <div>
      <div data-reveal className="eyebrow section-label">03 — About</div>
      <h2 data-reveal className="display-heading">Frames that<br />don’t blink</h2>
      <div data-reveal className="about-prose">
        <p>I direct, shoot and cut. Cinematic pieces when a brand needs weight, trend-led edits when it needs reach, and artistic stills that carry the same grade as the film they came from.</p>
        <p>Small crew by design: fewer people on set means faster decisions, longer takes and a subject who forgets the camera is there. Colour and sound finished in-house, so what you approve is what ships.</p>
      </div>
      <div data-reveal className="skills">{skills.map(skill => <span className="eyebrow" key={skill}>{skill}</span>)}</div>
    </div>
    <figure data-reveal className="about-image"><img src={asset('portrait.jpeg')} alt="Photographer behind and in front of the lens" loading="lazy" /><figcaption className="eyebrow">Behind / in front of the lens</figcaption></figure>
  </div></section>
}

function Process({ wrapRef, active, progress }: { wrapRef: React.RefObject<HTMLElement | null>, active: number, progress: number }) {
  return <section id="process" className="process-section border-top" ref={wrapRef}>
    <div className="process-sticky"><div className="container process-grid">
      <div><div className="eyebrow section-label">04 — How we shoot</div><div className="step-list">
        {steps.map((step, index) => <div className={`step ${index === active ? 'is-active' : ''}`} key={step.number}>
          <span className="eyebrow accent">{step.number}</span><div><h3>{step.title}</h3><p>{step.body}</p></div>
        </div>)}
      </div></div>
      <div className="process-frame">
        {steps.map((step, index) => <div className={`process-image ${index === active ? 'is-active' : ''}`} key={step.number}><span className="eyebrow">{step.frame}</span></div>)}
        <span className="process-seq eyebrow">SEQ · SCRUB</span><span className="process-progress" style={{ width: `${progress * 100}%` }} />
      </div>
    </div></div>
  </section>
}

function Pricing() {
  return <section id="pricing" className="section-pad border-top"><div className="container">
    <div data-reveal className="section-topline eyebrow"><span>05 — Packages</span><span>Half-day minimum · travel quoted separately</span></div>
    <div className="plans-grid">{plans.map(plan => <article data-reveal className={`plan ${plan.featured ? 'is-featured' : ''}`} key={plan.number}>
      <div className="plan-top eyebrow"><span>{plan.tag}</span><span>{plan.number}</span></div>
      <div><h3>{plan.name}</h3><span className="eyebrow">{plan.price}</span></div>
      <ul>{plan.items.map(item => <li key={item}>{item}</li>)}</ul>
      <a className="plan-link eyebrow" href="#contact" data-cursor="link"><span>Book this</span><span>→</span></a>
    </article>)}</div>
  </div></section>
}

function Journal() {
  return <section id="journal" className="section-pad border-top"><div className="container">
    <div data-reveal className="eyebrow section-label">06 — Journal</div>
    <div className="journal-list">{posts.map(post => <article data-reveal className="journal-row" key={post.title}>
      <span className="eyebrow">{post.date}</span><h3>{post.title}</h3><span className="eyebrow accent">{post.read}</span>
    </article>)}</div>
  </div></section>
}

function Feed() {
  return <section id="feed" className="section-pad feed-section border-top"><div className="container section-topline eyebrow"><span>07 — Feed</span><span className="accent">@izmab →</span></div>
    <div className="feed-grid">{Array.from({ length: 6 }, (_, index) => <div className="feed-placeholder eyebrow" key={index}>Post {String(index + 1).padStart(2, '0')} — replace</div>)}</div>
  </section>
}

function Contact() {
  const [error, setError] = useState('')
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const values = new FormData(form)
    const body = `Name: ${values.get('name')}\nEmail: ${values.get('email')}\nProject: ${values.get('project')}\nDates: ${values.get('dates')}`
    const url = `mailto:hello@izmab.studio?subject=${encodeURIComponent('Project enquiry — IZMAB')}&body=${encodeURIComponent(body)}`
    setError('Your email app will open with this enquiry ready to send.')
    window.location.href = url
  }
  return <section id="contact" className="section-pad contact-section border-top"><div className="container contact-grid">
    <div><div data-reveal className="eyebrow section-label">08 — Booking</div><h2 data-reveal className="display-heading">Let’s<br />roll</h2>
      <div data-reveal className="contact-details eyebrow"><a href="mailto:hello@izmab.studio" data-cursor="link">hello@izmab.studio</a><span>Next opening: Nov 2026</span></div>
    </div>
    <form data-reveal className="contact-form" onSubmit={onSubmit}>
      <label><span className="eyebrow">Name</span><input name="name" type="text" placeholder="Who is asking" autoComplete="name" required data-cursor="text" /></label>
      <label><span className="eyebrow">Email</span><input name="email" type="email" placeholder="Where to reply" autoComplete="email" required data-cursor="text" /></label>
      <label><span className="eyebrow">Project</span><input name="project" type="text" placeholder="Brand film, portraits, event…" required data-cursor="text" /></label>
      <label><span className="eyebrow">Dates</span><input name="dates" type="text" placeholder="Rough window is fine" data-cursor="text" /></label>
      <button className="send-button eyebrow" type="submit" data-cursor="link"><span>Prepare enquiry email</span><span>→</span></button>
      {error && <p className="form-note" role="status">{error}</p>}
    </form>
  </div></section>
}

function Footer() {
  return <footer className="footer"><a href="#top" aria-label="Back to top" data-cursor="link"><img src={asset('izmab-wordmark.svg')} alt="IZMAB" loading="lazy" /></a>
    <div className="footer-bottom eyebrow"><span>© {new Date().getFullYear()} IZMAB — Video &amp; photography</span><span>Site by IZMAB</span></div>
  </footer>
}

export default function App() {
  const reduced = useReducedMotion()
  const markRef = useRef<HTMLImageElement>(null)
  const portraitRef = useRef<HTMLImageElement>(null)
  const workWrapRef = useRef<HTMLElement>(null)
  const workTrackRef = useRef<HTMLDivElement>(null)
  const processWrapRef = useRef<HTMLElement>(null)
  const [workIndex, setWorkIndex] = useState(1)
  const [activeStep, setActiveStep] = useState(0)
  const [processProgress, setProcessProgress] = useState(0)

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    document.documentElement.classList.add('motion-ready')
    nodes.forEach(node => observer.observe(node))
    return () => { observer.disconnect(); document.documentElement.classList.remove('motion-ready') }
  }, [reduced])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const viewport = window.innerHeight
      const mobile = window.matchMedia('(max-width: 800px)').matches
      const y = window.scrollY
      if (!reduced && !mobile) {
        if (markRef.current) markRef.current.style.transform = `translate(-50%, -50%) translateY(${y * 0.26}px) scale(${1 + y / 9000})`
        if (portraitRef.current) portraitRef.current.style.transform = `translateX(-50%) translateY(${y * 0.08}px)`
      }
      const work = workWrapRef.current
      const track = workTrackRef.current
      if (work && track && !mobile) {
        const total = Math.max(1, work.offsetHeight - viewport)
        const progress = Math.max(0, Math.min(1, -work.getBoundingClientRect().top / total))
        const distance = Math.max(0, track.scrollWidth - window.innerWidth + 48)
        track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`
        setWorkIndex(Math.min(projects.length, Math.floor(progress * projects.length) + 1))
      } else if (track) track.style.transform = ''
      const process = processWrapRef.current
      if (process && !mobile) {
        const total = Math.max(1, process.offsetHeight - viewport)
        const progress = Math.max(0, Math.min(0.999, -process.getBoundingClientRect().top / total))
        setProcessProgress(progress)
        setActiveStep(Math.floor(progress * steps.length))
      }
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame) }
  }, [reduced])

  return <>
    <Atmosphere reduced={reduced} /><Cursor reduced={reduced} /><Loader reduced={reduced} />
    <Header />
    <main>
      <Hero markRef={markRef} portraitRef={portraitRef} />
      <Ticker reduced={reduced} />
      <Work wrapRef={workWrapRef} trackRef={workTrackRef} index={workIndex} />
      <Reel /><About /><Process wrapRef={processWrapRef} active={activeStep} progress={processProgress} />
      <Pricing /><Journal /><Feed /><Contact />
    </main>
    <Footer />
  </>
}
