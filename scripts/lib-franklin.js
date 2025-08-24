// Image optimization for CWV
// Optimize Image Loading Strategy

function optimizeImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Add loading="lazy" for non-critical images
    if (!img.closest('[data-critical]')) {
      img.loading = 'lazy';
    }
    
    // Add fetchpriority for LCP images
    if (img.closest('[data-lcp]')) {
      img.fetchPriority = 'high';
    }
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', optimizeImages);
