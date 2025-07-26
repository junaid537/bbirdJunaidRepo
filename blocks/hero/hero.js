/**
 * Decorates the hero block to optimize LCP performance.
 * Sets loading="eager" and fetchpriority="high" for hero images.
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // Find the first image in the hero block (LCP candidate)
  const img = block.querySelector('img');

  if (img) {
    // Set loading to eager for immediate loading
    img.setAttribute('loading', 'eager');

    // Set fetch priority to high for LCP optimization
    img.setAttribute('fetchpriority', 'high');
  }

  // Also optimize any picture elements
  const pictures = block.querySelectorAll('picture');
  pictures.forEach((picture) => {
    const pictureImg = picture.querySelector('img');
    if (pictureImg) {
      pictureImg.setAttribute('loading', 'eager');
      pictureImg.setAttribute('fetchpriority', 'high');
    }
  });
}
