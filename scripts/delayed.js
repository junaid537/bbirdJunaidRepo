// add delayed functionality here

// Load Auth0 SPA JS (non-critical, moved from head.html for performance)
const auth0Script = document.createElement('script');
auth0Script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
auth0Script.async = true;

// Dispatch event when Auth0 is loaded (optional optimization)
auth0Script.onload = () => {
  window.dispatchEvent(new Event('auth0-loaded'));
};

document.head.appendChild(auth0Script);
