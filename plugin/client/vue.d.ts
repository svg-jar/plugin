// Type declarations for SVG imports handled by @svg-jar/plugin with the Vue target.
//
// Add this to your project's tsconfig.json:
//
//   {
//     "compilerOptions": {
//       "types": ["@svg-jar/plugin/client/vue"]
//     }
//   }

declare module '*.svg' {
  import type { Component } from 'vue';

  const component: Component;
  export default component;
}

declare module '*.svg?current-color' {
  import type { Component } from 'vue';

  const component: Component;
  export default component;
}

declare module '*.svg?skip-current-color' {
  import type { Component } from 'vue';

  const component: Component;
  export default component;
}

declare module '*.svg?unsafe-inline' {
  import type { Component } from 'vue';

  const component: Component;
  export default component;
}

declare module '*.svg?file' {
  const url: string;
  export default url;
}
