// astro.config.mjs
// trust-lionel.com — Astro configuration
// All work on development branch only. Never touch main directly.

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://trust-lionel.com',
  integrations: [
    sitemap(),
  ],
  output: 'static',
});
