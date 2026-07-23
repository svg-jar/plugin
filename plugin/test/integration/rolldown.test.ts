import path from 'node:path';
import { rolldown, type RolldownOutput } from 'rolldown';
import { describe, it, expect, beforeAll } from 'vitest';
import { SvgJarPlugin } from '../../src/index.ts';
import { PLACEHOLDER_RE } from '../../src/core/constants.ts';

const FIXTURES_DIR = path.join(import.meta.dirname, '..', '_fixtures');
const ENTRY = path.join(FIXTURES_DIR, 'entry.js');
const ENTRY_FILE_MODE = path.join(FIXTURES_DIR, 'entry-file-mode.js');

/**
 * Builds the test fixture with Rolldown + svg-jar plugin and returns the output.
 */
async function build(options = {}, entry = ENTRY): Promise<RolldownOutput> {
  const bundle = await rolldown({
    input: entry,
    plugins: [SvgJarPlugin.rolldown(options)],
    // The generated components import the runtime from the published
    // package name, which is not resolvable from inside the package itself.
    external: [/^@svg-jar\/plugin\/runtime\//],
  });
  return bundle.generate({ format: 'esm' });
}

function findChunk(output: RolldownOutput) {
  const chunk = output.output.find((o) => o.type === 'chunk');
  if (!chunk || chunk.type !== 'chunk') throw new Error('no chunk in output');
  return chunk;
}

function findAsset(output: RolldownOutput, match: (fileName: string) => boolean) {
  return output.output.find((o) => o.type === 'asset' && match(o.fileName));
}

describe('Rolldown integration', () => {
  let output: RolldownOutput;

  beforeAll(async () => {
    output = await build({ target: 'dom' });
  });

  describe('output chunks', () => {
    it('generates a single output chunk', () => {
      const chunks = output.output.filter((o) => o.type === 'chunk');
      expect(chunks).toHaveLength(1);
    });

    it('contains createSvg import for sprite mode SVGs', () => {
      expect(findChunk(output).code).toContain('createSvg');
    });

    it('replaces all sprite placeholders with final sprite URLs', () => {
      const code = findChunk(output).code;

      PLACEHOLDER_RE.lastIndex = 0;
      expect(code).not.toMatch(PLACEHOLDER_RE);
      expect(code).toMatch(/\/assets\/sprite-[a-f0-9]+\.svg#[a-f0-9]+/);
      expect(code).toMatch(/\/assets\/nav-[a-f0-9]+\.svg#[a-f0-9]+/);
    });
  });

  describe('sprite files', () => {
    it('emits a default sprite asset with content hash', () => {
      expect(findAsset(output, (f) => f.startsWith('assets/sprite-') && f.endsWith('.svg'))).toBeDefined();
    });

    it('emits a named sprite asset with content hash', () => {
      expect(findAsset(output, (f) => f.startsWith('assets/nav-') && f.endsWith('.svg'))).toBeDefined();
    });

    it('default sprite contains the simple icon symbol', () => {
      const asset = findAsset(output, (f) => f.startsWith('assets/sprite-'));
      expect(asset?.type === 'asset' && asset.source).toContain('<symbol');
    });
  });

  describe('file mode', () => {
    let fileOutput: RolldownOutput;

    beforeAll(async () => {
      fileOutput = await build({ target: 'dom' }, ENTRY_FILE_MODE);
    });

    it('exports the emitted asset URL', () => {
      const code = findChunk(fileOutput).code;
      expect(code).toMatch(/\/assets\/simple-[a-f0-9]+\.svg/);
    });

    it('emits the SVG as a standalone file asset', () => {
      expect(findAsset(fileOutput, (f) => /^assets\/simple-[a-f0-9]+\.svg$/.test(f))).toBeDefined();
    });
  });

  describe('base option', () => {
    it('prefixes sprite and file asset URLs with the configured base', async () => {
      const [spriteOutput, fileOutput] = await Promise.all([
        build({ target: 'dom', base: '/vendor/icons/' }),
        build({ target: 'dom', base: '/vendor/icons' }, ENTRY_FILE_MODE),
      ]);

      expect(findChunk(spriteOutput).code).toMatch(/\/vendor\/icons\/assets\/sprite-[a-f0-9]+\.svg#[a-f0-9]+/);
      // Trailing slash is added when missing
      expect(findChunk(fileOutput).code).toMatch(/\/vendor\/icons\/assets\/simple-[a-f0-9]+\.svg/);
    });
  });
});
