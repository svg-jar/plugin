// @ts-expect-error @ember/template-compiler is a peer dependency provided by the consuming Ember app
import { template } from '@ember/template-compiler';

/**
 * Creates an Ember component that renders an SVG sprite symbol via `<use href>`.
 * Used in production builds where SVGs are collected into sprite sheets.
 *
 * The template is compiled once with scoped bindings rather than string
 * interpolation, so each SVG reuses the same compiled template.
 *
 * @param viewBox The `viewBox` attribute for the `<svg>` element.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param symbol  The sprite symbol reference (e.g. `/assets/sprite.svg#abc123`).
 * @returns       An Ember template component.
 */
export const createSvg = /*#__NO_SIDE_EFFECTS__*/ (
  viewBox: string | null,
  width: string | null,
  height: string | null,
  symbol: string,
): unknown => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return template(
    `<svg viewBox={{viewBox}} width={{width}} height={{height}} ...attributes>{{yield}}<use href={{symbol}} /></svg>`,
    { scope: () => ({ viewBox, width, height, symbol }) },
  );
};

/**
 * Creates an Ember component that renders inline SVG markup.
 * Used in dev mode and for `?unsafe-inline` imports.
 *
 * The SVG markup is injected as raw HTML via triple-curlies `{{{xml}}}`,
 * wrapped in an `<svg>` element that receives `...attributes` for
 * splattributes support.
 *
 * @param viewBox The `viewBox` attribute for the wrapper `<svg>`.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param xml     The inner SVG markup string (children of the root `<svg>`).
 * @returns       An Ember template component.
 */
export const createSvgInline = /*#__NO_SIDE_EFFECTS__*/ (
  viewBox: string | null,
  width: string | null,
  height: string | null,
  xml: string,
): unknown => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return template(`<svg viewBox={{viewBox}} width={{width}} height={{height}} ...attributes>{{yield}}{{{xml}}}</svg>`, {
    scope: () => ({ viewBox, width, height, xml }),
  });
};
