import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { WORDMARK_H, WORDMARK_PATH, WORDMARK_W } from './wordmark'

/*
 * The wordmark seen through a moving lens: depth-of-field blur that falls off smoothly from the cursor,
 * a touch of magnification at its centre, and a short smear along the direction of travel.
 * The SVG underneath stays in the DOM for accessibility and is the fallback without WebGL, on touch
 * screens and with reduced motion.
 */
const BLEED_X = .1, BLEED_Y = .55 // canvas overhang, as a share of the mark's width / height, so blur can spill past the letters
const TAPS = 48

const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`
const fragment = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uStrength;
uniform float uRadius;
uniform vec3 uColor;
varying vec2 vUv;
void main(){
  vec2 px=vUv*uRes;
  vec2 rel=px-uMouse;
  float d=length(rel*vec2(1.,1.15));
  float k=uStrength*(1.-smoothstep(uRadius*.08,uRadius,d));
  k=k*k*(3.-2.*k);
  vec2 lens=px-rel*k*.085;
  float blur=k*uRadius*.2;
  float a,halo=0.;
  if(blur<.35){ a=texture2D(uTex,lens/uRes).a; }
  else {
    a=0.;
    for(int i=0;i<${TAPS};i++){
      float fi=float(i);
      float r=sqrt((fi+.5)/${TAPS}.)*blur;
      float th=fi*2.39996323;
      vec2 dir=vec2(cos(th),sin(th));
      vec2 o=dir*r+uVel*k*(fi/${TAPS - 1}.-.5);
      a+=texture2D(uTex,(lens+o)/uRes).a;
      halo+=texture2D(uTex,(lens+o*2.6)/uRes).a;
    }
    a/=${TAPS}.;
    halo/=${TAPS}.;
  }
  // Halation: like film, light bleeds a warm glow around what the lens softens.
  float glow=halo*k*.42;
  float alpha=max(a,glow);
  vec3 col=mix(uColor*vec3(1.,.82,.7),uColor*(1.+k*.12),a/max(alpha,.0001));
  gl_FragColor=vec4(col*alpha,alpha);
}`

export type LensMarkHandle = HTMLDivElement
export const LensMark = forwardRef<HTMLDivElement, { className?: string; label?: string; enabled: boolean }>(function LensMark({ className = '', label = 'IZMAB', enabled }, ref) {
  const host = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => host.current as HTMLDivElement)

  useEffect(() => {
    const node = host.current
    if (!node || !enabled || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' }) }
    catch { return }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0, 0)
    const canvas = renderer.domElement
    canvas.className = 'lens-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    node.appendChild(canvas)

    // currentColor, kept in sRGB: the shader writes straight to the canvas without colour management.
    const [r, g, b] = (getComputedStyle(node).color.match(/[\d.]+/g) ?? ['229', '50', '43']).map(Number)
    const color = { r: r / 255, g: g / 255, b: b / 255 }
    const uniforms = {
      uTex: { value: null as THREE.Texture | null }, uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(-9999, -9999) },
      uVel: { value: new THREE.Vector2() }, uStrength: { value: 0 }, uRadius: { value: 160 }, uColor: { value: new THREE.Vector3(color.r, color.g, color.b) },
    }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false })
    const geometry = new THREE.PlaneGeometry(2, 2)
    const scene = new THREE.Scene()
    scene.add(new THREE.Mesh(geometry, material))
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Rasterise the path once per size into an alpha texture, with room around it for the blur to spill into.
    const path = new Path2D(WORDMARK_PATH)
    let texture: THREE.CanvasTexture | null = null, textureWidth = 0
    const bake = (cssWidth: number) => {
      const scale = Math.min(2600, cssWidth * (1 + BLEED_X * 2) * dpr) / (WORDMARK_W * (1 + BLEED_X * 2))
      const w = Math.round(WORDMARK_W * (1 + BLEED_X * 2) * scale), h = Math.round(WORDMARK_H * (1 + BLEED_Y * 2) * scale)
      if (texture && Math.abs(w - textureWidth) / textureWidth < .15) return
      const paper = document.createElement('canvas')
      paper.width = w; paper.height = h
      const context = paper.getContext('2d')
      if (!context) return
      context.setTransform(scale, 0, 0, scale, WORDMARK_W * BLEED_X * scale, WORDMARK_H * BLEED_Y * scale)
      context.fillStyle = '#fff'
      context.fill(path)
      texture?.dispose()
      texture = new THREE.CanvasTexture(paper)
      texture.minFilter = THREE.LinearFilter; texture.generateMipmaps = false
      uniforms.uTex.value = texture
      textureWidth = w
    }

    let cssW = 0, cssH = 0
    const resize = () => {
      const rect = node.getBoundingClientRect()
      cssW = rect.width * (1 + BLEED_X * 2); cssH = rect.height * (1 + BLEED_Y * 2)
      renderer.setSize(cssW, cssH, false)
      uniforms.uRes.value.set(cssW * dpr, cssH * dpr)
      bake(rect.width)
      dirty = true
    }

    const pointer = { x: -9999, y: -9999, inside: false }, smooth = { x: -9999, y: -9999 }, vel = { x: 0, y: 0 }
    let dirty = true, frame = 0, visible = true, ready = false, radius = 160
    const move = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      const x = event.clientX - rect.left + rect.width * BLEED_X, y = event.clientY - rect.top + rect.height * BLEED_Y
      if (pointer.x < -9000) { smooth.x = x; smooth.y = y }
      pointer.x = x; pointer.y = y
      const reach = radius * .6
      pointer.inside = event.clientX > rect.left - reach && event.clientX < rect.right + reach && event.clientY > rect.top - reach && event.clientY < rect.bottom + reach
    }
    const leave = () => { pointer.inside = false }
    const io = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false })
    io.observe(node)
    const ro = new ResizeObserver(resize)
    ro.observe(node)

    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      const px = smooth.x, py = smooth.y
      smooth.x += (pointer.x - smooth.x) * .14; smooth.y += (pointer.y - smooth.y) * .14
      const dx = smooth.x - px, dy = smooth.y - py
      vel.x += (dx - vel.x) * .2; vel.y += (dy - vel.y) * .2
      const speed = Math.hypot(vel.x, vel.y)
      const target = pointer.inside ? 1 : 0
      const strength = uniforms.uStrength.value + (target - uniforms.uStrength.value) * (target ? .07 : .05)
      radius += (Math.max(150, Math.min(300, cssW * .14)) + Math.min(speed * 2.4, 110) - radius) * .1
      const settled = Math.abs(strength - target) < .002 && speed < .05
      if (!dirty && settled && target === 0) { if (uniforms.uStrength.value !== 0) { uniforms.uStrength.value = 0; renderer.render(scene, camera) } return }
      uniforms.uStrength.value = strength
      uniforms.uRadius.value = radius * dpr
      uniforms.uMouse.value.set(smooth.x * dpr, (cssH - smooth.y) * dpr)
      const scaleVel = Math.min(1, 26 / Math.max(speed, .001))
      uniforms.uVel.value.set(vel.x * dpr * 2.6 * scaleVel, -vel.y * dpr * 2.6 * scaleVel)
      renderer.render(scene, camera)
      dirty = false
      if (!ready && uniforms.uTex.value) { ready = true; node.classList.add('is-lens') }
    }
    resize()
    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame); io.disconnect(); ro.disconnect()
      window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave)
      node.classList.remove('is-lens')
      texture?.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); canvas.remove()
    }
  }, [enabled])

  return <div ref={host} className={`lens-mark ${className}`}>
    <svg className="lens-svg" viewBox={`0 0 ${WORDMARK_W} ${WORDMARK_H}`} role="img" aria-label={label}><path d={WORDMARK_PATH} fill="currentColor" /></svg>
  </div>
})
