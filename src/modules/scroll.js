import LocomotiveScroll from 'locomotive-scroll';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function initSmoothScroll(scrollerContainer) {
  if (!scrollerContainer) return null;

  // Initialize Locomotive Scroll v4
  const scrollEl = scrollerContainer;
  const locoScroll = new LocomotiveScroll({
    el: scrollEl,
    smooth: true,
    multiplier: 1.0,
    lerp: 0.08, // Smoothness intensity matching custom curve deceleration
    class: 'is-inview',
    getDirection: true,
    getSpeed: true
  });

  // Update ScrollTrigger and dispatch velocity events on every Locomotive Scroll update
  locoScroll.on('scroll', (obj) => {
    ScrollTrigger.update();

    // Dispatch custom event carrying current velocity for particle warp integrations
    const speedEvent = new CustomEvent('scrollspeed', { detail: { speed: obj.speed } });
    window.dispatchEvent(speedEvent);
  });

  // Set up the ScrollTrigger scroller proxy
  ScrollTrigger.scrollerProxy(scrollEl, {
    scrollTop(value) {
      if (arguments.length) {
        locoScroll.scrollTo(value, 0, 0);
        return;
      }
      return locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    },
    // Force transform pinning since Locomotive Scroll translates the container
    pinType: 'transform'
  });

  // Force ScrollTrigger and Locomotive Scroll to sync up after resizing or updates
  const refreshHandler = () => {
    locoScroll.update();
  };
  ScrollTrigger.addEventListener('refresh', refreshHandler);

  // Run initial refresh to calibrate boundaries
  ScrollTrigger.refresh();

  // Return the Locomotive scroll instance for external access
  return locoScroll;
}
