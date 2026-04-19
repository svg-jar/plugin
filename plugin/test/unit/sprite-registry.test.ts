import { describe, it, expect, beforeEach } from 'vitest';
import { SpriteRegistry, type SpriteSymbol } from '../../src/core/sprite-registry.ts';
import { parseSvg } from '../../src/svg/parse.ts';
import { createSymbol } from '../../src/svg/serialize.ts';

function makeSymbol(id: string, svg: string): SpriteSymbol {
  const data = parseSvg(svg);
  return {
    symbolId: id,
    entries: [createSymbol(id, data)],
    metadata: data,
  };
}

const ICON_A = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0"/></svg>';
const ICON_B = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
const ICON_C = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16"/></svg>';

describe('SpriteRegistry', () => {
  let registry: SpriteRegistry;

  beforeEach(() => {
    registry = new SpriteRegistry();
  });

  describe('addSymbol', () => {
    it('registers a symbol in the default sprite', () => {
      registry.addSymbol('sprite', makeSymbol('a1', ICON_A));

      expect(registry.getSprite('sprite')).toHaveLength(1);
    });

    it('registers multiple symbols in the same sprite', () => {
      registry.addSymbol('sprite', makeSymbol('a1', ICON_A));
      registry.addSymbol('sprite', makeSymbol('b1', ICON_B));

      expect(registry.getSprite('sprite')).toHaveLength(2);
    });

    it('registers symbols in different named sprites', () => {
      registry.addSymbol('sprite', makeSymbol('a1', ICON_A));
      registry.addSymbol('nav', makeSymbol('b1', ICON_B));

      expect(registry.getSprite('sprite')).toHaveLength(1);
      expect(registry.getSprite('nav')).toHaveLength(1);
    });
  });

  describe('getSpriteNames', () => {
    it('returns all sprite names', () => {
      registry.addSymbol('sprite', makeSymbol('a1', ICON_A));
      registry.addSymbol('nav', makeSymbol('b1', ICON_B));
      registry.addSymbol('footer', makeSymbol('c1', ICON_C));

      expect(registry.getSpriteNames()).toEqual(expect.arrayContaining(['sprite', 'nav', 'footer']));
      expect(registry.getSpriteNames()).toHaveLength(3);
    });

    it('returns empty array when no sprites registered', () => {
      expect(registry.getSpriteNames()).toEqual([]);
    });
  });

  describe('getSprite', () => {
    it('returns empty array for unknown sprite name', () => {
      expect(registry.getSprite('unknown')).toEqual([]);
    });
  });

  describe('tree-shaking', () => {
    beforeEach(() => {
      registry.addSymbol('sprite', makeSymbol('a1', ICON_A));
      registry.addSymbol('sprite', makeSymbol('b1', ICON_B));
      registry.addSymbol('sprite', makeSymbol('c1', ICON_C));
    });

    it('markUsed tracks which symbols are in the output', () => {
      registry.markUsed('a1');

      expect(registry.isUsed('a1')).toBe(true);
      expect(registry.isUsed('b1')).toBe(false);
      expect(registry.isUsed('c1')).toBe(false);
    });

    it('getUsedSymbols returns only marked symbols', () => {
      registry.markUsed('a1');
      registry.markUsed('c1');

      const used = registry.getUsedSymbols('sprite');
      expect(used).toHaveLength(2);
      expect(used.map((s) => s.symbolId)).toEqual(['a1', 'c1']);
    });

    it('getUsedSymbols returns empty when nothing is marked', () => {
      expect(registry.getUsedSymbols('sprite')).toEqual([]);
    });
  });

  describe('reset', () => {
    it('clears all sprites and used markers', () => {
      registry.addSymbol('sprite', makeSymbol('a1', ICON_A));
      registry.markUsed('a1');

      registry.reset();

      expect(registry.getSpriteNames()).toEqual([]);
      expect(registry.isUsed('a1')).toBe(false);
    });
  });
});
