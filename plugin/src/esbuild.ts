/**
 * This entry file is for the esbuild plugin.
 *
 * @module
 */

import { SvgJarPlugin } from './index.ts';

/**
 * esbuild plugin
 *
 * @example
 * ```ts
 * import { build } from 'esbuild';
 * import svgJar from '@svg-jar/plugin/esbuild';
 *
 * build({ plugins: [svgJar()] })
 * ```
 */
const esbuild: typeof SvgJarPlugin.esbuild = SvgJarPlugin.esbuild;
export default esbuild;
export { esbuild as 'module.exports' };
