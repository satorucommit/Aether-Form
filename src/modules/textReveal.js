import { gsap } from 'gsap';

/**
 * Splits text into words and characters wrapped in inline-block spans
 * to support overflow mask transformations without premium GSAP SplitText.
 * @param {HTMLElement} element 
 */
export function splitText(element) {
  const text = element.textContent.trim();
  element.textContent = ''; // Clear container

  const words = text.split(' ');
  words.forEach((word, wordIndex) => {
    // Word wrapper container (allows wrapping correctly in text blocks)
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';
    wordSpan.style.overflow = 'hidden';
    wordSpan.style.verticalAlign = 'top';

    const chars = Array.from(word);
    chars.forEach((char) => {
      const charSpan = document.createElement('span');
      charSpan.classList.add('char-inner');
      charSpan.style.display = 'inline-block';
      charSpan.style.transformOrigin = 'left bottom';
      // Initial state: shifted down and slightly rotated as requested
      charSpan.style.transform = 'translateY(110%) rotate(5deg)';
      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
    });

    element.appendChild(wordSpan);

    // Add back spacing between words
    if (wordIndex < words.length - 1) {
      const space = document.createTextNode(' ');
      element.appendChild(space);
    }
  });
}

/**
 * Orchestrates text reveals using a GSAP timeline
 * @param {HTMLElement} element The heading element to animate
 * @param {HTMLElement|string} trigger The trigger element for ScrollTrigger
 * @param {string} scrollerSelector The Locomotive Scroll container target selector
 */
export function initTextReveal(element, trigger = null, scrollerSelector = '#smooth-content') {
  if (!element) return;

  // Split target element content
  splitText(element);
  const chars = element.querySelectorAll('.char-inner');

  // GSAP animation configuration
  const tweenConfig = {
    y: '0%',
    rotate: 0,
    duration: 1.2,
    stagger: 0.02,
    ease: 'cubic-bezier(0.25, 1, 0.5, 1)', // OutQuint ease profile
    overwrite: 'auto'
  };

  // If a ScrollTrigger selector is supplied, hook it into ScrollTrigger
  if (trigger) {
    tweenConfig.scrollTrigger = {
      trigger: trigger,
      scroller: scrollerSelector,
      start: 'top 85%', // Trigger when top of element reaches 85% of screen height
      toggleActions: 'play none none none'
    };
  }

  return gsap.to(chars, tweenConfig);
}
