# JavaScript Minification

This project now includes automated JavaScript minification for improved Core Web Vitals performance.

## Build Commands

- `npm run build` - Minify all JavaScript files
- `npm run build:production` - Run linting + minification  
- `npm run minify:js` - Minify JavaScript only

## Performance Impact

- ~50% average compression of JavaScript files
- Expected 59ms INP improvement on desktop
- Reduced transfer and parsing times

## Key Results

- aem.js: 22,573 → 10,385 bytes (54% reduction)
- scripts.js: 4,644 → 2,646 bytes (43% reduction)
- All block files automatically minified with updated import paths

Run `npm run build:production` before deployment for optimized JavaScript.