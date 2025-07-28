// add delayed functionality here

// Load Auth0 conditionally when needed (not blocking initial LCP)
const loadAuth0 = () => {
  if (!window.auth0 && !document.querySelector('script[src*="auth0"]')) {
    const script = document.createElement('script');
    script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
    script.async = true;
    document.head.appendChild(script);
  }
};

// Auto-load Auth0 for pages that might need authentication
const shouldLoadAuth0 = () => document.querySelector('[data-requires-auth]')
  || document.querySelector('.login')
  || document.querySelector('.auth')
  || window.location.pathname.includes('/login')
  || window.location.pathname.includes('/profile');

if (shouldLoadAuth0()) {
  loadAuth0();
}

// Expose loadAuth0 globally for blocks that need it
window.loadAuth0 = loadAuth0;

// Lazy load analytics and tracking scripts
const loadAnalytics = () => {
  // Add any analytics scripts here that don't impact LCP
  // Example: Google Analytics, Adobe Analytics, etc.
};

// Load analytics after user interaction or after a delay
let analyticsLoaded = false;
const loadAnalyticsOnInteraction = () => {
  if (!analyticsLoaded) {
    analyticsLoaded = true;
    loadAnalytics();
  }
};

// Load analytics on first user interaction or after 5 seconds
['click', 'scroll', 'touchstart', 'keydown'].forEach((event) => {
  document.addEventListener(event, loadAnalyticsOnInteraction, { once: true, passive: true });
});

setTimeout(loadAnalyticsOnInteraction, 5000);
