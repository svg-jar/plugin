import { createUnplugin, type UnpluginInstance } from 'unplugin';
import { resolveOptions, type SvgJarOptions } from './core/options.ts';
import { PluginState } from './core/state.ts';
import { createResolveIdHook } from './hooks/resolve-id.ts';
import { createLoadHook } from './hooks/load.ts';
import { createTransformHook } from './hooks/transform.ts';
import { createRenderChunkHook } from './hooks/render-chunk.ts';
import { createGenerateBundleHook } from './hooks/generate-bundle.ts';
import { createTransformHtmlHook } from './hooks/transform-html.ts';

/**
 * The main unplugin instance. Use the bundler-specific entry points
 * (e.g. `@svg-jar/plugin/vite`) for framework integration.
 */
export const SvgJarPlugin: UnpluginInstance<SvgJarOptions | undefined, false> = createUnplugin((rawOptions = {}) => {
  const options = resolveOptions(rawOptions);
  const state = new PluginState(options);

  return {
    name: 'svg-jar',
    enforce: 'pre',

    buildStart() {
      state.reset();
    },

    resolveId: createResolveIdHook(),
    load: createLoadHook(state),
    transform: createTransformHook(state),

    // Rollup/Vite-specific hooks for sprite assembly
    vite: {
      configResolved(config) {
        state.isDev = config.command === 'serve';
        state.base = config.base ?? '/';
        state.root = config.root ?? '';
      },
      renderChunk: createRenderChunkHook(state) as never,
      generateBundle: createGenerateBundleHook(state) as never,
      transformIndexHtml: createTransformHtmlHook(state),
      handleHotUpdate({ file, server }) {
        if (!file.endsWith('.svg')) return;

        // Find all modules that imported this SVG (with any query string)
        const affectedModules = [...state.modules.entries()]
          .filter(([, mod]) => {
            // Match the file path portion of the module ID
            const queryIndex = mod.id.indexOf('?');
            const modPath = queryIndex === -1 ? mod.id : mod.id.slice(0, queryIndex);
            return modPath === file;
          })
          .map(([id]) => server.moduleGraph.getModuleById(id))
          .filter((mod): mod is NonNullable<typeof mod> => mod != null);

        if (affectedModules.length === 0) return;

        // Invalidate the SVG modules so they are re-loaded and re-transformed
        for (const mod of affectedModules) {
          server.moduleGraph.invalidateModule(mod);
        }

        // Trigger HMR update for all affected modules
        return affectedModules;
      },
    },

    rollup: {
      renderChunk: createRenderChunkHook(state) as never,
      generateBundle: createGenerateBundleHook(state) as never,
    },

    rolldown: {
      renderChunk: createRenderChunkHook(state) as never,
      generateBundle: createGenerateBundleHook(state) as never,
    },
  };
});

export type { SvgJarOptions, SvgJarTarget } from './core/options.ts';
