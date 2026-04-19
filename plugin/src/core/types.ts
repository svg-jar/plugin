import type { LosslessEntry } from '@eksml/xml/lossless';
import type { SvgImportMode } from './query.ts';

/**
 * Parsed SVG metadata extracted from the root `<svg>` element.
 */
export interface SvgData {
  /** The `viewBox` attribute value, e.g. `"0 0 24 24"`. */
  viewBox: string | null;
  /** The `width` attribute value, e.g. `"24"`. */
  width: string | null;
  /** The `height` attribute value, e.g. `"24"`. */
  height: string | null;
  /** The SVG content in eksml lossless format. */
  entries: LosslessEntry[];
}

/**
 * A symbol registered in a sprite sheet.
 */
export interface SpriteSymbol {
  /** Deterministic hash of the SVG content. */
  symbolId: string;
  /** The `<symbol>` element in lossless format. */
  entries: LosslessEntry[];
  /** Metadata from the original SVG. */
  metadata: SvgData;
}

/**
 * Per-import metadata created by the `load` hook and consumed by `transform`.
 */
export interface SvgModule {
  /** The resolved module ID (absolute path + query). */
  id: string;
  /** Deterministic hash of the SVG content. */
  symbolId: string;
  /** Import mode derived from the query string. */
  mode: SvgImportMode;
  /** Sprite name (only meaningful when `mode === 'sprite'`). */
  spriteName: string;
  /**
   * Per-SVG currentColor override.
   * - `true`  - opt-in via `?current-color`
   * - `false` - opt-out via `?skip-current-color`
   * - `undefined` - use the global option
   */
  currentColor: boolean | undefined;
  /** Parsed SVG metadata and lossless entries. */
  data: SvgData;
  /** Inner SVG content (children of `<svg>`, no root wrapper). Used by codegen. */
  svgMarkup: string;
  /** Full SVG document string (with root `<svg>`). Used for file asset emission. */
  svgSource: string;
  /**
   * Module IDs of SVGs referenced via `<use href>` inside this SVG.
   * Used in dev mode to embed referenced symbols inline. Empty when
   * there are no embedded SVG refs.
   */
  useRefs: string[];
}
