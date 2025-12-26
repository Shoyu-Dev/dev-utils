import { test, expect } from '@playwright/test';

test.describe('JWT Decoder Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jwt');
  });

  // Sample JWT for testing
  const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'JWT Decoder' })).toBeVisible();
  });

  test('should show warning about decode-only', async ({ page }) => {
    await expect(page.getByText('Decode only — not verification')).toBeVisible();
  });

  test('should decode valid JWT and show header', async ({ page }) => {
    await page.locator('textarea').fill(validJWT);

    // Should show header
    await expect(page.getByText('Header (Algorithm & Token Type)')).toBeVisible();
    await expect(page.getByText('"alg"')).toBeVisible();
    await expect(page.getByText('HS256')).toBeVisible();
  });

  test('should decode valid JWT and show payload', async ({ page }) => {
    await page.locator('textarea').fill(validJWT);

    // Should show payload
    await expect(page.getByText('Payload (Claims)')).toBeVisible();
    await expect(page.getByText('"name"')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
  });

  test('should show signature section', async ({ page }) => {
    await page.locator('textarea').fill(validJWT);

    // Should show signature
    await expect(page.getByText('Signature (Base64URL encoded)')).toBeVisible();
  });

  test('should show error for invalid JWT format', async ({ page }) => {
    await page.locator('textarea').fill('not.ajwt');

    // Should show error
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.getByText('3 parts')).toBeVisible();
  });

  test('should show error for invalid Base64 encoding', async ({ page }) => {
    await page.locator('textarea').fill('!!!.!!!.!!!');

    // Should show error
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.getByText('Failed to decode')).toBeVisible();
  });
});
