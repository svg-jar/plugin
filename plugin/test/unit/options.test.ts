import { describe, it, expect } from 'vitest';
import { resolveOptions } from '../../src/core/options.ts';

describe('resolveOptions', () => {
  it('fills all defaults when no options provided', () => {
    const resolved = resolveOptions();

    expect(resolved.target).toBe('dom');
    expect(resolved.svgo).toBe(true);
    expect(resolved.defaultSprite).toBe('sprite');
    expect(resolved.currentColor).toBe(false);
  });

  it('preserves user-provided values', () => {
    const resolved = resolveOptions({
      target: 'ember',
      svgo: false,
      defaultSprite: 'icons',
      currentColor: true,
    });

    expect(resolved.target).toBe('ember');
    expect(resolved.svgo).toBe(false);
    expect(resolved.defaultSprite).toBe('icons');
    expect(resolved.currentColor).toBe(true);
  });

  it('accepts an SVGO config object', () => {
    const svgoConfig = { plugins: [] };
    const resolved = resolveOptions({ svgo: svgoConfig });

    expect(resolved.svgo).toBe(svgoConfig);
  });

  describe('base', () => {
    it('defaults to undefined (bundler decides)', () => {
      expect(resolveOptions({}).base).toBeUndefined();
    });

    it('preserves a base with a trailing slash', () => {
      expect(resolveOptions({ base: '/vendor/icons/' }).base).toBe('/vendor/icons/');
    });

    it('adds a missing trailing slash', () => {
      expect(resolveOptions({ base: '/vendor/icons' }).base).toBe('/vendor/icons/');
    });
  });
});
