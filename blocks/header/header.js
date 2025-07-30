import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');
let auth0 = null;

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

async function updateLoginState() {
  const user = await auth0.getUser();
  const loginBtn = document.querySelector('.nav-tools a[title="Login"]');

  if (user) {
    const username = loginBtn.parentElement;
    username.textContent = `${user.nickname || user.name || user.email}`;
    username.classList.remove('button-container');
    username.classList.add('nav-user');
    loginBtn.style.display = 'block';

    const lgOutBtnP = document.createElement('p');
    lgOutBtnP.classList.add('button-container');
    lgOutBtnP.id = 'logout-button';
    const lgOutBtnA = document.createElement('a');
    lgOutBtnA.classList.add('button');
    lgOutBtnA.title = 'Logout';
    lgOutBtnA.textContent = 'Logout';
    lgOutBtnA.style.display = 'block';
    lgOutBtnA.href = '/';

    document.querySelector('.section.nav-tools > div.default-content-wrapper').append(lgOutBtnP);

    lgOutBtnP.append(lgOutBtnA);

    lgOutBtnA.addEventListener('click', async () => {
      await auth0.logout({ returnTo: window.location.origin });
    });
  } else {
    loginBtn.style.display = 'block';
    document.querySelector('#logout-button').style.display = 'none';
  }
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

async function initAuth0() {
  // Wait for Auth0 script to load (moved to delayed loading for performance)
  if (!window.auth0) {
    // Try to wait for auth0-loaded event first, fall back to polling
    await new Promise((resolve) => {
      if (window.auth0) {
        resolve();
        return;
      }

      const onAuth0Loaded = () => {
        window.removeEventListener('auth0-loaded', onAuth0Loaded);
        resolve();
      };

      window.addEventListener('auth0-loaded', onAuth0Loaded);

      // Fallback polling in case event doesn't work
      const pollForAuth0 = () => {
        if (window.auth0) {
          window.removeEventListener('auth0-loaded', onAuth0Loaded);
          resolve();
        } else {
          setTimeout(pollForAuth0, 100);
        }
      };
      setTimeout(pollForAuth0, 100);
    });
  }

  const { createAuth0Client } = window.auth0;
  auth0 = await createAuth0Client({
    domain: 'dev-moq43cn106jxt2mm.us.auth0.com',
    clientId: 'P3icLdZ89e4sdIjht9oHxFpfeeMOtMkY',
    authorizationParams: {
      redirect_uri: window.location.origin,
    },
  });

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    updateLoginState();
  } else if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    try {
      await auth0.handleRedirectCallback();
      // const user = await auth0.getUser();
      // console.log('User:', user);
      updateLoginState();
      window.history.replaceState({}, document.title, '/');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error handling redirect callback:', err);
    }
  }

  const loginBtn = document.querySelector('.nav-tools a[title="Login"]');
  // const logoutBtn = document.querySelector('.nav-tools a[title="Logout"]');

  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin,
    });
  });

  /**
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await auth0.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  });
    * */
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // SharePoint can't wrap a picture in a link, so we need to move the picture to the link
  const brandPicture = navBrand.querySelector('picture');
  if (brandPicture) {
    const brandPicLink = brandPicture.nextElementSibling;
    if (brandPicLink?.tagName === 'A' && brandPicLink.href) {
      brandPicLink.innerHTML = brandPicture.outerHTML;
      brandPicture.remove();
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  await initAuth0();
}
