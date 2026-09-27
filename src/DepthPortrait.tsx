import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`
const fragment = `
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uPointer;
uniform vec2 uLight;
uniform vec3 uRipple;
uniform float uTime;
varying vec2 vUv;
void main(){
  vec2 uv=vUv;
  float depth=texture2D(uDepth,uv).r;
  vec2 parallax=(uPointer-.5)*depth*.006;
  float r=distance(uv,uRipple.xy);
  float age=uTime-uRipple.z;
  float envelope=exp(-age*2.7)*smoothstep(1.2,0.,age)*smoothstep(.34,.02,r);
  float wave=sin((r-age*.28)*53.)*envelope;
  vec2 normal=normalize(uv-uRipple.xy+vec2(.00001));
  vec2 displaced=clamp(uv+parallax+normal*wave*.004,vec2(.002),vec2(.998));
  vec3 color=texture2D(uImage,displaced).rgb;
  float face=exp(-pow((uv.x-.5)/.13,2.)-pow((uv.y-.73)/.2,2.));
  float originalRed=max(color.r-max(color.g,color.b)*1.06,0.);
  color.r-=originalRed*face*.58;
  color.g+=originalRed*face*.10;
  vec3 lifted=pow(max(color,vec3(0.)),vec3(.68))*1.1;
  color=mix(color,lifted,face*.84);
  float dx=texture2D(uDepth,uv+vec2(.003,0.)).r-texture2D(uDepth,uv-vec2(.003,0.)).r;
  float dy=texture2D(uDepth,uv+vec2(0.,.003)).r-texture2D(uDepth,uv-vec2(0.,.003)).r;
  vec3 surfaceNormal=normalize(vec3(-dx*9.,-dy*9.,1.));
  vec3 lightDirection=normalize(vec3(uLight-uv,.24));
  float incidence=max(dot(surfaceNormal,lightDirection),0.);
  vec2 delta=(uv-uLight)*vec2(1.6,1.);
  float attenuation=exp(-dot(delta,delta)*38.);
  color+=vec3(.33,.01,.035)*incidence*attenuation*depth*.55;
  color+=vec3(.56,.67,.77)*max(wave,0.)*.035;
  gl_FragColor=vec4(color,1.);
}`

export default function DepthPortrait({ portraitRef, reduced }: { portraitRef: RefObject<HTMLDivElement | null>; reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const image = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (reduced || !host.current || !image.current) return
    const element = host.current
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }) }
    catch { return }
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geometry = new THREE.PlaneGeometry(2, 2)
    const uniforms = {
      uImage: { value: new THREE.Texture() }, uDepth: { value: new THREE.Texture() },
      uPointer: { value: new THREE.Vector2(.5, .5) }, uLight: { value: new THREE.Vector2(-2, -2) },
      uRipple: { value: new THREE.Vector3(-2, -2, -100) }, uTime: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment })
    scene.add(new THREE.Mesh(geometry, material))
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.3))
    renderer.domElement.className = 'depth-canvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    element.appendChild(renderer.domElement)
    let disposed = false, ready = 0, frame = 0, visible = true
    const loader = new THREE.TextureLoader()
    const loaded = (kind: 'uImage' | 'uDepth') => (texture: THREE.Texture) => {
      if (disposed) { texture.dispose(); return }
      texture.colorSpace = kind === 'uImage' ? THREE.SRGBColorSpace : THREE.NoColorSpace
      uniforms[kind].value = texture
      ready++
      if (ready === 2) element.classList.add('is-ready')
    }
    loader.load('/portrait.jpeg', loaded('uImage'), undefined, () => {})
    loader.load('/portrait-depth-v2.png', loaded('uDepth'), undefined, () => {})
    const resize = () => { const rect = element.getBoundingClientRect(); renderer.setSize(rect.width, rect.height, false) }
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false })
    observer.observe(element)
    const onPointer = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width, y = 1 - (event.clientY - rect.top) / rect.height
      const hero = element.closest('.hero')?.getBoundingClientRect()
      const overHero = hero && event.clientX >= hero.left && event.clientX <= hero.right && event.clientY >= hero.top && event.clientY <= hero.bottom
      uniforms.uLight.value.set(overHero ? x : -2, overHero ? y : -2)
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) uniforms.uPointer.value.set(x, y)
      else uniforms.uPointer.value.set(.5, .5)
    }
    const onDown = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width, y = 1 - (event.clientY - rect.top) / rect.height
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) uniforms.uRipple.value.set(x, y, performance.now() * .001)
    }
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (!visible || document.hidden || ready !== 2) return
      uniforms.uTime.value = now * .001
      renderer.render(scene, camera)
    }
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(element)
    resize()
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    frame = requestAnimationFrame(tick)
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); sizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointer); window.removeEventListener('pointerdown', onDown)
      uniforms.uImage.value.dispose(); uniforms.uDepth.value.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [reduced])
  return <div className="hero-portrait-shell" ref={portraitRef}><div ref={host} className="depth-host"><img ref={image} className="hero-portrait" src="/portrait.jpeg" alt="Portrait of the photographer" fetchPriority="high" /></div></div>
}
