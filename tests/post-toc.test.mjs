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
    'constraint-shaping-the-output-before-it-arrives',
  );
  assert.equal(slugifyHeading('  AI as an Ally  '), 'ai-as-an-ally');
});

test('createHeadingRecords preserves explicit ids and de-duplicates generated ids', () => {
  assert.deepEqual(
    createHeadingRecords([
      { level: 2, text: 'Intro', id: '' },
      { level: 2, text: 'Intro', id: 'intro-custom' },
      { level: 3, text: 'Intro', id: '' },
    ]),
    [
      { level: 2, text: 'Intro', id: 'intro' },
      { level: 2, text: 'Intro', id: 'intro-custom' },
      { level: 3, text: 'Intro', id: 'intro-2' },
    ],
  );
});

test('createHeadingRecords keeps explicit ids unique when they collide with generated ids', () => {
  assert.deepEqual(
    createHeadingRecords([
      { level: 2, text: 'Intro', id: '' },
      { level: 2, text: 'Intro', id: 'intro' },
      { level: 3, text: 'Intro', id: '' },
    ]),
    [
      { level: 2, text: 'Intro', id: 'intro' },
      { level: 2, text: 'Intro', id: 'intro-2' },
      { level: 3, text: 'Intro', id: 'intro-3' },
    ],
  );
});

test('shouldRenderToc requires at least two headings', () => {
  assert.equal(shouldRenderToc([]), false);
  assert.equal(
    shouldRenderToc([{ level: 2, text: 'Intro', id: 'intro' }]),
    false,
  );
  assert.equal(
    shouldRenderToc([
      { level: 2, text: 'Intro', id: 'intro' },
      { level: 2, text: 'Setup', id: 'setup' },
    ]),
    true,
  );
});

test('renderTocList marks nesting and the active item', () => {
  const html = renderTocList(
    [
      { level: 2, text: 'Intro <script>', id: 'intro & 1' },
      { level: 3, text: 'Setup', id: 'setup' },
    ],
    'intro & 1',
  );

  assert.match(html, /^<ol class="post-toc-list">/);
  assert.match(html, /data-level="2"/);
  assert.match(html, /data-level="3"/);
  assert.match(html, /href="#intro &amp; 1"/);
  assert.match(html, /data-toc-target="intro &amp; 1"/);
  assert.match(html, /<a class="post-toc-link is-active" href="#intro &amp; 1" data-toc-target="intro &amp; 1">Intro &lt;script&gt;<\/a>/);
});
