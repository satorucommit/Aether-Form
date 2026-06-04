// Import styles to let Vite bundle them
import 'locomotive-scroll/dist/locomotive-scroll.css';
import './styles/main.css';
import './styles/bento.css';
import './styles/cursor.css';
import './styles/loader.css';

// Import creative modules
import { gsap } from 'gsap';
import { WebGLApp } from './webgl/WebGLApp.js';
import { initSmoothScroll } from './modules/scroll.js';
import { CustomCursor } from './modules/cursor.js';
import { initTextReveal } from './modules/textReveal.js';
import { CardDistortion } from './modules/cardDistortion.js';

function initApp() {
  // 1. Initialize custom interactive cursor
  const customCursor = new CustomCursor();

  // 2. Initialize smooth scrolling
  const scrollContainer = document.getElementById('smooth-content');
  const locoScroll = initSmoothScroll(scrollContainer);

  // 3. Initialize background WebGL Canvas
  const canvasElement = document.getElementById('webgl-canvas');
  let webglApp = null;
  if (canvasElement) {
    webglApp = new WebGLApp(canvasElement);
  }

  // ScrollTrigger: fade out and scale down the WebGL Hero Mesh group as the user scrolls
  if (webglApp && webglApp.heroMesh) {
    gsap.to(webglApp.heroMesh.group.scale, {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      scrollTrigger: {
        trigger: '#work',
        scroller: '#smooth-content',
        start: 'top top',
        end: 'center top',
        scrub: true
      }
    });

    gsap.to(webglApp.heroMesh.material, {
      opacity: 0,
      scrollTrigger: {
        trigger: '#work',
        scroller: '#smooth-content',
        start: 'top top',
        end: 'center top',
        scrub: true
      }
    });
  }

  // Particle speed warp listener: feed scrolling velocity to WebGL App
  window.addEventListener('scrollspeed', (e) => {
    if (webglApp) {
      // Convert scroll speed to positive speed multiplier target
      webglApp.targetScrollSpeed = Math.min(Math.abs(e.detail.speed) * 0.035, 4.5);
    }
  });

  // Interactive mesh noise click trigger: clicking spikes noise amplitude/freq elastically
  window.addEventListener('click', () => {
    if (webglApp && webglApp.heroMesh) {
      gsap.killTweensOf([webglApp.heroMesh.uniforms.uNoiseAmp, webglApp.heroMesh.uniforms.uNoiseFreq]);
      
      // Spike amplitude
      gsap.to(webglApp.heroMesh.uniforms.uNoiseAmp, {
        value: 0.75,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(webglApp.heroMesh.uniforms.uNoiseAmp, {
            value: 0.28,
            duration: 1.6,
            ease: 'elastic.out(1, 0.3)'
          });
        }
      });

      // Spike frequency
      gsap.to(webglApp.heroMesh.uniforms.uNoiseFreq, {
        value: 1.4,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(webglApp.heroMesh.uniforms.uNoiseFreq, {
            value: 0.65,
            duration: 1.6,
            ease: 'elastic.out(1, 0.3)'
          });
        }
      });
    }
  });

  // 4. Initialize card hover shaders
  const cardAether = document.getElementById('card-aether');
  const cardChroma = document.getElementById('card-chroma');
  if (cardAether) new CardDistortion(cardAether);
  if (cardChroma) new CardDistortion(cardChroma);

  // 5. Setup FPS Counter
  initFPSCounter();

  // 6. Preloader progress loading timeline
  runPreloader(() => {
    // Reveal animation once loader completes
    revealPageLayout();
  });
}

// Safely execute initializations immediately if DOM is already parsed
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}

/**
 * Animated mock preloader counting from 00 to 100
 * @param {Function} onComplete Callback when loading finishes
 */
function runPreloader(onComplete) {
  const numDisplay = document.getElementById('loader-number');
  const barFill = document.getElementById('loader-bar-fill');
  
  const progressObj = { value: 0 };
  
  const tl = gsap.timeline({
    onComplete: onComplete
  });

  // Fade in the preloader visual elements initially
  tl.fromTo('.loader-brand, .loader-spec, .loader-bottom, .loader-progress-wrap', 
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
  );

  tl.to(progressObj, {
    value: 100,
    duration: 2.2,
    ease: 'power2.out',
    onUpdate: () => {
      const currentVal = Math.floor(progressObj.value);
      // Format number to double digit string (e.g. 05, 54, 100)
      if (numDisplay) {
        numDisplay.textContent = currentVal < 10 ? `0${currentVal}` : currentVal;
      }
      if (barFill) {
        barFill.style.width = `${currentVal}%`;
      }
    }
  });

  // Double-layered curtain exit transition: slide up preloader, slide up crimson curtain behind it
  tl.to('#preloader', {
    y: '-100%',
    duration: 1.2,
    ease: 'power4.inOut'
  });

  tl.fromTo('#transition-curtain',
    { y: '100%' },
    { y: '-100%', duration: 1.2, ease: 'power4.inOut' },
    '-=1.0'
  );
  
  // Bring WebGL canvas to base state
  tl.to('#webgl-canvas', {
    opacity: 1,
    duration: 0.5
  }, '-=0.5');
}

/**
 * Orchestrates staggered text and grid item reveals
 */
function revealPageLayout() {
  // Title reveal
  const splitTitle = document.querySelector('.split-title');
  if (splitTitle) {
    initTextReveal(splitTitle);
  }

  // Fade in Section 1 (Hero Bento Grid) on load
  const heroCards = document.querySelectorAll('#work .bento-card');
  gsap.fromTo(heroCards, 
    {
      y: 50,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.08,
      ease: 'cubic-bezier(0.25, 1, 0.5, 1)', // OutQuint
      clearProps: 'transform' // Clear transforms to let hover animations function smoothly
    }
  );

  // Fade in Section 2 (Lab Bento Grid) on scroll
  const labCards = document.querySelectorAll('section:nth-of-type(2) .bento-card');
  if (labCards.length > 0) {
    gsap.fromTo(labCards,
      {
        y: 40,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        stagger: 0.08,
        ease: 'cubic-bezier(0.25, 1, 0.5, 1)', // OutQuint
        clearProps: 'transform',
        scrollTrigger: {
          trigger: 'section:nth-of-type(2)',
          scroller: '#smooth-content',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // Fade in Section 3 (Marquee & Chronology Grid) on scroll
  const section3Cards = document.querySelectorAll('section:nth-of-type(3) .bento-card');
  if (section3Cards.length > 0) {
    gsap.fromTo(section3Cards,
      {
        y: 40,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        stagger: 0.08,
        ease: 'cubic-bezier(0.25, 1, 0.5, 1)', // OutQuint
        clearProps: 'transform',
        scrollTrigger: {
          trigger: 'section:nth-of-type(3)',
          scroller: '#smooth-content',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // Parallax shifting inside the card elements (3D window effect)
  const parallaxCards = document.querySelectorAll('.parallax-card');
  parallaxCards.forEach((card, idx) => {
    const title = card.querySelector('h4');
    const p = card.querySelector('p');
    const speed = (idx % 2 === 0) ? 20 : -20;
    
    if (title && p) {
      gsap.to([title, p], {
        y: speed,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          scroller: '#smooth-content',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  });
}

/**
 * Technical FPS logger running on requestAnimationFrame
 */
function initFPSCounter() {
  const fpsDisplay = document.getElementById('fps-counter');
  if (!fpsDisplay) return;

  let lastTime = performance.now();
  let frameCount = 0;
  
  function updateFPS() {
    frameCount++;
    const now = performance.now();
    
    // Calculate difference every 500ms to throttle DOM updates
    if (now - lastTime >= 500) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      // Clamp to maximum 60fps for layout aesthetics
      fpsDisplay.textContent = Math.min(fps, 60);
      
      frameCount = 0;
      lastTime = now;
    }
    
    requestAnimationFrame(updateFPS);
  }

  requestAnimationFrame(updateFPS);
}
