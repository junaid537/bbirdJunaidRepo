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
 * Dynamically loads block scripts only when blocks are present
 * @param {Element} main The main element to check for blocks
 */
async function loadBlockScripts(main) {
  const blocks = main.querySelectorAll('[class*="block"]');
  const loadPromises = [];

  blocks.forEach((block) => {
    const blockName = Array.from(block.classList)
      .find((cls) => cls.endsWith('-block'))
      ?.replace('-block', '');

    if (blockName && !block.dataset.scriptLoaded) {
      const scriptPath = `/blocks/${blockName}/${blockName}.js`;

      // Use intersection observer for non-critical blocks
      const loadScript = () => {
        const promise = import(scriptPath)
          .then((module) => {
            block.dataset.scriptLoaded = 'true';
            // If the block has a default export, call it with the block element
            if (module.default && typeof module.default === 'function') {
              return module.default(block);
            }
            return module;
          })
          .catch(() => {
            // Script doesn't exist, which is fine
            block.dataset.scriptLoaded = 'true';
          });
        loadPromises.push(promise);
      };

      // Load immediately for critical blocks like hero, or use intersection observer
      if (blockName === 'hero' || block.closest('.section:first-child')) {
        loadScript();
      } else {
        // Use intersection observer for below-fold blocks
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !block.dataset.scriptLoaded) {
              observer.unobserve(block);
              loadScript();
            }
          });
        }, { rootMargin: '100px' });

        observer.observe(block);
      }
    }
  });

  return Promise.all(loadPromises);
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

  // Load block scripts lazily
  loadBlockScripts(main);
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
