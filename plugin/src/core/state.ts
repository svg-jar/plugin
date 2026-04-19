import type { ResolvedOptions } from './options.ts';
import type { SvgModule } from './types.ts';
import { SpriteRegistry } from './sprite-registry.ts';

/**
 * Shared state passed to each hook module. Encapsulates all mutable
 * cross-hook data in a single typed object rather than scattered
 * closure variables.
 */
export class PluginState {
  /** Resolved plugin options. */
  readonly options: ResolvedOptions;

  /** Sprite registry for collecting and tree-shaking symbols. */
  readonly sprites: SpriteRegistry = new SpriteRegistry();

  /** Per-import metadata, keyed by resolved module ID. */
  readonly modules: Map<string, SvgModule> = new Map();

  /** File-mode assets to emit in generateBundle. Keyed by module ID. */
  readonly fileAssets: Map<string, { fileName: string; source: string }> = new Map();

  /** Whether the current build is a dev server (serve) vs production build. */
  isDev = false;

  /** Vite base path (e.g. `"/"`). Used to construct final asset URLs. */
  base = '/';

  /** Project root directory. Used to compute relative paths. Defaults to cwd. */
  root: string = process.cwd();

  constructor(options: ResolvedOptions) {
    this.options = options;
  }

  /**
   * Resets all mutable state. Called on `buildStart` to ensure a clean
   * slate between builds (e.g. when running in watch mode).
   */
  reset(): void {
    this.sprites.reset();
    this.modules.clear();
    this.fileAssets.clear();
  }
}
