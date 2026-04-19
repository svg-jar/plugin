// Type declarations for SVG imports handled by @svg-jar/plugin with the Preact target.
//
// Add this to your project's tsconfig.json:
//
//   {
//     "compilerOptions": {
//       "types": ["@svg-jar/plugin/client/preact"]
//     }
//   }

declare module '*.svg' {
  import type { FunctionComponent, JSX } from 'preact';

  const Component: FunctionComponent<JSX.SVGAttributes<SVGSVGElement>>;
  export default Component;
}

declare module '*.svg?current-color' {
  import type { FunctionComponent, JSX } from 'preact';

  const Component: FunctionComponent<JSX.SVGAttributes<SVGSVGElement>>;
  export default Component;
}

declare module '*.svg?skip-current-color' {
  import type { FunctionComponent, JSX } from 'preact';

  const Component: FunctionComponent<JSX.SVGAttributes<SVGSVGElement>>;
  export default Component;
}

declare module '*.svg?unsafe-inline' {
  import type { FunctionComponent, JSX } from 'preact';

  const Component: FunctionComponent<JSX.SVGAttributes<SVGSVGElement>>;
  export default Component;
}

declare module '*.svg?file' {
  const url: string;
  export default url;
}
