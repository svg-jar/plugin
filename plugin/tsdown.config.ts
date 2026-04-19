import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/*.ts'],
    format: 'esm',
    platform: 'neutral',
    deps: { neverBundle: [/^node:/] },
    dts: true,
    clean: true,
    outDir: 'dist',
  },
  {
    entry: ['runtime/*.ts'],
    format: 'esm',
    platform: 'neutral',
    deps: {
      neverBundle: ['@ember/template-compiler', 'react', 'preact', 'preact/hooks', 'vue', 'solid-js', 'solid-js/web'],
    },
    dts: true,
    outDir: 'dist/runtime',
  },
]);
