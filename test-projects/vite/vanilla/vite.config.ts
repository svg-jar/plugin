import { defineConfig } from 'vite';
import svgJar from '@svg-jar/plugin/vite';

export default defineConfig({
  plugins: [svgJar({ target: 'dom' })],
});
