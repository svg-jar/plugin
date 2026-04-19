const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * Creates a custom element class that renders an SVG sprite symbol
 * via `<use href>`. The user registers it with `customElements.define()`.
 *
 * The element renders the SVG in the light DOM. Child elements like
 * `<title>` and `<desc>` are moved inside the `<svg>` for accessibility.
 *
 * Usage:
 *   import SvgArrow from './icons/arrow.svg';
 *   customElements.define('svg-arrow', SvgArrow);
 *   // <svg-arrow><title>Arrow</title></svg-arrow>
 *
 * @param viewBox The `viewBox` attribute for the `<svg>` element.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param href    The sprite symbol reference (e.g. `/assets/sprite.svg#abc123`).
 * @returns       A custom element class extending HTMLElement.
 */
export function createSvg(
  viewBox: string | null,
  width: string | null,
  height: string | null,
  href: string,
): typeof HTMLElement {
  return class extends HTMLElement {
    connectedCallback(): void {
      if (this.querySelector('svg')) return;

      const svg = document.createElementNS(SVG_NS, 'svg');
      if (viewBox) svg.setAttribute('viewBox', viewBox);
      if (width) svg.setAttribute('width', width);
      if (height) svg.setAttribute('height', height);

      // Move any light DOM children (title, desc) into the SVG
      while (this.firstChild) {
        svg.appendChild(this.firstChild);
      }

      const use = document.createElementNS(SVG_NS, 'use');
      use.setAttributeNS(XLINK_NS, 'href', href);
      use.setAttribute('href', href);
      svg.appendChild(use);

      this.appendChild(svg);
    }
  };
}

/**
 * Creates a custom element class that renders inline SVG markup.
 * Used in dev mode and for `?unsafe-inline` imports. The user registers
 * it with `customElements.define()`.
 *
 * @param viewBox The `viewBox` attribute for the wrapper `<svg>`.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param xml     The inner SVG markup string.
 * @returns       A custom element class extending HTMLElement.
 */
export function createSvgInline(
  viewBox: string | null,
  width: string | null,
  height: string | null,
  xml: string,
): typeof HTMLElement {
  return class extends HTMLElement {
    connectedCallback(): void {
      if (this.querySelector('svg')) return;

      const svg = document.createElementNS(SVG_NS, 'svg');
      if (viewBox) svg.setAttribute('viewBox', viewBox);
      if (width) svg.setAttribute('width', width);
      if (height) svg.setAttribute('height', height);

      // Move any light DOM children (title, desc) into the SVG
      while (this.firstChild) {
        svg.appendChild(this.firstChild);
      }

      svg.innerHTML += xml;

      this.appendChild(svg);
    }
  };
}
