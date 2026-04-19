import { optimize, type Config as SvgoConfig } from 'svgo';

export type { Config as SvgoConfig } from 'svgo';

/**
 * Baseline SVGO configuration used when `svgo: true` (the default).
 *
 * Preserves IDs (needed for sprite symbol references), path data
 * precision, numeric values, and hidden elements. Strips `<title>`
 * elements since they cause tooltip issues in browsers.
 */
const BASELINE_CONFIG: SvgoConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: { minify: false, remove: false },
          convertPathData: false,
          removeHiddenElems: false,
          cleanupNumericValues: false,
        },
      },
    },
    'removeTitle',
  ],
};

/**
 * Optimizes an SVG string using SVGO.
 *
 * @param svg    The raw SVG string to optimize.
 * @param config Controls optimization behavior:
 *               - `true`:  use baseline config (default)
 *               - `false`: return the SVG unchanged
 *               - object:  custom SVGO config (used as-is, not merged)
 * @returns The optimized SVG string.
 *
 * @example
 *   optimizeSvg('<svg>...</svg>', true)   // baseline optimization
 *   optimizeSvg('<svg>...</svg>', false)  // no-op, returns input
 *   optimizeSvg('<svg>...</svg>', { plugins: ['removeComments'] })
 */
export function optimizeSvg(svg: string, config: boolean | SvgoConfig): string {
  if (config === false) {
    return svg;
  }

  const svgoConfig = config === true ? BASELINE_CONFIG : config;
  const result = optimize(svg, svgoConfig);
  return result.data;
}
