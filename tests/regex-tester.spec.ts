import { test, expect } from '@playwright/test';

test.describe('Regex Tester Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/regex');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Regex Tester' })).toBeVisible();
  });

  test('should highlight matches in test string', async ({ page }) => {
    // Enter regex pattern
    await page.locator('input[placeholder*="regex pattern"]').fill('\\d+');

    // Enter test string
    await page.locator('textarea').fill('There are 42 apples and 7 oranges');

    // Should show highlighted matches
    await expect(page.getByText('Highlighted Matches')).toBeVisible();
    await expect(page.locator('.highlight')).toBeVisible();
  });

  test('should display match details', async ({ page }) => {
    await page.locator('input[placeholder*="regex pattern"]').fill('\\d+');
    await page.locator('textarea').fill('42 and 7');

    // Should show match details
    await expect(page.getByText('Match Details')).toBeVisible();
    await expect(page.getByText('Match 1')).toBeVisible();
    await expect(page.getByText('Match 2')).toBeVisible();
  });

  test('should display capture groups', async ({ page }) => {
    await page.locator('input[placeholder*="regex pattern"]').fill('(\\w+)@(\\w+)');
    await page.locator('textarea').fill('user@example');

    // Should show capture groups
    await expect(page.getByText('Capture Groups')).toBeVisible();
  });

  test('should show error for invalid regex', async ({ page }) => {
    await page.locator('input[placeholder*="regex pattern"]').fill('[invalid');
    await page.locator('textarea').fill('test');

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should toggle regex flags', async ({ page }) => {
    // Click case insensitive flag
    await page.click('button:text("i (ignore case)")');

    // Button should be highlighted
    await expect(page.locator('button:text("i (ignore case)").btn-primary')).toBeVisible();
  });

  test('should warn about catastrophic backtracking', async ({ page }) => {
    await page.locator('input[placeholder*="regex pattern"]').fill('(a+)+$');
    await page.locator('textarea').fill('aaaaaaaaaaaaaab');

    // Should show warning
    await expect(page.locator('.warning-message')).toBeVisible();
    await expect(page.getByText('catastrophic backtracking')).toBeVisible();
  });
});
