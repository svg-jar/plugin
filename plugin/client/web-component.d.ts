// Type declarations for SVG imports handled by @svg-jar/plugin with the web-component target.
//
// Add this to your project's tsconfig.json:
//
//   {
//     "compilerOptions": {
//       "types": ["@svg-jar/plugin/client/web-component"]
//     }
//   }

declare module '*.svg' {
  /** Custom element class to register with customElements.define(). */
  const ElementClass: typeof HTMLElement;
  export default ElementClass;
}

declare module '*.svg?current-color' {
  const ElementClass: typeof HTMLElement;
  export default ElementClass;
}

declare module '*.svg?skip-current-color' {
  const ElementClass: typeof HTMLElement;
  export default ElementClass;
}

declare module '*.svg?unsafe-inline' {
  const ElementClass: typeof HTMLElement;
  export default ElementClass;
}

declare module '*.svg?file' {
  const url: string;
  export default url;
}
