import { test, expect } from '@playwright/test';

test.describe('JSON/YAML Converter Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/convert');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'JSON / YAML Converter' })).toBeVisible();
  });

  test('should convert JSON to YAML', async ({ page }) => {
    const input = '{"name": "John", "age": 30}';
    await page.locator('textarea').first().fill(input);

    // Output should contain YAML
    const output = page.locator('textarea').nth(1);
    await expect(output).toContainText('name: John');
  });

  test('should convert YAML to JSON', async ({ page }) => {
    // Switch to YAML -> JSON
    await page.click('button:text("YAML → JSON")');

    const input = 'name: John\nage: 30';
    await page.locator('textarea').first().fill(input);

    // Output should contain JSON
    const output = page.locator('textarea').nth(1);
    await expect(output).toContainText('"name"');
    await expect(output).toContainText('"John"');
  });

  test('should show error for invalid input', async ({ page }) => {
    await page.locator('textarea').first().fill('not valid json');

    // Should show error
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should have copy button when output is present', async ({ page }) => {
    await page.locator('textarea').first().fill('{"key": "value"}');

    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
  });
});

test.describe('CSV/JSON Converter Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/csv');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'CSV / JSON Converter' })).toBeVisible();
  });

  test('should convert CSV to JSON', async ({ page }) => {
    const input = 'name,age\nAlice,30\nBob,25';
    await page.locator('textarea').first().fill(input);

    // Output should contain JSON array
    const output = page.locator('textarea').nth(1);
    await expect(output).toContainText('[');
    await expect(output).toContainText('Alice');
    await expect(output).toContainText('30');
  });

  test('should convert JSON to CSV', async ({ page }) => {
    await page.click('button:text("JSON → CSV")');

    const input = '[{"name":"Alice","age":30}]';
    await page.locator('textarea').first().fill(input);

    // Output should contain CSV
    const output = page.locator('textarea').nth(1);
    await expect(output).toContainText('name,age');
    await expect(output).toContainText('Alice,30');
  });

  test('should handle different delimiters', async ({ page }) => {
    await page.locator('select').first().selectOption(';');

    const input = 'name;age\nAlice;30';
    await page.locator('textarea').first().fill(input);

    const output = page.locator('textarea').nth(1);
    await expect(output).toContainText('Alice');
  });

  test('should show row and column count', async ({ page }) => {
    const input = 'a,b,c\n1,2,3\n4,5,6';
    await page.locator('textarea').first().fill(input);

    await expect(page.getByText('2 rows')).toBeVisible();
    await expect(page.getByText('3 columns')).toBeVisible();
  });
});

test.describe('JSON/YAML Prettifier Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prettify');
  });

  test('should display tool title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'JSON / YAML Prettifier' })).toBeVisible();
  });

  test('should prettify minified JSON', async ({ page }) => {
    const input = '{"name":"John","age":30}';
    await page.locator('textarea').first().fill(input);

    // Output should be prettified (contains newlines)
    const output = await page.locator('textarea').nth(1).inputValue();
    expect(output).toContain('\n');
    expect(output).toContain('  '); // Indentation
  });

  test('should minify JSON', async ({ page }) => {
    await page.click('button:text("Minify")');

    const input = `{
  "name": "John",
  "age": 30
}`;
    await page.locator('textarea').first().fill(input);

    // Output should be minified (no extra whitespace)
    const output = await page.locator('textarea').nth(1).inputValue();
    expect(output).not.toContain('\n');
    expect(output).toBe('{"name":"John","age":30}');
  });

  test('should switch between JSON and YAML', async ({ page }) => {
    await page.click('button:text("YAML")');

    const input = 'name: John\nage: 30';
    await page.locator('textarea').first().fill(input);

    // Should process YAML
    const output = await page.locator('textarea').nth(1).inputValue();
    expect(output).toContain('name');
  });
});
