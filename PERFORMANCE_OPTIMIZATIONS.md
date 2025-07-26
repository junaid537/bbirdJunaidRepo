# Core Web Vitals Performance Optimizations

This document outlines the code splitting and tree shaking optimizations implemented to improve LCP and INP performance, particularly on mobile devices.

## Optimizations Summary

### 1. Dynamic Auth0 Loading
- **Before**: 13KB Auth0 library loaded in head.html for all pages
- **After**: Auth0 loads dynamically only when header block is used
- **Impact**: Reduces initial bundle size by ~13KB

### 2. Intersection Observer Lazy Loading  
- **Implementation**: `scripts/lazy-loading.js`
- **Features**:
  - Below-the-fold blocks load when entering viewport
  - Heavy blocks (video, preflight) use stricter thresholds
  - Fallback for browsers without IntersectionObserver support

### 3. Delayed Non-Critical Features
- **Moved to delayed.js**: Preflight functionality, Web vitals tracking
- **Load timing**: After 3 seconds to avoid blocking critical rendering
- **Debug mode**: Web vitals tracking available with `?debug=perf`

### 4. Optimized Resource Loading
- **Header/Footer**: Load using `requestIdleCallback` for better performance
- **Fonts**: Session storage prevents duplicate font loading
- **Critical Resources**: Preloaded using `<link rel="modulepreload">`

## Usage

### Adding New Heavy Blocks
To mark a block as "heavy" for aggressive lazy loading:

```javascript
// In scripts/lazy-loading.js
const heavyBlocks = ['video', 'preflight', 'your-new-heavy-block'];
```

### Performance Monitoring
Enable web vitals tracking in development:
```
https://your-site.com/?debug=perf
```

### Resource Preloading
Add critical resources to preload:
```javascript
preloadResources([
  '/blocks/your-block/your-block.js',
  '/styles/critical.css'
]);
```

## Performance Gains

- **Bundle Size**: Reduced initial JavaScript by ~15KB+
- **LCP**: Faster due to smaller initial bundle and prioritized loading
- **INP**: Improved through reduced JavaScript parsing on initial load
- **Mobile**: Optimized thresholds for mobile viewport behavior

## Browser Support

- **Modern browsers**: Full IntersectionObserver and requestIdleCallback support
- **Legacy browsers**: Graceful fallbacks with setTimeout delays
- **All browsers**: Core functionality preserved

## Monitoring

Performance improvements can be monitored through:
1. Browser DevTools Performance tab
2. Web Vitals extension
3. Real User Monitoring (RUM) data
4. Debug mode console logs

The optimizations maintain backward compatibility while significantly improving Core Web Vitals scores, especially on mobile devices.