import type { CodegenContext } from './types.ts';
import { generateProd } from './prod.ts';
import { generateDev, generateDevSprite } from './dev.ts';
import { generateFile } from './file.ts';

/**
 * Generates the JS module code for an SVG import based on the context.
 *
 * Dispatches to the appropriate codegen function based on the import mode
 * and whether this is a dev or production build:
 *
 * - `file` mode → raw URL export (both dev and prod)
 * - `inline` mode → inline markup (both dev and prod)
 * - `sprite` + dev → symbol-based inline sprite (cross-browser `<use>` refs)
 * - `sprite` + prod → sprite placeholder (resolved in `renderChunk`)
 *
 * @param ctx The codegen context with all necessary metadata.
 * @returns   The generated JS module source code.
 */
export function generateCode(ctx: CodegenContext): string {
  if (ctx.mode === 'file') {
    return generateFile(ctx.symbolId);
  }

  if (ctx.mode === 'inline') {
    // Inline mode embeds the full SVG markup in both dev and prod.
    return generateDev(ctx.target, ctx.viewBox, ctx.width, ctx.height, ctx.svgMarkup);
  }

  if (ctx.isDev) {
    // Dev sprite mode — embed the SVG as a <symbol> with a <use> ref.
    // Referenced SVGs are also embedded as <symbol> entries so all
    // <use> references are local fragment refs (cross-browser safe).
    return generateDevSprite(
      ctx.target,
      ctx.viewBox,
      ctx.width,
      ctx.height,
      ctx.symbolMarkup,
      ctx.symbolId,
      ctx.refSymbols,
    );
  }

  // Production sprite mode — embed a placeholder that renderChunk resolves.
  return generateProd(ctx.target, ctx.symbolId, ctx.viewBox, ctx.width, ctx.height);
}
