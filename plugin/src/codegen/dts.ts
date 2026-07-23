import type { SvgJarTarget } from '../core/options.ts';
import type { SvgDtsKind } from '../core/query.ts';

/**
 * Declaration code for component-shaped SVG imports, per target.
 *
 * These mirror the ambient declarations in `client/*.d.ts`, but as real
 * module declarations so declaration bundlers (rolldown-plugin-dts, used
 * by tsdown) can emit correct types for libraries that re-export SVG
 * components.
 */
const COMPONENT_DTS: Record<SvgJarTarget, string> = {
  dom: [
    `import type { SvgOptions } from '@svg-jar/plugin/runtime/dom';`,
    `declare const component: (options?: SvgOptions) => SVGSVGElement;`,
    `export default component;`,
  ].join('\n'),

  ember: [
    `import type { ComponentLike } from '@glint/template';`,
    `declare const Component: ComponentLike<{ Element: SVGSVGElement; Blocks: { default: [] } }>;`,
    `export default Component;`,
  ].join('\n'),

  react: [
    `import type { FC, SVGAttributes, ReactNode } from 'react';`,
    `declare const Component: FC<SVGAttributes<SVGSVGElement> & { children?: ReactNode }>;`,
    `export default Component;`,
  ].join('\n'),

  preact: [
    `import type { FunctionComponent, JSX } from 'preact';`,
    `declare const Component: FunctionComponent<JSX.SVGAttributes<SVGSVGElement>>;`,
    `export default Component;`,
  ].join('\n'),

  vue: [
    `import type { Component } from 'vue';`,
    `declare const component: Component;`,
    `export default component;`,
  ].join('\n'),

  solid: [
    `import type { Component, JSX, ParentProps } from 'solid-js';`,
    `declare const component: Component<ParentProps<JSX.SvgSVGAttributes<SVGSVGElement>>>;`,
    `export default component;`,
  ].join('\n'),

  'web-component': [`declare const ElementClass: typeof HTMLElement;`, `export default ElementClass;`].join('\n'),
};

/** Declaration code for `?file` imports - a plain URL string. */
const FILE_DTS = [`declare const url: string;`, `export default url;`].join('\n');

/**
 * Generates declaration (`.d.ts`) code for a virtual SVG declaration
 * module. Served by the `load` hook when a declaration bundler resolves
 * an SVG import from a `.d.ts` module.
 *
 * @param target Framework target from plugin options.
 * @param kind   `'component'` for sprite/inline imports, `'file'` for `?file`.
 */
export function generateDts(target: SvgJarTarget, kind: SvgDtsKind): string {
  return kind === 'file' ? FILE_DTS : COMPONENT_DTS[target];
}
