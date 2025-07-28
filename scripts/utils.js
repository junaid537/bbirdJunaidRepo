/**
 * Creates a new HTML element
 */
export default function createElement(tagName, attributes, ...children) {
  const el = document.createElement(tagName);
  if (attributes) {
    Object.keys(attributes).forEach((name) => {
      el.setAttribute(name, attributes[name]);
    });
  }
  children.forEach((child) => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (Array.isArray(child)) {
      child.forEach((c) => el.appendChild(c));
    } else if (child) {
      el.appendChild(child);
    }
  });
  return el;
}

/**
 * Executes a function when the browser is idle to avoid blocking the main thread
 * @param {Function} fn - Function to execute during idle time
 * @param {Object} options - Options for idle callback
 * @returns {Promise} Promise that resolves when the function is executed
 */
export function executeWhenIdle(fn, options = {}) {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        try {
          const result = fn();
          resolve(result);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error in idle callback:', error);
          resolve();
        }
      }, options);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        try {
          const result = fn();
          resolve(result);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error in fallback timeout:', error);
          resolve();
        }
      }, 0);
    }
  });
}

/**
 * Executes a function on the next animation frame to optimize rendering
 * @param {Function} fn - Function to execute on next frame
 * @returns {Promise} Promise that resolves when the function is executed
 */
export function executeOnNextFrame(fn) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      try {
        const result = fn();
        resolve(result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in animation frame callback:', error);
        resolve();
      }
    });
  });
}
