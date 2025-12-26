import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  epochToDate,
  dateToEpoch,
  getRelativeTime,
  detectTimestampUnit,
} from '../utils/epoch';

describe('Epoch to Date Conversion', () => {
  it('should convert valid epoch seconds to date', () => {
    const result = epochToDate(1704067200, 'seconds'); // 2024-01-01 00:00:00 UTC
    expect(result.valid).toBe(true);
    expect(result.iso).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should convert valid epoch milliseconds to date', () => {
    const result = epochToDate(1704067200000, 'milliseconds');
    expect(result.valid).toBe(true);
    expect(result.iso).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should return error for timestamp before 1970', () => {
    const result = epochToDate(-1000000, 'seconds');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('range');
  });

  it('should return error for timestamp after 2100', () => {
    const result = epochToDate(5000000000, 'seconds'); // Year 2128
    expect(result.valid).toBe(false);
    expect(result.error).toContain('range');
  });

  it('should include timezone info', () => {
    const result = epochToDate(1704067200, 'seconds');
    expect(result.valid).toBe(true);
    expect(result.timezone).toBeDefined();
  });

  it('should include relative time', () => {
    const result = epochToDate(1704067200, 'seconds');
    expect(result.valid).toBe(true);
    expect(result.relative).toBeDefined();
  });
});

describe('Date to Epoch Conversion', () => {
  it('should convert ISO date string to epoch', () => {
    const result = dateToEpoch('2024-01-01T00:00:00Z');
    expect(result.valid).toBe(true);
    expect(result.seconds).toBe(1704067200);
    expect(result.milliseconds).toBe(1704067200000);
  });

  it('should convert date-only string', () => {
    const result = dateToEpoch('2024-01-01');
    expect(result.valid).toBe(true);
    expect(result.seconds).toBeDefined();
    expect(result.milliseconds).toBeDefined();
  });

  it('should handle natural date format', () => {
    const result = dateToEpoch('Jan 1, 2024');
    expect(result.valid).toBe(true);
    expect(result.seconds).toBeDefined();
  });

  it('should return error for invalid date', () => {
    const result = dateToEpoch('not a date');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid date');
  });

  it('should handle whitespace', () => {
    const result = dateToEpoch('  2024-01-01  ');
    expect(result.valid).toBe(true);
    expect(result.seconds).toBeDefined();
  });
});

describe('Relative Time', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show "now" for current time', () => {
    const now = Date.now();
    const result = getRelativeTime(now);
    expect(result).toBe('now');
  });

  it('should show "X seconds ago" for past', () => {
    const past = Date.now() - 30000; // 30 seconds ago
    const result = getRelativeTime(past);
    expect(result).toBe('30 seconds ago');
  });

  it('should show "in X seconds" for future', () => {
    const future = Date.now() + 30000; // 30 seconds from now
    const result = getRelativeTime(future);
    expect(result).toBe('in 30 seconds');
  });

  it('should use minutes for > 60 seconds', () => {
    const past = Date.now() - 120000; // 2 minutes ago
    const result = getRelativeTime(past);
    expect(result).toBe('2 minutes ago');
  });

  it('should use hours for > 60 minutes', () => {
    const past = Date.now() - 7200000; // 2 hours ago
    const result = getRelativeTime(past);
    expect(result).toBe('2 hours ago');
  });

  it('should use days for > 24 hours', () => {
    const past = Date.now() - 172800000; // 2 days ago
    const result = getRelativeTime(past);
    expect(result).toBe('2 days ago');
  });

  it('should use years for > 365 days', () => {
    const past = Date.now() - 63072000000; // ~2 years ago
    const result = getRelativeTime(past);
    expect(result).toBe('2 years ago');
  });

  it('should use singular form for 1 unit', () => {
    const past = Date.now() - 86400000; // 1 day ago
    const result = getRelativeTime(past);
    expect(result).toBe('1 day ago');
  });
});

describe('Timestamp Unit Detection', () => {
  it('should detect seconds for small numbers', () => {
    expect(detectTimestampUnit(1704067200)).toBe('seconds');
  });

  it('should detect milliseconds for large numbers', () => {
    expect(detectTimestampUnit(1704067200000)).toBe('milliseconds');
  });

  it('should use threshold of 9999999999', () => {
    expect(detectTimestampUnit(9999999999)).toBe('seconds');
    expect(detectTimestampUnit(10000000000)).toBe('milliseconds');
  });
});

describe('Round-trip Conversion', () => {
  it('should preserve timestamp through round-trip', () => {
    const original = 1704067200;
    const toDate = epochToDate(original, 'seconds');
    expect(toDate.valid).toBe(true);

    const backToEpoch = dateToEpoch(toDate.iso!);
    expect(backToEpoch.valid).toBe(true);
    expect(backToEpoch.seconds).toBe(original);
  });
});
