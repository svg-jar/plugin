<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/svg-jar/plugin/main/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/svg-jar/plugin/main/logo-light.svg">
  <img alt="SvgJar" src="https://raw.githubusercontent.com/svg-jar/plugin/main/logo-light.svg" width="300">
</picture>

<br>

[![npm version](https://img.shields.io/npm/v/@svg-jar/plugin?style=flat-square&colorB=FFE70B)](https://www.npmjs.com/package/@svg-jar/plugin)
[![CI](https://img.shields.io/github/actions/workflow/status/svg-jar/plugin/ci.yaml?label=CI&style=flat-square)](https://github.com/svg-jar/plugin/actions/workflows/ci.yaml)
[![License](https://img.shields.io/npm/l/@svg-jar/plugin?style=flat-square)](LICENSE)

# @svg-jar/plugin

</div>

An [unplugin](https://github.com/unjs/unplugin) for importing SVGs as components. Supports sprite sheets, inline SVGs, and raw file exports across Vite and Rollup.

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

  // SVGO configuration.
  // true (default): use baseline config with sensible defaults
  // false: disable optimization entirely
  // object: custom SVGO config, deep-merged with baseline
  svgo: true,

  // Default sprite name for bare SVG imports.
  // Default: 'sprite'
  defaultSprite: 'sprite',

  // Replace non-none fill/stroke with currentColor globally.
  // Default: false
  currentColor: false,
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

### Custom module declarations

TypeScript can't match two wildcards in a module specifier, so named sprite queries (`?sprite=name`) and combined query params (`?current-color&sprite=icons`) aren't covered by the built-in declarations. Add your own in a `.d.ts` file included by your tsconfig:

```ts
// svg.d.ts (React example)
declare module '*.svg?sprite=icons' {
  import type { FC, SVGAttributes, ReactNode } from 'react';

  const Component: FC<SVGAttributes<SVGSVGElement> & { children?: ReactNode }>;
  export default Component;
}
```

For the `dom` target:

```ts
declare module '*.svg?sprite=icons' {
  import type { SvgOptions } from '@svg-jar/plugin/runtime/dom';

  const component: (options?: SvgOptions) => SVGSVGElement;
  export default component;
}
```

The `?file` query always exports a `string` URL regardless of target, so no custom declaration is needed for combined file queries.

## How it works

### Build mode

1. **`resolveId`** <br> Intercepts `.svg` imports and parses query strings
2. **`load`** <br> Reads the SVG, optimizes with SVGO, parses via [@eksml/xml](https://github.com/evoactivity/eksml), applies transforms (currentColor, strip dimensions), resolves embedded `<use>` and `<image>` references, registers symbols in the sprite registry
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

### Embedded reference resolution

SVGs containing `<use href="other.svg">` or `<image href="photo.png">` have their references resolved through the bundler's module graph:

- `<use>` refs to other SVGs become sprite symbol references
- `<image>` refs to SVGs are emitted as file assets
- `<image>` refs to non-SVG files (PNG, etc.) are handled by the bundler's native asset pipeline

In dev mode, `<use>` SVG references are embedded as local `<symbol>` entries for cross-browser compatibility.

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
- Vite or Rollup

## Acknowledgements

- [Ivan Volti](https://github.com/ivanvolti) for creating [ember-svg-jar](https://github.com/evoactivity/ember-svg-jar), which has been the standard tool for SVGs in Ember for over 10 years, big thanks to him and everyone who has maintained it since.
- [Cynthia Rey](https://github.com/cyyynthia) for [vite-plugin-magical-svg](https://github.com/cyyynthia/vite-plugin-magical-svg), which directly inspired this plugin's approach to sprite-based SVG handling and embedded reference resolution. Her writing on [the problems with inline SVGs](https://cynthia.dev/blog/the-state-of-svgs-on-the-web) shaped the design philosophy behind the design of this plugin.

---

<img alt="SvgJar" src="https://raw.githubusercontent.com/svg-jar/plugin/main/logo-banner.svg">
