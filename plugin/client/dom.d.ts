// Type declarations for SVG imports handled by @svg-jar/plugin with the DOM target.
//
// Add this to your project's tsconfig.json:
//
//   {
//     "compilerOptions": {
//       "types": ["@svg-jar/plugin/client/dom"]
//     }
//   }

interface SvgOptions {
  /** Creates a `<title>` child element for accessibility. */
  title?: string;
  /** Creates a `<desc>` child element for accessibility. */
  desc?: string;
  /** Any other properties are set as attributes on the `<svg>` element. */
  [attr: string]: string | undefined;
}

declare module '*.svg' {
  /** Factory function that creates a new SVG DOM element on each call. */
  const component: (options?: SvgOptions) => SVGSVGElement;
  export default component;
}

declare module '*.svg?current-color' {
  const component: (options?: SvgOptions) => SVGSVGElement;
  export default component;
}

declare module '*.svg?skip-current-color' {
  const component: (options?: SvgOptions) => SVGSVGElement;
  export default component;
}

declare module '*.svg?unsafe-inline' {
  const component: (options?: SvgOptions) => SVGSVGElement;
  export default component;
}

declare module '*.svg?file' {
  const url: string;
  export default url;
}
