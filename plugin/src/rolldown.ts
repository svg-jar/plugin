/**
 * This entry file is for the Rolldown plugin.
 *
 * @module
 */

import { SvgJarPlugin } from './index.ts';

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import svgJar from '@svg-jar/plugin/rolldown';
 *
 * export default {
 *   plugins: [svgJar()],
 * }
 * ```
 */
const rolldown: typeof SvgJarPlugin.rolldown = SvgJarPlugin.rolldown;
export default rolldown;
export { rolldown as 'module.exports' };
