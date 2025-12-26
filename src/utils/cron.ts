/**
 * Cron expression utility functions
 * PRIVACY-CRITICAL: All cron parsing is done locally using cronstrue
 */

import cronstrue from 'cronstrue';

export interface CronParseResult {
  valid: boolean;
  explanation: string | null;
  parts: string[] | null;
  error: string | null;
}

const FIELD_NAMES = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'];

export function parseCronExpression(expression: string): CronParseResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { valid: false, explanation: null, error: null, parts: null };
  }

  const parts = trimmed.split(/\s+/);

  // Validate basic structure (5 or 6 parts)
  if (parts.length < 5 || parts.length > 6) {
    return {
      valid: false,
      explanation: null,
      error: `Expected 5 or 6 fields, got ${parts.length}. Format: minute hour day-of-month month day-of-week [year]`,
      parts: null,
    };
  }

  // Validate each field for obviously invalid characters
  const fieldErrors: string[] = [];
  parts.slice(0, 5).forEach((part, i) => {
    if (!/^[\d*,\-/JFMASONDLW#]+$/i.test(part)) {
      fieldErrors.push(`${FIELD_NAMES[i]}: contains invalid characters`);
    }
  });

  if (fieldErrors.length > 0) {
    return {
      valid: false,
      explanation: null,
      error: fieldErrors.join('; '),
      parts: parts.slice(0, 5),
    };
  }

  try {
    const explanation = cronstrue.toString(trimmed, {
      throwExceptionOnParseError: true,
      verbose: true,
    });

    return {
      valid: true,
      explanation,
      error: null,
      parts: parts.slice(0, 5),
    };
  } catch (err) {
    return {
      valid: false,
      explanation: null,
      error: err instanceof Error ? err.message : 'Invalid cron expression',
      parts: parts.slice(0, 5),
    };
  }
}

export function isValidCronField(field: string, index: number): boolean {
  // Basic validation patterns for each field
  const patterns = [
    /^(\*|[0-5]?\d)(\/\d+)?$|^(\d+(-\d+)?)(,\d+(-\d+)?)*$/,  // minute: 0-59
    /^(\*|[01]?\d|2[0-3])(\/\d+)?$|^(\d+(-\d+)?)(,\d+(-\d+)?)*$/,  // hour: 0-23
    /^(\*|[1-9]|[12]\d|3[01])(\/\d+)?$|^(\d+(-\d+)?)(,\d+(-\d+)?)*$|^L$/i,  // day: 1-31
    /^(\*|[1-9]|1[0-2])(\/\d+)?$|^(\d+(-\d+)?)(,\d+(-\d+)?)*$/,  // month: 1-12
    /^(\*|[0-7])(\/\d+)?$|^(\d+(-\d+)?)(,\d+(-\d+)?)*$/,  // weekday: 0-7
  ];

  if (index < 0 || index >= patterns.length) return false;
  return patterns[index].test(field);
}
