/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
// @ts-expect-error solid-js is a peer dependency provided by the consuming app
import { type JSX, type ParentProps, splitProps } from 'solid-js';
// @ts-expect-error solid-js is a peer dependency provided by the consuming app
import { insert, spread, template } from 'solid-js/web';

type SvgProps = ParentProps<JSX.SvgSVGAttributes<SVGSVGElement>>;

/**
 * Creates a Solid component that renders an SVG sprite symbol via `<use href>`.
 * Used in production builds where SVGs are collected into sprite sheets.
 *
 * The component accepts all SVG attributes as props and supports children
 * for accessibility content like `<title>` and `<desc>`.
 *
 * @param viewBox The `viewBox` attribute for the `<svg>` element.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param href    The sprite symbol reference (e.g. `/assets/sprite.svg#abc123`).
 * @returns       A Solid component.
 */
export const createSvg: (
  viewBox: string | null,
  width: string | null,
  height: string | null,
  href: string,
) => unknown = /*#__NO_SIDE_EFFECTS__*/ (viewBox, width, height, href) => {
  const tmpl = template(
    `<svg${viewBox ? ` viewBox="${viewBox}"` : ''}${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}><use href="${href}">`,
  );

  return (props: SvgProps) => {
    const el: SVGSVGElement = tmpl();
    const [local, rest] = splitProps(props, ['children']);
    spread(el, rest, true, true);

    // Use Solid's insert() to properly resolve and render children
    // before the <use> element (for a11y: title, desc)
    const useEl = el.firstElementChild;
    insert(el, () => local.children, useEl);

    return el;
  };
};

/**
 * Creates a Solid component that renders inline SVG markup.
 * Used in dev mode and for `?unsafe-inline` imports.
 *
 * The SVG markup is injected via innerHTML on a `<g>` element so
 * that children (like `<title>` and `<desc>`) can still be rendered
 * alongside the markup.
 *
 * @param viewBox The `viewBox` attribute for the wrapper `<svg>`.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param xml     The inner SVG markup string.
 * @returns       A Solid component.
 */
export const createSvgInline: (
  viewBox: string | null,
  width: string | null,
  height: string | null,
  xml: string,
) => unknown = /*#__NO_SIDE_EFFECTS__*/ (viewBox, width, height, xml) => {
  const tmpl = template(
    `<svg${viewBox ? ` viewBox="${viewBox}"` : ''}${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}>`,
  );

  return (props: SvgProps) => {
    const el: SVGSVGElement = tmpl();
    const [local, rest] = splitProps(props, ['children']);
    spread(el, rest, true, true);

    // Inject the SVG markup first, then insert children before it
    el.innerHTML = xml;
    const firstChild = el.firstChild;
    insert(el, () => local.children, firstChild);

    return el;
  };
};
