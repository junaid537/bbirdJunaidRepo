// Auth0 SPA JS Production Script
// This file should contain the actual auth0-spa-js.production.js content
// Downloaded from: https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js
//
// In production, this file would be downloaded and served from the same origin
// to improve Core Web Vitals performance by reducing third-party script blocking

// Placeholder for auth0 functionality - in real implementation,
// this would be the actual auth0-spa-js library content

// Note: In a production deployment, you would:
// 1. Download the actual file from https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js
// 2. Replace this placeholder with the real auth0 library content
// 3. Ensure the file is properly minified and optimized

// For demo purposes, creating a minimal auth0 object structure
if (typeof window !== 'undefined') {
  window.auth0 = {
    createAuth0Client() {
      return Promise.resolve({
        isAuthenticated: () => Promise.resolve(false),
        getUser: () => Promise.resolve(null),
        loginWithRedirect: () => Promise.resolve(),
        logout: () => Promise.resolve(),
        handleRedirectCallback: () => Promise.resolve(),
      });
    },
  };
}
