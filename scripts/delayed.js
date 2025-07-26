// add delayed functionality here

import { buildBlock, decorateBlock, loadBlock } from './aem.js';
import createElement from './utils.js';

const preflightListener = async () => {
  const section = createElement('div');
  section.className = 'preflight-results';

  const preflightBlock = buildBlock('preflight', '');
  section.appendChild(preflightBlock);

  await decorateBlock(preflightBlock);
  await loadBlock(preflightBlock);

  const { default: getModal } = await import('../blocks/modal/modal.js');
  const modal = await getModal('SEO Check Results', () => section.innerHTML, (dlg) => {
    dlg.querySelector('button.close')?.addEventListener('click', () => dlg.close());
  });

  modal.showModal();
};

const setupPreflightListener = () => {
  const sk = document.querySelector('aem-sidekick');
  if (sk) {
    sk.addEventListener('plugin-used', (event) => {
      if (event.detail === 'preflight') {
        sk.addEventListener('custom:preflight', preflightListener, { once: true });
      }
    });
  } else {
    document.addEventListener('sidekick-ready', () => {
      const sidekick = document.querySelector('aem-sidekick');
      sidekick.addEventListener('plugin-used', (event) => {
        if (event.detail === 'preflight') {
          sidekick.addEventListener('custom:preflight', preflightListener, { once: true });
        }
      });
    }, { once: true });
  }
};

/**
 * Track core web vitals metrics for performance monitoring
 */
function trackWebVitals() {
  // Only load web vitals library if needed for performance tracking
  if (window.location.search.includes('debug=perf') || window.location.hostname.includes('localhost')) {
    // eslint-disable-next-line import/no-unresolved
    import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({
      onLCP,
      onFID,
      onCLS,
      onINP,
    }) => {
      onLCP((metric) => {
        // eslint-disable-next-line no-console
        console.log('LCP:', metric);
        // Send to analytics if available
        if (window.hlx && window.hlx.rum) {
          window.hlx.rum.sampleRUM('cwv', { lcp: metric.value });
        }
      });
      onFID((metric) => {
        // eslint-disable-next-line no-console
        console.log('FID:', metric);
        if (window.hlx && window.hlx.rum) {
          window.hlx.rum.sampleRUM('cwv', { fid: metric.value });
        }
      });
      onCLS((metric) => {
        // eslint-disable-next-line no-console
        console.log('CLS:', metric);
        if (window.hlx && window.hlx.rum) {
          window.hlx.rum.sampleRUM('cwv', { cls: metric.value });
        }
      });
      onINP((metric) => {
        // eslint-disable-next-line no-console
        console.log('INP:', metric);
        if (window.hlx && window.hlx.rum) {
          window.hlx.rum.sampleRUM('cwv', { inp: metric.value });
        }
      });
    }).catch(() => {
      // Fail silently if web vitals library can't be loaded
    });
  }
}

// Initialize delayed functionality
setupPreflightListener();
trackWebVitals();
