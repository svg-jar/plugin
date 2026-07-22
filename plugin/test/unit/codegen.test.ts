import { describe, it, expect } from 'vitest';
import { generateCode } from '../../src/codegen/index.ts';
import { makePlaceholder } from '../../src/core/constants.ts';
import type { CodegenContext } from '../../src/codegen/types.ts';

const BASE_CTX: CodegenContext = {
  target: 'dom',
  symbolId: 'abc12345',
  viewBox: '0 0 24 24',
  width: '24',
  height: '24',
  mode: 'sprite',
  isDev: false,
  isEmbedded: false,
  svgMarkup: '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>',
  symbolMarkup: '<symbol id="abc12345" viewBox="0 0 24 24"><path d="M0 0"/></symbol>',
  refSymbols: [],
};

function ctx(overrides: Partial<CodegenContext>): CodegenContext {
  return { ...BASE_CTX, ...overrides };
}

describe('generateCode', () => {
  describe('production sprite mode', () => {
    it('imports createSvg from the dom runtime', () => {
      const code = generateCode(ctx({ target: 'dom' }));

      expect(code).toContain("import { createSvg } from '@svg-jar/plugin/runtime/dom'");
    });

    it('imports createSvg from the ember runtime', () => {
      const code = generateCode(ctx({ target: 'ember' }));

      expect(code).toContain("import { createSvg } from '@svg-jar/plugin/runtime/ember'");
    });

    it('includes the sprite placeholder', () => {
      const code = generateCode(ctx({}));
      const placeholder = makePlaceholder('abc12345');

      expect(code).toContain(placeholder);
    });

    it('passes viewBox, width, and height', () => {
      const code = generateCode(ctx({}));

      expect(code).toContain('"0 0 24 24"');
      expect(code).toContain('"24"');
    });

    it('annotates with #__PURE__ for tree-shaking', () => {
      const code = generateCode(ctx({}));

      expect(code).toContain('/*#__PURE__*/');
    });

    it('handles null viewBox/dimensions', () => {
      const code = generateCode(ctx({ viewBox: null, width: null, height: null }));

      expect(code).toContain('null');
    });
  });

  describe('dev sprite mode', () => {
    it('uses createSvgInline for the runtime', () => {
      const code = generateCode(ctx({ isDev: true }));

      expect(code).toContain('createSvgInline');
      expect(code).not.toContain('createSvg(');
    });

    it('wraps the content in a <symbol> with the symbolId', () => {
      const code = generateCode(ctx({ isDev: true }));

      expect(code).toContain('<symbol id=\\"abc12345\\"');
    });

    it('includes a <use href="#symbolId"> reference', () => {
      const code = generateCode(ctx({ isDev: true }));

      expect(code).toContain('<use href=\\"#abc12345\\"/>');
    });

    it('does not contain a sprite placeholder', () => {
      const code = generateCode(ctx({ isDev: true }));
      const placeholder = makePlaceholder('abc12345');

      expect(code).not.toContain(placeholder);
    });

    it('includes referenced symbols when present', () => {
      const code = generateCode(
        ctx({
          isDev: true,
          refSymbols: ['<symbol id="ref123" viewBox="0 0 16 16"><circle r="8"/></symbol>'],
        }),
      );

      expect(code).toContain('<symbol id=\\"ref123\\"');
      expect(code).toContain('<symbol id=\\"abc12345\\"');
      expect(code).toContain('<use href=\\"#abc12345\\"/>');
    });
  });

  describe('inline mode (?unsafe-inline)', () => {
    it('uses createSvgInline even in production', () => {
      const code = generateCode(ctx({ mode: 'inline', isDev: false }));

      expect(code).toContain('createSvgInline');
    });

    it('embeds the full SVG markup', () => {
      const code = generateCode(ctx({ mode: 'inline', isDev: false }));

      expect(code).toContain('<path d=\\"M0 0\\"');
    });
  });

  describe('file mode (?file)', () => {
    it('exports the symbol ID as a string', () => {
      const code = generateCode(ctx({ mode: 'file' }));

      expect(code).toContain('export default');
      expect(code).toContain('"abc12345"');
    });

    it('does not import any runtime', () => {
      const code = generateCode(ctx({ mode: 'file' }));

      expect(code).not.toContain('import');
    });
  });
});
