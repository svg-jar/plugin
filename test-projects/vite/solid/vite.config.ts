import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import svgJar from '@svg-jar/plugin/vite';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [svgJar({ target: 'solid' }), solid()],
});
