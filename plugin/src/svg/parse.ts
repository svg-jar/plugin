import { lossless, type LosslessEntry } from '@eksml/xml/lossless';
import type { SvgData } from '../core/types.ts';

/**
 * Parses an SVG string into lossless entries and extracts metadata
 * (viewBox, width, height) from the root `<svg>` element.
 *
 * Uses eksml's lossless format which preserves attribute order,
 * document structure, and is directly serializable back to XML
 * via `write()`.
 *
 * @param source Raw SVG string.
 * @returns Parsed SVG data with metadata and lossless entries.
 *
 * @example
 *   const data = parseSvg('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>');
 *   // data.viewBox === '0 0 24 24'
 *   // data.width === null
 *   // data.entries is the lossless representation
 */
export function parseSvg(source: string): SvgData {
  const entries = lossless(source);
  const attrs = findRootSvgAttrs(entries);

  return {
    viewBox: attrs?.viewBox ?? null,
    width: attrs?.width ?? null,
    height: attrs?.height ?? null,
    entries,
  };
}

/**
 * Type guard: is this lossless entry an element (has a single string key
 * mapping to a LosslessEntry[] children array)?
 */
function isElementEntry(entry: LosslessEntry): entry is { [tagName: string]: LosslessEntry[] } {
  if (typeof entry !== 'object') return false;
  const keys = Object.keys(entry);
  return keys.length === 1 && !keys[0].startsWith('$');
}

/**
 * Type guard: is this lossless entry an `$attr` block?
 */
function isAttrEntry(entry: LosslessEntry): entry is { $attr: Record<string, string | null> } {
  return typeof entry === 'object' && '$attr' in entry;
}

/**
 * Finds the `$attr` record on the root `<svg>` element in a lossless
 * entry array. Returns `undefined` if no `<svg>` root or no attributes.
 */
function findRootSvgAttrs(entries: LosslessEntry[]): Record<string, string | null> | undefined {
  for (const entry of entries) {
    if (!isElementEntry(entry)) continue;
    if (!('svg' in entry)) continue;

    const children = entry.svg;
    if (children.length > 0 && isAttrEntry(children[0])) {
      return children[0].$attr;
    }
  }
  return undefined;
}

/**
 * Generates a deterministic symbol ID from SVG content by hashing
 * the source string. Returns an 8-character hex string.
 *
 * @param source Raw SVG string.
 *
 * @example
 *   hashSvg('<svg><path d="M0 0"/></svg>')
 *   // → 'a1b2c3d4'
 */
export function hashSvg(source: string): string {
  // Simple FNV-1a 32-bit hash - fast, deterministic, no crypto dependency.
  let hash = 0x811c9dc5;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Convert to unsigned 32-bit, then to 8-char hex.
  return (hash >>> 0).toString(16).padStart(8, '0');
}
