// add delayed functionality here

import { executeWhenIdle } from './utils.js';

/**
 * Loads additional analytics and tracking when browser is idle
 */
function loadAnalytics() {
  // Add any analytics or tracking code that can be delayed
  // This function runs when the browser has idle time available

  // Example: Performance monitoring
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Log performance metrics for monitoring
          if (entry.entryType === 'largest-contentful-paint') {
            // eslint-disable-next-line no-console
            console.debug('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            // eslint-disable-next-line no-console
            console.debug('FID:', entry.processingStart - entry.startTime);
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    } catch (e) {
      // Ignore if PerformanceObserver is not supported
    }
  }
}

/**
 * Optimizes images and other media when browser is idle
 */
function optimizeMedia() {
  executeWhenIdle(() => {
    // Lazy load any remaining images that weren't loaded yet
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach((img) => {
      if (!img.complete && img.getBoundingClientRect().top < window.innerHeight * 1.5) {
        // Force reload if needed by updating the src attribute
        const currentSrc = img.src;
        if (currentSrc) {
          img.src = '';
          img.src = currentSrc;
        }
      }
    });
  });
}

/**
 * Preloads critical resources for future navigation
 */
function preloadCriticalResources() {
  executeWhenIdle(() => {
    // Preload critical CSS for faster subsequent page loads
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    linkElement.as = 'style';
    linkElement.href = `${window.hlx.codeBasePath}/styles/styles.css`;
    document.head.appendChild(linkElement);
  });
}

// Initialize delayed functionality
executeWhenIdle(() => {
  loadAnalytics();
  optimizeMedia();
  preloadCriticalResources();
});
