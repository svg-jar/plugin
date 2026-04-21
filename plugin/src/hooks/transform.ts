import path from 'node:path';
import type { UnpluginBuildContext, UnpluginContext } from 'unplugin';
import type { PluginState } from '../core/state.ts';
import { isSvgId } from '../core/query.ts';
import { generateCode } from '../codegen/index.ts';
import { hashSvg } from '../svg/parse.ts';
import { createSymbol, serializeSvg } from '../svg/serialize.ts';

/**
 * Creates the `transform` hook function.
 *
 * Replaces the stub JS module returned by `load` with framework-specific
 * component code. Looks up the pre-built `SvgModule` from plugin state
 * and dispatches to the appropriate codegen.
 *
 * For file mode:
 *   - Dev: exports the file path relative to the project root (Vite serves it)
 *   - Build: exports a hashed filename; the file is emitted in `generateBundle`
 */
export function createTransformHook(
  state: PluginState,
): (this: UnpluginBuildContext & UnpluginContext, code: string, id: string) => string | null {
  return function transform(code, id) {
    if (!isSvgId(id)) return null;

    const svgModule = state.modules.get(id);
    if (!svgModule) return null;

    // Preserve any import preamble from `load` (embedded ref imports).
    // The preamble is everything before `export default`.
    const exportIndex = code.indexOf('export default');
    const preamble = exportIndex > 0 ? code.slice(0, exportIndex) : '';

    // File mode - export the asset URL.
    if (svgModule.mode === 'file') {
      const queryIndex = svgModule.id.indexOf('?');
      const filePath = queryIndex === -1 ? svgModule.id : svgModule.id.slice(0, queryIndex);

      if (state.isDev) {
        // Dev mode: export the file path relative to root.
        // Vite's dev server serves files directly from the filesystem.
        const relativePath = state.root ? path.relative(state.root, filePath) : filePath;
        return `${preamble}export default ${JSON.stringify(`${state.base}${relativePath}`)};`;
      }

      // Build mode: generate a hashed filename and store for generateBundle to emit.
      const baseName = path.basename(filePath, '.svg');
      const hash = hashSvg(svgModule.svgSource).slice(0, 8);
      const fileName = `assets/${baseName}-${hash}.svg`;

      state.fileAssets.set(id, { fileName, source: svgModule.svgSource });

      return `${preamble}export default ${JSON.stringify(`${state.base}${fileName}`)};`;
    }

    // Build symbol markup for dev sprite mode.
    // The symbol wraps the SVG content with an id so <use href="#id"> works.
    // Referenced SVGs are also serialized as symbols.
    let symbolMarkup = '';
    const refSymbols: string[] = [];

    if (state.isDev && svgModule.mode === 'sprite') {
      const symbolEntry = createSymbol(svgModule.symbolId, svgModule.data);
      symbolMarkup = serializeSvg([symbolEntry]);

      // Gather symbol markup for each referenced SVG
      for (const refId of svgModule.useRefs) {
        const refModule = state.modules.get(refId);
        if (!refModule) continue;

        const refSymbolEntry = createSymbol(refModule.symbolId, refModule.data);
        refSymbols.push(serializeSvg([refSymbolEntry]));
      }
    }

    // Embedded sprites use a local fragment href (#symbolId) instead of a
    // placeholder, so renderChunk never encounters them and cannot mark them
    // used. Mark them used here instead.
    const isEmbedded = state.sprites.isEmbedded(svgModule.spriteName);
    if (svgModule.mode === 'sprite' && isEmbedded) {
      state.sprites.markUsed(svgModule.symbolId);
    }

    const generated = generateCode({
      target: state.options.target,
      symbolId: svgModule.symbolId,
      viewBox: svgModule.data.viewBox,
      width: svgModule.data.width,
      height: svgModule.data.height,
      mode: svgModule.mode,
      isDev: state.isDev,
      isEmbedded,
      svgMarkup: svgModule.svgMarkup,
      symbolMarkup,
      refSymbols,
    });

    return `${preamble}${generated}`;
  };
}
