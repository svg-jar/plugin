declare module '*.svg?sprite=shapes' {
  import type { Component, JSX, ParentProps } from 'solid-js';

  const component: Component<ParentProps<JSX.SvgSVGAttributes<SVGSVGElement>>>;
  export default component;
}
