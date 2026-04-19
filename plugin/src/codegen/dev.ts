import type { SvgJarTarget } from '../core/options.ts';
import { RUNTIME_PATHS } from '../core/constants.ts';

/**
 * Generates JS module code for inline (`?unsafe-inline`) imports.
 *
 * The generated code imports `createSvgInline` from the framework runtime and
 * exports a component that embeds the full SVG markup. Used for inline mode
 * in both dev and prod.
 *
 * @param target    Framework target.
 * @param viewBox   The `viewBox` attribute value.
 * @param width     The `width` attribute value.
 * @param height    The `height` attribute value.
 * @param svgMarkup The full SVG markup string.
 *
 * @example
 *   generateDev('dom', '0 0 24 24', '24', '24', '<svg>...</svg>')
 *   // → "import { createSvgInline } from '...'; export default /*#__PURE__* / createSvgInline(...);"
 */
export function generateDev(
  target: SvgJarTarget,
  viewBox: string | null,
  width: string | null,
  height: string | null,
  svgMarkup: string,
): string {
  const runtimePath = RUNTIME_PATHS[target];

  return [
    `import { createSvgInline } from '${runtimePath}';`,
    `export default /*#__PURE__*/ createSvgInline(${JSON.stringify(viewBox)}, ${JSON.stringify(width)}, ${JSON.stringify(height)}, ${JSON.stringify(svgMarkup)});`,
  ].join('\n');
}

/**
 * Generates JS module code for dev mode sprite imports.
 *
 * Instead of raw SVG markup, the generated code embeds the SVG content
 * wrapped in a `<symbol>` with a `<use href="#id"/>` reference. Any SVGs
 * referenced via `<use href>` are also embedded as `<symbol>` entries,
 * so all `<use>` references are local fragment refs that work cross-browser.
 *
 * The markup is rendered inside an `<svg>` by the runtime's `createSvgInline`.
 *
 * @param target         Framework target.
 * @param viewBox        The `viewBox` attribute value.
 * @param width          The `width` attribute value.
 * @param height         The `height` attribute value.
 * @param symbolMarkup   The SVG content as a `<symbol>` element string.
 * @param symbolId       The symbol ID for the `<use href>` reference.
 * @param refSymbols     Markup for referenced `<symbol>` entries to embed.
 *
 * @example
 *   generateDevSprite('dom', '0 0 24 24', null, null, '<symbol id="a">...</symbol>', 'a', ['<symbol id="b">...</symbol>'])
 */
export function generateDevSprite(
  target: SvgJarTarget,
  viewBox: string | null,
  width: string | null,
  height: string | null,
  symbolMarkup: string,
  symbolId: string,
  refSymbols: string[],
): string {
  const runtimePath = RUNTIME_PATHS[target];

  // Build the inner content: referenced symbols first, then the main symbol, then <use>.
  // No outer <svg> wrapper — the runtime provides that.
  const inner = [...refSymbols, symbolMarkup, `<use href="#${symbolId}"/>`].join('');

  return [
    `import { createSvgInline } from '${runtimePath}';`,
    `export default /*#__PURE__*/ createSvgInline(${JSON.stringify(viewBox)}, ${JSON.stringify(width)}, ${JSON.stringify(height)}, ${JSON.stringify(inner)});`,
  ].join('\n');
}
