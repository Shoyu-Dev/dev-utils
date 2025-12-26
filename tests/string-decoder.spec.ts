import { test, expect } from '@playwright/test';

test.describe('Encoded String Decoder Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/decode');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Encoded String Decoder' })).toBeVisible();
  });

  test('should decode Base64', async ({ page }) => {
    await page.locator('textarea').fill('SGVsbG8gV29ybGQ=');

    // Should show decoded result
    await expect(page.getByText('Base64')).toBeVisible();
    await expect(page.getByText('Hello World')).toBeVisible();
  });

  test('should decode URL encoding', async ({ page }) => {
    await page.locator('textarea').fill('Hello%20World');

    await expect(page.getByText('URL Encoding')).toBeVisible();
    await expect(page.getByText('Hello World')).toBeVisible();
  });

  test('should decode Hex', async ({ page }) => {
    await page.locator('textarea').fill('48656c6c6f');

    await expect(page.getByText('Hexadecimal')).toBeVisible();
    await expect(page.getByText('Hello')).toBeVisible();
  });

  test('should show all decoding attempts', async ({ page }) => {
    await page.locator('textarea').fill('SGVsbG8=');

    // Should attempt all decodings
    await expect(page.getByText('Decoded Results')).toBeVisible();
    await expect(page.getByText('Base64')).toBeVisible();
    await expect(page.getByText('Base64URL')).toBeVisible();
    await expect(page.getByText('URL Encoding')).toBeVisible();
    await expect(page.getByText('Hexadecimal')).toBeVisible();
    await expect(page.getByText('Unicode Escapes')).toBeVisible();
  });

  test('should switch to encode mode', async ({ page }) => {
    await page.click('button:text("Encode")');

    // Should show encoding options
    await expect(page.getByText('Plain Text Input')).toBeVisible();
  });

  test('should encode text to Base64', async ({ page }) => {
    await page.click('button:text("Encode")');
    await page.locator('textarea').fill('Hello World');

    // Should show encoded result
    await expect(page.getByText('SGVsbG8gV29ybGQ=')).toBeVisible();
  });

  test('should encode text to different formats', async ({ page }) => {
    await page.click('button:text("Encode")');
    await page.click('button:text("Hexadecimal")');
    await page.locator('textarea').fill('Hi');

    // Should show hex encoded result
    await expect(page.getByText('4869')).toBeVisible();
  });

  test('should have copy buttons', async ({ page }) => {
    await page.locator('textarea').fill('SGVsbG8=');

    // Should have copy buttons for successful decodings
    await expect(page.locator('button:text("Copy")').first()).toBeVisible();
  });
});

test.describe('Schema Validator Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schema');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'JSON / YAML Schema Validator' })).toBeVisible();
  });

  test('should validate valid data against schema', async ({ page }) => {
    const data = '{"name": "John", "age": 30}';
    const schema = '{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "integer"}}, "required": ["name"]}';

    await page.locator('textarea').first().fill(data);
    await page.locator('textarea').nth(1).fill(schema);

    // Should show success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.getByText('Validation successful')).toBeVisible();
  });

  test('should show errors for invalid data', async ({ page }) => {
    const data = '{"name": 123}';
    const schema = '{"type": "object", "properties": {"name": {"type": "string"}}}';

    await page.locator('textarea').first().fill(data);
    await page.locator('textarea').nth(1).fill(schema);

    // Should show validation errors
    await expect(page.getByText('Validation Failed')).toBeVisible();
  });

  test('should show parse errors', async ({ page }) => {
    await page.locator('textarea').first().fill('not json');
    await page.locator('textarea').nth(1).fill('{}');

    // Should show parse error
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.getByText('parse error')).toBeVisible();
  });

  test('should support YAML format', async ({ page }) => {
    // Switch data to YAML
    await page.locator('button:text("YAML")').first().click();

    const data = 'name: John\nage: 30';
    const schema = '{"type": "object"}';

    await page.locator('textarea').first().fill(data);
    await page.locator('textarea').nth(1).fill(schema);

    // Should validate YAML
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
