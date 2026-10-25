import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

import { writeRoutePages } from './scripts/route-pages';

// GitHub Pages serves a project site under its repository name: /<repo>/.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'native-place';

// A page per popular route, a sitemap and robots.txt, written next to the built site.
function routePages(): Plugin {
  return {
    name: 'route-pages',
    apply: 'build',
    closeBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const count = writeRoutePages(resolve(import.meta.dirname, 'public/data'), resolve(import.meta.dirname, 'dist'), today);
      this.info(`${count} route pages`);
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_PAGES ? `/${repo}/` : '/',
  plugins: [routePages()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        methods: resolve(import.meta.dirname, 'methods.html'),
      },
    },
  },
});
