import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import svgJar from '@svg-jar/plugin/vite';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [svgJar({ target: 'preact' }), preact()],
});
