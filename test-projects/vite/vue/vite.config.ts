import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgJar from '@svg-jar/plugin/vite';

export default defineConfig({
  plugins: [svgJar({ target: 'vue' }), vue()],
});
