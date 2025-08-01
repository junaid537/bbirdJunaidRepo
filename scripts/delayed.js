// add delayed functionality here

/**
 * Delayed loading for non-critical features
 * This file is loaded 3 seconds after page load to avoid blocking critical rendering
 */

/**
 * Load analytics and tracking scripts
 * Only if user hasn't opted out and we're not in development
 */
function loadAnalytics() {
  if (window.location.hostname === 'localhost'
      || window.location.hostname.includes('hlx.page')
      || localStorage.getItem('analytics-disabled') === 'true') {
    // Skip analytics in development or when disabled
  } else {
    // Example: Load analytics conditionally
    // conditionalLoadScript(
    //   () => !navigator.doNotTrack,
    //   'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
    // );
  }
}

/**
 * Load social media widgets only if social content is present
 */
function loadSocialWidgets() {
  const socialElements = document.querySelectorAll('.social-widget, .twitter-embed, .facebook-embed');
  if (socialElements.length > 0) {
    // Example: Load social media scripts
    // conditionalLoadScript(
    //   () => true,
    //   'https://platform.twitter.com/widgets.js'
    // );
  }
}

/**
 * Load additional features that are not immediately necessary
 */
function loadNonCriticalFeatures() {
  loadAnalytics();
  loadSocialWidgets();

  // Check for any auth-related content that might need auth0
  const authElements = document.querySelectorAll('.login-button, .auth-form, [data-auth="true"]');
  if (authElements.length === 0) {
    // No auth elements found, but check if we're on a page that might need auth later
    const isAuthPage = window.location.pathname.includes('/login')
                      || window.location.pathname.includes('/profile')
                      || window.location.pathname.includes('/dashboard');

    if (isAuthPage) {
      // Preload auth0 for auth-related pages, but don't block anything
      import('./lazy-loader.js').then(({ loadAuth0WhenNeeded }) => {
        loadAuth0WhenNeeded().catch(() => {
          // Silently fail - auth0 will be loaded when needed
        });
      });
    }
  }
}

// Initialize delayed features
loadNonCriticalFeatures();
