import path from 'node:path';
import { defineConfig } from '@playwright/test';

/**
 * Test projects and their preview ports.
 * Each project is built and served via `vite preview` on a unique port.
 * `dir` is the project path relative to `test-projects/`.
 */
const testProjects = {
  vanilla: { port: 4200, dir: 'vite/vanilla' },
  react: { port: 4201, dir: 'vite/react' },
  vue: { port: 4202, dir: 'vite/vue' },
  preact: { port: 4203, dir: 'vite/preact' },
  solid: { port: 4204, dir: 'vite/solid' },
  ember: { port: 4205, dir: 'vite/ember' },
  'web-component': { port: 4206, dir: 'vite/web-component' },
  'rolldown-vanilla': { port: 4207, dir: 'rolldown/vanilla' },
};

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
  },
  projects: Object.entries(testProjects).map(([name, { port }]) => ({
    name,
    use: {
      baseURL: `http://localhost:${port}`,
    },
    testMatch: `${name}.spec.ts`,
  })),
  webServer: Object.entries(testProjects).map(([, { port, dir }]) => ({
    command: `pnpm vite preview --port ${port} --strictPort`,
    cwd: path.resolve(import.meta.dirname, '..', 'test-projects', dir),
    port,
    reuseExistingServer: !process.env.CI,
  })),
});
