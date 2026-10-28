import path from 'node:path';
import MagicString from 'magic-string';
import type { PluginState } from '../core/state.ts';
import { PLACEHOLDER_RE } from '../core/constants.ts';

/**
 * Creates the `renderChunk` hook function.
 *
 * Scans rendered chunk code for `__SVG_JAR_SPRITE__<hash>__` placeholders
 * and replaces each with the final sprite URL + fragment identifier
 * (e.g. `/assets/sprite.abc123.svg#symbolId`).
 *
 * Also marks each found symbol as used in the `SpriteRegistry` so that
 * `generateBundle` can tree-shake unused symbols from the sprite files.
 *
 * With the `relativeUrls` option, the whole string literal around each
 * placeholder becomes a `new URL(..., import.meta.url)` expression that
 * points from the chunk to the sprite file.
 *
 * Note: This hook is Rollup/Vite-specific. For webpack/esbuild it is
 * currently a no-op (tree-shaking deferred).
 */
export function createRenderChunkHook(
  state: PluginState,
): (code: string, chunk?: { fileName: string }) => { code: string; map?: unknown } | null {
  return function renderChunk(code, chunk) {
    // Reset the regex lastIndex since we reuse the global regex
    PLACEHOLDER_RE.lastIndex = 0;

    if (!PLACEHOLDER_RE.test(code)) return null;

    const ms = new MagicString(code);
    PLACEHOLDER_RE.lastIndex = 0;

    let match;
    while ((match = PLACEHOLDER_RE.exec(code)) !== null) {
      const symbolId = match[1];
      state.sprites.markUsed(symbolId);

      const spriteName = state.sprites.getSpriteName(symbolId) ?? 'sprite';
      const spriteFileName = state.sprites.getSpriteFileName(spriteName);
      const start = match.index;
      const end = start + match[0].length;
      const quote = code[start - 1];

      if (state.options.relativeUrls && isQuote(quote) && code[end] === quote) {
        const chunkDir = path.posix.dirname(chunk?.fileName ?? '');
        const relative = path.posix.relative(chunkDir, `assets/${spriteFileName}`);
        const spriteUrl = relative.startsWith('.') ? relative : `./${relative}`;

        ms.overwrite(
          start - 1,
          end + 1,
          `new URL(${JSON.stringify(spriteUrl)}, import.meta.url).href + ${JSON.stringify(`#${symbolId}`)}`,
        );
        continue;
      }

      ms.overwrite(start, end, `${state.base}assets/${spriteFileName}#${symbolId}`);
    }

    return { code: ms.toString(), map: ms.generateMap({ hires: true }) };
  };
}

function isQuote(char: string | undefined): boolean {
  return char === '"' || char === "'" || char === '`';
}
