import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

/**
 * Finds a file in a directory matching a predicate.
 */
export function findFile(dir: string, match: (name: string) => boolean): string | undefined {
  if (!fs.existsSync(dir)) return undefined;
  return fs.readdirSync(dir).find(match);
}

/**
 * Reads an asset file from a project's dist/assets directory.
 */
export function readAsset(assetsDir: string, fileName: string): string {
  return fs.readFileSync(path.join(assetsDir, fileName), 'utf-8');
}

/**
 * Returns the dist/assets path for a test project.
 */
export function assetsDir(projectName: string): string {
  return path.resolve(import.meta.dirname, '..', '..', '..', 'test-projects', 'vite', projectName, 'dist', 'assets');
}

// -- Page rendering assertions --

export async function expectSvgsVisible(page: Page): Promise<void> {
  const svgs = page.locator('svg');
  await expect(svgs.first()).toBeVisible();
}

export async function expectSpriteRef(page: Page): Promise<void> {
  const use = page.locator('svg use').first();
  await expect(use).toBeAttached();
}

export async function expectInlineSvg(page: Page): Promise<void> {
  const found = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll('svg'));
    for (const svg of svgs) {
      const hasUse = svg.querySelector('use');
      const hasContent = svg.querySelector('path, rect, circle, polygon, ellipse');
      if (!hasUse && hasContent) return true;
    }
    return false;
  });
  expect(found).toBe(true);
}

export async function expectChildrenSupport(page: Page, titleText: string): Promise<void> {
  const title = page.locator('svg title');
  await expect(title.first()).toBeAttached();
  await expect(title.first()).toHaveText(titleText);
}

// -- Build output assertions --

export function expectDefaultSprite(assets: string): void {
  expect(findFile(assets, (f) => f.startsWith('sprite-') && f.endsWith('.svg'))).toBeDefined();
}

export function expectNamedSprite(assets: string): void {
  expect(findFile(assets, (f) => f.startsWith('shapes-') && f.endsWith('.svg'))).toBeDefined();
}

export function expectSpriteContainsArrow(assets: string): void {
  const sprite = readAsset(assets, findFile(assets, (f) => f.startsWith('sprite-') && f.endsWith('.svg'))!);
  expect(sprite).toContain('<symbol');
  expect(sprite).toContain('M12 4l8 8-8 8');
}

export function expectSpriteNoInlineSvgs(assets: string): void {
  const sprite = readAsset(assets, findFile(assets, (f) => f.startsWith('sprite-') && f.endsWith('.svg'))!);
  expect(sprite).not.toContain('M4 4H20V20H4z');
}

export function expectNamedSpriteContainsCircle(assets: string): void {
  const sprite = readAsset(assets, findFile(assets, (f) => f.startsWith('shapes-') && f.endsWith('.svg'))!);
  expect(sprite).toContain('<symbol');
  expect(sprite).toContain('<circle');
}

export function expectChunkContainsSpriteRefs(assets: string): void {
  const code = readAsset(assets, findFile(assets, (f) => f.endsWith('.js'))!);
  expect(code).toMatch(/sprite-[a-f0-9]+\.svg/);
  expect(code).toMatch(/shapes-[a-f0-9]+\.svg/);
}

export function expectChunkContainsInlineMarkup(assets: string): void {
  const code = readAsset(assets, findFile(assets, (f) => f.endsWith('.js'))!);
  expect(code).toContain('M4 4H20V20H4z');
}

export function expectChunkContainsChildren(assets: string, ...texts: string[]): void {
  const code = readAsset(assets, findFile(assets, (f) => f.endsWith('.js'))!);
  for (const text of texts) {
    expect(code).toContain(text);
  }
}
