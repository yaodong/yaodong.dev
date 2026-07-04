// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yaodong.dev',
  // Jekyll served posts at /:title/; internal links, canonical tags, sitemap and
  // feed all hardcode the trailing slash, so 'ignore' keeps those URLs while
  // letting the per-post /<slug>.md endpoints build (dynamic file-extension
  // routes can't get the trailing-slash exemption under 'always').
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: {
    // The Jekyll site did not colorize code (no Rouge token CSS); code blocks
    // are styled monochrome via `.prose pre`. Disable Shiki to match exactly.
    syntaxHighlight: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
