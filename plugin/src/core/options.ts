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
}

/**
 * Fully resolved options with all fields required.
 */
export interface ResolvedOptions {
  target: SvgJarTarget;
  svgo: boolean | SvgoConfig;
  defaultSprite: string;
  currentColor: boolean;
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
  };
}
