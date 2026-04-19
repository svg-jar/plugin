/**
 * This entry file is for the Vite plugin.
 *
 * @module
 */

import { SvgJarPlugin } from './index.ts';

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import svgJar from '@svg-jar/plugin/vite';
 *
 * export default defineConfig({
 *   plugins: [svgJar()],
 * })
 * ```
 */
const vite: typeof SvgJarPlugin.vite = SvgJarPlugin.vite;
export default vite;
export { vite as 'module.exports' };
