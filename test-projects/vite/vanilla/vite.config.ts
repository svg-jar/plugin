import { defineConfig } from 'vite';
import svgJar from '@svg-jar/plugin/vite';

export default defineConfig({
  plugins: [svgJar({ target: 'dom', embedded: ['animated', 'fonts'] })],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        animations: 'animations.html',
      },
    },
  },
});
