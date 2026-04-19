/**
 * Import mode determined by the query string on an SVG import.
 *
 * - `'sprite'`  - collected into a sprite sheet (default)
 * - `'inline'`  - full SVG markup embedded in the component
 * - `'file'`    - raw asset URL export, no component
 */
export type SvgImportMode = 'sprite' | 'inline' | 'file';

/**
 * Parsed information from an SVG import specifier (path + query string).
 */
export interface ParsedSvgId {
  /** Absolute file path to the .svg file (without query string). */
  filePath: string;

  /** Import mode derived from the query string. */
  mode: SvgImportMode;

  /**
   * Sprite name from `?sprite=<name>`, or `undefined` when no `?sprite`
   * query is present. The caller is responsible for applying the default
   * sprite name from plugin options.
   */
  spriteName: string | undefined;

  /**
   * Per-SVG currentColor override.
   * - `true`  - opt-in via `?current-color`
   * - `false` - opt-out via `?skip-current-color`
   * - `undefined` - use the global `currentColor` option
   */
  currentColor: boolean | undefined;
}

/**
 * Parses an SVG module ID (file path + query string) into its components.
 *
 * This is a pure parser - it only extracts what is in the query string.
 * Default values (e.g. the default sprite name) are the caller's
 * responsibility.
 *
 * @param id The full module ID including query string.
 *
 * @example
 *   parseSvgId('/project/icon.svg')
 *   // → { filePath: '/project/icon.svg', mode: 'sprite', spriteName: undefined, currentColor: undefined }
 *
 * @example
 *   parseSvgId('/project/icon.svg?sprite=nav&current-color')
 *   // → { filePath: '/project/icon.svg', mode: 'sprite', spriteName: 'nav', currentColor: true }
 *
 * @example
 *   parseSvgId('/project/icon.svg?unsafe-inline&skip-current-color')
 *   // → { filePath: '/project/icon.svg', mode: 'inline', spriteName: undefined, currentColor: false }
 */
export function parseSvgId(id: string): ParsedSvgId {
  const queryIndex = id.indexOf('?');
  const filePath = queryIndex === -1 ? id : id.slice(0, queryIndex);
  const queryString = queryIndex === -1 ? '' : id.slice(queryIndex + 1);

  const params = new URLSearchParams(queryString);

  // Determine import mode
  let mode: SvgImportMode = 'sprite';
  if (params.has('unsafe-inline')) {
    mode = 'inline';
  } else if (params.has('file')) {
    mode = 'file';
  }

  // Determine sprite name (undefined when not specified in query)
  const spriteName = params.get('sprite') ?? undefined;

  // Determine per-SVG currentColor override
  let currentColor: boolean | undefined;
  if (params.has('current-color')) {
    currentColor = true;
  } else if (params.has('skip-current-color')) {
    currentColor = false;
  }

  return { filePath, mode, spriteName, currentColor };
}

/**
 * Returns true if the given module ID looks like an SVG import
 * (ends with `.svg` or `.svg?...`).
 */
export function isSvgId(id: string): boolean {
  const queryIndex = id.indexOf('?');
  const filePath = queryIndex === -1 ? id : id.slice(0, queryIndex);
  return filePath.endsWith('.svg');
}
