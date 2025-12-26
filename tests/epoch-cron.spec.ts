import { test, expect } from '@playwright/test';

test.describe('Epoch Converter Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/epoch');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Epoch Timestamp Converter' })).toBeVisible();
  });

  test('should show current time', async ({ page }) => {
    await expect(page.getByText('Current Time')).toBeVisible();
    await expect(page.getByText('Seconds')).toBeVisible();
    await expect(page.getByText('Milliseconds')).toBeVisible();
  });

  test('should convert epoch to date', async ({ page }) => {
    // Enter epoch timestamp
    await page.locator('input[placeholder*="timestamp"]').fill('1704067200');

    // Should show conversion results
    await expect(page.getByText('Local Time')).toBeVisible();
    await expect(page.getByText('UTC')).toBeVisible();
    await expect(page.getByText('ISO 8601')).toBeVisible();
  });

  test('should convert date to epoch', async ({ page }) => {
    // Enter date string
    await page.locator('input[placeholder*="date"]').fill('2024-01-01');

    // Should show epoch values
    await expect(page.locator('text=/\\d{10}/')).toBeVisible(); // 10-digit epoch
  });

  test('should toggle between seconds and milliseconds', async ({ page }) => {
    await page.locator('select').first().selectOption('milliseconds');
    await page.locator('input[placeholder*="timestamp"]').fill('1704067200000');

    // Should still convert correctly
    await expect(page.getByText('2024')).toBeVisible();
  });

  test('should show error for invalid timestamp', async ({ page }) => {
    await page.locator('input[placeholder*="timestamp"]').fill('99999999999');

    // Should show error about range
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should have copy buttons', async ({ page }) => {
    await expect(page.locator('button:text("Copy")').first()).toBeVisible();
  });
});

test.describe('Cron Explainer Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cron');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cron Expression Explainer' })).toBeVisible();
  });

  test('should explain simple cron expression', async ({ page }) => {
    await page.locator('input[placeholder*="cron"]').fill('0 0 * * *');

    // Should show explanation
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.getByText(/midnight/i)).toBeVisible();
  });

  test('should show field breakdown', async ({ page }) => {
    await page.locator('input[placeholder*="cron"]').fill('*/15 9 * * 1-5');

    // Should show field breakdown
    await expect(page.getByText('Field Breakdown')).toBeVisible();
    await expect(page.getByText('Minute')).toBeVisible();
    await expect(page.getByText('Hour')).toBeVisible();
  });

  test('should show error for invalid cron', async ({ page }) => {
    await page.locator('input[placeholder*="cron"]').fill('invalid cron');

    // Should show error
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should have clickable examples', async ({ page }) => {
    // Click on an example
    await page.click('text="Every 15 minutes"');

    // Input should be populated
    const input = await page.locator('input[placeholder*="cron"]').inputValue();
    expect(input).toBe('*/15 * * * *');
  });

  test('should show cron format reference', async ({ page }) => {
    await expect(page.getByText('Cron Format Reference')).toBeVisible();
    await expect(page.getByText('Special Characters')).toBeVisible();
  });
});
