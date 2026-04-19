import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { write } from '@eksml/xml/writer';
import { parseSvg } from '../../src/svg/parse.ts';
import { applyCurrentColor, stripDimensions, findEmbeddedRefs } from '../../src/svg/transform.ts';

const FIXTURES_DIR = path.join(import.meta.dirname, '..', '_fixtures');

function readFixture(name: string): string {
  return readFileSync(path.join(FIXTURES_DIR, name), 'utf-8');
}

describe('applyCurrentColor', () => {
  it('replaces fill values with currentColor', () => {
    const data = parseSvg(readFixture('colored.svg'));
    applyCurrentColor(data.entries);
    const output = write(data.entries);

    expect(output).toContain('fill="currentColor"');
    expect(output).not.toContain('fill="#e91e63"');
  });

  it('replaces stroke values with currentColor', () => {
    const data = parseSvg(readFixture('colored.svg'));
    applyCurrentColor(data.entries);
    const output = write(data.entries);

    expect(output).toContain('stroke="currentColor"');
    expect(output).not.toContain('stroke="#333"');
  });

  it('preserves fill="none"', () => {
    const data = parseSvg(readFixture('colored.svg'));
    applyCurrentColor(data.entries);
    const output = write(data.entries);

    expect(output).toContain('fill="none"');
  });

  it('handles SVGs without fill/stroke attributes', () => {
    const data = parseSvg(readFixture('simple.svg'));
    applyCurrentColor(data.entries);
    const output = write(data.entries);

    // Should not crash, output should still be valid
    expect(output).toContain('<path');
  });

  it('processes nested elements', () => {
    const data = parseSvg(readFixture('nested-groups.svg'));
    applyCurrentColor(data.entries);
    const output = write(data.entries);

    expect(output).toContain('fill="currentColor"');
    expect(output).not.toContain('fill="blue"');
    expect(output).not.toContain('fill="green"');
  });

  it('returns the entries for chaining', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const result = applyCurrentColor(data.entries);

    expect(result).toBe(data.entries);
  });
});

describe('stripDimensions', () => {
  it('removes width and height from the root svg', () => {
    const data = parseSvg(readFixture('with-dimensions.svg'));
    stripDimensions(data.entries);
    const output = write(data.entries);

    expect(output).not.toContain('width="24"');
    expect(output).not.toContain('height="24"');
    expect(output).toContain('viewBox="0 0 24 24"');
  });

  it('does nothing when there are no dimensions', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const before = write(data.entries);
    stripDimensions(data.entries);
    const after = write(data.entries);

    expect(after).toBe(before);
  });

  it('only strips from the root svg, not child elements', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="10" height="10"/></svg>';
    const data = parseSvg(svg);
    stripDimensions(data.entries);
    const output = write(data.entries);

    // Root dimensions removed
    expect(output).not.toMatch(/svg[^>]*width="24"/);
    // Child rect dimensions preserved
    expect(output).toContain('width="10"');
    expect(output).toContain('height="10"');
  });

  it('returns the entries for chaining', () => {
    const data = parseSvg(readFixture('with-dimensions.svg'));
    const result = stripDimensions(data.entries);

    expect(result).toBe(data.entries);
  });
});

describe('findEmbeddedRefs', () => {
  it('finds <use href> pointing to an external file', () => {
    const data = parseSvg('<svg xmlns="http://www.w3.org/2000/svg"><use href="./arrow.svg"/></svg>');
    const refs = findEmbeddedRefs(data.entries);

    expect(refs).toHaveLength(1);
    expect(refs[0].tag).toBe('use');
    expect(refs[0].attr).toBe('href');
    expect(refs[0].href).toBe('./arrow.svg');
  });

  it('finds <image href> pointing to an external file', () => {
    const data = parseSvg('<svg xmlns="http://www.w3.org/2000/svg"><image href="photo.png"/></svg>');
    const refs = findEmbeddedRefs(data.entries);

    expect(refs).toHaveLength(1);
    expect(refs[0].tag).toBe('image');
    expect(refs[0].attr).toBe('href');
    expect(refs[0].href).toBe('photo.png');
  });

  it('finds xlink:href references', () => {
    const data = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="./arrow.svg"/></svg>',
    );
    const refs = findEmbeddedRefs(data.entries);

    expect(refs).toHaveLength(1);
    expect(refs[0].attr).toBe('xlink:href');
    expect(refs[0].href).toBe('./arrow.svg');
  });

  it('skips internal fragment references (href="#id")', () => {
    const data = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><defs><circle id="dot" r="5"/></defs><use href="#dot"/></svg>',
    );
    const refs = findEmbeddedRefs(data.entries);

    expect(refs).toHaveLength(0);
  });

  it('finds multiple references in one SVG', () => {
    const data = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><use href="./a.svg"/><image href="./b.png"/><use href="./c.svg"/></svg>',
    );
    const refs = findEmbeddedRefs(data.entries);

    expect(refs).toHaveLength(3);
    expect(refs[0].href).toBe('./a.svg');
    expect(refs[1].href).toBe('./b.png');
    expect(refs[2].href).toBe('./c.svg');
  });

  it('finds refs nested inside groups', () => {
    const data = parseSvg('<svg xmlns="http://www.w3.org/2000/svg"><g><g><use href="./nested.svg"/></g></g></svg>');
    const refs = findEmbeddedRefs(data.entries);

    expect(refs).toHaveLength(1);
    expect(refs[0].href).toBe('./nested.svg');
  });

  it('returns empty array for SVGs with no external refs', () => {
    const data = parseSvg(readFixture('simple.svg'));
    const refs = findEmbeddedRefs(data.entries);

    expect(refs).toHaveLength(0);
  });

  it('provides a mutable attrs reference for rewriting', () => {
    const data = parseSvg('<svg xmlns="http://www.w3.org/2000/svg"><use href="./arrow.svg"/></svg>');
    const refs = findEmbeddedRefs(data.entries);

    // Rewrite the href via the returned attrs reference
    refs[0].attrs[refs[0].attr] = '/resolved/arrow.svg';

    // The change should be reflected in the original entries
    const output = write(data.entries);
    expect(output).toContain('href="/resolved/arrow.svg"');
    expect(output).not.toContain('href="./arrow.svg"');
  });

  it('prefers href over xlink:href when both are present', () => {
    const data = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use href="./a.svg" xlink:href="./b.svg"/></svg>',
    );
    const refs = findEmbeddedRefs(data.entries);

    // Should return only one ref (href takes priority due to iteration order)
    expect(refs).toHaveLength(1);
    expect(refs[0].attr).toBe('href');
    expect(refs[0].href).toBe('./a.svg');
  });

  it('skips empty href values', () => {
    const data = parseSvg('<svg xmlns="http://www.w3.org/2000/svg"><use href=""/></svg>');
    const refs = findEmbeddedRefs(data.entries);

    expect(refs).toHaveLength(0);
  });
});
