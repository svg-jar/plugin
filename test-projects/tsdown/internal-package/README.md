# tsdown internal package example

Models an **internal monorepo package** built with [tsdown](https://tsdown.dev), consumed by an application the same team owns.

Sprite sheets are an application-level optimization: their benefits (app-wide symbol dedupe, per-symbol tree-shaking, a single sheet on a known origin) only exist when one build owns the whole module graph. A package built with tsdown emits its sprite and `?file` assets to its own `dist/assets/` with baked URLs, which a consuming bundler will not copy or rewrite. That is only viable when you **control the deploy origin** — i.e. an internal package whose consuming app takes on serving the assets:

1. The plugin is configured with a fixed base path (see `tsdown.config.ts`):

   ```ts
   svgJar({ target: 'dom', base: '/vendor/icons/' });
   ```

2. The consuming app copies this package's assets to that path as part of its build, e.g.:

   ```sh
   cp -r node_modules/@your-org/icons/dist/assets public/vendor/icons/assets
   ```

For a **publicly distributed library**, don't prebake sprites: ship raw SVG files (and let the consuming app run svg-jar itself), or export inline components (`?unsafe-inline`), which need no asset serving.

Declaration output (`dts: true`) works for any of these shapes — SVG re-exports get correctly typed declarations per target.
