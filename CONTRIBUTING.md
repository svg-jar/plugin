# Contributing to @svg-jar/plugin

## Requirements

- Node.js >= 20
- pnpm >= 10
- Playwright (for E2E tests — installed separately, see below)

## Setup

```sh
git clone https://github.com/svg-jar/plugin
cd plugin
pnpm install
```

## Development

Run these from the `plugin/` package directory:

```sh
# Build the plugin
pnpm --filter @svg-jar/plugin build

# Build in watch mode
pnpm --filter @svg-jar/plugin dev

# Type-check
pnpm --filter @svg-jar/plugin typecheck

# Lint
pnpm --filter @svg-jar/plugin lint

# Format
pnpm --filter @svg-jar/plugin format
```

## Project structure

```
plugin/                     Publishable @svg-jar/plugin package
├── src/
│   ├── index.ts            Main unplugin factory
│   ├── vite.ts             Vite entry
│   ├── rollup.ts           Rollup entry
│   ├── rolldown.ts         Rolldown entry
│   ├── esbuild.ts          esbuild entry
│   ├── webpack.ts          Webpack entry
│   ├── rspack.ts           Rspack entry
│   ├── core/               Option resolution, state, sprite registry
│   ├── codegen/            Framework-specific component code generation
│   ├── hooks/              Unplugin hook implementations
│   └── svg/                SVG parsing, optimization, serialization
├── runtime/                Framework runtime modules (dom, react, vue, etc.)
├── client/                 Type-only ambient declarations for SVG imports
└── dist/                   Build output (gitignored)

test-projects/vite/         One Vite app per supported framework target
├── ember/
├── preact/
├── react/
├── solid/
├── vanilla/
├── vue/
└── web-component/
```

## Tests

### Unit tests

Unit tests use [Vitest](https://vitest.dev) and cover individual modules in `src/`.

```sh
pnpm --filter @svg-jar/plugin test:unit
```

### Integration tests

A Rollup integration test builds a minimal bundle and asserts the output.

```sh
pnpm --filter @svg-jar/plugin test:unit   # includes integration/
```

### E2E tests

E2E tests use [Playwright](https://playwright.dev). They build each framework test project and take visual screenshots, compared against committed baselines.

```sh
# Install Playwright browsers (first time only)
pnpm --filter @svg-jar/plugin exec playwright install chromium

# Build the plugin and all test projects, then run E2E tests
pnpm --filter @svg-jar/plugin build:test-projects
pnpm --filter @svg-jar/plugin test:e2e
```

To update visual baselines after an intentional rendering change:

```sh
pnpm --filter @svg-jar/plugin test:e2e --update-snapshots
```

Baseline PNGs are committed to the repo under `plugin/test/e2e/`. The CI workflow also supports updating them via a manual `workflow_dispatch` trigger with the `update-baselines` input set to `true`.

## Adding a new framework target

1. Add a runtime module at `runtime/<target>.ts`
2. Add the corresponding client type declaration at `client/<target>.d.ts`
3. Add the `./runtime/<target>` and `./client/<target>` entries to `exports` in `package.json`
4. Add the target to the `SvgJarTarget` union in `src/core/options.ts`
5. Add codegen logic in `src/codegen/`
6. Add a test project under `test-projects/vite/<target>/`
7. Add an E2E spec under `plugin/test/e2e/`

## Submitting changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Ensure `pnpm --filter @svg-jar/plugin test:unit`, `pnpm --filter @svg-jar/plugin lint`, and `pnpm --filter @svg-jar/plugin typecheck` all pass
4. Open a pull request against `main`

CI runs lint, unit tests across Node 20, 22, 24, and 25, E2E tests on Node 22, and a build check.
