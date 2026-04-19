import { defineConfig } from 'vite';
import { extensions, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import svgJar from '@svg-jar/plugin/vite';

export default defineConfig({
  resolve: {
    // In a monorepo with workspace:* links, Vite follows symlinks and
    // resolves @ember/* from the plugin's real path instead of the app's
    // node_modules. preserveSymlinks prevents this.
    preserveSymlinks: true,
  },
  plugins: [
    svgJar({ target: 'ember' }),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
