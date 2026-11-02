import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base keeps the built bundle portable: root hosting (Netlify) and
  // sub-path hosting both work without edits.
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: {
      // Browser QA writes screenshots and reports into the workspace. If Vite
      // watches that folder it full-reloads the page mid-playtest and destroys
      // the session, which looks exactly like a lost keypress.
      ignored: ['**/.playwright-mcp/**', '**/qa-evidence/**', '**/dist/**'],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    // Phaser is a single large engine chunk by design; keep the build log clean.
    chunkSizeWarningLimit: 1600,
    sourcemap: false,
  },
});
