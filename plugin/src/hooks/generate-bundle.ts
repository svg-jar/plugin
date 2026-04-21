import path from 'node:path';
import type { PluginState } from '../core/state.ts';
import { assembleSprite } from '../svg/serialize.ts';
import { findEmbeddedRefs } from '../svg/transform.ts';

/**
 * Subset of Rollup's plugin context used in generateBundle.
 */
interface GenerateBundleContext {
  emitFile(file: { type: 'asset'; fileName: string; source: string }): string;
}

/**
 * An entry in the output bundle (asset or chunk).
 */
interface BundleEntry {
  type: 'asset' | 'chunk';
  fileName: string;
}

/**
 * The output bundle map passed as the second argument to `generateBundle`.
 */
interface OutputBundle {
  [fileName: string]: BundleEntry;
}

/**
 * Finds an emitted asset in the output bundle whose fileName matches
 * the basename of the given resolved path. Used to locate assets emitted
 * by Vite's native asset handling (PNGs, etc.) or other plugins.
 *
 * @returns The asset URL (e.g. `"/assets/placeholder-abc123.png"`) or `null`.
 */
function findEmittedAssetUrl(bundle: OutputBundle, resolvedPath: string, base: string): string | null {
  const ext = path.extname(resolvedPath);
  const stem = path.basename(resolvedPath, ext);

  for (const entry of Object.values(bundle)) {
    if (entry.type !== 'asset') continue;
    if (entry.fileName.includes(stem) && entry.fileName.endsWith(ext)) {
      return `${base}${entry.fileName}`;
    }
  }

  return null;
}

/**
 * Rewrites embedded references inside symbol entries to their final
 * asset URLs before the sprite is serialized.
 *
 * - `<use href="/abs/path/icon.svg">` → sprite URL with `#symbolId` fragment
 * - `<image href="/abs/path/icon.svg?file">` → file asset URL
 * - `<image href="/abs/path/photo.png">` → emitted asset URL from the bundle
 */
/**
 * Converts a root-relative href (e.g. `/src/icons/arrow.svg`) written
 * into the lossless entries during `load` back to an absolute module ID
 * for looking up in plugin state.
 */
function hrefToModuleId(href: string, base: string, root: string): string {
  const relative = href.startsWith(base) ? href.slice(base.length) : href;
  return path.resolve(root, relative);
}

/**
 * Rewrites embedded references inside symbol entries to their final
 * asset URLs before the sprite is serialized.
 *
 * During `load`, hrefs were rewritten to root-relative URLs (e.g.
 * `/src/icons/arrow.svg`). This function resolves them back to absolute
 * module IDs via `state.root`, then looks up the final asset URLs.
 *
 * - `<use>` refs → sprite URL with `#symbolId` fragment
 * - `<image>` SVG refs with `?file` → emitted file asset URL
 * - `<image>` non-SVG refs → emitted asset URL from the output bundle
 */
function resolveRefsToFinalUrls(
  state: PluginState,
  bundle: OutputBundle,
  entries: import('@eksml/xml/lossless').LosslessEntry[],
): void {
  const refs = findEmbeddedRefs(entries);

  for (const ref of refs) {
    const href = ref.href;

    // Skip absolute URLs — they were left untouched by the load hook and
    // should remain as-is in the final sprite output.
    if (/^[a-z][a-z\d+\-.]*:/i.test(href)) continue;

    const moduleId = hrefToModuleId(href, state.base, state.root);

    // <use> refs: the referenced SVG is a sprite symbol.
    if (ref.tag === 'use') {
      const mod = state.modules.get(moduleId);
      if (!mod) continue;

      const targetSpriteName = state.sprites.getSpriteName(mod.symbolId);
      if (!targetSpriteName) continue;

      const spriteFileName = state.sprites.getSpriteFileName(targetSpriteName);
      ref.attrs[ref.attr] = `${state.base}assets/${spriteFileName}#${mod.symbolId}`;
      continue;
    }

    // <image> refs to SVGs emitted as file assets via ?file.
    // The fileAssets key includes the ?file query, so try both.
    const fileKey = moduleId.endsWith('.svg') ? `${moduleId}?file` : moduleId;
    if (ref.tag === 'image' && state.fileAssets.has(fileKey)) {
      const fileAsset = state.fileAssets.get(fileKey)!;
      ref.attrs[ref.attr] = `${state.base}${fileAsset.fileName}`;
      continue;
    }

    // <image> refs to non-SVG files (PNG, JPEG, etc.): look up the
    // emitted asset in the output bundle by matching on filename.
    if (ref.tag === 'image') {
      const url = findEmittedAssetUrl(bundle, moduleId, state.base);
      if (url) {
        ref.attrs[ref.attr] = url;
      }
    }
  }
}

/**
 * Creates the `generateBundle` hook function.
 *
 * For each named sprite in the registry:
 *   1. Gets the tree-shaken symbols (only those marked used by `renderChunk`).
 *   2. Resolves embedded refs to final asset URLs using the output bundle.
 *   3. Assembles the sprite XML from the `<symbol>` entries.
 *   4. Emits the sprite as a build asset.
 *
 * SVGO optimization is NOT applied here - it runs per-SVG during `load`
 * before symbols are created. This ensures each SVG's `<style>` tag is
 * inlined correctly without cross-contamination between symbols.
 */
export function createGenerateBundleHook(
  state: PluginState,
): (this: GenerateBundleContext, options: unknown, bundle: OutputBundle) => void {
  return function generateBundle(_options, bundle) {
    for (const spriteName of state.sprites.getSpriteNames()) {
      const symbols = state.sprites.getUsedSymbols(spriteName);
      if (symbols.length === 0) continue;

      // Collect all <symbol> entries
      const symbolEntries = symbols.flatMap((s) => s.entries);

      // Rewrite embedded refs to final asset URLs before serialization
      resolveRefsToFinalUrls(state, bundle, symbolEntries);

      // Assemble the sprite XML
      const spriteXml = assembleSprite(symbolEntries);

      // Emit the sprite file with content hash for cache busting
      const fileName = `assets/${state.sprites.getSpriteFileName(spriteName)}`;
      this.emitFile({
        type: 'asset',
        fileName,
        source: spriteXml,
      });
    }

    // Emit file-mode assets (individual SVG files)
    for (const { fileName, source } of state.fileAssets.values()) {
      this.emitFile({
        type: 'asset',
        fileName,
        source,
      });
    }
  };
}
