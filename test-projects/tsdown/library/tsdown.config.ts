import { defineConfig } from 'tsdown';
import svgJar from '@svg-jar/plugin/rolldown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'browser',
  dts: true,
  plugins: [svgJar({ target: 'dom' })],
});
