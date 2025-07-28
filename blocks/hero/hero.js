import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const picture = block.querySelector('picture');

  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      // Hero images are typically LCP candidates, so use eager loading and high priority
      const breakpoints = [
        { media: '(min-width: 1200px)', width: '1600' },
        { media: '(min-width: 900px)', width: '1200' },
        { width: '750' },
      ];
      const optimizedPicture = createOptimizedPicture(
        img.src,
        img.alt,
        true, // eager loading for hero
        breakpoints,
        'high', // high fetchpriority for LCP
      );
      picture.replaceWith(optimizedPicture);
    }
  }
}
