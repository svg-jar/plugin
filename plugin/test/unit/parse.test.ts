import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseSvg, hashSvg } from '../../src/svg/parse.ts';

const FIXTURES_DIR = path.join(import.meta.dirname, '..', '_fixtures');

function readFixture(name: string): string {
  return readFileSync(path.join(FIXTURES_DIR, name), 'utf-8');
}

describe('parseSvg', () => {
  it('extracts viewBox from a simple SVG', () => {
    const data = parseSvg(readFixture('simple.svg'));

    expect(data.viewBox).toBe('0 0 24 24');
  });

  it('extracts width and height when present', () => {
    const data = parseSvg(readFixture('with-dimensions.svg'));

    expect(data.viewBox).toBe('0 0 24 24');
    expect(data.width).toBe('24');
    expect(data.height).toBe('24');
  });

  it('returns null for missing viewBox', () => {
    const data = parseSvg(readFixture('no-viewbox.svg'));

    expect(data.viewBox).toBeNull();
    expect(data.width).toBe('48');
    expect(data.height).toBe('48');
  });

  it('returns null for missing width/height', () => {
    const data = parseSvg(readFixture('simple.svg'));

    expect(data.width).toBeNull();
    expect(data.height).toBeNull();
  });

  it('preserves the lossless entry structure', () => {
    const data = parseSvg(readFixture('simple.svg'));

    expect(data.entries).toBeInstanceOf(Array);
    expect(data.entries.length).toBeGreaterThan(0);

    // The root entry should be an svg element
    const root = data.entries[0] as { svg: unknown[] };
    expect(root).toHaveProperty('svg');
  });

  it('handles SVGs with nested groups', () => {
    const data = parseSvg(readFixture('nested-groups.svg'));

    expect(data.viewBox).toBe('0 0 100 100');
    expect(data.entries).toBeInstanceOf(Array);
  });

  it('handles inline SVG strings', () => {
    const data = parseSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16"/></svg>',
    );

    expect(data.viewBox).toBe('0 0 16 16');
    expect(data.width).toBeNull();
  });
});

describe('hashSvg', () => {
  it('returns an 8-character hex string', () => {
    const hash = hashSvg('<svg><path d="M0 0"/></svg>');

    expect(hash).toMatch(/^[a-f0-9]{8}$/);
  });

  it('returns the same hash for the same input', () => {
    const input = '<svg><path d="M0 0"/></svg>';

    expect(hashSvg(input)).toBe(hashSvg(input));
  });

  it('returns different hashes for different inputs', () => {
    const hash1 = hashSvg('<svg><path d="M0 0"/></svg>');
    const hash2 = hashSvg('<svg><circle cx="0" cy="0" r="5"/></svg>');

    expect(hash1).not.toBe(hash2);
  });

  it('is deterministic across calls', () => {
    const source = readFixture('simple.svg');
    const hash1 = hashSvg(source);
    const hash2 = hashSvg(source);

    expect(hash1).toBe(hash2);
  });
});
