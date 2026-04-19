import type { SvgJarTarget } from '../core/options.ts';
import type { SvgImportMode } from '../core/query.ts';

/**
 * Context passed to code generation functions.
 */
export interface CodegenContext {
  /** Framework target (e.g. `'dom'`, `'ember'`). */
  target: SvgJarTarget;
  /** Deterministic symbol ID. */
  symbolId: string;
  /** The `viewBox` attribute value. */
  viewBox: string | null;
  /** The `width` attribute value. */
  width: string | null;
  /** The `height` attribute value. */
  height: string | null;
  /** Import mode. */
  mode: SvgImportMode;
  /** Whether this is a dev build. */
  isDev: boolean;
  /** Full SVG markup string (for inline mode). */
  svgMarkup: string;
  /** The SVG content as a `<symbol>` element string (for dev sprite mode). */
  symbolMarkup: string;
  /** Markup for `<symbol>` entries referenced via `<use>` (for dev sprite mode). */
  refSymbols: string[];
}
