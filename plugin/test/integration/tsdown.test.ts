import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { describe, it, expect, beforeAll } from 'vitest';

const PLUGIN_DIR = path.resolve(import.meta.dirname, '..', '..');
const PROJECT_DIR = path.resolve(PLUGIN_DIR, '..', 'test-projects', 'tsdown', 'internal-package');
const DIST = path.join(PROJECT_DIR, 'dist');

function readDist(fileName: string): string {
  return fs.readFileSync(path.join(DIST, fileName), 'utf-8');
}

/**
 * Builds the tsdown example project against the freshly built plugin and
 * asserts on the actual dist output. This exercises the real declaration
 * path (dts importer detection -> virtual `.d.ts` module -> declaration
 * codegen -> rolldown-plugin-dts bundling), which unit tests cannot: the
 * detection is coupled to rolldown-plugin-dts internals, and tsdown
 * exiting 0 alone proved nothing (it also exited 0 while emitting a
 * declaration file full of runtime JS).
 */
describe('tsdown integration (internal-package example)', () => {
  beforeAll(async () => {
    // Build the plugin first: the example resolves @svg-jar/plugin via the
    // workspace, whose exports point at dist/. Skipping this would silently
    // test a stale build.
    await execa('pnpm', ['build'], { cwd: PLUGIN_DIR });
    await execa('pnpm', ['build'], { cwd: PROJECT_DIR });
  }, 120_000);

  describe('JS output', () => {
    it('replaces sprite placeholders with base-prefixed URLs', () => {
      const code = readDist('index.js');

      expect(code).not.toContain('__SVG_JAR_SPRITE__');
      expect(code).toMatch(/\/vendor\/icons\/assets\/sprite-[a-f0-9]+\.svg#[a-f0-9]+/);
    });

    it('exports a base-prefixed URL for the ?file import', () => {
      expect(readDist('index.js')).toMatch(/\/vendor\/icons\/assets\/star-[a-f0-9]+\.svg/);
    });

    it('emits the sprite and file assets', () => {
      const assets = fs.readdirSync(path.join(DIST, 'assets'));

      expect(assets.find((f) => /^sprite-[a-f0-9]+\.svg$/.test(f))).toBeDefined();
      expect(assets.find((f) => /^star-[a-f0-9]+\.svg$/.test(f))).toBeDefined();
    });
  });

  describe('declaration output', () => {
    it('declares the component and URL exports', () => {
      const dts = readDist('index.d.ts');

      expect(dts).toContain('declare const component: (options?: SvgOptions) => SVGSVGElement;');
      expect(dts).toContain('declare const url: string;');
      expect(dts).toContain('declare function createNextButton(label: string): HTMLButtonElement;');
      expect(dts).toMatch(/export \{.*component as Square.*\}/);
    });

    it('contains no runtime code or JS imports', () => {
      const dts = readDist('index.d.ts');

      // createSvg may appear inside inlined doc comments; assert it is
      // never imported or called in actual declaration code.
      expect(dts).not.toMatch(/import\s*\{[^}]*createSvg/);
      expect(dts).not.toMatch(/^\s*(?:declare\s+)?(?:const|var|let)[^=\n]*=\s*.*createSvg/m);
      expect(dts).not.toMatch(/from\s+["'][^"']*\.js["']/);
      expect(dts).not.toContain('__SVG_JAR_SPRITE__');
    });
  });
});
