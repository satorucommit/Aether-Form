import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw';
import fragmentShader from './shaders/fragment.glsl?raw';

export class HeroMesh {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.material = null;

    this.init();
  }

  init() {
    // 1. High density icosahedron geometry for fluid simplex displacement
    this.geometry = new THREE.IcosahedronGeometry(1.6, 64);

    // 2. Uniforms mapping CSS Design Tokens to WebGL Shader variables
    this.uniforms = {
      uTime: { value: 0 },
      uNoiseFreq: { value: 0.65 },
      uNoiseAmp: { value: 0.28 },
      uCursor: { value: new THREE.Vector2(0, 0) },
      uColorBg: { value: new THREE.Color('#0B0B0C') },
      uColorGlass: { value: new THREE.Color('#141416') },
      uColorAccent: { value: new THREE.Color('#F4F4F4') },
      uColorFlash: { value: new THREE.Color('#FF3E6C') }
    };

    // 3. Shader material declaration
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide
    });

    // 4. Group & Mesh creation and scene insertion
    this.group = new THREE.Group();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.group.add(this.mesh);
    
    // Position mesh in space: center on mobile, slightly shifted to the right on desktop
    this.handleResize(window.innerWidth, window.innerHeight);

    this.scene.add(this.group);
  }

  handleResize(width, height) {
    if (!this.mesh) return;
    if (!this.basePosition) this.basePosition = new THREE.Vector3(0, 0, 0);

    if (width < 768) {
      // Mobile positioning: centered, slightly lower to align with text
      this.basePosition.set(0, -0.2, 0);
      this.mesh.scale.setScalar(0.55);
    } else if (width < 1200) {
      // Tablet positioning: centered-left
      this.basePosition.set(-1.0, 0.2, 0);
      this.mesh.scale.setScalar(0.75);
    } else {
      // Desktop positioning: centered exactly behind the "Aether & Form" title card text (left side)
      this.basePosition.set(-2.0, 0.4, 0);
      this.mesh.scale.setScalar(0.95);
    }

    this.mesh.position.copy(this.basePosition);
  }

  update(time, mouse) {
    if (!this.mesh) return;
    if (!this.basePosition) this.basePosition = new THREE.Vector3(0, 0, 0);

    // Update shader uniforms
    this.uniforms.uTime.value = time;
    this.uniforms.uCursor.value.copy(mouse);

    // Slowly rotate the mesh for base continuous movement
    this.mesh.rotation.y = time * 0.08;
    this.mesh.rotation.x = time * 0.05;

    // Bobbing offset added relative to basePosition
    this.mesh.position.copy(this.basePosition);
    this.mesh.position.y += Math.sin(time * 0.4) * 0.15;
  }
}
