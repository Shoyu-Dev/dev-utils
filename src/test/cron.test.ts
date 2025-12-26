import { describe, it, expect } from 'vitest';
import { parseCronExpression, isValidCronField } from '../utils/cron';

describe('Cron Expression Parsing', () => {
  it('should parse simple cron expression', () => {
    const result = parseCronExpression('0 0 * * *');
    expect(result.valid).toBe(true);
    expect(result.explanation).toBeDefined();
    // cronstrue may say "At 12:00 AM" or "midnight" depending on version
    expect(result.explanation).toMatch(/12:00 AM|midnight/i);
  });

  it('should parse every 15 minutes', () => {
    const result = parseCronExpression('*/15 * * * *');
    expect(result.valid).toBe(true);
    expect(result.explanation).toContain('15');
  });

  it('should parse weekday schedule', () => {
    const result = parseCronExpression('0 9 * * 1-5');
    expect(result.valid).toBe(true);
    expect(result.explanation).toBeDefined();
  });

  it('should parse monthly schedule', () => {
    const result = parseCronExpression('0 0 1 * *');
    expect(result.valid).toBe(true);
    expect(result.explanation).toContain('day 1');
  });

  it('should return parts for valid expression', () => {
    const result = parseCronExpression('0 9 * * 1-5');
    expect(result.parts).toEqual(['0', '9', '*', '*', '1-5']);
  });

  it('should return error for too few fields', () => {
    const result = parseCronExpression('0 * * *');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5 or 6 fields');
  });

  it('should return error for too many fields', () => {
    const result = parseCronExpression('0 0 * * * * *');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5 or 6 fields');
  });

  it('should handle empty input', () => {
    const result = parseCronExpression('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeNull();
  });

  it('should handle whitespace only', () => {
    const result = parseCronExpression('   ');
    expect(result.valid).toBe(false);
  });

  it('should reject invalid characters', () => {
    const result = parseCronExpression('0 0 $ * *');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid characters');
  });

  it('should accept 6-field cron with year', () => {
    const result = parseCronExpression('0 0 * * * 2024');
    expect(result.valid).toBe(true);
  });
});

describe('Common Cron Patterns', () => {
  const patterns = [
    { expr: '* * * * *', desc: 'every minute' },
    { expr: '0 * * * *', desc: 'every hour' },
    { expr: '0 0 * * *', desc: 'every day at midnight' },
    { expr: '0 0 * * 0', desc: 'every Sunday' },
    { expr: '0 0 1 * *', desc: 'first of every month' },
    { expr: '0 0 1 1 *', desc: 'first of January' },
  ];

  patterns.forEach(({ expr, desc }) => {
    it(`should parse "${expr}" (${desc})`, () => {
      const result = parseCronExpression(expr);
      expect(result.valid).toBe(true);
      expect(result.explanation).toBeDefined();
    });
  });
});

describe('Cron Field Validation', () => {
  describe('Minute field (0-59)', () => {
    it('should accept valid minutes', () => {
      expect(isValidCronField('0', 0)).toBe(true);
      expect(isValidCronField('59', 0)).toBe(true);
      expect(isValidCronField('*', 0)).toBe(true);
      expect(isValidCronField('*/5', 0)).toBe(true);
      expect(isValidCronField('0-30', 0)).toBe(true);
      expect(isValidCronField('0,15,30,45', 0)).toBe(true);
    });
  });

  describe('Hour field (0-23)', () => {
    it('should accept valid hours', () => {
      expect(isValidCronField('0', 1)).toBe(true);
      expect(isValidCronField('23', 1)).toBe(true);
      expect(isValidCronField('*', 1)).toBe(true);
      expect(isValidCronField('9-17', 1)).toBe(true);
    });
  });

  describe('Day of month field (1-31)', () => {
    it('should accept valid days', () => {
      expect(isValidCronField('1', 2)).toBe(true);
      expect(isValidCronField('31', 2)).toBe(true);
      expect(isValidCronField('*', 2)).toBe(true);
      expect(isValidCronField('L', 2)).toBe(true);
    });
  });

  describe('Month field (1-12)', () => {
    it('should accept valid months', () => {
      expect(isValidCronField('1', 3)).toBe(true);
      expect(isValidCronField('12', 3)).toBe(true);
      expect(isValidCronField('*', 3)).toBe(true);
      expect(isValidCronField('1-6', 3)).toBe(true);
    });
  });

  describe('Day of week field (0-7)', () => {
    it('should accept valid weekdays', () => {
      expect(isValidCronField('0', 4)).toBe(true);
      expect(isValidCronField('7', 4)).toBe(true);
      expect(isValidCronField('*', 4)).toBe(true);
      expect(isValidCronField('1-5', 4)).toBe(true);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle multiple spaces between fields', () => {
    const result = parseCronExpression('0   0   *   *   *');
    expect(result.valid).toBe(true);
  });

  it('should handle leading/trailing whitespace', () => {
    const result = parseCronExpression('  0 0 * * *  ');
    expect(result.valid).toBe(true);
  });

  it('should handle complex step expressions', () => {
    const result = parseCronExpression('0-30/10 * * * *');
    expect(result.valid).toBe(true);
  });

  it('should handle list expressions', () => {
    const result = parseCronExpression('0 9,12,18 * * *');
    expect(result.valid).toBe(true);
  });
});
