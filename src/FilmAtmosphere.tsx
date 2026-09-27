import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uScroll;
  uniform float uPulse;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 point = vec2((uv.x - uPointer.x) * aspect, uv.y - uPointer.y);
    float distanceToPointer = length(point);

    // Two scales of grain: moving silver halide and slowly drifting film texture.
    float coarse = noise(uv * vec2(230.0 * aspect, 230.0) + vec2(uTime * 4.0, uTime * 2.0));
    float fine = hash(floor(uv * uResolution * 0.72) + floor(uTime * 18.0));
    float grain = coarse * 0.42 + fine * 0.58;
    float scan = sin(uv.y * uResolution.y * 1.18 + uTime * 2.0) * 0.5 + 0.5;

    float leftLeak = exp(-pow((uv.x + 0.08) * 3.9, 2.0)) *
      exp(-pow((uv.y - 0.73 + sin(uTime * 0.16) * 0.08) * 2.7, 2.0));
    float rightLeak = exp(-pow((uv.x - 1.08) * 4.4, 2.0)) *
      exp(-pow((uv.y - 0.26 - uScroll * 0.2) * 2.4, 2.0));
    float lens = exp(-distanceToPointer * 11.0) * (0.7 + 0.3 * sin(uTime * 2.0));
    float ring = uPulse < 1.5 ? exp(-abs(distanceToPointer - uPulse * 0.43) * 80.0) * (1.0 - uPulse / 1.5) : 0.0;
    float gate = (1.0 - smoothstep(0.0, 0.015, uv.x)) + smoothstep(0.985, 1.0, uv.x);
    float scratchX = fract(sin(floor(uTime * 0.47) * 29.7) * 47.9);
    float scratch = (1.0 - smoothstep(0.0, 0.0016, abs(uv.x - scratchX))) *
      step(0.83, hash(vec2(floor(uTime * 0.47), 4.0)));

    vec3 silver = vec3(0.94, 0.91, 0.87) * (grain * 0.027 + scan * 0.005 + scratch * 0.055);
    vec3 red = vec3(0.969, 0.004, 0.188) * (leftLeak * 0.23 + lens * 0.25 + ring * 0.34 + gate * 0.035);
    vec3 amber = vec3(1.0, 0.28, 0.12) * rightLeak * 0.10;
    vec3 color = silver + red + amber;
    float alpha = clamp(max(max(color.r, color.g), color.b) * 0.7, 0.0, 0.3);
    gl_FragColor = vec4(color / max(alpha, 0.001), alpha);
  }
`

export default function FilmAtmosphere({ reduced }: { reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const fallback = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = host.current
    if (!container || reduced) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    } catch {
      fallback.current?.classList.add('is-visible')
      return
    }
    renderer.setClearColor(0x000000, 0)
    const mobile = window.matchMedia('(max-width: 800px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25))
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uPointer: { value: new THREE.Vector2(-2, -2) },
      uScroll: { value: 0 },
      uPulse: { value: 2 },
    }
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, uniforms, transparent: true,
      depthTest: false, depthWrite: false,
    })
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    scene.add(new THREE.Mesh(geometry, material))

    const pointer = new THREE.Vector2(-2, -2)
    let burstAt = -5000
    let frame = 0
    let lastFrame = 0
    const resize = () => {
      const width = window.innerWidth, height = window.innerHeight
      renderer.setSize(width, height, false)
      uniforms.uResolution.value.set(width, height)
    }
    const onPointer = (event: PointerEvent) => pointer.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight)
    const onPress = () => { burstAt = performance.now() }
    const onScroll = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight
      uniforms.uScroll.value = distance > 0 ? window.scrollY / distance : 0
    }
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate)
      if (document.hidden || (mobile && now - lastFrame < 32)) return
      lastFrame = now
      uniforms.uTime.value = now * 0.001
      uniforms.uPointer.value.lerp(pointer, 0.085)
      uniforms.uPulse.value = (now - burstAt) * 0.001
      renderer.render(scene, camera)
    }
    resize()
    onScroll()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPress, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPress)
      window.removeEventListener('scroll', onScroll)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reduced])

  return <div className="film-atmosphere" ref={host} aria-hidden="true"><div className="film-fallback" ref={fallback} /></div>
}
