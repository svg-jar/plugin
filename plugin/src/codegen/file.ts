/**
 * Generates JS module code for file mode (`?file`).
 *
 * The component simply exports the file URL as a string. The bundler's
 * native asset handling determines the final URL.
 *
 * @param fileUrl The URL or path to the SVG file.
 *
 * @example
 *   generateFile('/assets/icon.svg')
 *   // → "export default \"/assets/icon.svg\";"
 */
export function generateFile(fileUrl: string): string {
  return `export default ${JSON.stringify(fileUrl)};`;
}
