/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
// @ts-expect-error react is a peer dependency provided by the consuming app
import { createElement, useCallback } from 'react';

/**
 * Creates a React component that renders an SVG sprite symbol via `<use href>`.
 * Used in production builds where SVGs are collected into sprite sheets.
 *
 * The component accepts all SVG attributes as props (className, aria-*, style, etc.)
 * and supports children for accessibility content like `<title>` and `<desc>`.
 *
 * @param viewBox The `viewBox` attribute for the `<svg>` element.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param href    The sprite symbol reference (e.g. `/assets/sprite.svg#abc123`).
 * @returns       A React function component.
 */
export const createSvg: (
  viewBox: string | null,
  width: string | null,
  height: string | null,
  href: string,
) => (props: unknown) => Record<string, unknown> = /*#__NO_SIDE_EFFECTS__*/ (viewBox, width, height, href) => {
  const useEl = createElement('use', { href });

  return (props: unknown) => {
    const { children, ...rest } = props as Record<string, unknown>;
    return createElement(
      'svg',
      { viewBox: viewBox ?? undefined, width: width ?? undefined, height: height ?? undefined, ...rest },
      children,
      useEl,
    );
  };
};

/**
 * Creates a React component that renders inline SVG markup.
 * Used in dev mode and for `?unsafe-inline` imports.
 *
 * The SVG markup is injected via a ref callback on a `<g>` wrapper
 * so that children (like `<title>` and `<desc>`) can still be passed
 * alongside the markup.
 *
 * @param viewBox The `viewBox` attribute for the wrapper `<svg>`.
 * @param width   The `width` attribute, or `null` to omit.
 * @param height  The `height` attribute, or `null` to omit.
 * @param xml     The inner SVG markup string.
 * @returns       A React function component.
 */
export const createSvgInline: (
  viewBox: string | null,
  width: string | null,
  height: string | null,
  xml: string,
) => (props: unknown) => Record<string, unknown> = /*#__NO_SIDE_EFFECTS__*/ (viewBox, width, height, xml) => {
  return (props: unknown) => {
    const { children, ...rest } = props as Record<string, unknown>;
    const setMarkup = useCallback((node: SVGGElement | null) => {
      if (node) node.innerHTML = xml;
    }, []);

    return createElement(
      'svg',
      { viewBox: viewBox ?? undefined, width: width ?? undefined, height: height ?? undefined, ...rest },
      children,
      createElement('g', { ref: setMarkup }),
    );
  };
};
