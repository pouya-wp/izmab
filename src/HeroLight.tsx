import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroLight({ reduced }: { reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reduced || !host.current || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const node = host.current
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }) } catch { return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25))
    renderer.setClearColor(0, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-hidden', 'true')
    node.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 20)
    camera.position.z = 8
    const orb = new THREE.Group(); scene.add(orb)
    const coreGeometry = new THREE.IcosahedronGeometry(.115, 3)
    const coreMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff2146, emissive: 0xff1238, emissiveIntensity: 4.2, metalness: .14, roughness: .16, clearcoat: 1 })
    const core = new THREE.Mesh(coreGeometry, coreMaterial); orb.add(core)
    const haloGeometry = new THREE.SphereGeometry(.22, 24, 16)
    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xe60032, transparent: true, opacity: .11, blending: THREE.AdditiveBlending, depthWrite: false })
    orb.add(new THREE.Mesh(haloGeometry, haloMaterial))
    const ringGeometry = new THREE.TorusGeometry(.19, .008, 8, 64)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff7585, transparent: true, opacity: .65, blending: THREE.AdditiveBlending })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial); ring.rotation.x = .38; orb.add(ring)
    const point = new THREE.PointLight(0xff183c, 14, 2.2); point.position.z = .3; orb.add(point)
    scene.add(new THREE.AmbientLight(0xffffff, .7))
    let active = false, frame = 0, desiredScale = 1
    renderer.setSize(132, 132, false)
    document.documentElement.classList.add('custom-cursor')
    const move = (event: PointerEvent) => { active = true; node.style.transform = `translate3d(${event.clientX - 66}px,${event.clientY - 66}px,0)`; desiredScale = (event.target as Element).closest?.('[data-cursor]') ? 1.45 : 1 }
    const leave = () => { active = false }
    const tick = (now: number) => { frame = requestAnimationFrame(tick); if (document.hidden) return; ring.rotation.z = now * .001; orb.scale.setScalar(orb.scale.x + (desiredScale - orb.scale.x) * .15); orb.visible = active; if (active) renderer.render(scene, camera); else renderer.clear() }
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('pointerleave', leave)
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); document.documentElement.classList.remove('custom-cursor'); window.removeEventListener('pointermove', move); window.removeEventListener('pointerleave', leave); coreGeometry.dispose(); coreMaterial.dispose(); haloGeometry.dispose(); haloMaterial.dispose(); ringGeometry.dispose(); ringMaterial.dispose(); renderer.dispose(); renderer.domElement.remove() }
  }, [reduced])
  return <div className="hero-light-canvas" ref={host} aria-hidden="true" />
}
