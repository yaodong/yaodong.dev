// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yaodong.dev',
  // Jekyll served posts at /:title/ with a trailing slash — preserve that.
  trailingSlash: 'always',
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
