// add delayed functionality here

// Load auth0 script deferred to improve INP performance
function loadAuth0Script() {
  return new Promise((resolve, reject) => {
    if (window.auth0) {
      resolve(); // Already loaded
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load auth0 script'));
    document.head.appendChild(script);
  });
}

// Load auth0 and notify components that it's ready
loadAuth0Script().then(() => {
  // Dispatch custom event to notify components that auth0 is ready
  window.dispatchEvent(new CustomEvent('auth0-ready'));
}).catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Error loading auth0:', error);
});
