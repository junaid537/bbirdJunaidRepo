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

import createElement from './utils.js';
import { loadAuth0WhenNeeded } from './lazy-loader.js';

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
 * Setup authentication features when needed
 * This implements conditional loading for auth0-spa-js
 */
const setupAuthenticationFeatures = () => {
  // Set up event listeners for authentication triggers
  document.addEventListener('click', async (event) => {
    const target = event.target.closest('.login-button, [data-auth="true"]');
    if (target) {
      event.preventDefault();
      try {
        await loadAuth0WhenNeeded();
        // Re-dispatch the click event after auth0 is loaded
        target.click();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load authentication library:', error);
      }
    }
  });

  // Check URL for auth callback parameters and load auth0 if needed
  if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
    loadAuth0WhenNeeded().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load authentication library for callback:', error);
    });
  }
};

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
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
    decorateMain(main);
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

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  setupPreflightListener();
  setupAuthenticationFeatures();
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
