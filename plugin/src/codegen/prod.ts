import type { SvgJarTarget } from '../core/options.ts';
import { RUNTIME_PATHS, makePlaceholder } from '../core/constants.ts';

/**
 * Generates JS module code for production sprite mode.
 *
 * The generated code imports `createSvg` from the framework runtime and
 * exports a component that references a sprite symbol via a placeholder.
 * The placeholder is resolved to the final sprite URL during `renderChunk`.
 *
 * The `/*#__PURE__* /` annotation enables tree-shaking - if the component
 * is unused, the bundler eliminates it, and the symbol is excluded from
 * the sprite.
 *
 * @param target   Framework target.
 * @param symbolId Deterministic hash for the placeholder.
 * @param viewBox  The `viewBox` attribute value.
 * @param width    The `width` attribute value.
 * @param height   The `height` attribute value.
 *
 * @example
 *   generateProd('dom', 'abc123', '0 0 24 24', '24', '24')
 *   // → "import { createSvg } from '...'; export default /*#__PURE__* / createSvg(...);"
 */
export function generateProd(
  target: SvgJarTarget,
  symbolId: string,
  viewBox: string | null,
  width: string | null,
  height: string | null,
  isEmbedded = false,
): string {
  const runtimePath = RUNTIME_PATHS[target];

  // Embedded sprites are inlined in the HTML document — use a local fragment
  // reference that is stable at codegen time (no renderChunk replacement needed).
  // Non-embedded sprites use a placeholder that renderChunk replaces with the
  // final hashed sprite URL.
  const href = isEmbedded ? JSON.stringify(`#${symbolId}`) : `"${makePlaceholder(symbolId)}"`;

  return [
    `import { createSvg } from '${runtimePath}';`,
    `export default /*#__PURE__*/ createSvg(${JSON.stringify(viewBox)}, ${JSON.stringify(width)}, ${JSON.stringify(height)}, ${href});`,
  ].join('\n');
}
