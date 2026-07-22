import { describe, it, expect } from 'vitest';
import { generateDts } from '../../src/codegen/dts.ts';
import type { SvgJarTarget } from '../../src/core/options.ts';

const TARGETS: SvgJarTarget[] = ['dom', 'ember', 'react', 'preact', 'vue', 'solid', 'web-component'];

describe('generateDts', () => {
  it('generates a URL string declaration for file mode regardless of target', () => {
    for (const target of TARGETS) {
      expect(generateDts(target, 'file')).toMatchInlineSnapshot(`
        "declare const url: string;
        export default url;"
      `);
    }
  });

  it('generates a dom component declaration', () => {
    expect(generateDts('dom', 'component')).toMatchInlineSnapshot(`
      "import type { SvgOptions } from '@svg-jar/plugin/runtime/dom';
      declare const component: (options?: SvgOptions) => SVGSVGElement;
      export default component;"
    `);
  });

  it('generates an ember component declaration', () => {
    expect(generateDts('ember', 'component')).toMatchInlineSnapshot(`
      "import type { ComponentLike } from '@glint/template';
      declare const Component: ComponentLike<{ Element: SVGSVGElement; Blocks: { default: [] } }>;
      export default Component;"
    `);
  });

  it('generates a react component declaration', () => {
    expect(generateDts('react', 'component')).toMatchInlineSnapshot(`
      "import type { FC, SVGAttributes, ReactNode } from 'react';
      declare const Component: FC<SVGAttributes<SVGSVGElement> & { children?: ReactNode }>;
      export default Component;"
    `);
  });

  it('generates a preact component declaration', () => {
    expect(generateDts('preact', 'component')).toMatchInlineSnapshot(`
      "import type { FunctionComponent, JSX } from 'preact';
      declare const Component: FunctionComponent<JSX.SVGAttributes<SVGSVGElement>>;
      export default Component;"
    `);
  });

  it('generates a vue component declaration', () => {
    expect(generateDts('vue', 'component')).toMatchInlineSnapshot(`
      "import type { Component } from 'vue';
      declare const component: Component;
      export default component;"
    `);
  });

  it('generates a solid component declaration', () => {
    expect(generateDts('solid', 'component')).toMatchInlineSnapshot(`
      "import type { Component, JSX, ParentProps } from 'solid-js';
      declare const component: Component<ParentProps<JSX.SvgSVGAttributes<SVGSVGElement>>>;
      export default component;"
    `);
  });

  it('generates a web-component declaration', () => {
    expect(generateDts('web-component', 'component')).toMatchInlineSnapshot(`
      "declare const ElementClass: typeof HTMLElement;
      export default ElementClass;"
    `);
  });
});
