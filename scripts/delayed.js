// add delayed functionality here
import { loadScript } from './aem.js';

// Load Auth0 script in the delayed phase to improve INP performance
loadScript('https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js');
