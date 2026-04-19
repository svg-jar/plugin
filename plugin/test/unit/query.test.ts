import { describe, it, expect } from 'vitest';
import { parseSvgId, isSvgId } from '../../src/core/query.ts';

describe('parseSvgId', () => {
  describe('import mode', () => {
    it('defaults to sprite mode with no query string', () => {
      const result = parseSvgId('/project/icon.svg');

      expect(result.mode).toBe('sprite');
      expect(result.filePath).toBe('/project/icon.svg');
    });

    it('parses ?unsafe-inline as inline mode', () => {
      const result = parseSvgId('/project/icon.svg?unsafe-inline');

      expect(result.mode).toBe('inline');
    });

    it('parses ?file as file mode', () => {
      const result = parseSvgId('/project/icon.svg?file');

      expect(result.mode).toBe('file');
    });
  });

  describe('sprite name', () => {
    it('returns undefined when no ?sprite query', () => {
      const result = parseSvgId('/project/icon.svg');

      expect(result.spriteName).toBeUndefined();
    });

    it('parses ?sprite=nav as a named sprite', () => {
      const result = parseSvgId('/project/icon.svg?sprite=nav');

      expect(result.spriteName).toBe('nav');
    });

    it('returns undefined for inline mode without ?sprite', () => {
      const result = parseSvgId('/project/icon.svg?unsafe-inline');

      expect(result.spriteName).toBeUndefined();
    });
  });

  describe('currentColor override', () => {
    it('returns undefined when no currentColor query', () => {
      const result = parseSvgId('/project/icon.svg');

      expect(result.currentColor).toBeUndefined();
    });

    it('parses ?current-color as true', () => {
      const result = parseSvgId('/project/icon.svg?current-color');

      expect(result.currentColor).toBe(true);
    });

    it('parses ?skip-current-color as false', () => {
      const result = parseSvgId('/project/icon.svg?skip-current-color');

      expect(result.currentColor).toBe(false);
    });
  });

  describe('combined query strings', () => {
    it('handles ?sprite=nav&current-color', () => {
      const result = parseSvgId('/project/icon.svg?sprite=nav&current-color');

      expect(result.mode).toBe('sprite');
      expect(result.spriteName).toBe('nav');
      expect(result.currentColor).toBe(true);
    });

    it('handles ?unsafe-inline&skip-current-color', () => {
      const result = parseSvgId('/project/icon.svg?unsafe-inline&skip-current-color');

      expect(result.mode).toBe('inline');
      expect(result.currentColor).toBe(false);
    });
  });

  describe('file path extraction', () => {
    it('strips query string from file path', () => {
      const result = parseSvgId('/project/icons/arrow.svg?sprite=nav&current-color');

      expect(result.filePath).toBe('/project/icons/arrow.svg');
    });

    it('handles paths with no query string', () => {
      const result = parseSvgId('/project/icons/arrow.svg');

      expect(result.filePath).toBe('/project/icons/arrow.svg');
    });
  });
});

describe('isSvgId', () => {
  it('returns true for .svg files', () => {
    expect(isSvgId('/project/icon.svg')).toBe(true);
  });

  it('returns true for .svg files with query strings', () => {
    expect(isSvgId('/project/icon.svg?unsafe-inline')).toBe(true);
  });

  it('returns false for non-svg files', () => {
    expect(isSvgId('/project/icon.png')).toBe(false);
    expect(isSvgId('/project/component.ts')).toBe(false);
  });

  it('returns false for files that contain svg but do not end with .svg', () => {
    expect(isSvgId('/project/svg-utils.ts')).toBe(false);
  });
});
