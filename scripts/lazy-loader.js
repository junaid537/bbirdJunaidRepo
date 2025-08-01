/**
 * Lazy loading utilities for code splitting and performance optimization
 */

/**
 * Cache for loaded scripts to avoid duplicate loading
 */
const loadedScripts = new Map();

/**
 * Lazily loads an external script only when needed
 * @param {string} src - Script URL to load
 * @param {Object} options - Loading options
 * @param {boolean} options.async - Load script asynchronously (default: true)
 * @param {boolean} options.defer - Defer script execution (default: false)
 * @param {string} options.id - Optional script ID
 * @returns {Promise} Promise that resolves when script is loaded
 */
export function lazyLoadScript(src, options = {}) {
  // Return cached promise if script already loaded or loading
  if (loadedScripts.has(src)) {
    return loadedScripts.get(src);
  }

  const {
    async = true,
    defer = false,
    id = null,
  } = options;

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    if (id) script.id = id;

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });

  loadedScripts.set(src, promise);
  return promise;
}

/**
 * Conditionally loads a script based on a predicate function
 * @param {Function} shouldLoad - Function that returns true if script should load
 * @param {string} src - Script URL to load
 * @param {Object} options - Loading options
 * @returns {Promise|null} Promise if loading, null if not needed
 */
export function conditionalLoadScript(shouldLoad, src, options = {}) {
  if (typeof shouldLoad === 'function' && shouldLoad()) {
    return lazyLoadScript(src, options);
  }
  return null;
}

/**
 * Loads a script when a specific DOM event occurs
 * @param {string} event - Event name to listen for
 * @param {string} src - Script URL to load
 * @param {Object} options - Loading options
 * @param {Element} target - Event target (default: document)
 * @returns {Promise} Promise that resolves when script is loaded
 */
export function loadScriptOnEvent(event, src, options = {}, target = document) {
  return new Promise((resolve, reject) => {
    const loadHandler = () => {
      target.removeEventListener(event, loadHandler);
      lazyLoadScript(src, options).then(resolve).catch(reject);
    };
    target.addEventListener(event, loadHandler, { once: true });
  });
}

/**
 * Loads a script when an element becomes visible (using Intersection Observer)
 * @param {Element} element - Element to observe
 * @param {string} src - Script URL to load
 * @param {Object} options - Loading options
 * @param {Object} observerOptions - IntersectionObserver options
 * @returns {Promise} Promise that resolves when script is loaded
 */
export function loadScriptOnVisible(element, src, options = {}, observerOptions = {}) {
  return new Promise((resolve, reject) => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        lazyLoadScript(src, options).then(resolve).catch(reject);
      }
    }, observerOptions);

    observer.observe(element);
  });
}

/**
 * Auth0 SPA JS specific lazy loader
 * Only loads when authentication features are actually needed
 */
export function loadAuth0WhenNeeded() {
  // Check if auth0 is already loaded
  if (window.auth0) {
    return Promise.resolve(window.auth0);
  }

  // Check if we need auth0 (presence of login buttons, auth forms, etc.)
  const needsAuth = () => (document.querySelector('.login-button, .auth-form, [data-auth="true"]')
    || window.location.hash.includes('access_token')
    || window.location.search.includes('code='));

  if (needsAuth()) {
    return lazyLoadScript('https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js', {
      id: 'auth0-spa-js',
    }).then(() => window.auth0);
  }

  return null;
}
