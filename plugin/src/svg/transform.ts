import type { LosslessEntry } from '@eksml/xml/lossless';

/** Attributes that control color and should be replaced with currentColor. */
const COLOR_ATTRS = ['fill', 'stroke'];

/** Tags that can reference external SVG files via `href`. */
const REF_TAGS = ['use', 'image'];

/** Attribute names that can hold an external reference. */
const REF_ATTRS = ['href', 'xlink:href'];

/**
 * A reference from a `<use>` or `<image>` element to an external file.
 *
 * Contains:
 * - The tag name (`'use'` or `'image'`) so the caller knows whether to
 *   treat the target as a sprite import or a file asset.
 * - The attribute name (`'href'` or `'xlink:href'`) that holds the ref.
 * - The raw href value (e.g. `'./other.svg'`, `'icons/arrow.svg#fragment'`).
 * - A mutable reference to the `$attr` record so the caller can rewrite
 *   the href in place after resolving it.
 */
export interface EmbeddedRef {
  /** The element tag: `'use'` or `'image'`. */
  tag: string;
  /** The attribute holding the reference: `'href'` or `'xlink:href'`. */
  attr: string;
  /** The raw href value before resolution. */
  href: string;
  /** Mutable reference to the element's `$attr` record for rewriting. */
  attrs: Record<string, string | null>;
}

/**
 * Type guard: is this lossless entry an `$attr` block?
 */
function isAttrEntry(entry: LosslessEntry): entry is { $attr: Record<string, string | null> } {
  return typeof entry === 'object' && '$attr' in entry;
}

/**
 * Type guard: is this lossless entry an element (single key → children array)?
 */
function isElementEntry(entry: LosslessEntry): entry is { [tagName: string]: LosslessEntry[] } {
  if (typeof entry !== 'object') return false;
  const keys = Object.keys(entry);
  return keys.length === 1 && !keys[0].startsWith('$');
}

/**
 * Walks all lossless entries and replaces non-`none` fill and stroke
 * attribute values with `currentColor`. This allows the SVG to inherit
 * its color from the parent element's CSS `color` property.
 *
 * Mutates the entries in place and returns them for chaining.
 *
 * @param entries Lossless SVG entries.
 *
 * @example
 *   const data = parseSvg('<svg ...><path fill="#e91e63"/></svg>');
 *   applyCurrentColor(data.entries);
 *   // The path's fill is now 'currentColor'
 */
export function applyCurrentColor(entries: LosslessEntry[]): LosslessEntry[] {
  for (const entry of entries) {
    if (isAttrEntry(entry)) {
      const attrs = entry.$attr;
      for (const attr of COLOR_ATTRS) {
        if (attr in attrs && attrs[attr] !== 'none') {
          attrs[attr] = 'currentColor';
        }
      }
    } else if (isElementEntry(entry)) {
      const tagName = Object.keys(entry)[0];
      applyCurrentColor(entry[tagName]);
    }
  }

  return entries;
}

/**
 * Removes `width` and `height` attributes from the root `<svg>` element's
 * `$attr` block. This allows the SVG to scale to its container.
 *
 * Mutates the entries in place and returns them for chaining.
 *
 * @param entries Lossless SVG entries.
 */
export function stripDimensions(entries: LosslessEntry[]): LosslessEntry[] {
  for (const entry of entries) {
    if (!isElementEntry(entry)) continue;

    const tagName = Object.keys(entry)[0];
    if (tagName !== 'svg') continue;

    const children = entry[tagName];
    if (children.length > 0 && isAttrEntry(children[0])) {
      delete children[0].$attr.width;
      delete children[0].$attr.height;
    }
    break; // Only process the root <svg>
  }

  return entries;
}

/**
 * Finds all `<use>` and `<image>` elements that reference external files
 * via `href` or `xlink:href` attributes.
 *
 * Internal fragment references (e.g. `href="#gradient1"`) are skipped —
 * only references that point to other files are returned.
 *
 * Returns an array of `EmbeddedRef` objects. Each contains a mutable
 * reference to the element's `$attr` record so the caller can rewrite
 * the href in place after resolving it through the bundler.
 *
 * @param entries Lossless SVG entries.
 *
 * @example
 *   const data = parseSvg('<svg><use href="./arrow.svg"/><image href="photo.png"/></svg>');
 *   const refs = findEmbeddedRefs(data.entries);
 *   // → [
 *   //   { tag: 'use', attr: 'href', href: './arrow.svg', attrs: { href: './arrow.svg' } },
 *   //   { tag: 'image', attr: 'href', href: 'photo.png', attrs: { href: 'photo.png' } },
 *   // ]
 */
export function findEmbeddedRefs(entries: LosslessEntry[]): EmbeddedRef[] {
  const refs: EmbeddedRef[] = [];
  collectRefs(entries, refs);
  return refs;
}

/**
 * Recursive helper that walks lossless entries and collects embedded refs.
 *
 * @param entries    The children array to walk.
 * @param refs       Accumulator for found references.
 * @param parentTag  The tag name of the parent element (if any), so we
 *                   know when an `$attr` belongs to a ref-bearing element.
 */
function collectRefs(entries: LosslessEntry[], refs: EmbeddedRef[], parentTag?: string): void {
  for (const entry of entries) {
    if (isAttrEntry(entry)) {
      // Check if the parent is a ref-bearing element
      if (parentTag && REF_TAGS.includes(parentTag)) {
        const attrs = entry.$attr;
        for (const attr of REF_ATTRS) {
          const href = attrs[attr];
          if (typeof href === 'string' && href.length > 0 && !href.startsWith('#')) {
            refs.push({ tag: parentTag, attr, href, attrs });
            break; // Only one ref attr per element
          }
        }
      }
    } else if (isElementEntry(entry)) {
      const tagName = Object.keys(entry)[0];
      collectRefs(entry[tagName], refs, tagName);
    }
  }
}
