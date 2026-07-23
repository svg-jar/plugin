import { test, expect } from '@playwright/test';
import {
  assetsDir,
  findFile,
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

const ASSETS = assetsDir('vanilla', 'rolldown');

test.describe('Rolldown app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // -- Page rendering --

  test('page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/SVG Jar/);
  });

  test('renders SVG elements', async ({ page }) => {
    await expectSvgsVisible(page);
  });

  test('renders sprite icons with <use href>', async ({ page }) => {
    await expectSpriteRef(page);
  });

  test('renders inline SVGs without <use>', async ({ page }) => {
    await expectInlineSvg(page);
  });

  test('factory options create <title>', async ({ page }) => {
    const title = page.locator('svg title');
    await expect(title.first()).toBeAttached();
    await expect(title.first()).toHaveText('Forward arrow');
  });

  test('renders file mode SVG as an img', async ({ page }) => {
    const img = page.locator('img[alt="Star"]');
    await expect(img).toBeAttached();
    const src = await img.getAttribute('src');
    expect(src).toMatch(/\.svg/);
  });

  test('all SVGs render correctly', async ({ page }) => {
    const app = page.locator('#app');
    await expect(app).toBeVisible();
    await expect(app).toHaveScreenshot('all-svgs.png', { maxDiffPixelRatio: 0.01 });
  });

  // -- Build output --

  test('emits default sprite', () => expectDefaultSprite(ASSETS));
  test('emits named sprite', () => expectNamedSprite(ASSETS));
  test('sprite contains arrow symbol', () => expectSpriteContainsArrow(ASSETS));
  test('sprite excludes inline SVGs', () => expectSpriteNoInlineSvgs(ASSETS));
  test('named sprite contains circle', () => expectNamedSpriteContainsCircle(ASSETS));
  test('chunk references sprites', () => expectChunkContainsSpriteRefs(ASSETS));
  test('chunk embeds inline markup', () => expectChunkContainsInlineMarkup(ASSETS));

  test('emits file-mode SVG', () => {
    expect(findFile(ASSETS, (f) => f.includes('star') && f.endsWith('.svg'))).toBeDefined();
  });
});
