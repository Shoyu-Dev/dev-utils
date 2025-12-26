import { test, expect } from '@playwright/test';

test.describe('Diff Checker Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/diff');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Diff Checker' })).toBeVisible();
  });

  test('should show differences between two texts', async ({ page }) => {
    // Enter text in both input areas
    const textareas = page.locator('textarea');
    await textareas.first().fill('hello\nworld');
    await textareas.nth(1).fill('hello\nthere');

    // Should show diff output
    await expect(page.getByText('Differences')).toBeVisible();
    await expect(page.locator('.diff-removed')).toBeVisible();
    await expect(page.locator('.diff-added')).toBeVisible();
  });

  test('should toggle between line and word diff', async ({ page }) => {
    const textareas = page.locator('textarea');
    await textareas.first().fill('hello world');
    await textareas.nth(1).fill('hello there');

    // Click word diff button
    await page.click('button:text("Word Diff")');

    // Diff container should be visible
    await expect(page.locator('.diff-container')).toBeVisible();
  });

  test('should show stats for changes', async ({ page }) => {
    const textareas = page.locator('textarea');
    await textareas.first().fill('line1\nline2');
    await textareas.nth(1).fill('line1\nline3');

    // Should show added/removed counts
    await expect(page.locator('text=/\\+\\d+/')).toBeVisible();
    await expect(page.locator('text=/-\\d+/')).toBeVisible();
  });

  test('should handle empty input', async ({ page }) => {
    // Initially no diff should be shown
    await expect(page.locator('.diff-container')).not.toBeVisible();
  });
});
