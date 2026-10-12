import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

/*
 * One shader, six generative "living stills" — a stand-in for each project until real footage lands.
 * Scenes are drawn in a centred coordinate space, so a narrow 9:16 frame crops the same world a 2.39:1
 * frame shows in full — the frame reframes the shot instead of squashing it.
 */
const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`
const fragment = `
precision highp float;
uniform float uTime;
uniform float uAspect;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uFlash;
uniform vec2 uPointer;
varying vec2 vUv;

float h1(float n){return fract(sin(n*127.1)*43758.5453);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}

// 0 — Nocturne: a wet street at night, lit towers mirrored in the asphalt, rain.
vec3 nocturne(vec2 p,float t){
  float hz=.34;
  vec3 col=mix(vec3(.01,.012,.025),vec3(.05,.025,.06),smoothstep(.2,1.,p.y));
  vec2 q=p;float refl=0.;
  if(q.y<hz){refl=1.;q.y=2.*hz-q.y;q.x+=(noise(vec2(p.x*9.,p.y*70.-t*1.6))-.5)*.04*(hz-p.y)*3.;}
  col+=vec3(.9,.05,.16)*.18*exp(-pow((q.y-hz-.05)*5.,2.));
  for(int i=0;i<13;i++){
    float fi=float(i);
    float x=(h1(fi*3.1)-.5)*2.3;
    float w=.035+h1(fi*7.3)*.075;
    float top=hz+.12+h1(fi*1.7)*.48-fi*.006;
    float inside=step(abs(q.x-x),w)*step(q.y,top)*step(hz,q.y);
    vec3 b=vec3(.012,.013,.022)+vec3(.02,.005,.01)*(1.-(q.y-hz));
    vec2 cell=vec2((q.x-x+w)/.02,(q.y-hz)/.03);
    vec2 cf=fract(cell),ci=floor(cell);
    float lit=step(.7,h2(ci+fi*13.))*step(.18,cf.x)*step(cf.x,.72)*step(.2,cf.y)*step(cf.y,.7);
    lit*=.6+.4*step(.5,h2(ci+floor(t*.3+fi)));
    vec3 wc=h2(ci*1.3+fi)>.7?vec3(.4,.6,1.):vec3(1.,.72,.42);
    b+=wc*lit*.5;
    vec3 neon=h1(fi*5.)>.5?vec3(1.,.04,.16):vec3(.2,.45,1.);
    float sign=step(.45,h1(fi*9.))*smoothstep(.006,0.,abs(q.y-top+.03))*step(abs(q.x-x),w*.8);
    float edge=step(.7,h1(fi*11.))*smoothstep(.005,0.,abs(abs(q.x-x)-w));
    b+=neon*(sign+edge*.7)*(1.4+.4*sin(t*3.+fi));
    col=mix(col,b*(refl>.5?.3+.1*noise(vec2(p.x*4.,p.y*90.+t)):1.),inside);
  }
  for(int i=0;i<6;i++){float fi=float(i);float x=(h1(fi*17.)-.5)*2.;col+=(h1(fi*5.7)>.5?vec3(1.,.05,.2):vec3(.2,.4,1.))*exp(-abs(q.x-x)*30.)*.12*step(hz,q.y)*smoothstep(hz+.7,hz,q.y);}
  vec2 rp=vec2(p.x*90.+p.y*22.,p.y*5.+t*7.5);
  vec2 rf=fract(rp);float rid=h2(floor(rp));
  col+=vec3(.7,.75,.9)*step(.94,rid)*smoothstep(.12,0.,abs(rf.x-.5))*smoothstep(0.,.4,rf.y)*smoothstep(1.,.5,rf.y)*.16;
  return col;
}

// 1 — Salt Season: bleached horizon, low sun, sea shimmer, a lone figure on the salt.
vec3 salt(vec2 p,float t){
  float hz=.46;
  vec3 sky=mix(vec3(.95,.86,.78),vec3(.52,.63,.74),smoothstep(hz,1.05,p.y));
  vec2 sun=vec2(.28,hz+.13);float sd=length(p-sun);
  sky+=vec3(1.,.72,.5)*exp(-sd*7.)*.55+smoothstep(.05,.044,sd)*vec3(.25,.16,.08);
  vec3 col=sky;
  if(p.y<hz){
    float depth=(hz-p.y)/hz;
    col=mix(vec3(.82,.77,.72),vec3(.43,.49,.55),pow(depth,.6));
    float sh=smoothstep(.62,1.,noise(vec2((p.x-sun.x)*30./(depth+.15),p.y*260.+t*1.4)));
    col+=vec3(1.,.85,.65)*sh*exp(-abs(p.x-sun.x)*5.)*.65;
    float crust=smoothstep(.2,.0,p.y);
    float cracks=smoothstep(.04,.0,abs(fbm(vec2(p.x*14.,p.y*40.))-.5));
    col=mix(col,vec3(.97,.95,.92)-cracks*.18,crust);
  }
  vec2 fp=p-vec2(-.34,hz);
  float body=smoothstep(.006,.0,max(abs(fp.x)-.009,abs(fp.y-.045)-.045));
  float head=smoothstep(.012,.008,length(fp-vec2(0.,.1)));
  col=mix(col,vec3(.1,.08,.08),max(body,head)*.92);
  col=mix(col,col*vec3(1.03,.98,.95),.5);
  return col;
}

// 2 — Low Light: drifting bokeh, stage haze, a single red beam.
vec3 lowlight(vec2 p,float t){
  vec3 col=mix(vec3(.02,.005,.02),vec3(.07,.01,.05),p.y);
  col+=vec3(.75,.02,.14)*exp(-abs(p.x+.05)*4.5)*.32*(.3+p.y)*(.85+.15*sin(t*1.7));
  float haze=fbm(vec2(p.x*2.+t*.05,p.y*3.-t*.08));
  col+=vec3(.25,.03,.1)*haze*.35;
  for(int i=0;i<26;i++){
    float fi=float(i);
    vec2 c=vec2((h1(fi*1.3)-.5)*2.2+sin(t*.2+fi)*.03,fract(h1(fi*2.7)+t*.018*(.3+h1(fi*4.1))));
    float r=.025+h1(fi*5.9)*.085;
    float d=length(p-c);
    float disk=smoothstep(r,r*.9,d);
    float ring=smoothstep(.012,0.,abs(d-r*.94));
    vec3 bc=h1(fi*8.)>.55?vec3(1.,.12,.25):(h1(fi*3.)>.5?vec3(1.,.55,.25):vec3(.75,.2,.9));
    col+=bc*(disk*.13+ring*.09)*(.65+.35*sin(t*.9+fi*2.));
  }
  return col;
}

// 3 — Atlas Runs: a track rushing toward the vanishing point under floodlights.
vec3 atlas(vec2 p,float t){
  vec2 vp=vec2(0.,.7);
  float dy=vp.y-p.y;
  vec3 col=mix(vec3(.02,.025,.04),vec3(.05,.06,.09),p.y);
  if(dy>0.){
    float z=.32/dy;
    float x=(p.x-vp.x)*z;
    col=vec3(.42,.07,.05)*(1.-exp(-dy*4.))+vec3(.05,.01,.01);
    float lane=abs(fract(x*3.2+.5)-.5)/3.2;
    float fade=1.-exp(-dy*7.);
    col+=vec3(.95,.9,.86)*smoothstep(.012,.004,lane)*fade*step(abs(x),.95);
    float mark=step(.7,fract(z*.5-t*2.6))*smoothstep(.04,.01,abs(abs(x)-.62));
    col+=vec3(1.,.95,.9)*mark*fade*.5;
    col*=.85+.15*sin(x*3.2*6.283);
    col+=vec3(.6,.62,.7)*smoothstep(.0,.03,.03-dy)*.4;
    float streak=smoothstep(.985,1.,noise(vec2(x*3.,z*.6-t*4.)));
    col+=vec3(1.,.9,.85)*streak*.25;
  } else {
    for(int i=0;i<3;i++){
      float fi=float(i);
      vec2 lp=vec2((fi-1.)*.55,.9+h1(fi)*.05);
      vec2 d=p-lp;
      float star=exp(-length(d)*28.)+exp(-abs(d.y)*120.)*exp(-abs(d.x)*7.)*.5+exp(-abs(d.x)*120.)*exp(-abs(d.y)*12.)*.25;
      col+=vec3(.9,.92,1.)*star*.9;
    }
  }
  col+=vec3(.75,.78,.9)*exp(-pow(dy*14.,2.))*.25;
  return col;
}

// 4 — Ember Room: warm window light, smoke, embers rising.
vec3 ember(vec2 p,float t){
  vec3 col=vec3(.03,.015,.01);
  float win=exp(-pow((p.x+.55)*2.2,2.))*smoothstep(.0,.7,p.y);
  col+=vec3(.95,.45,.15)*win*.4;
  float smoke=fbm(vec2(p.x*2.5-t*.04,p.y*2.-t*.12));
  col+=vec3(.5,.22,.08)*pow(smoke,2.)*.6*(1.-p.y*.4);
  col+=vec3(1.,.4,.08)*exp(-length(p-vec2(.15,-.05))*3.2)*.35;
  for(int i=0;i<34;i++){
    float fi=float(i);
    float sp=.05+h1(fi*2.1)*.09;
    float y=fract(h1(fi*1.7)+t*sp);
    vec2 c=vec2((h1(fi*3.3)-.5)*1.5+sin(t*1.3+fi*3.)*.04*y+.1,y*1.1-.05);
    float d=length((p-c)*vec2(1.,.55));
    float life=sin(y*3.14159);
    col+=vec3(1.,.5,.12)*smoothstep(.006,.0,d)*life*1.6+vec3(1.,.35,.05)*exp(-d*90.)*life*.25;
  }
  return col;
}

// 5 — Nine Nights: festoon lights over a crowd, camera flashes in the dark.
vec3 nights(vec2 p,float t){
  vec3 col=mix(vec3(.02,.02,.06),vec3(.06,.03,.11),p.y);
  for(int s=0;s<3;s++){
    float fs=float(s);
    float base=.62+fs*.12;
    float sag=.08+fs*.03;
    float xx=p.x*(1.+fs*.25)+fs*.3;
    float cy=base-sag*(1.-pow(fract(xx*.8)*2.-1.,2.));
    col+=vec3(.9,.7,.4)*smoothstep(.004,0.,abs(p.y-cy))*.25;
    float cell=floor(xx*8.);
    float bx=(cell+.5)/8.;
    float by=base-sag*(1.-pow(fract(bx*.8)*2.-1.,2.));
    vec2 bulb=vec2((bx-fs*.3)/(1.+fs*.25),by-.012);
    float d=length(p-bulb);
    float tw=.75+.25*sin(t*2.+cell*1.7+fs);
    col+=vec3(1.,.72,.38)*(smoothstep(.009,.004,d)+exp(-d*45.)*.35)*tw;
  }
  float crowd=.18+.05*fbm(vec2(p.x*6.,0.))+.03*sin(p.x*40.+sin(p.x*13.))+.012*sin(t*3.+p.x*20.);
  float heads=0.;
  for(int i=0;i<10;i++){float fi=float(i);vec2 hc=vec2((h1(fi*4.4)-.5)*2.2,crowd+.02+h1(fi)*.03+sin(t*4.+fi)*.006);heads=max(heads,smoothstep(.04,.035,length((p-hc)*vec2(1.,.8))));}
  float sil=max(step(p.y,crowd),heads);
  float flashId=floor(t*1.6);
  float fl=step(.72,h1(flashId))*exp(-fract(t*1.6)*9.);
  vec2 fpos=vec2((h1(flashId*2.)-.5)*1.6,crowd+.03);
  vec3 flash=vec3(1.)*fl*exp(-length(p-fpos)*4.);
  col+=flash*.9;
  col=mix(col,vec3(.006,.006,.014)+flash*.08,sil);
  return col;
}

vec3 scene(float id,vec2 p,float t){
  if(id<.5) return nocturne(p,t);
  if(id<1.5) return salt(p,t);
  if(id<2.5) return lowlight(p,t);
  if(id<3.5) return atlas(p,t);
  if(id<4.5) return ember(p,t);
  return nights(p,t);
}

void main(){
  vec2 uv=vUv;
  vec2 drift=(uPointer-.5)*.018;
  vec2 p=vec2((uv.x-.5)*uAspect,uv.y)+drift;
  float t=uTime;
  vec3 col;
  if(uMix<=0.001) col=scene(uFrom,p,t);
  else if(uMix>=.999) col=scene(uTo,p,t);
  else {
    float n=fbm(uv*vec2(3.,2.)+uFrom*1.7);
    float edge=uMix*1.3-.15;
    float m=smoothstep(edge-.12,edge+.12,n);
    vec2 shift=vec2((1.-m)*m*.06,0.);
    vec3 a=scene(uFrom,p+shift,t),b=scene(uTo,p-shift,t);
    col=mix(b,a,m);
    col+=vec3(1.,.06,.2)*pow(1.-abs(m*2.-1.),6.)*.9;
  }
  col+=uFlash*vec3(1.,.95,.9);
  float vig=smoothstep(1.2,.25,length((uv-.5)*vec2(1.25,1.)));
  col*=mix(.35,1.,vig);
  float g=h2(uv*vec2(913.,577.)+fract(t*24.)*31.)-.5;
  col+=g*.055;
  col=col/(1.+col*.18);
  gl_FragColor=vec4(pow(max(col,0.),vec3(.95)),1.);
}`

export const SCENE_COUNT = 6

export default function SceneCanvas({ scene, montage = false, reduced, className = '' }: { scene: number; montage?: boolean; reduced: boolean; className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ go: (to: number, fast?: boolean) => void } | null>(null)

  const [near, setNear] = useState(false)
  useEffect(() => {
    const node = host.current
    if (!node || near) return
    const io = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: '100% 0px 100% 0px' })
    io.observe(node)
    return () => io.disconnect()
  }, [near])

  useEffect(() => {
    const node = host.current
    if (!node || !near) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' }) }
    catch { node.classList.add('is-fallback'); return }
    const mobile = window.matchMedia('(max-width: 800px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25))
    renderer.domElement.setAttribute('aria-hidden', 'true')
    node.appendChild(renderer.domElement)
    const uniforms = {
      uTime: { value: 3 }, uAspect: { value: 1.6 }, uFrom: { value: scene }, uTo: { value: scene }, uMix: { value: 0 },
      uFlash: { value: 0 }, uPointer: { value: new THREE.Vector2(.5, .5) },
    }
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment })
    const sceneGraph = new THREE.Scene()
    sceneGraph.add(new THREE.Mesh(geometry, material))
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    let visible = true, frame = 0, last = 0
    const render = () => renderer.render(sceneGraph, camera)
    const resize = () => {
      const rect = node.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      renderer.setSize(rect.width, rect.height, false)
      uniforms.uAspect.value = rect.width / rect.height
      render()
    }
    let tween: gsap.core.Tween | null = null
    api.current = {
      go: (to, fast = false) => {
        if (to === uniforms.uTo.value && uniforms.uMix.value >= .999) return
        tween?.kill()
        uniforms.uFrom.value = uniforms.uMix.value > .5 ? uniforms.uTo.value : uniforms.uFrom.value
        uniforms.uTo.value = to
        uniforms.uMix.value = 0
        if (reduced) { uniforms.uFrom.value = to; uniforms.uMix.value = 0; render(); return }
        tween = gsap.to(uniforms.uMix, { value: 1, duration: fast ? .32 : 1.05, ease: fast ? 'power2.inOut' : 'expo.inOut', onComplete: () => { uniforms.uFrom.value = to; uniforms.uMix.value = 0 } })
        if (fast) gsap.fromTo(uniforms.uFlash, { value: .22 }, { value: 0, duration: .25, ease: 'power2.out' })
      },
    }
    const io = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false }, { rootMargin: '120px' })
    io.observe(node)
    const ro = new ResizeObserver(resize)
    ro.observe(node)
    const onPointer = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      uniforms.uPointer.value.set(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)), Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height)))
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    let cutTimer = 0, cutIndex = scene
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      if (mobile && now - last < 30) return
      last = now
      if (montage && now - cutTimer > 900) { cutTimer = now; cutIndex = (cutIndex + 1) % SCENE_COUNT; api.current?.go(cutIndex, true) }
      uniforms.uTime.value = 3 + now * .001
      render()
    }
    resize()
    if (reduced) render(); else frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame); io.disconnect(); ro.disconnect(); tween?.kill()
      window.removeEventListener('pointermove', onPointer)
      geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); api.current = null
    }
    // The scene prop is applied through api.go below; the renderer lives for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montage, reduced, near])

  useEffect(() => { api.current?.go(scene) }, [scene])

  return <div ref={host} className={`scene-canvas ${className}`} aria-hidden="true" />
}
