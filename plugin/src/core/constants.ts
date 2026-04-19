/**
 * Runtime module paths for each framework target.
 */
export const RUNTIME_PATHS = {
  dom: '@svg-jar/plugin/runtime/dom',
  ember: '@svg-jar/plugin/runtime/ember',
  react: '@svg-jar/plugin/runtime/react',
  preact: '@svg-jar/plugin/runtime/preact',
  vue: '@svg-jar/plugin/runtime/vue',
  solid: '@svg-jar/plugin/runtime/solid',
  'web-component': '@svg-jar/plugin/runtime/web-component',
} as const;

/**
 * Placeholder prefix inserted into generated JS during the `transform` hook.
 * Resolved to final sprite URLs during `renderChunk`.
 */
export const PLACEHOLDER_PREFIX = '__SVG_JAR_SPRITE__' as const;

/**
 * Regex to find all sprite placeholders in rendered chunks.
 * Captures the symbol ID (hex hash) between the prefix and suffix.
 */
export const PLACEHOLDER_RE: RegExp = /__SVG_JAR_SPRITE__([a-f0-9]+)__/g;

/**
 * Creates a placeholder string for a sprite symbol reference.
 * This is embedded in the generated JS and later replaced with the
 * actual sprite URL + fragment in `renderChunk`.
 *
 * @param symbolId Deterministic hash identifying the symbol.
 *
 * @example
 *   makePlaceholder('abc123')
 *   // → '__SVG_JAR_SPRITE__abc123__'
 */
export function makePlaceholder(symbolId: string): string {
  return `${PLACEHOLDER_PREFIX}${symbolId}__`;
}
