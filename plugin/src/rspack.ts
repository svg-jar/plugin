/**
 * This entry file is for the Rspack plugin.
 *
 * @module
 */

import { SvgJarPlugin } from './index.ts';

/**
 * Rspack plugin
 *
 * @example
 * ```ts
 * // rspack.config.js
 * const svgJar = require('@svg-jar/plugin/rspack');
 *
 * module.exports = {
 *   plugins: [svgJar()],
 * }
 * ```
 */
const rspack: typeof SvgJarPlugin.rspack = SvgJarPlugin.rspack;
export default rspack;
export { rspack as 'module.exports' };
