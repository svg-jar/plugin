import { describe, it, expect } from 'vitest';
import { makePlaceholder, PLACEHOLDER_RE } from '../../src/core/constants.ts';

describe('makePlaceholder', () => {
  it('creates a placeholder string from a symbol ID', () => {
    expect(makePlaceholder('abc123')).toBe('__SVG_JAR_SPRITE__abc123__');
  });
});

describe('PLACEHOLDER_RE', () => {
  it('matches a placeholder and captures the symbol ID', () => {
    const input = 'before __SVG_JAR_SPRITE__abc123__ after';
    const matches = [...input.matchAll(PLACEHOLDER_RE)];

    expect(matches).toHaveLength(1);
    expect(matches[0][1]).toBe('abc123');
  });

  it('matches multiple placeholders in the same string', () => {
    const input = '__SVG_JAR_SPRITE__abc123__ and __SVG_JAR_SPRITE__def456__';
    const matches = [...input.matchAll(PLACEHOLDER_RE)];

    expect(matches).toHaveLength(2);
    expect(matches[0][1]).toBe('abc123');
    expect(matches[1][1]).toBe('def456');
  });

  it('does not match non-hex characters in the symbol ID', () => {
    const input = '__SVG_JAR_SPRITE__notHex!__';
    const matches = [...input.matchAll(PLACEHOLDER_RE)];

    expect(matches).toHaveLength(0);
  });

  it('round-trips with makePlaceholder', () => {
    const symbolId = 'deadbeef';
    const placeholder = makePlaceholder(symbolId);
    const matches = [...placeholder.matchAll(PLACEHOLDER_RE)];

    expect(matches).toHaveLength(1);
    expect(matches[0][1]).toBe(symbolId);
  });
});
