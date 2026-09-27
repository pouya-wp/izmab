import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { type Language } from './i18n'

const words: Record<Language, { eyebrow: string; heading: string; body: string; drag: string; lab: string; before: string; after: string; prompt: string }> = {
  en: { eyebrow: 'A different perspective', heading: 'LOOK CLOSER.', body: 'A lens is a tiny world: light, distance, and a point of view. Move through it, then take the light into your own hands.', drag: 'Move to orbit · click to pulse', lab: 'The light room', before: 'Natural', after: 'After dark', prompt: 'Drag the line. Change the mood.' },
  fa: { eyebrow: 'نگاهی دیگر', heading: 'نزدیک‌تر ببین.', body: 'هر لنز یک جهان کوچک است؛ نور، فاصله و زاویهٔ نگاه. در آن حرکت کن و بعد نور را خودت به دست بگیر.', drag: 'برای چرخش حرکت بده · برای ضربان کلیک کن', lab: 'اتاق نور', before: 'طبیعی', after: 'پس از تاریکی', prompt: 'خط را بکش و حال‌وهوا را تغییر بده.' },
  hy: { eyebrow: 'Այլ տեսանկյուն', heading: 'ՆԱՅԻՐ ԱՎԵԼԻ ՄՈՏ։', body: 'Ոսպնյակը փոքրիկ աշխարհ է՝ լույս, հեռավորություն և տեսանկյուն։ Շարժիր այն, հետո ինքդ կառավարիր լույսը։', drag: 'Շարժիր՝ պտտելու համար · սեղմիր՝ զարկ տալու համար', lab: 'Լույսի սենյակ', before: 'Բնական', after: 'Մթությունից հետո', prompt: 'Քաշիր գիծը և փոխիր տրամադրությունը։' },
  ru: { eyebrow: 'Другой взгляд', heading: 'СМОТРИ БЛИЖЕ.', body: 'Объектив — маленький мир света, расстояния и точки зрения. Поверни его, а затем возьми свет в свои руки.', drag: 'Двигай для вращения · нажми для импульса', lab: 'Комната света', before: 'Естественно', after: 'После заката', prompt: 'Потяни линию и смени настроение.' },
}

function LensCanvas({ reduced }: { reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reduced || !host.current) return
    const node = host.current
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }) } catch { return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45))
    renderer.setClearColor(0, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    node.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100)
    camera.position.z = 8
    const rig = new THREE.Group()
    scene.add(rig)
    const materials: THREE.Material[] = []
    const geometries: THREE.BufferGeometry[] = []
    const makeTorus = (radius: number, tube: number, color: number, metalness = .8) => {
      const geometry = new THREE.TorusGeometry(radius, tube, 18, 128)
      const material = new THREE.MeshPhysicalMaterial({ color, metalness, roughness: .18, clearcoat: 1, clearcoatRoughness: .09 })
      geometries.push(geometry); materials.push(material)
      const ring = new THREE.Mesh(geometry, material)
      rig.add(ring)
      return ring
    }
    const outer = makeTorus(1.85, .095, 0x28272b)
    const inner = makeTorus(1.55, .09, 0xb80b2d)
    const lip = makeTorus(1.23, .055, 0x54545b)
    outer.rotation.x = .23; inner.rotation.y = .3; lip.rotation.x = -.3
    const glassGeometry = new THREE.SphereGeometry(1.15, 48, 32)
    const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0x130c13, metalness: .15, roughness: .15, transmission: .65, thickness: 1.2, ior: 1.38, transparent: true, opacity: .72, clearcoat: 1 })
    geometries.push(glassGeometry); materials.push(glassMaterial)
    const glass = new THREE.Mesh(glassGeometry, glassMaterial); glass.scale.z = .14; rig.add(glass)
    const pupilGeometry = new THREE.CircleGeometry(.35, 64)
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x020202 })
    geometries.push(pupilGeometry); materials.push(pupilMaterial)
    const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial); pupil.position.z = .22; rig.add(pupil)
    const red = new THREE.PointLight(0xff1239, 22, 10); red.position.set(-2, 1.5, 3); scene.add(red)
    const white = new THREE.PointLight(0xfff6ec, 16, 10); white.position.set(2, -1, 3); scene.add(white)
    scene.add(new THREE.AmbientLight(0xaaaacc, .7))
    let frame = 0, visible = true, pulse = 0
    const desired = { x: 0, y: 0 }
    const resize = () => { const rect = node.getBoundingClientRect(); camera.aspect = rect.width / Math.max(1, rect.height); camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false) }
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false }); observer.observe(node)
    const size = new ResizeObserver(resize); size.observe(node)
    const move = (event: PointerEvent) => { const rect = node.getBoundingClientRect(); desired.x = ((event.clientX - rect.left) / rect.width - .5) * .8; desired.y = ((event.clientY - rect.top) / rect.height - .5) * .6 }
    const click = () => { pulse = 1 }
    const tick = (now: number) => { frame = requestAnimationFrame(tick); if (!visible || document.hidden) return; rig.rotation.y += (desired.x + Math.sin(now * .00028) * .13 - rig.rotation.y) * .035; rig.rotation.x += (desired.y - rig.rotation.x) * .035; inner.rotation.z += .003; lip.rotation.z -= .0018; pulse *= .9; rig.scale.setScalar(1 + pulse * .075); renderer.render(scene, camera) }
    node.addEventListener('pointermove', move); node.addEventListener('pointerdown', click)
    resize(); frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); size.disconnect(); node.removeEventListener('pointermove', move); node.removeEventListener('pointerdown', click); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove() }
  }, [reduced])
  return <div className="lens-canvas" ref={host} aria-hidden="true" />
}

export default function LensRoom({ language, reduced }: { language: Language; reduced: boolean }) {
  const copy = words[language]
  const [split, setSplit] = useState(52)
  const splitRef = useRef<HTMLDivElement>(null)
  const setFromPointer = (clientX: number) => { const rect = splitRef.current?.getBoundingClientRect(); if (rect) setSplit(Math.max(4, Math.min(96, (clientX - rect.left) / rect.width * 100))) }
  useEffect(() => {
    if (reduced) return
    const elements = document.querySelectorAll('.lens-room [data-lens-reveal]')
    const animations = Array.from(elements).map((element, index) => gsap.fromTo(element, { opacity: 0, y: 90, skewY: 5 }, { opacity: 1, y: 0, skewY: 0, duration: 1.2, delay: index * .08, ease: 'elastic.out(1,.8)', scrollTrigger: { trigger: element, start: 'top 88%', once: true } }))
    return () => animations.forEach(animation => { animation.scrollTrigger?.kill(); animation.kill() })
  }, [language, reduced])
  return <section className="lens-room section-pad border-top" aria-label={copy.eyebrow}>
    <div className="container"><div className="lens-heading"><div><span className="eyebrow accent" data-lens-reveal>✦ {copy.eyebrow}</span><h2 className="display-heading" data-lens-reveal>{copy.heading}</h2><p data-lens-reveal>{copy.body}</p></div><span className="eyebrow" data-lens-reveal>01 / 02 — LIGHT STUDY</span></div>
      <div className="lens-stage" data-lens-reveal><LensCanvas reduced={reduced} /><div className="lens-crosshair" aria-hidden="true" /><span className="lens-stage-hint eyebrow">{copy.drag}</span><span className="lens-stage-index eyebrow">✦ IZMAB / OPTICS</span></div>
      <div className="light-lab" data-lens-reveal><div className="light-lab-copy"><span className="eyebrow accent">02 / 02 — {copy.lab}</span><p>{copy.prompt}</p></div>
        <div className="light-lab-frame" ref={splitRef} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setFromPointer(event.clientX) }} onPointerMove={event => { if (event.buttons) setFromPointer(event.clientX) }}>
          <img src="/portrait.jpeg" alt="" loading="lazy" />
          <div className="light-lab-grade" style={{ clipPath: `inset(0 0 0 ${split}%)` }}><img src="/portrait.jpeg" alt="" loading="lazy" /></div>
          <span className="light-lab-left eyebrow">{copy.before}</span><span className="light-lab-right eyebrow">{copy.after}</span>
          <span className="light-lab-divider" style={{ left: `${split}%` }}><i>↔</i></span>
          <input className="light-lab-range" type="range" min="4" max="96" value={split} onChange={event => setSplit(Number(event.target.value))} aria-label={copy.prompt} />
        </div>
      </div>
    </div>
  </section>
}
