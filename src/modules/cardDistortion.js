import { gsap } from 'gsap';

export class CardDistortion {
  constructor(cardElement) {
    this.container = cardElement;
    this.canvas = cardElement.querySelector('.hover-distortion-canvas');
    this.img = cardElement.querySelector('img');
    if (!this.canvas || !this.img) return;

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) return;

    this.isPlaying = false;
    this.progress = 0;
    this.mouse = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.angle = 0;

    // Load texture and initialize WebGL
    if (this.img.complete) {
      this.init();
    } else {
      this.img.onload = () => this.init();
    }
  }

  init() {
    this.setupCanvas();
    this.createProgram();
    this.setupBuffers();
    this.loadTexture();
    this.setupEvents();

    // Render the initial image frame before hover events trigger
    this.draw();

    // Hide original image; WebGL canvas will render the distorted version
    this.img.style.opacity = '0';
  }

  setupCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  createProgram() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        // Flip Y for texture coordinates
        vUv.y = 1.0 - vUv.y;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Applies liquid wave distortion and chromatic aberration based on mouse and hover progress
    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float uProgress;
      uniform vec2 uMouse;
      uniform float uAngle;

      void main() {
        vec2 uv = vUv;
        
        // Liquid wave distortion: Create wave offsets originating from the mouse position
        float dist = distance(uv, uMouse);
        
        // Wave math: sine wave ripples fading out away from mouse
        float wave = sin(dist * 15.0 - uProgress * 5.0) * 0.03 * uProgress * exp(-dist * 2.0);
        
        // Add directional shift based on entry angle
        vec2 direction = vec2(cos(uAngle), sin(uAngle));
        vec2 displacement = direction * wave;

        // Chromatic Aberration: Different displacement offsets for Red, Green, Blue channels
        float r = texture2D(uTexture, uv + displacement * 1.5).r;
        float g = texture2D(uTexture, uv + displacement * 1.0).g;
        float b = texture2D(uTexture, uv + displacement * 0.5).b;

        // Subtle ambient dimming on the edges of the distortion
        vec3 finalColor = vec3(r, g, b);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.useProgram(this.program);

    // Uniform locations
    this.uTexture = gl.getUniformLocation(this.program, 'uTexture');
    this.uProgress = gl.getUniformLocation(this.program, 'uProgress');
    this.uMouse = gl.getUniformLocation(this.program, 'uMouse');
    this.uAngle = gl.getUniformLocation(this.program, 'uAngle');
  }

  setupBuffers() {
    const gl = this.gl;
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  }

  loadTexture() {
    const gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Set texture wrapping and filtering parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload image to GPU
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
  }

  setupEvents() {
    // Track window resize
    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.draw();
    });

    this.container.addEventListener('mouseenter', (e) => {
      this.isPlaying = true;
      this.calculateAngle(e);

      gsap.to(this, {
        progress: 1.0,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => this.draw()
      });
    });

    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.targetMouse.x = (e.clientX - rect.left) / rect.width;
      this.targetMouse.y = (e.clientY - rect.top) / rect.height;

      if (!this.isPlaying) return;
      this.tick();
    });

    this.container.addEventListener('mouseleave', () => {
      gsap.to(this, {
        progress: 0.0,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => this.draw(),
        onComplete: () => {
          this.isPlaying = false;
        }
      });
    });
  }

  calculateAngle(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Center point of the card bounding box
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Angle of entry from center
    this.angle = Math.atan2(y - cy, x - cx);
  }

  tick() {
    if (!this.isPlaying) return;

    // Smooth lerp mouse positioning within texture space
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.12;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.12;

    this.draw();
    requestAnimationFrame(() => this.tick());
  }

  draw() {
    const gl = this.gl;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(this.uProgress, this.progress);
    gl.uniform1f(this.uAngle, this.angle);
    gl.uniform2f(this.uMouse, this.mouse.x, this.mouse.y);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
