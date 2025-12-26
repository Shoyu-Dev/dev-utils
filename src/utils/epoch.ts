/**
 * Epoch timestamp utility functions
 * PRIVACY-CRITICAL: All time conversions use browser's local Date object
 * No external time APIs are called
 */

export interface EpochToDateResult {
  valid: boolean;
  local?: string;
  utc?: string;
  iso?: string;
  timezone?: string;
  relative?: string;
  error?: string;
}

export interface DateToEpochResult {
  valid: boolean;
  seconds?: number;
  milliseconds?: number;
  error?: string;
}

export function epochToDate(value: number, unit: 'seconds' | 'milliseconds'): EpochToDateResult {
  const ms = unit === 'seconds' ? value * 1000 : value;

  // Sanity check - reasonable date range
  const minDate = new Date('1970-01-01').getTime();
  const maxDate = new Date('2100-01-01').getTime();

  if (ms < minDate || ms > maxDate) {
    return { valid: false, error: 'Timestamp out of reasonable range (1970-2100)' };
  }

  const date = new Date(ms);

  return {
    valid: true,
    local: date.toLocaleString(),
    utc: date.toUTCString(),
    iso: date.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    relative: getRelativeTime(ms),
  };
}

export function dateToEpoch(dateString: string): DateToEpochResult {
  const date = new Date(dateString.trim());

  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  const ms = date.getTime();
  return {
    valid: true,
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
  };
}

export function getRelativeTime(ms: number): string {
  const now = Date.now();
  const diff = ms - now;
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  let unit: string;
  let value: number;

  if (years > 0) {
    unit = years === 1 ? 'year' : 'years';
    value = years;
  } else if (days > 0) {
    unit = days === 1 ? 'day' : 'days';
    value = days;
  } else if (hours > 0) {
    unit = hours === 1 ? 'hour' : 'hours';
    value = hours;
  } else if (minutes > 0) {
    unit = minutes === 1 ? 'minute' : 'minutes';
    value = minutes;
  } else {
    unit = seconds === 1 ? 'second' : 'seconds';
    value = seconds;
  }

  if (diff > 0) {
    return `in ${value} ${unit}`;
  } else if (diff < 0) {
    return `${value} ${unit} ago`;
  } else {
    return 'now';
  }
}

export function detectTimestampUnit(value: number): 'seconds' | 'milliseconds' {
  // If the number is larger than a reasonable seconds timestamp, it's likely milliseconds
  // Unix timestamp in seconds for year 2100 is about 4102444800
  return value > 9999999999 ? 'milliseconds' : 'seconds';
}
