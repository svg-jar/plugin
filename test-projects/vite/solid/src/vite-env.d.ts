/// <reference types="@svg-jar/plugin/client/solid" />

// CSS imports (normally provided by vite/client, but we can't use it
// because it declares *.svg as string which conflicts with our types)
declare module '*.css' {
  const css: string;
  export default css;
}
