import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`
const fragment = `
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uBursts[2];
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=vUv;
  float aspect=uResolution.x/max(uResolution.y,1.);
  float grain=hash(floor(uv*uResolution*.78)+floor(uTime*12.))-0.5;
  float alpha=abs(grain)*.008;
  vec3 color=vec3(.45,.46,.5)*alpha;
  for(int i=0;i<2;i++){
    vec4 burst=uBursts[i];
    float age=uTime-burst.z;
    if(age<0. || age>1.7) continue;
    vec2 delta=(uv-burst.xy)*vec2(aspect,1.);
    float radius=length(delta);
    float leading=radius-age*.32;
    float spread=exp(-pow(leading*10.,2.));
    float damping=exp(-age*1.65);
    float wave=sin(leading*38.)*spread*damping*burst.w;
    vec2 direction=normalize(delta+vec2(.00001));
    float angle=dot(direction,normalize(vec2(-.65,.76)));
    float crest=max(wave,0.);
    float trough=max(-wave,0.);
    float a=(.006+.011*crest+.006*trough)*spread*damping;
    vec3 tint=mix(vec3(.018,.025,.036),vec3(.38,.43,.5),clamp(.5+angle*.42+crest*.32-trough*.3,0.,1.));
    color+=tint*a;
    alpha+=a;
  }
  alpha=clamp(alpha,0.,.035);
  gl_FragColor=vec4(color/max(alpha,.0001),alpha);
}`

export default function WaterAtmosphere({ reduced }: { reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (reduced || !host.current) return
    const node = host.current
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }) }
    catch { return }
    const mobile = window.matchMedia('(max-width: 800px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25))
    renderer.setClearColor(0, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    node.appendChild(renderer.domElement)
    const bursts = Array.from({ length: 2 }, () => new THREE.Vector4(-2, -2, -100, 1))
    const uniforms = { uResolution: { value: new THREE.Vector2() }, uTime: { value: 0 }, uBursts: { value: bursts } }
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, depthTest: false })
    const scene = new THREE.Scene()
    scene.add(new THREE.Mesh(geometry, material))
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 10)
    camera.position.z = 2
    scene.add(new THREE.AmbientLight(0xc5d0db, 1.2))
    const edgeLight = new THREE.PointLight(0xffffff, 7, 5)
    edgeLight.position.set(-1, 1, 1.5)
    scene.add(edgeLight)
    const ringGeometry = new THREE.TorusGeometry(1, .13, 12, 72)
    const rings: { mesh: THREE.Mesh<THREE.TorusGeometry, THREE.MeshPhysicalMaterial>; start: number }[] = []
    let frame = 0, last = 0, index = 0
    const resize = () => { const w = window.innerWidth, h = window.innerHeight, aspect = w / h; renderer.setSize(w, h, false); uniforms.uResolution.value.set(w, h); camera.left = -aspect; camera.right = aspect; camera.top = 1; camera.bottom = -1; camera.updateProjectionMatrix() }
    const press = (event: PointerEvent) => {
      const w = window.innerWidth, h = window.innerHeight, now = performance.now()
      bursts[index].set(event.clientX / w, 1 - event.clientY / h, now * .001, .9)
      index = (index + 1) % bursts.length
      const ringMaterial = new THREE.MeshPhysicalMaterial({ color: 0x8096a6, metalness: .44, roughness: .16, clearcoat: 1, clearcoatRoughness: .08, transparent: true, opacity: .08, depthWrite: false, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(ringGeometry, ringMaterial)
      mesh.position.set((event.clientX / w - .5) * 2 * (w / h), (.5 - event.clientY / h) * 2, .2)
      mesh.rotation.x = -.18
      scene.add(mesh)
      rings.push({ mesh, start: now })
      if (rings.length > 2) { const old = rings.shift(); if (old) { scene.remove(old.mesh); old.mesh.material.dispose() } }
    }
    const tick = (now: number) => { frame = requestAnimationFrame(tick); if (document.hidden || (mobile && now - last < 30)) return; last = now; uniforms.uTime.value = now * .001; for (let i = rings.length - 1; i >= 0; i--) { const ring = rings[i], age = (now - ring.start) * .001; if (age > 1.35) { scene.remove(ring.mesh); ring.mesh.material.dispose(); rings.splice(i, 1); continue } ring.mesh.scale.setScalar(.035 + age * .36); ring.mesh.material.opacity = .08 * Math.pow(1 - age / 1.35, 2); ring.mesh.rotation.y = Math.sin(age * 4) * .16; ring.mesh.rotation.x = -.18 + Math.sin(age * 3) * .06 } renderer.render(scene, camera) }
    resize(); frame = requestAnimationFrame(tick)
    window.addEventListener('resize', resize); window.addEventListener('pointerdown', press, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); window.removeEventListener('pointerdown', press); rings.forEach(ring => ring.mesh.material.dispose()); ringGeometry.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove() }
  }, [reduced])
  return <div ref={host} className="film-atmosphere water-atmosphere" aria-hidden="true" />
}
