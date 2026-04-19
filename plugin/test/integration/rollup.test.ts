import { readFileSync } from 'node:fs';
import path from 'node:path';
import { rollup, type Plugin, type RollupOutput } from 'rollup';
import { describe, it, expect, beforeAll } from 'vitest';
import { SvgJarPlugin } from '../../src/index.ts';

const FIXTURES_DIR = path.join(import.meta.dirname, '..', '_fixtures');
const ENTRY = path.join(FIXTURES_DIR, 'entry.js');
const ENTRY_EMBEDDED_REFS = path.join(FIXTURES_DIR, 'entry-embedded-refs.js');

/** Non-JS file extensions that should be treated as binary assets. */
const ASSET_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico'];

/**
 * Minimal Rollup plugin that handles binary asset imports.
 * Mirrors what Vite does natively for non-JS files.
 */
function assetPlugin(): Plugin {
  return {
    name: 'test-asset',
    load(id) {
      const ext = path.extname(id);
      if (!ASSET_EXTS.includes(ext)) return null;

      const source = readFileSync(id);
      const hash = Buffer.from(source).toString('hex').slice(0, 8);
      const fileName = `assets/${path.basename(id, ext)}-${hash}${ext}`;

      this.emitFile({ type: 'asset', fileName, source });

      return `export default ${JSON.stringify(`/${fileName}`)};`;
    },
  };
}

/**
 * Builds the test fixture with Rollup + svg-jar plugin and returns the output.
 */
async function build(options = {}, entry = ENTRY): Promise<RollupOutput> {
  const plugin = SvgJarPlugin.rollup(options);
  const bundle = await rollup({
    input: entry,
    plugins: [plugin, assetPlugin()],
    // Suppress unresolved import warnings for the runtime modules
    onwarn(warning, defaultHandler) {
      if (warning.code === 'UNRESOLVED_IMPORT') return;
      defaultHandler(warning);
    },
  });

  return bundle.generate({ format: 'esm' });
}

describe('Rollup integration', () => {
  let output: RollupOutput;

  beforeAll(async () => {
    output = await build({ target: 'dom' });
  });

  describe('output chunks', () => {
    it('generates a single output chunk', () => {
      const chunks = output.output.filter((o) => o.type === 'chunk');
      expect(chunks).toHaveLength(1);
    });

    it('contains createSvg import for sprite mode SVGs', () => {
      const chunk = output.output.find((o) => o.type === 'chunk');
      expect(chunk).toBeDefined();
      expect(chunk!.type === 'chunk' && chunk!.code).toContain('createSvg');
    });

    it('contains createSvgInline import for inline mode SVGs', () => {
      const chunk = output.output.find((o) => o.type === 'chunk');
      expect(chunk).toBeDefined();
      expect(chunk!.type === 'chunk' && chunk!.code).toContain('createSvgInline');
    });

    it('contains SVG markup for inline imports', () => {
      const chunk = output.output.find((o) => o.type === 'chunk');
      expect(chunk).toBeDefined();
      // The with-dimensions.svg?unsafe-inline should have its inner markup embedded
      expect(chunk!.type === 'chunk' && chunk!.code).toContain('<circle');
    });
  });

  describe('sprite files', () => {
    function findAsset(match: (fileName: string) => boolean) {
      return output.output.find((o) => o.type === 'asset' && match(o.fileName));
    }

    function assetSource(match: (fileName: string) => boolean): string {
      const asset = findAsset(match);
      return asset?.type === 'asset' && typeof asset.source === 'string' ? asset.source : '';
    }

    it('emits a default sprite asset with content hash', () => {
      expect(findAsset((f) => f.startsWith('assets/sprite-') && f.endsWith('.svg'))).toBeDefined();
    });

    it('emits a named sprite asset with content hash', () => {
      expect(findAsset((f) => f.startsWith('assets/nav-') && f.endsWith('.svg'))).toBeDefined();
    });

    it('default sprite contains the simple icon symbol', () => {
      const source = assetSource((f) => f.startsWith('assets/sprite-'));
      expect(source).toContain('<symbol');
      expect(source).toContain('viewBox="0 0 24 24"');
    });

    it('named sprite contains the nested-groups icon symbol', () => {
      const source = assetSource((f) => f.startsWith('assets/nav-'));
      expect(source).toContain('<symbol');
      expect(source).toContain('viewBox="0 0 100 100"');
    });

    it('inline SVGs are not in any sprite', () => {
      const assets = output.output.filter((o) => o.type === 'asset');
      for (const asset of assets) {
        if (asset.type !== 'asset' || typeof asset.source !== 'string') continue;
        // with-dimensions.svg was imported as ?unsafe-inline, should not appear in sprites
        expect(asset.source).not.toContain('viewBox="0 0 24 24" width="24" height="24"');
      }
    });
  });

  describe('embedded refs', () => {
    let refOutput: RollupOutput;

    beforeAll(async () => {
      refOutput = await build({ target: 'dom' }, ENTRY_EMBEDDED_REFS);
    });

    function spriteSource(): string {
      const sprite = refOutput.output.find(
        (o) => o.type === 'asset' && o.fileName.startsWith('assets/sprite-') && o.fileName.endsWith('.svg'),
      );
      return sprite?.type === 'asset' && typeof sprite.source === 'string' ? sprite.source : '';
    }

    it('resolves <use href> to a sprite URL with symbol fragment', () => {
      const source = spriteSource();
      // The <use href="./simple.svg"> should be rewritten to the sprite URL + #symbolId
      expect(source).not.toContain('href="./simple.svg"');
      expect(source).toMatch(/href="\/assets\/sprite-[a-f0-9]+\.svg#[a-f0-9]+"/);
    });

    it('includes the referenced SVG as its own symbol in the sprite', () => {
      const source = spriteSource();
      // with-use-ref.svg references simple.svg, so simple.svg should
      // also be a <symbol> in the sprite
      const symbolCount = (source.match(/<symbol/g) || []).length;
      expect(symbolCount).toBeGreaterThanOrEqual(2);
    });

    it('resolves <image href> to a file asset URL when referencing an SVG', () => {
      const source = spriteSource();
      // with-image-svg-ref.svg has <image href="./simple.svg">
      // The SVG should be emitted as a file asset, and the href rewritten to its URL
      expect(source).toMatch(/href="\/assets\/simple-[a-f0-9]+\.svg"/);
    });

    it('emits the referenced SVG as a standalone file asset', () => {
      const fileAsset = refOutput.output.find(
        (o) => o.type === 'asset' && o.fileName.includes('simple') && o.fileName.endsWith('.svg'),
      );
      expect(fileAsset).toBeDefined();
    });

    it('resolves <image href> to the asset URL for non-SVG files', () => {
      const source = spriteSource();
      // with-image-ref.svg has <image href="./placeholder.png">
      // The asset plugin emits it as assets/placeholder-<hash>.png
      expect(source).not.toContain('href="./placeholder.png"');
      expect(source).toMatch(/href="\/assets\/placeholder-[a-f0-9]+\.png"/);
    });

    it('emits the PNG as a binary asset', () => {
      const pngAsset = refOutput.output.find(
        (o) => o.type === 'asset' && o.fileName.includes('placeholder') && o.fileName.endsWith('.png'),
      );
      expect(pngAsset).toBeDefined();
    });
  });

  describe('currentColor', () => {
    it('applies currentColor when enabled globally', async () => {
      const result = await build({ target: 'dom', currentColor: true });

      // The nav sprite (nested-groups.svg) has fill="blue" and fill="green"
      const navSprite = result.output.find(
        (o) => o.type === 'asset' && o.fileName.startsWith('assets/nav-') && o.fileName.endsWith('.svg'),
      );
      expect(navSprite).toBeDefined();
      if (navSprite!.type === 'asset' && typeof navSprite!.source === 'string') {
        expect(navSprite!.source).toContain('currentColor');
        expect(navSprite!.source).not.toContain('fill="blue"');
        expect(navSprite!.source).not.toContain('fill="green"');
      }
    });
  });
});
