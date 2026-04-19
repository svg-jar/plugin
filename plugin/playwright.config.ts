import path from 'node:path';
import { defineConfig } from '@playwright/test';

/**
 * Test projects and their preview ports.
 * Each project is built and served via `vite preview` on a unique port.
 */
const testProjects = {
  vanilla: 4200,
  react: 4201,
  vue: 4202,
  preact: 4203,
  solid: 4204,
  ember: 4205,
  'web-component': 4206,
};

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
  },
  projects: Object.entries(testProjects).map(([name, port]) => ({
    name,
    use: {
      baseURL: `http://localhost:${port}`,
    },
    testMatch: `${name}.spec.ts`,
  })),
  webServer: Object.entries(testProjects).map(([name, port]) => ({
    command: `pnpm vite preview --port ${port} --strictPort`,
    cwd: path.resolve(import.meta.dirname, '..', 'test-projects', 'vite', name),
    port,
    reuseExistingServer: !process.env.CI,
  })),
});
