import * as THREE from 'three';
import { Starfield } from './Starfield.js';
import { HeroMesh } from './HeroMesh.js';

export class WebGLApp {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio, 2);

    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);

    // Scroll speed warping configurations
    this.scrollSpeed = 0.0;
    this.targetScrollSpeed = 0.0;

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.z = 10;

    // 3. Renderer setup with transparency and antialiasing
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // 4. Time tracking
    this.clock = new THREE.Clock();

    // 5. Add custom light sources
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf4f4f4, 1.5);
    dirLight1.position.set(5, 5, 5);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff3e6c, 2.5);
    dirLight2.position.set(-5, -5, 2);
    this.scene.add(dirLight2);

    // 6. Instantiate sub-components
    this.starfield = new Starfield(this.scene);
    this.heroMesh = new HeroMesh(this.scene);

    // 7. Event listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    // 8. Start loop
    this.tick();
  }

  onMouseMove(e) {
    // Map mouse position to normal WebGL coordinates (-1 to 1)
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio, 2);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.dpr);

    if (this.heroMesh) {
      this.heroMesh.handleResize(this.width, this.height);
    }
  }

  tick() {
    requestAnimationFrame(this.tick.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    // Smoothly interpolate (lerp) mouse positions to create an organic lag feel
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // Smoothly decay scroll warp speed target back to 0 (friction deceleration)
    this.targetScrollSpeed += (0 - this.targetScrollSpeed) * 0.05;
    this.scrollSpeed += (this.targetScrollSpeed - this.scrollSpeed) * 0.08;

    // Update child components
    if (this.starfield) {
      this.starfield.update(elapsedTime, this.mouse, this.scrollSpeed);
    }

    if (this.heroMesh) {
      this.heroMesh.update(elapsedTime, this.mouse);
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}
