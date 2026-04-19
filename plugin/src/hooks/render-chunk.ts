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
 * Note: This hook is Rollup/Vite-specific. For webpack/esbuild it is
 * currently a no-op (tree-shaking deferred).
 */
export function createRenderChunkHook(state: PluginState): (code: string) => { code: string; map?: unknown } | null {
  return function renderChunk(code) {
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
      const spriteUrl = `${state.base}assets/${spriteFileName}#${symbolId}`;

      ms.overwrite(match.index, match.index + match[0].length, spriteUrl);
    }

    return { code: ms.toString(), map: ms.generateMap({ hires: true }) };
  };
}
