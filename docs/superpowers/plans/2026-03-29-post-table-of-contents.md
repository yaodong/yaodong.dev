# Post Table of Contents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an automatic Table of Contents to blog post pages with a sticky desktop panel, collapsible mobile section, and active heading highlighting.

**Architecture:** Jekyll continues rendering post pages normally. A lightweight browser module at `assets/javascripts/post-toc.mjs` progressively enhances post pages by scanning `.prose` for `h2` and `h3`, generating heading IDs, and rendering shared TOC data into desktop and mobile mount points added in `_layouts/post.html`. Styling lives in `_assets/stylesheets/application.css` and is compiled into `assets/stylesheets/application.css`.

**Tech Stack:** Jekyll, Liquid layouts, vanilla ES modules, PostCSS/Tailwind CSS, Node built-in test runner (`node --test`)

**Note:** Commit steps are intentionally omitted because the repository owner asked the agent not to create git commits in this workflow.

---

## File Map

- Create: `assets/javascripts/post-toc.mjs`
  Purpose: Post-page TOC enhancement module with pure helpers, DOM bootstrapping, mobile toggle handling, and active-section tracking.
- Create: `tests/post-toc.test.mjs`
  Purpose: Node-based regression tests for slug generation, heading ID de-duplication, render threshold logic, and TOC markup generation.
- Modify: `package.json`
  Purpose: Add a dedicated `test:js` script so the TOC module can be tested without introducing a larger test framework.
- Modify: `_layouts/post.html`
  Purpose: Add desktop/mobile TOC mount points, scope the enhancement to post pages, and load the TOC module.
- Modify: `_assets/stylesheets/application.css`
  Purpose: Add TOC layout, panel, nesting, active-state, and responsive mobile/desktop styles.
- Generate: `assets/stylesheets/application.css`
  Purpose: Compiled CSS output generated from `_assets/stylesheets/application.css`.

## Task 1: Add a Small JS Test Harness and Pure TOC Helpers

**Files:**
- Modify: `package.json`
- Create: `tests/post-toc.test.mjs`
- Create: `assets/javascripts/post-toc.mjs`

- [ ] **Step 1: Add a dedicated JS test script**

Update `package.json` so the repo has a targeted TOC test entry point:

```json
{
  "scripts": {
    "build:css": "postcss _assets/stylesheets/application.css -o ./assets/stylesheets/application.css",
    "test:js": "node --test tests/post-toc.test.mjs",
    "generate:og": "bun run scripts/generate-og-image.ts",
    "generate:og:all": "for post in _posts/*.md; do bun run scripts/generate-og-image.ts \"$post\"; done"
  }
}
```

- [ ] **Step 2: Write the failing TOC helper tests**

Create `tests/post-toc.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createHeadingRecords,
  renderTocList,
  shouldRenderToc,
  slugifyHeading,
} from '../assets/javascripts/post-toc.mjs';

test('slugifyHeading normalizes punctuation and whitespace', () => {
  assert.equal(
    slugifyHeading('Constraint: shaping the output before it arrives'),
    'constraint-shaping-the-output-before-it-arrives'
  );
  assert.equal(slugifyHeading('  AI as an Ally  '), 'ai-as-an-ally');
});

test('createHeadingRecords preserves explicit ids and de-duplicates generated ids', () => {
  const records = createHeadingRecords([
    { level: 2, text: 'Intro', id: '' },
    { level: 2, text: 'Intro', id: 'intro-custom' },
    { level: 3, text: 'Intro', id: '' },
  ]);

  assert.deepEqual(records, [
    { level: 2, text: 'Intro', id: 'intro' },
    { level: 2, text: 'Intro', id: 'intro-custom' },
    { level: 3, text: 'Intro', id: 'intro-2' },
  ]);
});

test('shouldRenderToc requires at least two headings', () => {
  assert.equal(shouldRenderToc([]), false);
  assert.equal(shouldRenderToc([{ level: 2, text: 'Intro', id: 'intro' }]), false);
  assert.equal(
    shouldRenderToc([
      { level: 2, text: 'Intro', id: 'intro' },
      { level: 2, text: 'Setup', id: 'setup' },
    ]),
    true
  );
});

test('renderTocList marks nesting and the active item', () => {
  const html = renderTocList(
    [
      { level: 2, text: 'Intro', id: 'intro' },
      { level: 3, text: 'Setup', id: 'setup' },
    ],
    'setup'
  );

  assert.match(html, /data-level="2"/);
  assert.match(html, /data-level="3"/);
  assert.match(html, /href="#setup"/);
  assert.match(html, /post-toc-link is-active/);
});
```

- [ ] **Step 3: Run the tests and confirm they fail before implementation**

Run:

```bash
bun run test:js
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` because `assets/javascripts/post-toc.mjs` does not exist yet.

- [ ] **Step 4: Create the pure helper module with a no-op browser boot stub**

Create `assets/javascripts/post-toc.mjs`:

```js
const MIN_TOC_ITEMS = 2;

export function slugifyHeading(text) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

export function createHeadingRecords(headings) {
  const usedIds = new Set();

  return headings.map((heading) => {
    const explicitId = heading.id ? heading.id.trim() : '';
    const baseId = explicitId || slugifyHeading(heading.text);
    let candidate = baseId;
    let suffix = 2;

    while (usedIds.has(candidate)) {
      candidate = `${baseId}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(candidate);

    return {
      level: heading.level,
      text: heading.text,
      id: candidate,
    };
  });
}

export function shouldRenderToc(entries) {
  return entries.length >= MIN_TOC_ITEMS;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderTocList(entries, activeId = '') {
  const items = entries
    .map((entry) => {
      const activeClass = entry.id === activeId ? ' is-active' : '';

      return `
        <li class="post-toc-item" data-level="${entry.level}">
          <a class="post-toc-link${activeClass}" href="#${entry.id}" data-toc-target="${entry.id}">
            ${escapeHtml(entry.text)}
          </a>
        </li>
      `;
    })
    .join('');

  return `<ol class="post-toc-list">${items}</ol>`;
}

function bootPostToc() {
  if (typeof document === 'undefined') {
    return;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', bootPostToc);
}
```

- [ ] **Step 5: Re-run the tests and confirm the pure helpers pass**

Run:

```bash
bun run test:js
```

Expected:

```text
# tests 4
# pass 4
# fail 0
```

## Task 2: Add Post-Only TOC Mount Points to the Layout

**Files:**
- Modify: `_layouts/post.html`

- [ ] **Step 1: Build the current site and prove the layout has no TOC hooks yet**

Run:

```bash
bundle exec jekyll build
rg -n 'data-post-toc-(desktop|mobile)|post-toc\.mjs|data-post-content' _site/the-migration-of-harness/index.html
```

Expected: `bundle exec jekyll build` succeeds, then `rg` exits with status `1` because the new TOC hooks do not exist yet.

- [ ] **Step 2: Update the post layout to include desktop/mobile mount points and load the module**

Replace `_layouts/post.html` with:

```liquid
---
layout: default
---

<div class="post-shell">
  <aside class="post-toc-column" data-post-toc-desktop-column hidden aria-hidden="true">
    <div class="post-toc-panel">
      <div class="post-toc-eyebrow">Table of Contents</div>
      <nav aria-label="Table of contents" data-post-toc-desktop></nav>
    </div>
  </aside>

  <article class="content-card post-article">
    <header class="mb-8">
      <a href="{{ '/' | relative_url }}" class="back-link mb-6 inline-block">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
        <span>Back</span>
      </a>

      <h1 class="mb-4">{{ page.title }}</h1>

      <div class="meta flex flex-wrap items-center gap-3">
        <time datetime="{{ page.created_date | date: '%Y-%m-%d' }}">
          {{ page.created_date | date: "%b %d, %Y" }}
        </time>
        {% if page.updated_date %}
        <span class="text-[var(--color-border)]">·</span>
        <time datetime="{{ page.updated_date | date: '%Y-%m-%d' }}">
          Updated {{ page.updated_date | date: "%b %d, %Y" }}
        </time>
        {% endif %}
      </div>
    </header>

    {% if page.tags.size > 0 %}
    <div class="flex flex-wrap gap-2 mb-8">
      {% for tag in page.tags %}
      <a href="{{ '/tags/' | append: tag | append: '/' | relative_url }}" class="tag">
        {{ tag }}
      </a>
      {% endfor %}
    </div>
    {% endif %}

    <section class="post-toc-mobile" data-post-toc-mobile-shell hidden aria-hidden="true">
      <button type="button" class="post-toc-mobile-toggle" data-post-toc-mobile-toggle aria-expanded="false">
        <span>Table of Contents</span>
        <span class="post-toc-mobile-icon" aria-hidden="true">+</span>
      </button>
      <nav class="post-toc-mobile-panel" aria-label="Table of contents" data-post-toc-mobile hidden></nav>
    </section>

    <div class="prose prose-lg max-w-none" data-post-content>
      {{ content }}
    </div>
  </article>
</div>

<script type="module" src="{{ '/assets/javascripts/post-toc.mjs' | relative_url }}"></script>

{% if site.related_posts.size > 0 %}
<section class="mt-8 content-card">
  <h3 class="text-lg mb-6">Related Posts</h3>
  <ul class="space-y-1">
    {% for related_post in site.related_posts limit:4 %}
    <li class="post-item">
      <a href="{{ related_post.url | relative_url }}">
        {{ related_post.title }}
      </a>
      <time datetime="{{ related_post.created_date | date: '%Y-%m-%d' }}">
        {{ related_post.created_date | date: "%b %d, %Y" }}
      </time>
    </li>
    {% endfor %}
  </ul>
</section>
{% endif %}
```

- [ ] **Step 3: Rebuild and verify the new hooks appear in a generated post**

Run:

```bash
bundle exec jekyll build
rg -n 'data-post-toc-(desktop|mobile)|post-toc\.mjs|data-post-content' _site/the-migration-of-harness/index.html
```

Expected: `rg` now finds the desktop mount point, mobile mount point, script tag, and `data-post-content`.

## Task 3: Add Desktop and Mobile TOC Styles

**Files:**
- Modify: `_assets/stylesheets/application.css`
- Generate: `assets/stylesheets/application.css`

- [ ] **Step 1: Confirm the compiled CSS does not already contain TOC selectors**

Run:

```bash
rg -n 'post-shell|post-toc-panel|post-toc-mobile|post-toc-link' assets/stylesheets/application.css
```

Expected: exit status `1` because the selectors do not exist yet.

- [ ] **Step 2: Add the TOC source styles**

Append the following block to `_assets/stylesheets/application.css` after the existing post/article-related styles:

```css
/* Post TOC */
.post-shell {
  position: relative;
}

.post-article {
  min-width: 0;
}

.post-toc-column[hidden],
.post-toc-mobile[hidden],
.post-toc-mobile-panel[hidden] {
  display: none !important;
}

.post-toc-panel,
.post-toc-mobile {
  background: var(--color-bg-content);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.post-toc-panel {
  position: sticky;
  top: 6.5rem;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  padding: 0.875rem 0.875rem 1rem;
}

.post-toc-eyebrow {
  font-family: var(--font-heading);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.post-toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.post-toc-item + .post-toc-item {
  margin-top: 0.25rem;
}

.post-toc-item[data-level="3"] {
  padding-left: 0.875rem;
}

.post-toc-link {
  position: relative;
  display: block;
  padding-left: 0.875rem;
  color: var(--color-text-secondary);
  font-family: var(--font-heading);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.post-toc-link::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.42rem;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 999px;
  background: var(--color-border);
}

.post-toc-link:hover {
  color: var(--color-text);
}

.post-toc-link.is-active {
  color: var(--color-accent);
}

.post-toc-link.is-active::before {
  background: var(--color-accent);
}

.post-toc-mobile {
  margin-bottom: 1.5rem;
  padding: 0.5rem 0.75rem 0.75rem;
}

.post-toc-mobile-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-family: var(--font-heading);
  font-size: 0.875rem;
  color: var(--color-text);
  padding: 0.25rem 0;
}

.post-toc-mobile-icon {
  font-size: 1rem;
  line-height: 1;
}

.post-toc-mobile[data-open="true"] .post-toc-mobile-icon {
  transform: rotate(45deg);
}

.post-toc-mobile-panel {
  padding-top: 0.5rem;
}

@media (max-width: 1199px) {
  .post-toc-column {
    display: none !important;
  }
}

@media (min-width: 1200px) {
  .post-shell {
    display: grid;
    grid-template-columns: 13rem minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  .post-toc-column {
    display: block;
  }

  .post-toc-mobile {
    display: none !important;
  }
}
```

- [ ] **Step 3: Rebuild the compiled CSS**

Run:

```bash
bun run build:css
```

Expected: PASS and `assets/stylesheets/application.css` is regenerated without PostCSS errors.

- [ ] **Step 4: Verify the compiled CSS now contains the TOC selectors**

Run:

```bash
rg -n 'post-shell|post-toc-panel|post-toc-mobile|post-toc-link' assets/stylesheets/application.css
```

Expected: multiple matches for the new selectors.

## Task 4: Wire the Browser Module to Real Post Content

**Files:**
- Modify: `assets/javascripts/post-toc.mjs`

- [ ] **Step 1: Replace the no-op boot function with real DOM collection, rendering, toggling, and active-state logic**

Update `assets/javascripts/post-toc.mjs` to:

```js
const MIN_TOC_ITEMS = 2;
const HEADING_SELECTOR = 'h2, h3';

export function slugifyHeading(text) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

export function createHeadingRecords(headings) {
  const usedIds = new Set();

  return headings.map((heading) => {
    const explicitId = heading.id ? heading.id.trim() : '';
    const baseId = explicitId || slugifyHeading(heading.text);
    let candidate = baseId;
    let suffix = 2;

    while (usedIds.has(candidate)) {
      candidate = `${baseId}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(candidate);

    return {
      level: heading.level,
      text: heading.text,
      id: candidate,
    };
  });
}

export function shouldRenderToc(entries) {
  return entries.length >= MIN_TOC_ITEMS;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderTocList(entries, activeId = '') {
  const items = entries
    .map((entry) => {
      const activeClass = entry.id === activeId ? ' is-active' : '';

      return `
        <li class="post-toc-item" data-level="${entry.level}">
          <a class="post-toc-link${activeClass}" href="#${entry.id}" data-toc-target="${entry.id}">
            ${escapeHtml(entry.text)}
          </a>
        </li>
      `;
    })
    .join('');

  return `<ol class="post-toc-list">${items}</ol>`;
}

function collectHeadingRecords(root) {
  const headingNodes = Array.from(root.querySelectorAll(HEADING_SELECTOR))
    .map((element) => ({
      element,
      level: Number(element.tagName.slice(1)),
      text: element.textContent.trim(),
      id: element.id || '',
    }))
    .filter((heading) => heading.text.length > 0);

  const normalized = createHeadingRecords(
    headingNodes.map(({ level, text, id }) => ({ level, text, id }))
  );

  return normalized.map((record, index) => ({
    ...record,
    element: headingNodes[index].element,
  }));
}

function applyHeadingIds(records) {
  records.forEach((record) => {
    record.element.id = record.id;
  });
}

function setActiveLinks(activeId) {
  document.querySelectorAll('[data-toc-target]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.tocTarget === activeId);
  });
}

function setExpanded(shell, panel, toggle, expanded) {
  shell.dataset.open = expanded ? 'true' : 'false';
  panel.hidden = !expanded;
  toggle.setAttribute('aria-expanded', String(expanded));
}

function observeActiveHeading(records) {
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const visible = new Map();
  let currentActiveId = records[0].id;

  setActiveLinks(currentActiveId);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visible.set(entry.target.id, entry.boundingClientRect.top);
        } else {
          visible.delete(entry.target.id);
        }
      });

      if (visible.size === 0) {
        return;
      }

      const nextActiveId = Array.from(visible.entries()).sort(
        (left, right) => Math.abs(left[1]) - Math.abs(right[1])
      )[0][0];

      if (nextActiveId !== currentActiveId) {
        currentActiveId = nextActiveId;
        setActiveLinks(currentActiveId);
      }
    },
    {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 1],
    }
  );

  records.forEach((record) => observer.observe(record.element));
}

function bootPostToc() {
  if (typeof document === 'undefined') {
    return;
  }

  const postContent = document.querySelector('[data-post-content]');
  const desktopColumn = document.querySelector('[data-post-toc-desktop-column]');
  const desktopNav = document.querySelector('[data-post-toc-desktop]');
  const mobileShell = document.querySelector('[data-post-toc-mobile-shell]');
  const mobileToggle = document.querySelector('[data-post-toc-mobile-toggle]');
  const mobileNav = document.querySelector('[data-post-toc-mobile]');

  if (!postContent || !desktopColumn || !desktopNav || !mobileShell || !mobileToggle || !mobileNav) {
    return;
  }

  const records = collectHeadingRecords(postContent);

  if (!shouldRenderToc(records)) {
    return;
  }

  applyHeadingIds(records);

  desktopNav.innerHTML = renderTocList(records, records[0].id);
  mobileNav.innerHTML = renderTocList(records, records[0].id);

  desktopColumn.hidden = false;
  desktopColumn.removeAttribute('aria-hidden');
  mobileShell.hidden = false;
  mobileShell.removeAttribute('aria-hidden');

  setExpanded(mobileShell, mobileNav, mobileToggle, false);

  mobileToggle.addEventListener('click', () => {
    const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    setExpanded(mobileShell, mobileNav, mobileToggle, !expanded);
  });

  mobileNav.addEventListener('click', (event) => {
    const link = event.target.closest('[data-toc-target]');

    if (!link) {
      return;
    }

    setExpanded(mobileShell, mobileNav, mobileToggle, false);
  });

  observeActiveHeading(records);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', bootPostToc);
}
```

- [ ] **Step 2: Re-run the helper tests to catch regressions in the shared module**

Run:

```bash
bun run test:js
```

Expected:

```text
# tests 4
# pass 4
# fail 0
```

- [ ] **Step 3: Rebuild the site to verify the new module does not break Jekyll output**

Run:

```bash
bundle exec jekyll build
```

Expected: PASS with no Liquid or layout errors.

## Task 5: Perform Browser-Level Verification on a Long Post and a Short Post

**Files:**
- No new files

- [ ] **Step 1: Start the local app for manual verification**

Run:

```bash
bin/dev
```

Expected: Foreman starts both `bundle exec jekyll serve` and `bun run build:css --watch`, and the local site is available at `http://127.0.0.1:4000`.

- [ ] **Step 2: Verify the long-post happy path**

Open:

```text
http://127.0.0.1:4000/the-migration-of-harness/
```

Check:

- desktop viewport shows a left-side framed TOC panel
- the TOC remains visible while scrolling
- clicking `The interfaces are breaking` jumps to the correct heading
- scrolling through the page updates the active TOC item
- on a narrow mobile viewport, the TOC moves above the article and starts collapsed
- selecting a mobile TOC entry closes the collapsible panel

- [ ] **Step 3: Verify the low-heading fallback path**

Open:

```text
http://127.0.0.1:4000/ai-as-an-ally/
```

Check:

- no desktop TOC panel appears
- no mobile TOC block appears
- the post layout still looks normal

- [ ] **Step 4: Run the final non-browser regression commands**

Run:

```bash
bun run test:js
bun run build:css
bundle exec jekyll build
```

Expected: all commands PASS.

## Self-Review Checklist

- Spec coverage:
  - desktop left-side framed TOC: Task 2 + Task 3 + Task 5
  - mobile collapsible TOC above content: Task 2 + Task 3 + Task 4 + Task 5
  - `h2` and `h3` only: Task 1 + Task 4
  - hide when fewer than 2 headings: Task 1 + Task 4 + Task 5
  - active-section highlighting: Task 4 + Task 5
  - lightweight static-site-friendly approach: Task 1 + Task 4
- Placeholder scan:
  - no placeholder markers or vague “handle appropriately” steps remain
- Type consistency:
  - shared helper names stay consistent across tests and module code: `slugifyHeading`, `createHeadingRecords`, `shouldRenderToc`, `renderTocList`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-29-post-table-of-contents.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
