// add delayed functionality here

/**
 * Loads Auth0 library dynamically for better performance
 * This prevents the Auth0 script from blocking the critical rendering path
 */
function loadAuth0() {
  return new Promise((resolve, reject) => {
    // Check if Auth0 is already loaded
    if (window.auth0) {
      resolve(window.auth0);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
    script.async = true;

    script.onload = () => {
      resolve(window.auth0);
    };

    script.onerror = () => {
      reject(new Error('Failed to load Auth0 library'));
    };

    document.head.appendChild(script);
  });
}

// Load Auth0 library when delayed scripts are executed
loadAuth0().then(() => {
  // Dispatch custom event to notify header that Auth0 is ready
  window.dispatchEvent(new CustomEvent('auth0-loaded'));
}).catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to load Auth0:', error);
});
