<div align="center">

# 🎬 IZMAB

### Cinematic Filmmaker & Visual Storytelling Showcase

[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20WebGL-black?style=flat-square&logo=vercel)](https://izmab.vercel.app)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/3D-Three.js-049EF4?style=flat-square&logo=threedotjs)](https://threejs.org/)
[![Motion](https://img.shields.io/badge/Motion-GSAP%20%2B%20Lenis-88CE02?style=flat-square&logo=greensock)](https://greensock.com/)
<br/>

<p align="center">
  <img src="assets/preview.png" alt="IZMAB Cinematic Showcase Preview" width="100%" style="border-radius: 8px;" />
</p>

[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Pouya%20Sadeghpour-181717?style=flat-square&logo=github)](https://github.com/pouya-wp)

<p align="center">
  <b>IZMAB</b> is a cinematic director and filmmaker visual portfolio. Structured and edited like a feature film, it combines dynamic depth-of-field lens blurs, physical grade comparisons, analog film audio design, and smooth inertial scrolling.
</p>

</div>

---

## ✨ Features

- 🎞️ **Cut-Like-A-Film Narrative** — Editorial pacing where each section behaves like an individual frame sequence.
- 🔍 **Physical Lens Blur & Depth of Field** — Realtime shader-driven optical blur transitioning smoothly as the user explores projects.
- 🎨 **Real-Time Grade Comparator** — Interactive split-screen slider comparing raw camera log footage against finished cinematic color grades.
- 🔊 **Subtle Analog Foley Design** — Tactile UI click sounds, film reel ambient hum, and soft glass tones.
- 📜 **Inertial Momentum Scrolling** — Powered by Lenis for buttery smooth navigation.

---

## 🏗️ Architecture

| Module | Technologies | Responsibility |
|:---|:---|:---|
| `src/components/` | React 19, TypeScript | Film reel sections, pricing calculator, responsive grid |
| `src/three/` | Three.js, GLSL | Custom lens shader, film grain pass, vignette |
| `src/sound/` | Web Audio API | Tactile interface audio feedback and sound design |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/pouya-wp/izmab.git
cd izmab

# Install dependencies
npm install

# Start local preview
npm run dev
```

---

## 📄 License

Distributed under the MIT License.

---

<div align="center">
  <sub>Crafted with precision & passion by <b><a href="https://github.com/pouya-wp">Pouya Sadeghpour</a></b></sub>
</div>
