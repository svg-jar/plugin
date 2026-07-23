// An internal package in a monorepo, built with tsdown and consumed by an
// app the same team owns. The app copies dist/assets/ to a fixed public
// path matching the `base` plugin option (see tsdown.config.ts and README).

import Arrow from './icons/arrow.svg';

/**
 * A button that renders a sprite icon internally. The sprite sheet is
 * emitted to dist/assets/ and served by the consuming app from the
 * configured base path.
 */
export function createNextButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.append(label, Arrow({ 'aria-hidden': 'true' }));
  return button;
}

// Inline components are safe to re-export from any package - the markup is
// embedded in the JS, no asset serving required.
export { default as Square } from './icons/square.svg?unsafe-inline';

// File mode works here because the app serves dist/assets/ from the base path.
export { default as starUrl } from './icons/star.svg?file';
