import { test, expect } from '@playwright/test';
import {
  assetsDir,
  expectSvgsVisible,
  expectSpriteRef,
  expectInlineSvg,
  expectChildrenSupport,
  expectDefaultSprite,
  expectNamedSprite,
  expectSpriteContainsArrow,
  expectSpriteNoInlineSvgs,
  expectNamedSpriteContainsCircle,
  expectChunkContainsSpriteRefs,
  expectChunkContainsInlineMarkup,
  expectChunkContainsChildren,
} from './helpers.ts';

const ASSETS = assetsDir('preact');

test.describe('Preact', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('SVG Jar Preact Test');
  });

  test('renders SVGs', async ({ page }) => {
    await expectSvgsVisible(page);
  });

  test('sprite icons with <use href>', async ({ page }) => {
    await expectSpriteRef(page);
  });

  test('inline SVGs', async ({ page }) => {
    await expectInlineSvg(page);
  });

  test('children for accessibility', async ({ page }) => {
    await expectChildrenSupport(page, 'Forward arrow');
  });

  test('class attribute', async ({ page }) => {
    await expect(page.locator('svg.icon').first()).toBeAttached();
  });

  // -- Visual regression --

  test('all SVGs render correctly', async ({ page }) => {
    const app = page.locator('#app');
    await expect(app).toBeVisible();
    await expect(app).toHaveScreenshot('all-svgs.png', { maxDiffPixelRatio: 0.01 });
  });

  // -- Build output --

  test('emits default sprite', () => expectDefaultSprite(ASSETS));
  test('emits named sprite', () => expectNamedSprite(ASSETS));
  test('sprite contains arrow', () => expectSpriteContainsArrow(ASSETS));
  test('sprite excludes inline SVGs', () => expectSpriteNoInlineSvgs(ASSETS));
  test('named sprite contains circle', () => expectNamedSpriteContainsCircle(ASSETS));
  test('chunk references sprites', () => expectChunkContainsSpriteRefs(ASSETS));
  test('chunk embeds inline markup', () => expectChunkContainsInlineMarkup(ASSETS));
  test('chunk contains children text', () =>
    expectChunkContainsChildren(ASSETS, 'Forward arrow', 'An arrow pointing to the right'));
});
