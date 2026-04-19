/**
 * This entry file is for the Webpack plugin.
 *
 * @module
 */

import { SvgJarPlugin } from './index.ts';

/**
 * Webpack plugin
 *
 * @example
 * ```ts
 * // webpack.config.js
 * const svgJar = require('@svg-jar/plugin/webpack');
 *
 * module.exports = {
 *   plugins: [svgJar()],
 * }
 * ```
 */
const webpack: typeof SvgJarPlugin.webpack = SvgJarPlugin.webpack;
export default webpack;
export { webpack as 'module.exports' };
