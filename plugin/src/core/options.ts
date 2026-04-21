import type { Config as SvgoConfig } from 'svgo';

/** Supported framework targets for component generation. */
export type SvgJarTarget = 'dom' | 'ember' | 'react' | 'preact' | 'vue' | 'solid' | 'web-component';

/**
 * Plugin options for @svg-jar/plugin.
 */
export interface SvgJarOptions {
  /** Framework target for component generation. Default: `'dom'`. */
  target?: SvgJarTarget;

  /**
   * SVGO configuration.
   * - `true` (default): use baseline config with sensible defaults
   * - `false`: disable optimization entirely
   * - object: custom SVGO config, deep-merged with baseline
   */
  svgo?: boolean | SvgoConfig;

  /** Default sprite name for bare SVG imports. Default: `'sprite'`. */
  defaultSprite?: string;

  /** Replace non-`none` fill/stroke with `currentColor`. Default: `false`. */
  currentColor?: boolean;

  /**
   * Sprite sheets to inline directly into the HTML document rather than
   * emit as external asset files (Vite only, via `transformIndexHtml`).
   *
   * Inlining keeps symbols in the same document as their `<use>` elements,
   * which is required for CSS animations (`@keyframes`), SMIL animations
   * (`<animate>`, `<animateMotion>`), and `@font-face` rules inside SVG
   * `<style>` tags to work correctly.
   *
   * - `true`: embed all sprite sheets
   * - `false` (default): emit all sprites as external files
   * - `string[]`: embed only the named sprites in the array
   *
   * @example
   * // Embed only the 'animated' sprite sheet
   * svgJar({ embedded: ['animated'] })
   *
   * @example
   * // Embed all sprite sheets
   * svgJar({ embedded: true })
   */
  embedded?: boolean | string[];
}

/**
 * Fully resolved options with all fields required.
 */
export interface ResolvedOptions {
  target: SvgJarTarget;
  svgo: boolean | SvgoConfig;
  defaultSprite: string;
  currentColor: boolean;
  embedded: boolean | string[];
}

/**
 * Merges user-provided options with defaults.
 *
 * @param options Raw user options.
 * @returns Fully resolved options with all defaults applied.
 */
export function resolveOptions(options: SvgJarOptions = {}): ResolvedOptions {
  return {
    target: options.target ?? 'dom',
    svgo: options.svgo ?? true,
    defaultSprite: options.defaultSprite ?? 'sprite',
    currentColor: options.currentColor ?? false,
    embedded: options.embedded ?? false,
  };
}
