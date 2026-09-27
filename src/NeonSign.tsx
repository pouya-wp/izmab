import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { type Language } from './i18n'

type Path = [number, number][]
const glyphs: Record<string, Path[]> = {
  I: [[[-.32,1],[.32,1]],[[0,1],[0,-1]],[[-.32,-1],[.32,-1]]],
  Z: [[[-.38,1],[.38,1]],[[.38,1],[-.38,-1]],[[-.38,-1],[.38,-1]]],
  M: [[[-.4,-1],[-.4,1],[0,-.18],[.4,1],[.4,-1]]],
  A: [[[-.4,-1],[0,1],[.4,-1]],[[-.25,-.25],[.25,-.25]]],
  B: [[[-.38,-1],[-.38,1]], [[-.38,1],[.05,1],[.35,.81],[.38,.52],[.18,.13],[-.38,.1]], [[-.38,.1],[.15,.1],[.41,-.17],[.41,-.64],[.15,-1],[-.38,-1]]],
}
const copy: Record<Language, { title: string; hint: string }> = {
  en: { title: 'The name in light', hint: 'Move to see the glass and metal' },
  fa: { title: 'نامی از نور', hint: 'حرکت بده تا شیشه و فلز را ببینی' },
  hy: { title: 'Անունը լույսի մեջ', hint: 'Շարժիր՝ ապակին ու մետաղը տեսնելու համար' },
  ru: { title: 'Имя в свете', hint: 'Двигай курсор, чтобы увидеть стекло и металл' },
}

export default function NeonSign({ language, reduced }: { language: Language; reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reduced || !host.current) return
    const node = host.current
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' }) } catch { return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 800 ? 1 : 1.4))
    renderer.setClearColor(0x050506, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = .9
    renderer.domElement.setAttribute('aria-hidden', 'true')
    node.appendChild(renderer.domElement)
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x050506)
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 100)
    camera.position.set(0, .1, 8)
    const rig = new THREE.Group(); rig.rotation.y = .1; scene.add(rig)
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []
    const housing = new THREE.MeshPhysicalMaterial({ color: 0x17181d, metalness: .88, roughness: .23, clearcoat: .7, clearcoatRoughness: .14 })
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x72757c, metalness: .15, roughness: .08, transmission: .43, thickness: .4, transparent: true, opacity: .6, clearcoat: 1 })
    materials.push(housing, glass)
    const neonMaterials: THREE.MeshBasicMaterial[] = []
    const coreMaterials: THREE.MeshBasicMaterial[] = []
    const letters = 'IZMAB'
    for (let index = 0; index < letters.length; index++) {
      const x = (index - 2) * 1.05
      const neon = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(2.15, .075, .17), toneMapped: false, transparent: true, opacity: 0 })
      const core = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(2.35, .42, .43), toneMapped: false, transparent: true, opacity: 0 })
      materials.push(neon, core); neonMaterials.push(neon); coreMaterials.push(core)
      for (const path of glyphs[letters[index]]) {
        const tube = (z: number, radius: number, material: THREE.Material) => {
          const points = path.map(([px, py]) => new THREE.Vector3(x + px, py, z))
          const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
          const geometry = new THREE.TubeGeometry(curve, Math.max(18, path.length * 15), radius, 10, false)
          geometries.push(geometry)
          rig.add(new THREE.Mesh(geometry, material))
        }
        tube(-.11, .092, housing)
        tube(.012, .052, glass)
        tube(.055, .028, neon)
        tube(.076, .011, core)
      }
    }
    const floorGeometry = new THREE.PlaneGeometry(14, 8)
    geometries.push(floorGeometry)
    const floorMaterial = new THREE.MeshPhysicalMaterial({ color: 0x111115, metalness: .66, roughness: .24, clearcoat: .48 })
    materials.push(floorMaterial)
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -1.4, .7); scene.add(floor)
    const redLights = [-2.2, 0, 2.2].map(x => { const light = new THREE.PointLight(0xff183a, 1.35, 2.6); light.position.set(x, .2, 1.6); scene.add(light); return light })
    const whiteLight = new THREE.PointLight(0xdde7ff, 2, 8); whiteLight.position.set(-3, 2.2, 3); scene.add(whiteLight)
    scene.add(new THREE.AmbientLight(0x868ba4, .28))
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .72, .3, .34)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    let frame = 0, visible = false, started = 0
    const desired = { x: 0, y: 0 }
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; if (visible && !started) started = performance.now() }, { threshold: .08 })
    observer.observe(node)
    const resize = () => { const rect = node.getBoundingClientRect(); camera.aspect = rect.width / Math.max(rect.height, 1); const radians = camera.fov * Math.PI / 180; camera.position.z = Math.max(7, 5.4 / (2 * Math.tan(radians / 2) * camera.aspect) * 1.12); camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false); composer.setSize(rect.width, rect.height) }
    const size = new ResizeObserver(resize); size.observe(node)
    const move = (event: PointerEvent) => { const rect = node.getBoundingClientRect(); desired.x = ((event.clientX - rect.left) / rect.width - .5) * .24; desired.y = ((event.clientY - rect.top) / rect.height - .5) * .13 }
    const tick = (now: number) => { frame = requestAnimationFrame(tick); if (!visible || document.hidden) return; const elapsed = now - started; rig.rotation.y += (.1 + desired.x - rig.rotation.y) * .035; rig.rotation.x += (-desired.y - rig.rotation.x) * .035; neonMaterials.forEach((material, index) => { const on = Math.max(0, Math.min(1, (elapsed - index * 170) / 250)); const flicker = elapsed - index * 170 < 750 ? .88 + Math.sin(now * .047 + index * 3) * .12 : 1; material.opacity = on * flicker; coreMaterials[index].opacity = on * flicker * .65 }); redLights.forEach((light, index) => { light.intensity = 1.35 + Math.sin(now * .0014 + index) * .14 }); composer.render() }
    node.addEventListener('pointermove', move)
    resize(); frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); node.removeEventListener('pointermove', move); observer.disconnect(); size.disconnect(); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); composer.dispose(); renderer.dispose(); renderer.domElement.remove() }
  }, [reduced])
  return <section className="neon-section border-top" aria-label={copy[language].title}>
    <div className="neon-top eyebrow"><span>IZMAB / {copy[language].title}</span><span>NEON / 01</span></div>
    <div className="neon-stage" ref={host}>{reduced && <strong className="neon-fallback">IZMAB</strong>}</div>
    <div className="neon-bottom eyebrow"><span>{copy[language].hint}</span><span>© 2026</span></div>
  </section>
}
