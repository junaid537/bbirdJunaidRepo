// add delayed functionality here

// Load Auth0 for authentication functionality
// This is loaded here since it's only used in the header block which loads after LCP
(function loadAuth0() {
  const script = document.createElement('script');
  script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
  script.onload = () => {
    // Dispatch event to notify header block that Auth0 is available
    window.dispatchEvent(new CustomEvent('auth0-loaded'));
  };
  document.head.appendChild(script);
}());
