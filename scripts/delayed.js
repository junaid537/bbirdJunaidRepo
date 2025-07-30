// add delayed functionality here

// Load Auth0 library when needed (deferred for performance)
async function loadAuth0() {
  if (window.auth0) return Promise.resolve(); // Already loaded

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Load additional analytics or tracking scripts here
async function loadAnalytics() {
  // Placeholder for future analytics/tracking scripts
  // that don't need to be loaded immediately
}

// Initialize delayed functionality
async function initDelayed() {
  // Load Auth0 for authentication features
  try {
    await loadAuth0();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load Auth0:', error);
  }

  // Load other delayed scripts
  await loadAnalytics();
}

// Start delayed loading
initDelayed();
