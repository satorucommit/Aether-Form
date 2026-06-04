# Aether & Form — Immersive Digital Exhibition Space

A high-end, GPU-accelerated creative portfolio and digital exhibition space that merges mathematical precision with fluid motion design. Built with raw WebGL, custom GLSL shaders, and a fully orchestrated animation pipeline.

---

## Live Preview

> **Aether & Form** — An immersive design landscape intersecting mathematical equations with fluid physical meshes. Powered by custom vertex displacements, simplex noise fields, and kinetic UI systems.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build Tool | [Vite](https://vitejs.dev/) v8 |
| 3D / WebGL | [Three.js](https://threejs.org/) v0.184 |
| Animation | [GSAP](https://greensock.com/gsap/) v3.15 + ScrollTrigger |
| Smooth Scroll | [Locomotive Scroll](https://locomotivemtl.github.io/locomotive-scroll/) v4 |
| Shaders | Custom GLSL ES 3.0 (Vertex + Fragment) |
| Language | Vanilla JavaScript (ES Modules) |

---

## Features

### WebGL Engine
- **Hero Mesh** — A high-density `IcosahedronGeometry (64 subdivisions)` displaced in real-time by 3D Simplex noise (Ian McEwan / Ashima Arts). Noise amplitude and frequency react elastically to click events via GSAP spring physics.
- **Starfield** — 5,000 GPU-rendered particles using procedural `CanvasTexture` for glowing radial gradients. Particles drift via multi-frequency sine/cosine noise fields and react to both cursor position and scroll velocity warp.
- **GLSL Shaders** — Custom vertex shader applies per-vertex simplex noise displacement; custom fragment shader implements Fresnel rim lighting, procedural chromatic aberration across R/G/B channels, and obsidian glassmorphic surface rendering with specular highlights.

### Card Distortion (WebGL per-card)
- Each portfolio card runs its own isolated WebGL context with a custom inline shader pipeline.
- On hover: sine-wave ripple distortion radiates from the cursor position with entry-angle-aware directional displacement and chromatic aberration splits at peak mouse speed.
- Smooth GSAP-driven `progress` uniform animates the effect in/out.

### Custom Cursor System
- Fluid magnetic ring cursor built on `requestAnimationFrame` with independent lerp rates for the outer ring (0.15) and inner dot (0.45).
- `[data-magnetic]` elements trigger an elastic snap — the ring morphs to enclose the target's bounding box with a GSAP spring attraction effect on the element content itself.
- Full click-state scaling feedback (compress on `mousedown`, elastic release on `mouseup`).

### Smooth Scroll & ScrollTrigger Integration
- Locomotive Scroll v4 bridged to GSAP ScrollTrigger via a `scrollerProxy` — ensures pinning and scrub animations work correctly with the CSS `transform`-based scroll container.
- Scroll velocity is dispatched as a custom `scrollspeed` DOM event, picked up by the WebGL engine to warp particle field speed in real-time.
- Hero mesh scales and fades to opacity `0` on a `scrub: true` ScrollTrigger as the user enters the portfolio section.

### Animation System
- **Preloader** — Dual-layer curtain exit: progress bar counts 0–100 with GSAP `onUpdate`, followed by an overlapping slide-up of the preloader panel and a crimson `transition-curtain` behind it.
- **Text Reveal** — Custom `splitText` utility wraps characters in overflow-masked `inline-block` spans. GSAP animates chars from `translateY(110%) rotate(5deg)` to neutral with a staggered `OutQuint` ease — no premium SplitText plugin required.
- **Bento Grid Reveals** — Staggered `fromTo` fade-ups on all three grid sections, with Section 2 and 3 hooked to ScrollTrigger `toggleActions`.
- **Parallax Cards** — Alternating `±20px` Y-axis scrub parallax on chronology cards for a 3D depth window effect.

### UI Layout
- Asymmetric 12-column bento grid system with fluid `col-*` / `row-*` span utilities.
- Real-time FPS counter throttled at 500ms intervals via `requestAnimationFrame`.
- Infinite CSS marquee ticker with display typography at `clamp(2rem, 4vw, 4rem)`.

---

## Project Structure

```
├── public/
│   ├── aether_exhibition.png     # Portfolio card 01 image
│   ├── chroma_refraction.png     # Portfolio card 02 image
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── modules/
│   │   ├── cardDistortion.js     # Per-card WebGL distortion effect
│   │   ├── cursor.js             # Magnetic fluid cursor system
│   │   ├── scroll.js             # Locomotive Scroll + ScrollTrigger bridge
│   │   └── textReveal.js        # Custom split-text character animation
│   ├── styles/
│   │   ├── main.css              # Global tokens, typography, layout
│   │   ├── bento.css             # Bento grid system
│   │   ├── cursor.css            # Cursor states and transitions
│   │   └── loader.css            # Preloader panel styles
│   ├── webgl/
│   │   ├── shaders/
│   │   │   ├── vertex.glsl       # Simplex noise vertex displacement
│   │   │   └── fragment.glsl     # Fresnel + chromatic aberration surface
│   │   ├── HeroMesh.js           # Icosahedron mesh with shader material
│   │   ├── Starfield.js          # 5,000 particle noise field
│   │   └── WebGLApp.js           # Three.js scene, camera, renderer, loop
│   └── main.js                   # App entry — orchestrates all systems
└── index.html
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/the-neo-minimalists.git
cd the-neo-minimalists

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` with Vite HMR.

### Production Build

```bash
npm run build
```

Output is emitted to `dist/`. Preview the production bundle locally:

```bash
npm run preview
```

---

## Interaction Reference

| Interaction | Behaviour |
|---|---|
| Mouse move | Starfield particles and hero mesh react to cursor position with lerped lag |
| Click anywhere | Hero mesh noise amplitude/frequency spike with elastic spring decay |
| Hover `[data-magnetic]` | Cursor ring snaps to element bounds; content attracts toward cursor |
| Hover portfolio card | WebGL sine-wave ripple + chromatic aberration activates on the card image |
| Scroll | Particle warp speed increases with scroll velocity; hero mesh fades on scroll |

---

## Performance

- Renderer configured with `powerPreference: "high-performance"` and ACES Filmic tone mapping.
- Device pixel ratio clamped to `2` to prevent GPU overload on high-DPI screens.
- Particle positions updated in a single typed `Float32Array` per frame — no GC pressure.
- GSAP `clearProps: 'transform'` used after entry animations to hand transforms back to CSS hover states cleanly.

---

## License

MIT © 2026 Aether & Form
