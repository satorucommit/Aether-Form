import * as THREE from 'three';

export class Starfield {
  constructor(scene) {
    this.scene = scene;
    this.count = 5000;
    this.particleData = [];

    this.init();
  }

  // Generate a beautiful, glowing circular point texture dynamically via a 2D Canvas
  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Create a smooth radial gradient to simulate a glowing star
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(244, 244, 244, 1)');
    grad.addColorStop(0.2, 'rgba(244, 244, 244, 0.8)');
    grad.addColorStop(0.5, 'rgba(122, 122, 130, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  init() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    const color1 = new THREE.Color('#7A7A82'); // Titanium grey
    const color2 = new THREE.Color('#F4F4F4'); // Raw porcelain
    const color3 = new THREE.Color('#FF3E6C'); // Crimson flash

    for (let i = 0; i < this.count; i++) {
      // Disperse points in a wide box volume
      const x = (Math.random() - 0.5) * 35;
      const y = (Math.random() - 0.5) * 35;
      const z = (Math.random() - 0.5) * 20 - 5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation
      let chosenColor = color1;
      const rand = Math.random();
      if (rand > 0.85) {
        chosenColor = color3; // Sparingly crimson
      } else if (rand > 0.6) {
        chosenColor = color2; // Porcelain
      }

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      // Store initial state and speed vectors for noise drift animation
      this.particleData.push({
        x: x,
        y: y,
        z: z,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        noiseSeed: Math.random() * 100,
        scale: 0.1 + Math.random() * 0.9
      });
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create a particle material using our dynamic canvas texture
    this.material = new THREE.PointsMaterial({
      size: 0.08,
      map: this.createParticleTexture(),
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  update(time, mouse, scrollSpeed = 0) {
    const positions = this.geometry.attributes.position.array;

    for (let i = 0; i < this.count; i++) {
      const data = this.particleData[i];

      // Speed multiplier factor on scroll speed warp!
      const speedMultiplier = 1.0 + scrollSpeed * 5.0;

      // Add multi-frequency mathematical noise drift (simulating Perlin noise fields)
      const noiseX = Math.sin(time * 0.1 + data.noiseSeed) * Math.cos(time * 0.05 + data.noiseSeed) * 0.2;
      const noiseY = Math.cos(time * 0.08 + data.noiseSeed) * Math.sin(time * 0.12 + data.noiseSeed) * 0.2;

      // Cursor reaction: particles react locally based on mouse vector coordinates
      // The cursor displacement diminishes with depth (Z axis)
      const depthFactor = Math.max(0.1, 1.0 - Math.abs(data.z / 15));
      const cursorX = mouse.x * 1.5 * depthFactor * data.scale;
      const cursorY = mouse.y * 1.5 * depthFactor * data.scale;

      // Update positions with speed multiplier
      positions[i * 3] = data.x + noiseX * speedMultiplier + cursorX;
      positions[i * 3 + 1] = data.y + noiseY * speedMultiplier + cursorY;
      // Gentle drift forwards/backwards accelerated on scroll speed warp
      positions[i * 3 + 2] = data.z + Math.sin(time * 0.05 * speedMultiplier + data.noiseSeed) * 0.3 * speedMultiplier;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }
}
