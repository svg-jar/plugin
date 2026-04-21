import type { PluginState } from '../core/state.ts';

/**
 * Creates the Vite `transformIndexHtml` hook function.
 *
 * For each sprite marked as embedded, reads the assembled sprite XML from
 * the Rollup output bundle (which is available as `ctx.bundle` during build)
 * and injects it inline at the start of `<body>`. This keeps the symbols in
 * the same document as the referencing `<use>` elements, which is required for:
 *
 * - CSS animations (`@keyframes` defined in `<style>` inside the symbol)
 * - SMIL animations (`<animate>`, `<animateMotion>`, `<animateTransform>`)
 * - `@font-face` rules inside SVG `<style>` tags
 *
 * The sprite XML is read directly from the bundle object — no disk I/O needed,
 * and no ordering dependency beyond generateBundle running first (which Vite
 * guarantees).
 */
export function createTransformHtmlHook(
  state: PluginState,
): (html: string, ctx: { bundle?: Record<string, { type: string; source?: string | Uint8Array }> }) => string {
  return function transformIndexHtml(html, ctx) {
    if (!ctx.bundle) return html;

    const snippets: string[] = [];

    for (const spriteName of state.sprites.getSpriteNames()) {
      if (!state.sprites.isEmbedded(spriteName)) continue;
      if (state.sprites.getUsedSymbols(spriteName).length === 0) continue;

      const fileName = `assets/${state.sprites.getSpriteFileName(spriteName)}`;
      const asset = ctx.bundle[fileName];

      if (asset?.type === 'asset' && typeof asset.source === 'string') {
        snippets.push(asset.source);
      }
    }

    if (snippets.length === 0) return html;

    const injection = snippets.join('\n');
    return html.replace('<body>', `<body>\n${injection}`);
  };
}
