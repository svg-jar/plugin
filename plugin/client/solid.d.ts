// Type declarations for SVG imports handled by @svg-jar/plugin with the Solid target.
//
// Add this to your project's tsconfig.json:
//
//   {
//     "compilerOptions": {
//       "types": ["@svg-jar/plugin/client/solid"]
//     }
//   }

declare module '*.svg' {
  import type { Component, JSX, ParentProps } from 'solid-js';

  const component: Component<ParentProps<JSX.SvgSVGAttributes<SVGSVGElement>>>;
  export default component;
}

declare module '*.svg?current-color' {
  import type { Component, JSX, ParentProps } from 'solid-js';

  const component: Component<ParentProps<JSX.SvgSVGAttributes<SVGSVGElement>>>;
  export default component;
}

declare module '*.svg?skip-current-color' {
  import type { Component, JSX, ParentProps } from 'solid-js';

  const component: Component<ParentProps<JSX.SvgSVGAttributes<SVGSVGElement>>>;
  export default component;
}

declare module '*.svg?unsafe-inline' {
  import type { Component, JSX, ParentProps } from 'solid-js';

  const component: Component<ParentProps<JSX.SvgSVGAttributes<SVGSVGElement>>>;
  export default component;
}

declare module '*.svg?file' {
  const url: string;
  export default url;
}
