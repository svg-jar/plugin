declare module '*.svg?sprite=shapes' {
  import type { FC, SVGAttributes, ReactNode } from 'react';

  const Component: FC<SVGAttributes<SVGSVGElement> & { children?: ReactNode }>;
  export default Component;
}
