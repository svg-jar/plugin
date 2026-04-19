const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * Options for customising the rendered SVG element.
 *
 * - `title` and `desc` create `<title>` and `<desc>` child elements
 *   inside the `<svg>` for accessibility.
 * - All other properties are set as attributes on the `<svg>` element
 *   (e.g. `class`, `aria-label`, `style`).
 */
export interface SvgOptions {
  /** Creates a `<title>` child element for accessibility. */
  title?: string;
  /** Creates a `<desc>` child element for accessibility. */
  desc?: string;
  /** Any other properties are set as attributes on the `<svg>` element. */
  [attr: string]: string | undefined;
}

/**
 * Applies options to an SVG element: sets attributes and creates
 * `<title>` / `<desc>` child elements.
 */
function applyOptions(svg: SVGSVGElement, options: SvgOptions): void {
  const { title, desc, ...attrs } = options;

  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined) svg.setAttribute(key, value);
  }

  if (title) {
    const el = document.createElementNS(SVG_NS, 'title');
    el.textContent = title;
    svg.prepend(el);
  }

  if (desc) {
    const el = document.createElementNS(SVG_NS, 'desc');
    el.textContent = desc;
    // Insert after <title> if present, otherwise prepend
    const titleEl = svg.querySelector('title');
    if (titleEl) {
      titleEl.after(el);
    } else {
      svg.prepend(el);
    }
  }
}

/**
 * Returns a factory function that creates an SVG element referencing a
 * sprite symbol via `<use href>`. Each call to the factory produces a
 * new DOM node, so the same import can be inserted into the document
 * multiple times without cloning.
 *
 * Used in production builds where SVGs are collected into sprite sheets.
 *
 * CSP-safe: uses `createElementNS` and `setAttribute` instead of `innerHTML`.
 *
 * @param viewBox The `viewBox` attribute for the `<svg>` element.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param href    The sprite symbol reference (e.g. `/assets/sprite.svg#abc123`).
 * @returns       A factory function that creates a new SVG DOM element on each call.
 *
 * @example
 *   const Arrow = createSvg('0 0 24 24', null, null, '/assets/sprite.svg#abc');
 *   document.body.appendChild(Arrow());
 *   document.body.appendChild(Arrow({ class: 'icon', title: 'Arrow', 'aria-hidden': 'true' }));
 */
export function createSvg(
  viewBox: string | null,
  width: string | null,
  height: string | null,
  href: string,
): (options?: SvgOptions) => SVGSVGElement {
  return (options?: SvgOptions) => {
    const svg = document.createElementNS(SVG_NS, 'svg');

    if (viewBox) svg.setAttribute('viewBox', viewBox);
    if (width) svg.setAttribute('width', width);
    if (height) svg.setAttribute('height', height);

    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttributeNS(XLINK_NS, 'xlink:href', href);
    use.setAttribute('href', href);
    svg.appendChild(use);

    if (options) applyOptions(svg, options);

    return svg;
  };
}

/**
 * Returns a factory function that creates an SVG element from raw markup.
 * Each call produces a new DOM node. Used in dev mode and for
 * `?unsafe-inline` imports where the full SVG is embedded in the component.
 *
 * Uses `innerHTML` to parse the markup - acceptable in dev mode but not
 * CSP-safe for production.
 *
 * @param viewBox   The `viewBox` attribute.
 * @param width     The `width` attribute.
 * @param height    The `height` attribute.
 * @param svgMarkup The inner SVG markup string.
 * @returns         A factory function that creates a new SVG DOM element on each call.
 *
 * @example
 *   const Square = createSvgInline('0 0 24 24', null, null, '<rect .../>');
 *   document.body.appendChild(Square());
 *   document.body.appendChild(Square({ class: 'icon', desc: 'A blue square' }));
 */
export function createSvgInline(
  viewBox: string | null,
  width: string | null,
  height: string | null,
  svgMarkup: string,
): (options?: SvgOptions) => SVGSVGElement {
  return (options?: SvgOptions) => {
    const svg = document.createElementNS(SVG_NS, 'svg');

    if (viewBox) svg.setAttribute('viewBox', viewBox);
    if (width) svg.setAttribute('width', width);
    if (height) svg.setAttribute('height', height);

    svg.innerHTML = svgMarkup;

    if (options) applyOptions(svg, options);

    return svg;
  };
}
