import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgJar from '@svg-jar/plugin/vite';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [svgJar({ target: 'react' }), react()],
});
