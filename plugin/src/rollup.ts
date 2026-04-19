/**
 * This entry file is for the Rollup plugin.
 *
 * @module
 */

import { SvgJarPlugin } from './index.ts';

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import svgJar from '@svg-jar/plugin/rollup';
 *
 * export default {
 *   plugins: [svgJar()],
 * }
 * ```
 */
const rollup: typeof SvgJarPlugin.rollup = SvgJarPlugin.rollup;
export default rollup;
export { rollup as 'module.exports' };
