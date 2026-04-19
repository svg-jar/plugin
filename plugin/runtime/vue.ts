// @ts-expect-error vue is a peer dependency provided by the consuming app
import { h, markRaw } from 'vue';

/**
 * Creates a Vue component that renders an SVG sprite symbol via `<use href>`.
 * Used in production builds where SVGs are collected into sprite sheets.
 *
 * The component accepts all SVG attributes as props and supports the default
 * slot for accessibility content like `<title>` and `<desc>`.
 *
 * @param viewBox The `viewBox` attribute for the `<svg>` element.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param href    The sprite symbol reference (e.g. `/assets/sprite.svg#abc123`).
 * @returns       A Vue component.
 */
export const createSvg: (
  viewBox: string | null,
  width: string | null,
  height: string | null,
  href: string,
) => unknown = /*#__NO_SIDE_EFFECTS__*/ (viewBox, width, height, href) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return markRaw({
    inheritAttrs: false,
    render(this: { $attrs: Record<string, unknown>; $slots: { default?: () => unknown[] } }) {
      const attrs = { viewBox, width, height, ...this.$attrs };
      const children = [
        ...(this.$slots.default?.() ?? []),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        h('use', { href }),
      ];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return h('svg', attrs, children);
    },
  });
};

/**
 * Creates a Vue component that renders inline SVG markup.
 * Used in dev mode and for `?unsafe-inline` imports.
 *
 * The SVG markup is injected via `innerHTML` on a `<g>` element so
 * that the default slot can still render children (like `<title>` and `<desc>`)
 * alongside the markup.
 *
 * @param viewBox The `viewBox` attribute for the wrapper `<svg>`.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param xml     The inner SVG markup string.
 * @returns       A Vue component.
 */
export const createSvgInline: (
  viewBox: string | null,
  width: string | null,
  height: string | null,
  xml: string,
) => unknown = /*#__NO_SIDE_EFFECTS__*/ (viewBox, width, height, xml) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return markRaw({
    inheritAttrs: false,
    render(this: { $attrs: Record<string, unknown>; $slots: { default?: () => unknown[] } }) {
      const attrs = { viewBox, width, height, ...this.$attrs };
      const children = [
        ...(this.$slots.default?.() ?? []),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        h('g', { innerHTML: xml }),
      ];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return h('svg', attrs, children);
    },
  });
};
