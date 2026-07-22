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

/**
 * The shape of a virtual SVG declaration module.
 *
 * - `'component'` - sprite/inline imports (default export is a component)
 * - `'file'`      - `?file` imports (default export is a URL string)
 */
export type SvgDtsKind = 'component' | 'file';

/** Suffix for virtual declaration modules of component-shaped SVG imports. */
const SVG_DTS_COMPONENT_SUFFIX = '.svg-jar.d.ts';

/** Suffix for virtual declaration modules of `?file` SVG imports. */
const SVG_DTS_FILE_SUFFIX = '.svg-jar-file.d.ts';

/**
 * Returns true if the importer is a declaration module (`.d.ts`, `.d.mts`,
 * `.d.cts`). Declaration bundlers like rolldown-plugin-dts (used by tsdown)
 * resolve imports from virtual `.d.ts` twins of the source modules; SVG
 * imports from those need declaration code, not component code.
 */
export function isDtsImporter(importer: string | undefined): boolean {
  return importer != null && /\.d\.[cm]?ts$/.test(importer);
}

/**
 * Builds the module ID for a virtual SVG declaration module.
 *
 * The ID must end in `.d.ts` so declaration bundlers treat the module as
 * declaration code. The query string is dropped - all component-shaped
 * imports of the same file share one type, so they dedupe naturally.
 *
 * @example
 *   makeSvgDtsId('/project/icon.svg', 'component')
 *   // → '/project/icon.svg.svg-jar.d.ts'
 */
export function makeSvgDtsId(filePath: string, kind: SvgDtsKind): string {
  return filePath + (kind === 'file' ? SVG_DTS_FILE_SUFFIX : SVG_DTS_COMPONENT_SUFFIX);
}

/**
 * Parses a virtual SVG declaration module ID created by {@link makeSvgDtsId}.
 *
 * @returns The declaration kind, or `null` if the ID is not a virtual
 *          SVG declaration module.
 */
export function parseSvgDtsId(id: string): SvgDtsKind | null {
  if (id.endsWith(SVG_DTS_FILE_SUFFIX)) return 'file';
  if (id.endsWith(SVG_DTS_COMPONENT_SUFFIX)) return 'component';
  return null;
}
