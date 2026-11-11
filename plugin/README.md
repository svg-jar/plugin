<div align="center">

  <picture>
    <img alt="SvgJar" src="https://raw.githubusercontent.com/svg-jar/plugin/main/logo-banner.svg">
  </picture>

# @svg-jar/plugin

[![npm version](https://img.shields.io/npm/v/@svg-jar/plugin?style=flat-square&colorB=FFE70B)](https://www.npmjs.com/package/@svg-jar/plugin)
[![CI](https://img.shields.io/github/actions/workflow/status/svg-jar/plugin/ci.yaml?label=CI&style=flat-square)](https://github.com/svg-jar/plugin/actions/workflows/ci.yaml)
[![License](https://img.shields.io/npm/l/@svg-jar/plugin?style=flat-square)](LICENSE)

</div>

An [unplugin](https://github.com/unjs/unplugin) for importing SVGs as components. Supports sprite sheets, inline SVGs, and raw file exports across Vite, Rollup, and Rolldown (including [tsdown](https://tsdown.dev)).

## Install

```sh
pnpm add -D @svg-jar/plugin
```

## Setup

### Vite

```ts
// vite.config.ts
import svgJar from '@svg-jar/plugin/vite';

export default {
  plugins: [svgJar({ target: 'ember' })],
};
```

### Rollup

```ts
// rollup.config.ts
import svgJar from '@svg-jar/plugin/rollup';

export default {
  plugins: [svgJar({ target: 'ember' })],
};
```

### Rolldown

```ts
// rolldown.config.ts
import svgJar from '@svg-jar/plugin/rolldown';

export default {
  plugins: [svgJar({ target: 'ember' })],
};
```

### tsdown

[tsdown](https://tsdown.dev) is built on Rolldown, so it uses the Rolldown entry point. Declaration files (`dts: true`) get correctly typed exports for each SVG import.

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown';
import svgJar from '@svg-jar/plugin/rolldown';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  plugins: [svgJar({ target: 'dom', base: '/vendor/icons/' })],
});
```

> [!IMPORTANT]
> Sprite sheets are an **application-level** optimization — their benefits (app-wide symbol dedupe, per-symbol tree-shaking, a single sheet on a known origin) only exist when one build owns the whole module graph. A package built with tsdown emits sprite and `?file` assets into its own `dist/assets` with baked URLs that a consuming bundler will not copy or rewrite.
>
> Use sprite or `?file` output from tsdown only for **internal packages where the consuming app controls the deploy origin**: set the `base` option to a fixed public path, and have the app copy the package's `dist/assets` there as part of its build (see `test-projects/tsdown/internal-package`). If the consuming app's bundler handles `new URL(..., import.meta.url)` (Vite does), set `relativeUrls: true` instead, so sprite URLs do not depend on where the app is served. For publicly distributed libraries, ship raw SVG files (and let the consuming app run svg-jar itself) or export inline components (`?unsafe-inline`), which need no asset serving.

## Usage

### Sprite mode (default)

SVGs are collected into a sprite sheet and rendered via `<use href>`. The sprite file is emitted with a content-hashed filename for cache busting.

```ts
import Arrow from './icons/arrow.svg';
```

### Named sprites

Group SVGs into separate sprite sheets with the `?sprite=name` query:

```ts
import Circle from './icons/circle.svg?sprite=shapes';
```

This creates a separate `shapes-<hash>.svg` sprite file containing only the icons assigned to it.

### Inline mode

Embed the full SVG markup directly in the component. No sprite sheet, no external request.

```ts
import Square from './icons/square.svg?unsafe-inline';
```

> [!CAUTION]
> Inline SVGs are embedded in your JavaScript bundle, increasing parse time and preventing separate caching. Sprite mode (the default) is more efficient for most use cases. See [What's unsafe about inline SVGs?](#whats-unsafe-about-inline-svgs)

### File mode

Export the SVG as a raw asset URL, like any other static file:

```ts
import logoUrl from './icons/logo.svg?file';

const img = document.createElement('img');
img.src = logoUrl;
```

## Options

```ts
svgJar({
  // Framework target for component generation.
  // Default: 'dom'
  target: 'dom' | 'ember' | 'react' | 'preact' | 'vue' | 'solid' | 'web-component',

  // SVGO configuration. See "SVGO optimization" below.
  // true (default): use the baseline config
  // false: disable optimization entirely
  // object: custom SVGO config, used in place of the baseline
  svgo: true,

  // Default sprite name for bare SVG imports.
  // Default: 'sprite'
  defaultSprite: 'sprite',

  // Replace non-none fill/stroke with currentColor globally.
  // Default: false
  currentColor: false,

  // Attributes copied from the root <svg> of each source file to the <svg>
  // that the runtime renders. See "Root attributes" below.
  // Default: the list below. A list given here replaces the default list.
  rootAttributes: [
    'fill',
    'fill-opacity',
    'fill-rule',
    'stroke',
    'stroke-width',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-opacity',
    'clip-rule',
    'opacity',
    'color',
  ],

  // Sprite sheets to inline into the HTML document rather than emit as
  // external files. See "Embedded sprites" below.
  // true: embed all sprites  |  string[]: embed named sprites  |  false (default): external files
  embedded: false,

  // Base public path prepended to emitted asset URLs (sprite sheets and
  // ?file assets). Defaults to Vite's resolved `base` in Vite, '/' elsewhere.
  // Set this when the build output is served from a known non-root location,
  // e.g. an internal package whose dist/assets the consuming app copies to a
  // fixed public path. A trailing slash is added if missing.
  base: '/vendor/icons/',

  // Emit sprite URLs as `new URL('./assets/sprite-<hash>.svg', import.meta.url)`,
  // relative to the chunk, instead of prefixing them with `base`. The
  // consuming app's bundler then resolves the sprite and serves it under the
  // app's own base. Applies to sprite references in JS only. Default: false.
  relativeUrls: false,
});
```

### Per-SVG modifiers

These can be combined with any import mode:

| Query                 | Effect                                                          |
| --------------------- | --------------------------------------------------------------- |
| `?current-color`      | Replace fill/stroke with `currentColor` (opt-in per SVG)        |
| `?skip-current-color` | Preserve original colors (opt-out when global option is `true`) |

```ts
// This icon inherits color from its parent's CSS color property
import Icon from './icons/icon.svg?current-color';
```

### Root attributes

Many icon sets put presentation attributes on the root `<svg>` and leave them off the children. Heroicons outline icons look like this:

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>
</svg>
```

svg-jar does not keep the root `<svg>` of the source file. The runtime renders its own `<svg>`, and in sprite mode the children move into a `<symbol>`. So svg-jar copies the attributes in `rootAttributes` from the source root to the rendered `<svg>`, and the children inherit them as before.

Attributes you pass to the component, and CSS rules on the rendered `<svg>`, override the copied values. For example, `<ChevronUp stroke-width="2" />` or a Tailwind class like `stroke-2` gives a thicker stroke.

The default list is:

`fill`, `fill-opacity`, `fill-rule`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `stroke-miterlimit`, `stroke-dasharray`, `stroke-dashoffset`, `stroke-opacity`, `clip-rule`, `opacity`, `color`

A list in `rootAttributes` replaces the default list. It can name any attribute, such as `aria-hidden`. An empty list copies nothing.

When `currentColor` is on, the root `fill` and `stroke` are replaced in the same way as on the children.

## Targets

The `target` option controls what each SVG import exports. All targets support sprite, inline, file, and named sprite modes.

### DOM

Factory functions that create SVG DOM elements. Each call returns a new element, so the same import can be inserted multiple times. An optional options object sets attributes and creates `<title>`/`<desc>` elements for accessibility.

```ts
import Arrow from './icons/arrow.svg';

document.body.appendChild(Arrow());

document.body.appendChild(
  Arrow({
    class: 'icon',
    'aria-label': 'Navigate forward',
    title: 'Forward arrow',
    desc: 'An arrow pointing to the right',
  }),
);
```

### Ember

Glimmer components supporting `...attributes` for attribute passthrough and `{{yield}}` for block content.

```glimmer-js
import Arrow from './icons/arrow.svg';

<template>
  <Arrow class="icon" aria-hidden="true">
    <title>Forward arrow</title>
    <desc>An arrow pointing to the right</desc>
  </Arrow>
</template>
```

### React

React function components that accept all SVG props and support children for accessibility content.

```tsx
import Arrow from './icons/arrow.svg';

function App() {
  return (
    <Arrow className="icon" aria-label="Navigate forward">
      <title>Forward arrow</title>
      <desc>An arrow pointing to the right</desc>
    </Arrow>
  );
}
```

### Preact

Preact function components with the same API as React.

```tsx
import Arrow from './icons/arrow.svg';

function App() {
  return (
    <Arrow class="icon" aria-label="Navigate forward">
      <title>Forward arrow</title>
    </Arrow>
  );
}
```

### Vue

Vue render objects that accept all attributes and support the default slot for accessibility content.

```vue
<script setup>
import Arrow from './icons/arrow.svg';
</script>

<template>
  <Arrow class="icon" aria-label="Navigate forward">
    <title>Forward arrow</title>
    <desc>An arrow pointing to the right</desc>
  </Arrow>
</template>
```

### Solid

Solid components that accept all SVG attributes and support children.

```tsx
import Arrow from './icons/arrow.svg';

function App() {
  return (
    <Arrow class="icon" aria-label="Navigate forward">
      <title>Forward arrow</title>
      <desc>An arrow pointing to the right</desc>
    </Arrow>
  );
}
```

### Web Component

Custom element classes that render SVGs in the light DOM. The user registers the element with `customElements.define()`.

```ts
import SvgArrow from './icons/arrow.svg';

customElements.define('svg-arrow', SvgArrow);
```

```html
<svg-arrow>
  <title>Forward arrow</title>
  <desc>An arrow pointing to the right</desc>
</svg-arrow>
```

Child elements (`<title>`, `<desc>`) are moved inside the rendered `<svg>` on `connectedCallback`.

## TypeScript

Add the client types for your target to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@svg-jar/plugin/client/<target>"]
  }
}
```

Available client types:

| Target          | Types path                             | Default export type                |
| --------------- | -------------------------------------- | ---------------------------------- |
| `dom`           | `@svg-jar/plugin/client/dom`           | `(options?) => SVGSVGElement`      |
| `ember`         | `@svg-jar/plugin/client/ember`         | `ComponentLike<{ Element }>`       |
| `react`         | `@svg-jar/plugin/client/react`         | `FC<SVGAttributes>`                |
| `preact`        | `@svg-jar/plugin/client/preact`        | `FunctionComponent<SVGAttributes>` |
| `vue`           | `@svg-jar/plugin/client/vue`           | `Component`                        |
| `solid`         | `@svg-jar/plugin/client/solid`         | `Component<ParentProps<...>>`      |
| `web-component` | `@svg-jar/plugin/client/web-component` | `typeof HTMLElement`               |

> [!NOTE]
> If your project also uses `vite/client` types, its `*.svg` declaration (which types SVGs as `string`) may conflict with the plugin's component types.

### Typing an icon

Each target exports its component type as `SvgComponent` from `@svg-jar/plugin/types/<target>`. Use it to type a variable, prop or config field that holds an SVG import, instead of writing out the type yourself.

```ts
// sidebar.ts (Ember example)
import type { SvgComponent } from '@svg-jar/plugin/types/ember';
import UsersIcon from './icons/users.svg';

interface Section {
  title: string;
  icon: SvgComponent;
}

export const sections: Section[] = [{ title: 'Users', icon: UsersIcon }];
```

```tsx
// React example
import type { SvgComponent } from '@svg-jar/plugin/types/react';

function NavLink({ href, icon: Icon, label }: { href: string; icon: SvgComponent; label: string }) {
  return (
    <a href={href}>
      <Icon aria-hidden="true" />
      {label}
    </a>
  );
}
```

The `dom` target also exports `SvgOptions`, the options type its factory function accepts.

Importing from `@svg-jar/plugin/types/<target>` only gives you the types. The `*.svg` module declarations still come from the `client` entry in your tsconfig.

### Custom module declarations

TypeScript can't match two wildcards in a module specifier, so named sprite queries (`?sprite=name`) and combined query params (`?current-color&sprite=icons`) aren't covered by the built-in declarations. Add your own in a `.d.ts` file included by your tsconfig:

```ts
// svg.d.ts (Ember example)
declare module '*.svg?sprite=icons' {
  import type { SvgComponent } from '@svg-jar/plugin/types/ember';

  const Component: SvgComponent;
  export default Component;
}
```

For other targets, change `ember` in the import path to your target, e.g. `@svg-jar/plugin/types/react`.

The `?file` query always exports a `string` URL regardless of target, so no custom declaration is needed for combined file queries.

## How it works

### Build mode

1. **`resolveId`** <br> Intercepts `.svg` imports and parses query strings
2. **`load`** <br> Reads the SVG, optimizes with SVGO, parses via [@eksml/xml](https://github.com/evoactivity/eksml), applies transforms (currentColor, strip dimensions), reads the root attributes, resolves embedded `<use>` and `<image>` references, registers symbols in the sprite registry
3. **`transform`** <br> Generates framework-specific component code with a sprite placeholder URL
4. **`renderChunk`** <br> Replaces placeholders with final sprite URLs, tracks which symbols are actually used (tree-shaking)
5. **`generateBundle`** <br> Assembles sprite sheets from used symbols only, resolves embedded refs to final asset URLs, emits sprite and file assets

### Dev mode

In development, sprite sheets are not assembled. Each SVG is rendered as a self-contained inline sprite: the SVG content is wrapped in a `<symbol>` with a local `<use href="#id"/>` reference. Any SVGs referenced via `<use href>` are embedded as additional `<symbol>` entries in the same `<svg>`, so all references are local fragment refs that work cross-browser (Safari, Firefox, Chrome).

Inline mode (`?unsafe-inline`) embeds the raw SVG markup directly.

HMR is supported <br> Editing an SVG file triggers a hot update of all components that import it.

### SVGO optimization

SVGO runs per-SVG during the `load` phase (not on assembled sprites) to prevent CSS cross-contamination between symbols. The baseline config:

- Runs `preset-default` with ID preservation (needed for sprite symbol refs)
- Inlines `<style>` tags to prevent cross-symbol CSS leaks
- Strips `<title>` elements
- Preserves path data and numeric values for visual fidelity

Runs in both dev and prod so behaviour is consistent.

A custom `svgo` config replaces the baseline config. svg-jar does not merge them. To keep the baseline and add plugins, copy the baseline plugins from `baselineSvgoConfig`:

```ts
import { baselineSvgoConfig } from '@svg-jar/plugin';
import svgJar from '@svg-jar/plugin/vite';

svgJar({
  svgo: {
    plugins: [...baselineSvgoConfig.plugins, 'removeDimensions'],
  },
});
```

If you write a config without the baseline, keep the `cleanupIds` override from it: `{ name: 'preset-default', params: { overrides: { cleanupIds: { minify: false, remove: false } } } }`. Without it, SVGO shortens IDs in each file to names like `a` and `b`. Icons from different files then use the same IDs in one sprite sheet, and a `url(#a)` reference can point to the gradient or clip path of a different icon.

### Embedded reference resolution

SVGs containing `<use href="other.svg">` or `<image href="photo.png">` have their references resolved through the bundler's module graph:

- `<use>` refs to other SVGs become sprite symbol references
- `<image>` refs to SVGs are emitted as file assets
- `<image>` refs to non-SVG files (PNG, etc.) are handled by the bundler's native asset pipeline

In dev mode, `<use>` SVG references are embedded as local `<symbol>` entries for cross-browser compatibility.

## Embedded sprites

By default, sprite sheets are emitted as separate asset files (e.g. `sprite-abc123.svg`) and referenced via `<use href="/assets/sprite-abc123.svg#symbolId">`. This is the most efficient delivery for static icons — the sprite is cached independently and shared across pages.

However, when the sprite file is loaded as an external document, browsers impose a hard restriction: **CSS and SMIL animations defined inside `<symbol>` elements do not run**. Specifically:

- `@keyframes` rules in `<style>` tags inside a `<symbol>` are not applied to the referencing document
- SMIL animation elements (`<animate>`, `<animateMotion>`, `<animateTransform>`) inside a `<symbol>` do not execute
- `@font-face` rules inside SVG `<style>` tags are not registered in the referencing document

This is a fundamental browser security boundary, not a plugin limitation. The symbol's styles and animations live in a separate SVG document and cannot affect the page that references them via `<use href>`.

The solution is to inline the sprite sheet directly into the HTML document. When the `<svg style="display:none">` containing the symbols is part of the same document as the `<use>` elements, all styles and animations work correctly, since they share the same browsing context.

### Using the `embedded` option (Vite only)

Pass the names of any sprite sheets that should be inlined into the HTML via `transformIndexHtml`:

```ts
// vite.config.ts
import svgJar from '@svg-jar/plugin/vite';

export default {
  plugins: [
    svgJar({
      target: 'dom',
      embedded: ['animated'], // inline the 'animated' sprite, keep others external
    }),
  ],
};
```

Then import your animated SVGs into that sprite as normal:

```ts
import Spinner from './icons/spinner.svg?sprite=animated';
import Pulse from './icons/pulse.svg?sprite=animated';
```

At build time, the plugin:

1. Assembles the `animated` sprite sheet as usual
2. Emits it as a file (available for inspection and caching if needed)
3. Injects the sprite's `<svg style="display:none">` inline at the start of `<body>` in each HTML entry point
4. Generates `<use href="#symbolId">` (local fragment references) instead of `<use href="/assets/animated-hash.svg#symbolId">` (external file references)

The result is that all animations, `@keyframes`, and `@font-face` rules inside the symbols work correctly in production builds.

To embed all sprites:

```ts
svgJar({ embedded: true });
```

> [!NOTE]
> The `embedded` option only applies to Vite builds. It has no effect in Rollup or other bundlers, which do not have an HTML entry point for the plugin to transform.

> [!NOTE]
> Embedded sprites are still emitted as external files — they are additionally injected into the HTML. Dev mode is unaffected: symbols are always rendered as self-contained inline SVGs during development.

## What's unsafe about inline SVGs?

The `?unsafe-inline` query is intentionally named to make you think twice. In most cases, sprite mode (the default) is the better choice. Inline SVGs have real costs that aren't immediately obvious:

- **Larger bundles** <br> Every inline SVG adds to the JavaScript your users download and parse. SVG markup embedded in JavaScript is [significantly more expensive](https://v8.dev/blog/cost-of-javascript-2019#json) to parse than the same markup served as HTML or as an external file.
- **No separate caching** <br> SVGs bundled in JS are invalidated whenever your code changes, even if the icons haven't changed. Sprite sheets are separate files with content-hashed filenames that stay cached independently.
- **Duplicate DOM nodes** <br> If the same inline SVG is rendered multiple times on a page, each instance creates a full copy of the markup in the DOM. Sprites use `<use href>` to reference a single shared `<symbol>`, avoiding duplication.
- **Slower rendering** <br> Frameworks that use a virtual DOM (React, Vue, etc.) pay additional costs creating and diffing VDOM nodes for every element in the SVG. Sprites sidestep this entirely.

Inline SVGs make sense in rare cases <br> Complex animations that target specific SVG elements, or SVGs that need to be fully self-contained. For icons and static graphics, sprites are more efficient.

For a thorough analysis of this problem, see Cynthia Rey's [The state of SVGs on the Web](https://cynthia.dev/blog/the-state-of-svgs-on-the-web).

## Requirements

- Node.js >= 20
- Vite, Rollup, or Rolldown (including tsdown)

## Acknowledgements

- [Ivan Volti](https://github.com/ivanvolti) for creating [ember-svg-jar](https://github.com/evoactivity/ember-svg-jar), which has been the standard tool for SVGs in Ember for over 10 years, big thanks to him and everyone who has maintained it since.
- [Cynthia Rey](https://github.com/cyyynthia) for [vite-plugin-magical-svg](https://github.com/cyyynthia/vite-plugin-magical-svg), which directly inspired this plugin's approach to sprite-based SVG handling and embedded reference resolution. Her writing on [the problems with inline SVGs](https://cynthia.dev/blog/the-state-of-svgs-on-the-web) shaped the design philosophy behind the design of this plugin.

---
