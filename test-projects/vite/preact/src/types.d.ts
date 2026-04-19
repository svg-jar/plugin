declare module '*.svg?sprite=shapes' {
  import type { FunctionComponent, JSX } from 'preact';

  const Component: FunctionComponent<JSX.SVGAttributes<SVGSVGElement>>;
  export default Component;
}
