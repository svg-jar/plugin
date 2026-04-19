// Type declarations for SVG imports handled by @svg-jar/plugin with the React target.
//
// Add this to your project's tsconfig.json:
//
//   {
//     "compilerOptions": {
//       "types": ["@svg-jar/plugin/client/react"]
//     }
//   }

declare module '*.svg' {
  import type { FC, SVGAttributes, ReactNode } from 'react';

  const Component: FC<SVGAttributes<SVGSVGElement> & { children?: ReactNode }>;
  export default Component;
}

declare module '*.svg?current-color' {
  import type { FC, SVGAttributes, ReactNode } from 'react';

  const Component: FC<SVGAttributes<SVGSVGElement> & { children?: ReactNode }>;
  export default Component;
}

declare module '*.svg?skip-current-color' {
  import type { FC, SVGAttributes, ReactNode } from 'react';

  const Component: FC<SVGAttributes<SVGSVGElement> & { children?: ReactNode }>;
  export default Component;
}

declare module '*.svg?unsafe-inline' {
  import type { FC, SVGAttributes, ReactNode } from 'react';

  const Component: FC<SVGAttributes<SVGSVGElement> & { children?: ReactNode }>;
  export default Component;
}

declare module '*.svg?file' {
  const url: string;
  export default url;
}
