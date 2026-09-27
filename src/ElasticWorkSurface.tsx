import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertex = `varying vec2 vUv;uniform float uBend;uniform float uTime;void main(){vUv=uv;vec3 p=position;p.x+=sin(uv.y*3.14159)*uBend*.12;p.y+=sin(uv.x*6.283+uTime*1.5)*abs(uBend)*.026;gl_Position=vec4(p,1.);}`
const fragment = `varying vec2 vUv;uniform float uTime;uniform float uBend;uniform float uReveal;uniform float uAccent;void main(){vec2 uv=vUv;float y=uv.y+sin(uv.x*7.+uTime*.55)*.05;float veil=exp(-pow((uv.x-.52-uBend*.04)*2.2,2.));float arc=abs(length((uv-vec2(.5,.5))*vec2(1.25,1.))-uAccent);float line=exp(-arc*48.);float grid=step(.985,fract((uv.x+uBend*uv.y*.05)*26.))*step(.13,uv.y)*step(uv.y,.87);vec3 color=vec3(.025,.026,.034)+vec3(.12,.005,.026)*veil+vec3(.5,.012,.08)*line*.25+vec3(.06,.06,.075)*grid;float edge=smoothstep(0.,.11,uv.x)*smoothstep(0.,.11,1.-uv.x);color*=mix(.15,1.,smoothstep(0.,1.,uReveal+uv.x*.4));gl_FragColor=vec4(color,edge);}`

export default function ElasticWorkSurface({ index, reduced }: { index: number; reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reduced || !host.current) return
    const node = host.current
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }) } catch { return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.1))
    renderer.setClearColor(0, 0)
    node.appendChild(renderer.domElement)
    const uniforms = { uTime: { value: 0 }, uBend: { value: 0 }, uReveal: { value: 0 }, uAccent: { value: .28 + index * .045 } }
    const geometry = new THREE.PlaneGeometry(2, 2, 24, 24)
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true })
    const scene = new THREE.Scene(); scene.add(new THREE.Mesh(geometry, material))
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    let frame = 0, visible = false, lastScroll = window.scrollY, velocity = 0, enteredAt = 0
    const observer = new IntersectionObserver(entries => { const next = entries[0]?.isIntersecting ?? false; if (next && !visible) enteredAt = performance.now(); visible = next }, { threshold: .05 })
    observer.observe(node)
    const resize = () => { const rect = node.getBoundingClientRect(); renderer.setSize(rect.width, rect.height, false) }
    const size = new ResizeObserver(resize); size.observe(node)
    const scroll = () => { const current = window.scrollY; velocity = Math.max(-1, Math.min(1, (current - lastScroll) / 80)); lastScroll = current }
    const tick = (now: number) => { frame = requestAnimationFrame(tick); if (!visible || document.hidden) return; uniforms.uTime.value = now * .001; uniforms.uBend.value += (velocity - uniforms.uBend.value) * .12; velocity *= .9; uniforms.uReveal.value = Math.min(1, (now - enteredAt) / 900); renderer.render(scene, camera) }
    resize(); frame = requestAnimationFrame(tick); window.addEventListener('scroll', scroll, { passive: true })
    return () => { cancelAnimationFrame(frame); observer.disconnect(); size.disconnect(); window.removeEventListener('scroll', scroll); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove() }
  }, [index, reduced])
  return <div ref={host} className="elastic-work-surface" aria-hidden="true" />
}
