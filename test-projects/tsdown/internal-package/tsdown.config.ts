import { defineConfig } from 'tsdown';
import svgJar from '@svg-jar/plugin/rolldown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'browser',
  dts: true,
  plugins: [
    svgJar({
      target: 'dom',
      // The consuming app copies this package's dist/assets/ directory to
      // public/vendor/icons/assets/, so emitted asset URLs resolve at runtime.
      base: '/vendor/icons/',
    }),
  ],
});
