import { test, expect } from '@playwright/test';
import {
  assetsDir,
  findFile,
  readAsset,
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

const ASSETS = assetsDir('vanilla');

test.describe('Vanilla DOM', () => {
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

  // -- DOM factory options --

  test('factory options set attributes', async ({ page }) => {
    await expect(page.locator('svg.icon').first()).toBeAttached();
  });

  test('factory options create <title>', async ({ page }) => {
    const title = page.locator('svg title');
    await expect(title.first()).toBeAttached();
    await expect(title.first()).toHaveText('Forward arrow');
  });

  test('factory options create <desc>', async ({ page }) => {
    const desc = page.locator('svg desc');
    await expect(desc.first()).toBeAttached();
    await expect(desc.first()).toHaveText('An arrow pointing to the right');
  });

  test('renders file mode SVG as an img', async ({ page }) => {
    const img = page.locator('img[alt="Star"]');
    await expect(img).toBeAttached();
    const src = await img.getAttribute('src');
    expect(src).toMatch(/\.svg/);
  });

  // -- Visual regression --

  test('source order SVG renders with correct z-layering', async ({ page }) => {
    const svg = page.locator('svg').last();
    await expect(svg).toBeVisible();
    await expect(svg).toHaveScreenshot('source-order.png', { maxDiffPixelRatio: 0.01 });
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

  test('SVGO inlines CSS in file-mode SVG', () => {
    const starFile = findFile(ASSETS, (f) => f.includes('star') && f.endsWith('.svg'));
    if (!starFile) return;
    const content = readAsset(ASSETS, starFile);
    expect(content).not.toContain('<style');
    expect(content).toContain('fill:');
  });

  test('currentColor not applied by default', () => {
    const sprite = readAsset(ASSETS, findFile(ASSETS, (f) => f.startsWith('shapes-') && f.endsWith('.svg'))!);
    expect(sprite).not.toContain('currentColor');
  });

  test('embedded <use href> resolved in sprite', () => {
    const sprite = readAsset(ASSETS, findFile(ASSETS, (f) => f.startsWith('sprite-') && f.endsWith('.svg'))!);
    expect(sprite).toContain('fill="#eee"');
    expect(sprite).not.toContain('href="./arrow.svg"');
  });

  test('embedded <image href> to PNG resolved', () => {
    const sprite = readAsset(ASSETS, findFile(ASSETS, (f) => f.startsWith('sprite-') && f.endsWith('.svg'))!);
    expect(sprite).toMatch(/href="\/assets\/placeholder-[^"]+\.png"/);
  });
});
