// add delayed functionality here

// Load auth0-spa-js script with delay to improve Core Web Vitals
window.setTimeout(() => {
  const script = document.createElement('script');
  script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
  script.onload = () => {
    // Dispatch event to notify that auth0 is now available
    window.dispatchEvent(new CustomEvent('auth0-loaded'));
  };
  document.head.appendChild(script);
}, 3000);
