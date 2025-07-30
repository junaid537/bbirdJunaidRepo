// add delayed functionality here

import { loadScript } from './aem.js';

// Load Auth0 script after LCP - non-blocking for performance
loadScript('https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js')
  .then(() => {
    // Auth0 script loaded, can initialize authentication features if needed
    // eslint-disable-next-line no-console
    console.debug('Auth0 script loaded via delayed loading');
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.warn('Failed to load Auth0 script:', error);
  });
