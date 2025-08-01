# Code Splitting Implementation Guide

This document explains the code splitting optimizations implemented to improve Core Web Vitals (specifically INP) performance.

## Overview

The implementation focuses on deferring or conditionally loading JavaScript that isn't immediately necessary for the initial page render, thereby reducing the main thread blocking time and improving Interaction to Next Paint (INP) metrics.

## Key Optimizations

### 1. Auth0 SPA JS Lazy Loading

**Before**: Auth0 SPA JS (~50KB) was loaded synchronously in `head.html`, blocking the main thread even when authentication wasn't needed.

**After**: Auth0 is loaded conditionally only when:
- User clicks a login button (`.login-button` or `[data-auth="true"]`)
- Page URL contains authentication callback parameters (`access_token` or `code=`)
- Page is on an authentication-related path (`/login`, `/profile`, `/dashboard`)

**Implementation**: See `scripts/lazy-loader.js` → `loadAuth0WhenNeeded()`

### 2. Enhanced Video Block Performance

**Before**: Video embedding functions were parsed and available immediately, even on pages without videos.

**After**: Video embedding functions are:
- Lazy-loaded only when the first video block is encountered
- Cached to avoid re-parsing for subsequent videos
- Loaded asynchronously to prevent blocking

**Implementation**: See `blocks/video/video.js` → `getEmbedFunctions()`

### 3. Utility-Based Lazy Loading

A comprehensive lazy loading utility system provides:

- `lazyLoadScript()` - General purpose script loader with caching
- `conditionalLoadScript()` - Predicate-based loading  
- `loadScriptOnEvent()` - Event-triggered loading
- `loadScriptOnVisible()` - Intersection Observer based loading

**Location**: `scripts/lazy-loader.js`

## Usage Examples

### Loading Auth0 Programmatically
```javascript
import { loadAuth0WhenNeeded } from './lazy-loader.js';

// Will only load if authentication indicators are present
const auth0 = await loadAuth0WhenNeeded();
```

### Adding Authentication Triggers
```html
<!-- These elements will trigger auth0 loading when clicked -->
<button class="login-button">Login</button>
<div data-auth="true">Protected Content</div>
```

### Using General Lazy Loading
```javascript
import { lazyLoadScript, conditionalLoadScript } from './lazy-loader.js';

// Load script when needed
await lazyLoadScript('https://example.com/library.js');

// Load script based on condition
await conditionalLoadScript(
  () => document.querySelector('.needs-library'),
  'https://example.com/library.js'
);
```

## Performance Impact

- **Auth0 SPA JS**: ~50KB script no longer blocks initial page load
- **Video Functions**: Reduced initial JavaScript parsing overhead
- **Conditional Loading**: Libraries only load when actually needed
- **Caching**: Prevents duplicate loading of same resources

## Browser Support

- Modern browsers with ES modules support
- IntersectionObserver API (for visibility-based loading)
- Promise support
- Graceful degradation for older browsers

## Testing

To verify the implementation:

1. **Initial Load**: Check that auth0 is not loaded on page load
2. **Conditional Loading**: Click login buttons to trigger auth0 loading
3. **Video Performance**: Observe that video functions load only when videos are present
4. **Network Tab**: Verify scripts load on-demand rather than initially

## Maintenance

When adding new features that might need lazy loading:

1. Use the utilities in `scripts/lazy-loader.js`
2. Follow the conditional loading pattern
3. Add appropriate selectors to detection logic
4. Test that libraries load when needed but not before

## Future Enhancements

Consider implementing:
- Service Worker for more advanced caching strategies
- Preloading hints for likely-needed resources
- Further granular splitting of large libraries
- Progressive enhancement patterns for critical functionality