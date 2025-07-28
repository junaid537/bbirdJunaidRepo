// add delayed functionality here

import { executeWhenIdle } from './utils.js';

/**
 * Performance monitoring and metrics collection
 */
function initPerformanceMonitoring() {
  if ('PerformanceObserver' in window) {
    try {
      // Monitor INP (Interaction to Next Paint)
      const inpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'first-input') {
            const inp = entry.processingStart - entry.startTime;
            // eslint-disable-next-line no-console
            console.debug('INP (First Input Delay):', inp.toFixed(2), 'ms');

            // Track if we're meeting our performance target
            if (inp < 100) {
              // eslint-disable-next-line no-console
              console.debug('✅ INP: Excellent performance');
            } else if (inp < 300) {
              // eslint-disable-next-line no-console
              console.debug('⚠️ INP: Good performance');
            } else {
              // eslint-disable-next-line no-console
              console.debug('❌ INP: Needs improvement');
            }
          }
        });
      });

      inpObserver.observe({ entryTypes: ['first-input'] });

      // Monitor LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // eslint-disable-next-line no-console
          console.debug('LCP (Largest Contentful Paint):', entry.startTime.toFixed(2), 'ms');
        });
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor long tasks that might block the main thread
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // eslint-disable-next-line no-console
          console.debug('Long Task detected:', entry.duration.toFixed(2), 'ms');
          if (entry.duration > 50) {
            // eslint-disable-next-line no-console
            console.warn('⚠️ Long task blocking main thread:', entry.duration.toFixed(2), 'ms');
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Performance monitoring is not critical, silently fail
    }
  }
}

/**
 * Loads additional analytics and tracking when browser is idle
 */
function loadAnalytics() {
  // Add any analytics or tracking code that can be delayed
  // This function runs when the browser has idle time available

  // Initialize performance monitoring
  initPerformanceMonitoring();

  // Track navigation timing for performance insights
  if (window.performance && window.performance.timing) {
    executeWhenIdle(() => {
      const { timing } = window.performance;
      const { navigationStart } = timing;

      const metrics = {
        'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
        'TCP Connection': timing.connectEnd - timing.connectStart,
        'Request Time': timing.responseStart - timing.requestStart,
        'Response Time': timing.responseEnd - timing.responseStart,
        'DOM Processing': timing.domComplete - timing.domLoading,
        'Page Load': timing.loadEventEnd - navigationStart,
      };

      // eslint-disable-next-line no-console
      console.debug('📊 Performance Metrics:', metrics);
    });
  }
}

/**
 * Optimizes images and other media when browser is idle
 */
function optimizeMedia() {
  executeWhenIdle(() => {
    // Optimize lazy loading images
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

    // Preload critical images that might be needed soon
    const criticalImages = document.querySelectorAll('img[data-preload="true"]');
    criticalImages.forEach((img) => {
      if (!img.complete) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
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
    const criticalStyles = [
      `${window.hlx.codeBasePath}/styles/styles.css`,
      `${window.hlx.codeBasePath}/styles/lazy-styles.css`,
    ];

    criticalStyles.forEach((href) => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'preload';
      linkElement.as = 'style';
      linkElement.href = href;
      document.head.appendChild(linkElement);
    });

    // Preload important JavaScript modules
    const criticalScripts = [
      `${window.hlx.codeBasePath}/scripts/aem.js`,
      `${window.hlx.codeBasePath}/scripts/utils.js`,
    ];

    criticalScripts.forEach((href) => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'modulepreload';
      linkElement.href = href;
      document.head.appendChild(linkElement);
    });
  });
}

/**
 * Cleanup and optimization for better memory usage
 */
function performCleanup() {
  executeWhenIdle(() => {
    // Remove any temporary elements or event listeners that are no longer needed
    const tempElements = document.querySelectorAll('[data-temp="true"]');
    tempElements.forEach((el) => el.remove());

    // Clean up any completed animations or transitions
    const completedAnimations = document.querySelectorAll('.animation-complete');
    completedAnimations.forEach((el) => el.classList.remove('animation-complete'));
  });
}

// Initialize delayed functionality with performance monitoring
executeWhenIdle(() => {
  // eslint-disable-next-line no-console
  console.debug('🚀 Initializing delayed performance optimizations...');

  loadAnalytics();
  optimizeMedia();
  preloadCriticalResources();
  performCleanup();

  // eslint-disable-next-line no-console
  console.debug('✅ Delayed performance optimizations initialized');
});
