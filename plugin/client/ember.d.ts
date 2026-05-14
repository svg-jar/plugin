// Type declarations for SVG imports handled by @svg-jar/plugin with the Ember target.
//
// Add this to your project's tsconfig.json:
//
//   {
//     "compilerOptions": {
//       "types": ["@svg-jar/plugin/client/ember"]
//     }
//   }

declare module '*.svg' {
  import type { ComponentLike } from '@glint/template';

  const Component: ComponentLike<{
    Element: SVGSVGElement;
    Blocks: {
      default: [];
    };
  }>;
  export default Component;
}

declare module '*.svg?current-color' {
  import type { ComponentLike } from '@glint/template';

  const Component: ComponentLike<{
    Element: SVGSVGElement;
    Blocks: {
      default: [];
    };
  }>;
  export default Component;
}

declare module '*.svg?skip-current-color' {
  import type { ComponentLike } from '@glint/template';

  const Component: ComponentLike<{
    Element: SVGSVGElement;
    Blocks: {
      default: [];
    };
  }>;
  export default Component;
}

declare module '*.svg?unsafe-inline' {
  import type { ComponentLike } from '@glint/template';

  const Component: ComponentLike<{
    Element: SVGSVGElement;
    Blocks: {
      default: [];
    };
  }>;
  export default Component;
}

declare module '*.svg?file' {
  const url: string;
  export default url;
}
