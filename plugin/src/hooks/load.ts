import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { UnpluginBuildContext, UnpluginContext } from 'unplugin';
import type { PluginState } from '../core/state.ts';
import { parseSvgId, isSvgId } from '../core/query.ts';
import { parseSvg, hashSvg } from '../svg/parse.ts';
import { optimizeSvg } from '../svg/optimize.ts';
import { applyCurrentColor, stripDimensions, findEmbeddedRefs } from '../svg/transform.ts';
import { createSymbol, serializeSvg, serializeSvgInner } from '../svg/serialize.ts';

/**
 * Subset of Rollup's `PluginContext` that provides module resolution.
 * Not all bundlers expose this (webpack/esbuild don't via unplugin),
 * so we check for its presence at runtime.
 */
interface ResolveContext {
  resolve(source: string, importer: string): Promise<{ id: string } | null>;
}

/**
 * Returns true if the plugin context has a `resolve` method (Rollup/Vite).
 */
function hasResolve(ctx: unknown): ctx is ResolveContext {
  return (
    typeof ctx === 'object' && ctx !== null && 'resolve' in ctx && typeof (ctx as ResolveContext).resolve === 'function'
  );
}

/**
 * Creates the `load` hook function.
 *
 * When a resolved `.svg` module ID is loaded:
 *   1. Reads the SVG file from disk.
 *   2. Generates a deterministic symbol ID from the raw content hash.
 *   3. Optimizes the SVG with SVGO (inlines CSS, strips titles, etc.).
 *   4. Re-parses the optimized SVG via eksml lossless format.
 *   5. Applies transforms (currentColor, strip dimensions).
 *   6. Resolves embedded references (`<use href>`, `<image href>`) via
 *      the bundler's `this.resolve()` (Rollup/Vite only).
 *   7. For sprite mode: creates a `<symbol>` and registers it in the registry.
 *   8. For file mode: stores the optimized SVG for emission in `generateBundle`.
 *   9. Stores the `SvgModule` in plugin state for `transform` to consume.
 *  10. Returns a JS module stub with imports for any embedded refs.
 */
export function createLoadHook(
  state: PluginState,
): (this: UnpluginBuildContext & UnpluginContext, id: string) => Promise<string | null> {
  return async function load(id) {
    if (!isSvgId(id)) return null;

    const parsed = parseSvgId(id);

    // Register the file for watching so HMR picks up changes
    this.addWatchFile(parsed.filePath);

    // Read the raw SVG and hash it before any transformations
    const source = readFileSync(parsed.filePath, 'utf-8');
    const symbolId = hashSvg(source);

    // Optimize per-SVG before assembly. SVGO inlines <style> tags, strips
    // <title>, and runs preset-default. This runs in both dev and prod so
    // behavior is consistent - issues with SVGO are visible during development.
    const optimized = optimizeSvg(source, state.options.svgo);

    // Parse the (possibly optimized) SVG
    const data = parseSvg(optimized);

    // Determine whether to apply currentColor: per-SVG override > global option
    const shouldApplyCurrentColor = parsed.currentColor ?? state.options.currentColor;
    if (shouldApplyCurrentColor) {
      applyCurrentColor(data.entries);
    }

    // Strip width/height from the root <svg> so SVGs scale to their container
    stripDimensions(data.entries);

    // Resolve embedded references (<use href="other.svg">, <image href="photo.png">).
    // Only available under Rollup/Vite where `this.resolve()` exists.
    const imports: string[] = [];
    const useRefs: string[] = [];

    if (hasResolve(this)) {
      const refs = findEmbeddedRefs(data.entries);

      for (const ref of refs) {
        // Skip absolute URLs (http/https/data/etc.) — leave them untouched.
        if (/^[a-z][a-z\d+\-.]*:/i.test(ref.href)) continue;

        const resolved = await this.resolve(ref.href, parsed.filePath);
        if (!resolved?.id) continue;

        const isSvg = resolved.id.endsWith('.svg');

        // For <image> referencing an SVG, add ?file so our plugin emits it
        // as a raw file rather than turning it into a sprite symbol.
        let importPath = resolved.id;
        if (ref.tag === 'image' && isSvg) {
          importPath += importPath.includes('?') ? '&file' : '?file';
        }

        // <use> refs to SVGs in dev mode: rewrite to a local #symbolId
        // fragment. The referenced SVG will be embedded as a <symbol>
        // inside the same <svg> by the transform hook.
        if (ref.tag === 'use' && isSvg && state.isDev) {
          const refSource = readFileSync(resolved.id, 'utf-8');
          const refSymbolId = hashSvg(refSource);
          ref.attrs[ref.attr] = `#${refSymbolId}`;
          useRefs.push(importPath);
        } else {
          // Build mode and <image> refs: root-relative URL. In build mode,
          // generateBundle resolves these to final hashed asset URLs.
          ref.attrs[ref.attr] = `${state.base}${path.relative(state.root, resolved.id)}`;
        }

        // Add a JS import so the bundler processes the referenced file
        if (!imports.includes(importPath)) {
          imports.push(importPath);
        }
      }
    }

    // Resolve sprite name: per-SVG query > global default
    const spriteName = parsed.spriteName ?? state.options.defaultSprite;

    // Determine whether this sprite should be embedded in the HTML document.
    // Resolved entirely from plugin options — no per-import override.
    const { embedded } = state.options;
    const isEmbedded = embedded === true || (Array.isArray(embedded) && embedded.includes(spriteName));

    // For sprite mode, create a <symbol> and register in the registry
    if (parsed.mode === 'sprite') {
      const symbolEntry = createSymbol(symbolId, data);
      state.sprites.addSymbol(spriteName, { symbolId, entries: [symbolEntry], metadata: data }, isEmbedded);
    }

    // Serialize inner content (no root <svg>) for codegen, and full SVG for file emission.
    const svgMarkup = serializeSvgInner(data.entries);
    const svgSource = serializeSvg(data.entries);

    // Store the module for transform to consume
    state.modules.set(id, {
      id,
      symbolId,
      mode: parsed.mode,
      spriteName,
      currentColor: parsed.currentColor,
      data,
      svgMarkup,
      svgSource,
      useRefs,
    });

    // Build the JS stub. Import statements for embedded refs create module
    // graph edges so the bundler processes the referenced files.
    const importLines = imports.map((imp) => `import ${JSON.stringify(imp)};`).join('\n');
    const stub = 'export default undefined;';

    return importLines ? `${importLines}\n${stub}` : stub;
  };
}
