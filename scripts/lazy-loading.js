/**
 * Lazy loading utilities for better performance
 */
import { loadBlock } from './aem.js';

/**
 * Creates an intersection observer for lazy loading blocks
 * @param {Function} callback Function to call when element enters viewport
 * @param {Object} options Intersection observer options
 * @returns {IntersectionObserver} The observer instance
 */
export function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options,
  };

  if (!window.IntersectionObserver) {
    // Fallback for browsers without intersection observer
    callback();
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, defaultOptions);
}

/**
 * Sets up lazy loading for blocks that are below the fold
 * @param {Element} main The main container element
 */
export function setupLazyBlocks(main) {
  const blocks = main.querySelectorAll('.block[data-block-status="initialized"]');
  const firstSection = main.querySelector('.section');

  blocks.forEach((block) => {
    const section = block.closest('.section');

    // Skip blocks in the first section (above the fold)
    if (section === firstSection) {
      return;
    }

    const observer = createIntersectionObserver((target) => {
      if (target.dataset.blockStatus === 'initialized') {
        loadBlock(target);
        observer?.unobserve(target);
      }
    });

    if (observer) {
      observer.observe(block);
    } else {
      // Fallback: load after a delay
      setTimeout(() => loadBlock(block), 1000);
    }
  });
}

/**
 * Preloads critical resources that might be needed soon
 * @param {Array} resources Array of resource URLs or import statements
 */
export function preloadResources(resources) {
  if (!Array.isArray(resources)) return;

  resources.forEach((resource) => {
    if (typeof resource === 'string' && resource.endsWith('.js')) {
      // Preload JavaScript modules
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = resource;
      document.head.appendChild(link);
    } else if (typeof resource === 'string' && resource.endsWith('.css')) {
      // Preload CSS
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = resource;
      document.head.appendChild(link);
    }
  });
}
