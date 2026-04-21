import type { LosslessEntry } from '@eksml/xml/lossless';
import type { SvgData } from './types.ts';
import { hashSvg } from '../svg/parse.ts';

/**
 * A symbol registered in a sprite sheet.
 */
export interface SpriteSymbol {
  /** Deterministic hash of the SVG content. */
  symbolId: string;
  /** The `<symbol>` element in lossless format. */
  entries: LosslessEntry[];
  /** Metadata from the original SVG. */
  metadata: SvgData;
}

/**
 * Manages sprite sheet state across plugin hooks.
 *
 * Symbols are added during `load`, marked as used during `renderChunk`,
 * and assembled into sprite sheets during `generateBundle`.
 *
 * Each named sprite (e.g. `"sprite"`, `"nav"`) maintains its own list of
 * symbols. Tree-shaking is supported by tracking which symbols actually
 * appear in the final bundled output.
 */
export class SpriteRegistry {
  /** Symbols grouped by sprite name. */
  private sprites = new Map<string, SpriteSymbol[]>();

  /** Symbol IDs that were found in rendered chunks (used for tree-shaking). */
  private usedSymbolIds = new Set<string>();

  /** Reverse mapping: symbolId → spriteName. */
  private symbolToSprite = new Map<string, string>();

  /** Sprite names that should be embedded inline in the HTML document. */
  private embeddedSprites = new Set<string>();

  /**
   * Registers a symbol in a named sprite.
   *
   * @param spriteName The sprite to add to (e.g. `"sprite"`, `"nav"`).
   * @param symbol     The symbol to register.
   * @param embedded   When `true`, marks this sprite as inline-embedded.
   */
  addSymbol(spriteName: string, symbol: SpriteSymbol, embedded = false): void {
    let symbols = this.sprites.get(spriteName);
    if (!symbols) {
      symbols = [];
      this.sprites.set(spriteName, symbols);
    }
    symbols.push(symbol);
    this.symbolToSprite.set(symbol.symbolId, spriteName);
    if (embedded) {
      this.embeddedSprites.add(spriteName);
    }
  }

  /**
   * Returns `true` if the named sprite should be inlined into the HTML
   * document rather than emitted as an external asset file.
   */
  isEmbedded(spriteName: string): boolean {
    return this.embeddedSprites.has(spriteName);
  }

  /**
   * Returns the sprite name that a symbol belongs to.
   */
  getSpriteName(symbolId: string): string | undefined {
    return this.symbolToSprite.get(symbolId);
  }

  /**
   * Marks a symbol ID as used in the final output. Called during
   * `renderChunk` when a placeholder is found in bundled code.
   */
  markUsed(symbolId: string): void {
    this.usedSymbolIds.add(symbolId);
  }

  /**
   * Returns whether a symbol ID was found in rendered chunks.
   */
  isUsed(symbolId: string): boolean {
    return this.usedSymbolIds.has(symbolId);
  }

  /**
   * Returns all symbols for a named sprite (no tree-shaking applied).
   */
  getSprite(name: string): SpriteSymbol[] {
    return this.sprites.get(name) ?? [];
  }

  /**
   * Returns only the symbols that were marked as used for a named sprite.
   * This is the tree-shaken set used during `generateBundle`.
   */
  getUsedSymbols(name: string): SpriteSymbol[] {
    return this.getSprite(name).filter((s) => this.usedSymbolIds.has(s.symbolId));
  }

  /**
   * Returns all sprite names that have at least one symbol registered.
   */
  getSpriteNames(): string[] {
    return [...this.sprites.keys()];
  }

  /**
   * Returns a hashed filename for a sprite, based on the sorted symbol IDs
   * of all symbols in the sprite (not just used ones). This ensures the
   * filename is stable across `renderChunk` and `generateBundle`.
   *
   * @example getSpriteFileName('sprite') → 'sprite-a1b2c3d4.svg'
   */
  getSpriteFileName(spriteName: string): string {
    const symbols = this.getSprite(spriteName);
    const content = symbols
      .map((s) => s.symbolId)
      .sort()
      .join('');
    const hash = hashSvg(content).slice(0, 8);
    return `${spriteName}-${hash}.svg`;
  }

  /**
   * Clears all state. Called on `buildStart` to reset between builds.
   */
  reset(): void {
    this.sprites.clear();
    this.usedSymbolIds.clear();
    this.symbolToSprite.clear();
    this.embeddedSprites.clear();
  }
}
