import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dev Utils' })).toBeVisible();
  });

  test('should navigate to all tools from home', async ({ page }) => {
    await page.goto('/');

    // Check all tool cards are visible
    await expect(page.getByText('Diff Checker')).toBeVisible();
    await expect(page.getByText('Regex Tester')).toBeVisible();
    await expect(page.getByText('JSON/YAML Prettifier')).toBeVisible();
    await expect(page.getByText('Schema Validator')).toBeVisible();
    await expect(page.getByText('JWT Decoder')).toBeVisible();
    await expect(page.getByText('String Decoder')).toBeVisible();
    await expect(page.getByText('JSON/YAML Converter')).toBeVisible();
    await expect(page.getByText('CSV/JSON Converter')).toBeVisible();
    await expect(page.getByText('Epoch Converter')).toBeVisible();
    await expect(page.getByText('Cron Explainer')).toBeVisible();
  });

  test('should navigate to privacy page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Privacy Guarantee');
    await expect(page.getByRole('heading', { name: 'Privacy Guarantee' })).toBeVisible();
    await expect(page.getByText('Zero Network Traffic')).toBeVisible();
  });

  test('should navigate to verification page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=How to Verify');
    await expect(page.getByRole('heading', { name: 'How to Verify' })).toBeVisible();
    await expect(page.getByText('Browser DevTools')).toBeVisible();
  });

  test('should show offline badge in sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Offline')).toBeVisible();
  });
});
