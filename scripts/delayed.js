// Load delayed/non-critical functionality here

// Load Auth0 for authentication functionality
async function loadAuth0() {
  if (!window.auth0) {
    const { loadScript } = await import('./aem.js');
    await loadScript('https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js');
  }
}

// Initialize any delayed authentication functionality
async function initDelayedAuth() {
  try {
    await loadAuth0();
    // Trigger auth initialization in header if it exists
    const headerEvent = new CustomEvent('auth0-ready');
    document.dispatchEvent(headerEvent);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load Auth0:', error);
  }
}

// Initialize delayed functionality
initDelayedAuth();
