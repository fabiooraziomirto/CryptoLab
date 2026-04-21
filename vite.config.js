import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: set `base` to your GitHub repo name so assets resolve
// correctly when served from https://<user>.github.io/<repo-name>/
// If you deploy to a user/organization site (root), use '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/cryptolab/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
