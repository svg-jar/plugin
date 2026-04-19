import type { LosslessEntry } from '@eksml/xml/lossless';
import { write } from '@eksml/xml/writer';
import type { SvgData } from '../core/types.ts';

/**
 * Creates a `<symbol>` lossless entry from parsed SVG data.
 *
 * Moves the `viewBox` from the root `<svg>` to the `<symbol>` and assigns
 * the given symbol ID. The children of the `<svg>` (excluding its `$attr`)
 * become the children of the `<symbol>`.
 *
 * @param symbolId Deterministic hash used as the symbol's `id` attribute.
 * @param data     Parsed SVG data containing the lossless entries.
 * @returns        A `<symbol>` lossless entry.
 *
 * @example
 *   const data = parseSvg('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>');
 *   const symbol = createSymbol('abc123', data);
 *   // → { symbol: [{ $attr: { id: 'abc123', viewBox: '0 0 24 24' } }, { path: [...] }] }
 */
export function createSymbol(symbolId: string, data: SvgData): LosslessEntry {
  // Find the root <svg> element and extract its children (minus $attr)
  const svgChildren = getRootSvgChildren(data.entries);

  const symbolAttrs: Record<string, string | null> = { id: symbolId };
  if (data.viewBox) {
    symbolAttrs.viewBox = data.viewBox;
  }

  return {
    symbol: [{ $attr: symbolAttrs }, ...svgChildren],
  };
}

/**
 * Assembles a complete sprite sheet SVG from an array of `<symbol>` entries.
 *
 * The sprite is an `<svg>` element with `xmlns` and `xmlns:xlink` attributes,
 * hidden via `style="display:none"`, containing all the symbols.
 *
 * @param symbols Array of `<symbol>` lossless entries (from `createSymbol`).
 * @returns       The sprite SVG as a string.
 *
 * @example
 *   const sprite = assembleSprite([symbol1, symbol2]);
 *   // → '<svg xmlns="..." style="display:none"><symbol id="a" ...>...</symbol><symbol id="b" ...>...</symbol></svg>'
 */
export function assembleSprite(symbols: LosslessEntry[]): string {
  const entries: LosslessEntry[] = [
    {
      svg: [
        {
          $attr: {
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            style: 'display:none',
          },
        },
        ...symbols,
      ],
    },
  ];

  return write(entries);
}

/**
 * Serializes SVG lossless entries back to an XML string.
 *
 * Thin wrapper around eksml's `write()` for convenience.
 *
 * @param entries Lossless SVG entries.
 * @returns       The serialized SVG string.
 */
export function serializeSvg(entries: LosslessEntry[]): string {
  return write(entries);
}

/**
 * Serializes only the inner children of the root `<svg>` element,
 * excluding the `<svg>` wrapper and its attributes.
 *
 * Used for codegen where the runtime provides the outer `<svg>` element
 * (e.g. Ember's template or DOM's createElementNS).
 *
 * @param entries Lossless SVG entries containing a root `<svg>`.
 * @returns       The serialized inner content string.
 *
 * @example
 *   const data = parseSvg('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>');
 *   serializeSvgInner(data.entries);
 *   // → '<path d="M0 0"/>'
 */
export function serializeSvgInner(entries: LosslessEntry[]): string {
  const children = getRootSvgChildren(entries);
  return write(children);
}

/**
 * Extracts the children of the root `<svg>` element, excluding its `$attr`
 * block. These are the elements that become `<symbol>` children.
 */
function getRootSvgChildren(entries: LosslessEntry[]): LosslessEntry[] {
  for (const entry of entries) {
    if (typeof entry !== 'object') continue;
    if ('$text' in entry || '$comment' in entry || '$attr' in entry) continue;

    const tagName = Object.keys(entry)[0];
    if (tagName === 'svg') {
      const children = entry[tagName];
      // Skip the $attr entry (always first if present)
      if (children.length > 0 && typeof children[0] === 'object' && '$attr' in children[0]) {
        return children.slice(1);
      }
      return children;
    }
  }
  return [];
}
