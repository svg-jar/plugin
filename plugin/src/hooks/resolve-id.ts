import { existsSync } from 'node:fs';
import path from 'node:path';
import type { UnpluginBuildContext, UnpluginContext } from 'unplugin';
import { isSvgId, isDtsImporter, makeSvgDtsId, parseSvgId } from '../core/query.ts';

/**
 * Creates the `resolveId` hook function.
 *
 * Intercepts `.svg` imports and resolves them. For relative/absolute imports,
 * the bundler's default resolution is used. For bare specifiers (e.g.
 * `some-package/icon.svg`), a naive node_modules lookup is performed that
 * bypasses the `exports` field in package.json - many icon packages don't
 * expose `.svg` files via their exports map.
 *
 * The query string is preserved through resolution so `load` and `transform`
 * can read import mode and per-SVG options.
 */
export function createResolveIdHook(): (
  this: UnpluginBuildContext & UnpluginContext,
  id: string,
  importer: string | undefined,
) => string | null {
  return function resolveId(id, importer) {
    if (!isSvgId(id)) return null;

    // Extract query string
    const queryIndex = id.indexOf('?');
    const filePath = queryIndex === -1 ? id : id.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : id.slice(queryIndex);

    // SVG imports from declaration modules (rolldown-plugin-dts / tsdown
    // resolve imports from virtual `.d.ts` twins) resolve to a virtual
    // declaration module instead of the component module, so the emitted
    // `.d.ts` bundle gets type declarations rather than runtime JS.
    const dtsKind = isDtsImporter(importer) ? (parseSvgId(id).mode === 'file' ? 'file' : 'component') : null;

    // Relative or absolute paths - resolve and re-append query.
    if (filePath.startsWith('.') || filePath.startsWith('/')) {
      if (!importer) return null;
      const resolved = path.resolve(path.dirname(importer), filePath);
      return dtsKind ? makeSvgDtsId(resolved, dtsKind) : resolved + query;
    }

    // Bare specifier - try naive node_modules resolution.
    // This bypasses package.json `exports` which often doesn't include .svg files.
    if (importer) {
      const resolved = resolveFromNodeModules(filePath, path.dirname(importer));
      if (resolved) return dtsKind ? makeSvgDtsId(resolved, dtsKind) : resolved + query;
    }

    return null;
  };
}

/**
 * Walks up from `startDir` looking for `node_modules/<id>`.
 * Returns the absolute path if found, `null` otherwise.
 */
function resolveFromNodeModules(id: string, startDir: string): string | null {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, 'node_modules', id);
    if (existsSync(candidate)) return candidate;

    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }
  return null;
}
