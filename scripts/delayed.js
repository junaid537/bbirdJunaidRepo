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

// Initialize delayed functionality
setupPreflightListener();
