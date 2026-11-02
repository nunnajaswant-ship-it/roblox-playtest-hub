import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: {
      // Browser QA writes screenshots into the workspace. Watching that folder
      // full-reloads the page mid-session and looks like a lost click.
      ignored: ['**/.playwright-mcp/**', '**/qa-evidence/**']
    }
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true
  },
  build: {
    target: 'es2022',
    sourcemap: false
  }
});
