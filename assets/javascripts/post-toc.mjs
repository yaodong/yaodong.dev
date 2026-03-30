const MIN_TOC_ITEMS = 2;
const HEADING_SELECTOR = 'h2, h3';
const ACTIVE_CLASS = 'is-active';
const DEFAULT_ACTIVATION_OFFSET = 160;
const OBSERVER_LINE_HEIGHT = 1;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function slugifyHeading(text) {
  const slug = String(text)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'section';
}

export function createHeadingRecords(headings) {
  const usedIds = new Set();

  return headings.map((heading) => {
    const baseId = heading.id && heading.id.trim() ? heading.id.trim() : slugifyHeading(heading.text);
    let id = baseId;
    let counter = 2;

    while (usedIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter += 1;
    }

    usedIds.add(id);

    return {
      level: heading.level,
      text: heading.text,
      id,
    };
  });
}

export function shouldRenderToc(entries) {
  return entries.length >= MIN_TOC_ITEMS;
}

export function renderTocList(entries, activeId = '') {
  const items = entries
    .map((entry) => {
      const activeClass = entry.id === activeId ? ' is-active' : '';
      return `<li class="post-toc-item" data-level="${entry.level}"><a class="post-toc-link${activeClass}" href="#${escapeHtml(entry.id)}" data-toc-target="${escapeHtml(entry.id)}">${escapeHtml(entry.text)}</a></li>`;
    })
    .join('');

  return `<ol class="post-toc-list">${items}</ol>`;
}

function setHidden(element, hidden) {
  if (!element) {
    return;
  }

  if (hidden) {
    element.setAttribute('hidden', '');
    element.setAttribute('aria-hidden', 'true');
    return;
  }

  element.removeAttribute('hidden');
  element.removeAttribute('aria-hidden');
}

function collectHeadingData(postContent) {
  return Array.from(postContent.querySelectorAll(HEADING_SELECTOR))
    .map((element) => ({
      element,
      level: Number(element.tagName.slice(1)),
      text: (element.textContent || '').trim(),
      id: element.id,
    }))
    .filter((heading) => heading.text);
}

function updateActiveLinks(links, activeId) {
  links.forEach((link) => {
    link.classList.toggle(ACTIVE_CLASS, link.dataset.tocTarget === activeId);
  });
}

function getActivationOffset() {
  if (typeof window === 'undefined' || typeof window.innerHeight !== 'number') {
    return DEFAULT_ACTIVATION_OFFSET;
  }

  return Math.max(0, Math.min(DEFAULT_ACTIVATION_OFFSET, window.innerHeight - 1));
}

function findActiveHeadingId(headings) {
  const activationOffset = getActivationOffset();
  let activeId = headings[0]?.id || '';

  headings.forEach((heading) => {
    if (heading.getBoundingClientRect().top <= activationOffset) {
      activeId = heading.id;
    }
  });

  return activeId;
}

function createActivationObserver(syncActiveHeading) {
  if (typeof window.IntersectionObserver !== 'function' || typeof window.innerHeight !== 'number') {
    return null;
  }

  const activationOffset = getActivationOffset();
  const bottomInset = Math.max(window.innerHeight - activationOffset - OBSERVER_LINE_HEIGHT, 0);

  return new window.IntersectionObserver(syncActiveHeading, {
    rootMargin: `-${activationOffset}px 0px -${bottomInset}px 0px`,
    threshold: 0,
  });
}

function bootPostToc() {
  if (typeof document === 'undefined') {
    return;
  }

  const postContent = document.querySelector('[data-post-content]');
  const desktopColumn = document.querySelector('[data-post-toc-desktop-column]');
  const desktopToc = document.querySelector('[data-post-toc-desktop]');
  const mobileShell = document.querySelector('[data-post-toc-mobile-shell]');
  const mobileToc = document.querySelector('[data-post-toc-mobile]');

  if (!postContent || !desktopColumn || !desktopToc || !mobileShell || !mobileToc) {
    return;
  }

  const headingData = collectHeadingData(postContent);
  const headings = createHeadingRecords(headingData);

  headingData.forEach((heading, index) => {
    heading.element.id = headings[index].id;
  });

  if (!shouldRenderToc(headings)) {
    setHidden(desktopColumn, true);
    setHidden(mobileShell, true);
    return;
  }

  const initialActiveId = headings[0].id;
  const tocMarkup = renderTocList(headings, initialActiveId);

  desktopToc.innerHTML = tocMarkup;
  mobileToc.innerHTML = tocMarkup;

  setHidden(desktopColumn, false);
  setHidden(mobileShell, false);

  const desktopLinks = Array.from(desktopToc.querySelectorAll('[data-toc-target]'));
  const mobileLinks = Array.from(mobileToc.querySelectorAll('[data-toc-target]'));
  const allLinks = [...desktopLinks, ...mobileLinks];
  const headingElements = headingData.map((heading) => heading.element);

  function setActiveHeading(activeId) {
    if (!activeId) {
      return;
    }

    updateActiveLinks(allLinks, activeId);
  }

  function syncActiveHeading() {
    setActiveHeading(findActiveHeadingId(headingElements));
  }

  setActiveHeading(initialActiveId);


  const syncAfterNavigation = () => {
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(syncActiveHeading);
      return;
    }

    syncActiveHeading();
  };

  window.addEventListener('hashchange', syncAfterNavigation);

  if (typeof window.IntersectionObserver !== 'function') {
    window.addEventListener('scroll', syncActiveHeading, { passive: true });
    window.addEventListener('resize', syncActiveHeading);
    syncAfterNavigation();
    return;
  }

  let observer = createActivationObserver(syncActiveHeading);

  headingElements.forEach((heading) => {
    observer?.observe(heading);
  });

  window.addEventListener('resize', () => {
    observer?.disconnect();
    observer = createActivationObserver(syncActiveHeading);

    headingElements.forEach((heading) => {
      observer?.observe(heading);
    });

    syncActiveHeading();
  });
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      bootPostToc();
    });
  } else {
    bootPostToc();
  }
}
