// Renders still frames from the site's own generative scenes (src/SceneCanvas.tsx) into public/stills/,
// so sections other than the hero have their own imagery instead of repeating the portrait.
// Usage: CHROMIUM_PATH=/path/to/chromium node scripts/render-stills.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const source = readFileSync(new URL('../src/SceneCanvas.tsx', import.meta.url), 'utf8')
const fragment = source.match(/const fragment = `([\s\S]*?)`\n/)?.[1]
if (!fragment) throw new Error('Scene shader not found in SceneCanvas.tsx')

const names = ['nocturne', 'salt', 'lowlight', 'atlas', 'ember', 'nights']
// [file, scene, width, height, time, pointerX, pointerY]
const shots = [
  ...names.flatMap((name, i) => [
    [`${name}-a`, i, 1500, 1000, 7.3 + i * 3.1, .5, .5],
    [`${name}-b`, i, 1500, 1000, 19.7 + i * 5.3, .15, .8],
  ]),
  ['grade', 1, 1200, 1500, 11.2, .55, .45],
  ['lens', 2, 900, 900, 13.4, .5, .5],
]

const out = new URL('../public/stills/', import.meta.url)
mkdirSync(out, { recursive: true })
const executablePath = process.env.CHROMIUM_PATH
const browser = await chromium.launch(executablePath ? { executablePath, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] } : { channel: 'chrome' })
const page = await browser.newPage()
await page.setContent('<canvas id="c"></canvas>')
for (const [file, scene, width, height, time, px, py] of shots) {
  const data = await page.evaluate(({ fragment, scene, width, height, time, px, py }) => {
    const canvas = document.getElementById('c')
    canvas.width = width; canvas.height = height
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
    const compile = (type, text) => { const s = gl.createShader(type); gl.shaderSource(s, text); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s }
    const program = gl.createProgram()
    gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}'))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(program); gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = name => gl.getUniformLocation(program, name)
    gl.uniform1f(u('uTime'), time); gl.uniform1f(u('uAspect'), width / height)
    gl.uniform1f(u('uFrom'), scene); gl.uniform1f(u('uTo'), scene); gl.uniform1f(u('uMix'), 0); gl.uniform1f(u('uFlash'), 0)
    gl.uniform2f(u('uPointer'), px, py)
    gl.viewport(0, 0, width, height)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    return canvas.toDataURL('image/jpeg', .86)
  }, { fragment, scene, width, height, time, px, py })
  writeFileSync(new URL(`${file}.jpg`, out), Buffer.from(data.split(',')[1], 'base64'))
  process.stdout.write(`${file}.jpg\n`)
}
await browser.close()
