import { test, expect } from '@playwright/test';
import {
  assetsDir,
  expectSvgsVisible,
  expectSpriteRef,
  expectInlineSvg,
  expectDefaultSprite,
  expectNamedSprite,
  expectSpriteContainsArrow,
  expectSpriteNoInlineSvgs,
  expectNamedSpriteContainsCircle,
  expectChunkContainsSpriteRefs,
  expectChunkContainsInlineMarkup,
} from './helpers.ts';

const ASSETS = assetsDir('ember');

test.describe('Ember', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('SVG Jar Ember Test');
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

  test('passes attributes via ...attributes', async ({ page }) => {
    await expect(page.locator('svg.exist').first()).toBeAttached();
  });

  // -- Visual regression --

  test('all SVGs render correctly', async ({ page }) => {
    const app = page.locator('body');
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
});
