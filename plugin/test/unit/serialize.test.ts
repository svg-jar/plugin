import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseSvg } from '../../src/svg/parse.ts';
import { createSymbol, assembleSprite, serializeSvg } from '../../src/svg/serialize.ts';
import { applyCurrentColor, stripDimensions } from '../../src/svg/transform.ts';

const FIXTURES_DIR = path.join(import.meta.dirname, '..', '_fixtures');

function readFixture(name: string): string {
  return readFileSync(path.join(FIXTURES_DIR, name), 'utf-8');
}

describe('createSymbol', () => {
  it('creates a <symbol> with the given ID', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const symbol = createSymbol('abc123', data);
    const output = serializeSvg([symbol]);

    expect(output).toContain('<symbol');
    expect(output).toContain('id="abc123"');
  });

  it('moves viewBox from <svg> to <symbol>', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const symbol = createSymbol('abc123', data);
    const output = serializeSvg([symbol]);

    expect(output).toContain('viewBox="0 0 24 24"');
    expect(output).not.toContain('<svg');
  });

  it('preserves the SVG children inside the symbol', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const symbol = createSymbol('abc123', data);
    const output = serializeSvg([symbol]);

    expect(output).toContain('<path');
    expect(output).toContain('d="M12 4l8 8-8 8"');
  });

  it('handles SVGs with nested groups', () => {
    const data = parseSvg(readFixture('nested-groups.svg'));
    const symbol = createSymbol('nested1', data);
    const output = serializeSvg([symbol]);

    expect(output).toContain('<g id="outer"');
    expect(output).toContain('<g id="inner"');
    expect(output).toContain('<circle');
    expect(output).toContain('<path');
  });

  it('handles SVGs without viewBox', () => {
    const data = parseSvg(readFixture('no-viewbox.svg'));
    const symbol = createSymbol('novb1', data);
    const output = serializeSvg([symbol]);

    expect(output).toContain('id="novb1"');
    expect(output).not.toContain('viewBox');
  });
});

describe('assembleSprite', () => {
  it('wraps symbols in an <svg> element', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const symbol = createSymbol('abc123', data);
    const sprite = assembleSprite([symbol]);

    expect(sprite).toContain('<svg');
    expect(sprite).toContain('</svg>');
    expect(sprite).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('includes xmlns:xlink attribute', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const symbol = createSymbol('abc123', data);
    const sprite = assembleSprite([symbol]);

    expect(sprite).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
  });

  it('hides the sprite container without display:none', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const symbol = createSymbol('abc123', data);
    const sprite = assembleSprite([symbol]);

    expect(sprite).toContain('aria-hidden="true"');
    expect(sprite).toContain('position:absolute');
    expect(sprite).not.toContain('display:none');
  });

  it('includes multiple symbols', () => {
    const data1 = parseSvg(readFixture('simple.svg'));
    const data2 = parseSvg(readFixture('with-dimensions.svg'));
    const symbol1 = createSymbol('sym1', data1);
    const symbol2 = createSymbol('sym2', data2);
    const sprite = assembleSprite([symbol1, symbol2]);

    expect(sprite).toContain('id="sym1"');
    expect(sprite).toContain('id="sym2"');
  });

  it('produces an empty sprite with no symbols', () => {
    const sprite = assembleSprite([]);

    expect(sprite).toContain('<svg');
    expect(sprite).toContain('</svg>');
    expect(sprite).not.toContain('<symbol');
  });
});

describe('serializeSvg', () => {
  it('round-trips a parsed SVG back to a string', () => {
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0"/></svg>';
    const data = parseSvg(input);
    const output = serializeSvg(data.entries);

    expect(output).toContain('viewBox="0 0 24 24"');
    expect(output).toContain('<path');
    expect(output).toContain('d="M0 0"');
  });
});

describe('source order preservation', () => {
  const sourceOrderSvg = readFixture('source-order.svg');

  it('preserves attribute order on the root <svg> element', () => {
    const data = parseSvg(sourceOrderSvg);
    const output = serializeSvg(data.entries);

    // The original attribute order: xmlns, viewBox, width, height, fill, stroke, stroke-width
    const attrPattern =
      /xmlns="[^"]*"[^>]*viewBox="[^"]*"[^>]*width="[^"]*"[^>]*height="[^"]*"[^>]*fill="[^"]*"[^>]*stroke="[^"]*"[^>]*stroke-width="[^"]*"/;
    expect(output).toMatch(attrPattern);
  });

  it('preserves attribute order on child elements', () => {
    const data = parseSvg(sourceOrderSvg);
    const output = serializeSvg(data.entries);

    // linearGradient attributes: id, x1, y1, x2, y2
    const gradientPattern = /id="grad"[^>]*x1="0"[^>]*y1="0"[^>]*x2="1"[^>]*y2="1"/;
    expect(output).toMatch(gradientPattern);
  });

  it('preserves element order (z-index layering)', () => {
    const data = parseSvg(sourceOrderSvg);
    const output = serializeSvg(data.entries);

    // Elements must appear in source order: rect (bg), defs, circle, rect, path, text
    const bgRect = output.indexOf('fill="#f0f0f0"');
    const defs = output.indexOf('<defs');
    const gradientCircle = output.indexOf('fill="url(#grad)"');
    const greenRect = output.indexOf('fill="green"');
    const orangePath = output.indexOf('fill="orange"');
    const text = output.indexOf('<text');

    expect(bgRect).toBeLessThan(defs);
    expect(defs).toBeLessThan(gradientCircle);
    expect(gradientCircle).toBeLessThan(greenRect);
    expect(greenRect).toBeLessThan(orangePath);
    expect(orangePath).toBeLessThan(text);
  });

  it('preserves <defs> children order', () => {
    const data = parseSvg(sourceOrderSvg);
    const output = serializeSvg(data.entries);

    // Inside <defs>: linearGradient before clipPath
    const gradient = output.indexOf('<linearGradient');
    const clipPath = output.indexOf('<clipPath');

    expect(gradient).toBeLessThan(clipPath);
  });

  it('preserves gradient stop order', () => {
    const data = parseSvg(sourceOrderSvg);
    const output = serializeSvg(data.entries);

    // stop-color="red" must come before stop-color="blue"
    const redStop = output.indexOf('stop-color="red"');
    const blueStop = output.indexOf('stop-color="blue"');

    expect(redStop).toBeLessThan(blueStop);
  });

  it('survives a full round-trip with transforms applied', () => {
    const data = parseSvg(sourceOrderSvg);

    // Apply transforms that the plugin uses
    applyCurrentColor(data.entries);
    stripDimensions(data.entries);

    const output = serializeSvg(data.entries);

    // Element order must still be preserved after transforms.
    // applyCurrentColor rewrites fill="url(#grad)" to fill="currentColor",
    // so look for the clip-path attribute instead to identify the circle.
    const defs = output.indexOf('<defs');
    const clippedCircle = output.indexOf('clip-path="url(#clip)"');
    const text = output.indexOf('<text');

    expect(defs).toBeLessThan(clippedCircle);
    expect(clippedCircle).toBeLessThan(text);
  });
});
