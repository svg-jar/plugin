import { defineConfig } from 'rolldown';
import svgJar from '@svg-jar/plugin/rolldown';

// Rolldown as the application bundler: one build owns the whole module
// graph, so sprite assembly works exactly like the Vite apps.
export default defineConfig({
  input: 'src/main.ts',
  plugins: [svgJar({ target: 'dom' })],
  output: {
    dir: 'dist',
    // Match the Vite apps' layout: JS chunks live in dist/assets/ alongside
    // the emitted sprite and file assets.
    entryFileNames: 'assets/[name].js',
    chunkFileNames: 'assets/[name]-[hash].js',
  },
});
