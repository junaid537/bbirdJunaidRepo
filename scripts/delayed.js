// add delayed functionality here

/**
 * Loads Auth0 library and initializes authentication
 */
async function loadAuth0() {
  if (!window.auth0) {
    // Dynamically load Auth0 library
    const script = document.createElement('script');
    script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
    script.async = true;

    return new Promise((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Auth0'));
      document.head.appendChild(script);
    });
  }
  return Promise.resolve();
}

/**
 * Initialize Auth0 when needed
 */
export async function initAuth0ForHeader() {
  try {
    await loadAuth0();
    // Auth0 is now available, header can initialize it
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load Auth0:', error);
    return false;
  }
}

/**
 * Load RUM enhancer for performance monitoring
 */
function loadRUMEnhancer() {
  if (window.hlx?.rum?.enhance) {
    window.hlx.rum.enhance();
  }
}

/**
 * Enhanced font loading with better performance characteristics
 */
export async function loadFontsEnhanced() {
  // Enhanced font loading with font-display: swap for better performance
  if (!document.querySelector('link[href*="fonts.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${window.hlx.codeBasePath}/styles/fonts.css`;
    link.media = 'print';
    link.onload = function onload() { this.media = 'all'; };
    document.head.appendChild(link);
  }
}

/**
 * Preload critical resources for next page navigation
 */
function preloadCriticalResources() {
  // Preload common resources for better navigation performance
  const resources = [
    `${window.hlx.codeBasePath}/blocks/header/header.css`,
    `${window.hlx.codeBasePath}/blocks/footer/footer.css`,
    `${window.hlx.codeBasePath}/styles/lazy-styles.css`,
  ];

  resources.forEach((href) => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'style';
      document.head.appendChild(link);
    }
  });
}

/**
 * Initialize analytics and tracking scripts
 */
function initTracking() {
  // Placeholder for analytics initialization
  // This runs in delayed phase to not impact initial page performance
  // eslint-disable-next-line no-console
  console.debug('Analytics tracking initialized in delayed phase');
}

/**
 * Initialize delayed functionality
 */
function init() {
  // Load RUM enhancer for better performance monitoring
  loadRUMEnhancer();

  // Enhanced font loading
  loadFontsEnhanced();

  // Preload resources for better navigation
  preloadCriticalResources();

  // Initialize tracking
  initTracking();

  // Any other delayed initialization can go here
  // eslint-disable-next-line no-console
  console.debug('Delayed functionality initialized');
}

// Initialize delayed functionality
init();
