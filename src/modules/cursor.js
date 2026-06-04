import { gsap } from 'gsap';

export class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('custom-cursor');
    if (!this.cursor) return;

    this.dot = this.cursor.querySelector('.cursor-dot');
    this.ring = this.cursor.querySelector('.cursor-ring');

    // Mouse coordinates
    this.mouse = { x: 0, y: 0 }; // Current real mouse coords
    this.cursorPos = { x: 0, y: 0 }; // Lerped ring coords
    this.dotPos = { x: 0, y: 0 }; // Lerped dot coords

    // Snapping configuration
    this.isMagnetic = false;
    this.magneticTarget = null;
    this.magneticCoords = { x: 0, y: 0, width: 0, height: 0 };

    this.init();
  }

  init() {
    // 1. Mouse movement tracking
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // 2. Click states
    window.addEventListener('mousedown', () => {
      gsap.to(this.ring, { scale: 0.8, duration: 0.15, ease: 'power2.out' });
      gsap.to(this.dot, { scale: 1.5, duration: 0.15, ease: 'power2.out' });
    });

    window.addEventListener('mouseup', () => {
      gsap.to(this.ring, { scale: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(this.dot, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });

    // 3. Register hover triggers
    this.registerHoverEvents();

    // 4. Start ticks
    this.tick();
  }

  registerHoverEvents() {
    // Select magnetic items
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        this.isMagnetic = true;
        this.magneticTarget = e.currentTarget;
        this.cursor.classList.add('magnetic-active');
      });

      el.addEventListener('mousemove', (e) => {
        if (!this.magneticTarget) return;

        // Calculate bounding box and center coordinates of the target
        const rect = this.magneticTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.magneticCoords.x = centerX;
        this.magneticCoords.y = centerY;
        this.magneticCoords.width = rect.width;
        this.magneticCoords.height = rect.height;

        // Create a subtle attraction effect on the actual text/content inside the magnetic element
        const strength = 0.35; // Strength coefficient
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        gsap.to(this.magneticTarget, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', () => {
        this.isMagnetic = false;
        this.cursor.classList.remove('magnetic-active');

        // Snap target element back to its original layout position
        if (this.magneticTarget) {
          gsap.to(this.magneticTarget, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
          });
        }
        this.magneticTarget = null;
      });
    });

    // General interactive elements scaling trigger (e.g. links, buttons)
    const hoverElements = document.querySelectorAll('a, button, .bento-card');
    hoverElements.forEach(el => {
      // Skip if it's already magnetic
      if (el.hasAttribute('data-magnetic')) return;

      el.addEventListener('mouseenter', () => {
        this.cursor.classList.add('hover-active');
      });
      el.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('hover-active');
      });
    });
  }

  tick() {
    requestAnimationFrame(this.tick.bind(this));

    if (this.isMagnetic && this.magneticTarget) {
      // Magnetic Snap: Lerp cursor outer ring to encircle target element center
      // Set target size for the outer ring
      const targetW = this.magneticCoords.width + 16;
      const targetH = this.magneticCoords.height + 16;

      this.cursorPos.x += (this.magneticCoords.x - this.cursorPos.x) * 0.25;
      this.cursorPos.y += (this.magneticCoords.y - this.cursorPos.y) * 0.25;

      gsap.to(this.cursor, {
        x: this.cursorPos.x,
        y: this.cursorPos.y,
        width: targetW,
        height: targetH,
        duration: 0.3,
        overwrite: 'auto',
        ease: 'power2.out'
      });
    } else {
      // Standard Follow: Ring trails with elastic delay, inner dot responds instantly
      this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * 0.15; // Damped lag
      this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * 0.15;

      this.dotPos.x += (this.mouse.x - this.dotPos.x) * 0.45; // Faster responsive lerp
      this.dotPos.y += (this.mouse.y - this.dotPos.y) * 0.45;

      gsap.to(this.cursor, {
        x: this.cursorPos.x,
        y: this.cursorPos.y,
        width: 50,
        height: 50,
        duration: 0.25,
        overwrite: 'auto',
        ease: 'power2.out'
      });

      // Update inner dot location manually
      gsap.to(this.dot, {
        x: this.dotPos.x - this.cursorPos.x,
        y: this.dotPos.y - this.cursorPos.y,
        duration: 0.1,
        overwrite: 'auto'
      });
    }
  }
}
