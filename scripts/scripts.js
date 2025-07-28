import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  loadBlock,
  decorateBlock,
} from './aem.js';

import createElement, { executeWhenIdle, executeOnNextFrame } from './utils.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

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
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export async function decorateMain(main) {
  // Critical path - execute immediately for LCP
  decorateButtons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);

  // Non-critical decorations - defer to idle time to improve INP
  executeWhenIdle(() => {
    decorateIcons(main);
  });
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    await decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // Defer header and footer loading to idle time to improve INP
  executeWhenIdle(() => {
    loadHeader(doc.querySelector('header'));
  });

  executeWhenIdle(() => {
    loadFooter(doc.querySelector('footer'));
  });

  // Defer CSS loading to next frame to avoid blocking
  executeOnNextFrame(() => {
    loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  });

  // Defer font loading to idle time
  executeWhenIdle(() => {
    loadFonts();
  });

  // Defer preflight setup to idle time as it's non-critical
  executeWhenIdle(() => {
    setupPreflightListener();
  });
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
