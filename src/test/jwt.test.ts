import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { decodeJWT, isJWTExpired } from '../utils/jwt';

describe('JWT Decoding', () => {
  // Sample JWT tokens for testing
  // These are test tokens, not real credentials
  const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  it('should decode a valid JWT', () => {
    const result = decodeJWT(validJWT);
    expect(result.valid).toBe(true);
    expect(result.decoded).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('should extract header correctly', () => {
    const result = decodeJWT(validJWT);
    expect(result.decoded?.header.alg).toBe('HS256');
    expect(result.decoded?.header.typ).toBe('JWT');
  });

  it('should extract payload correctly', () => {
    const result = decodeJWT(validJWT);
    expect(result.decoded?.payload.sub).toBe('1234567890');
    expect(result.decoded?.payload.name).toBe('John Doe');
    expect(result.decoded?.payload.iat).toBe(1516239022);
  });

  it('should extract signature', () => {
    const result = decodeJWT(validJWT);
    expect(result.decoded?.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  it('should return error for JWT with wrong number of parts', () => {
    const result = decodeJWT('not.ajwt');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('3 parts');
  });

  it('should return error for JWT with invalid Base64', () => {
    const result = decodeJWT('!!!.!!!.!!!');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Failed to decode');
  });

  it('should return null for empty input', () => {
    const result = decodeJWT('');
    expect(result.valid).toBe(false);
    expect(result.decoded).toBeNull();
    expect(result.error).toBeNull();
  });

  it('should handle whitespace around token', () => {
    const result = decodeJWT(`  ${validJWT}  `);
    expect(result.valid).toBe(true);
    expect(result.decoded?.payload.name).toBe('John Doe');
  });

  it('should decode JWT with complex payload', () => {
    // JWT with nested objects and arrays
    const complexJWT = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJhZG1pbiIsInVzZXIiXSwibWV0YSI6eyJpc3N1ZXIiOiJ0ZXN0In19.abc';
    const result = decodeJWT(complexJWT);
    expect(result.valid).toBe(true);
    expect(result.decoded?.payload.roles).toEqual(['admin', 'user']);
    expect((result.decoded?.payload.meta as Record<string, string>).issuer).toBe('test');
  });
});

describe('JWT Expiration Check', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should detect expired token', () => {
    // Set current time to 2024
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    // Token expired in 2020
    const payload = { exp: 1577836800 }; // 2020-01-01
    expect(isJWTExpired(payload)).toBe(true);
  });

  it('should detect non-expired token', () => {
    // Set current time to 2024
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    // Token expires in 2030
    const payload = { exp: 1893456000 }; // 2030-01-01
    expect(isJWTExpired(payload)).toBe(false);
  });

  it('should return false if no exp claim', () => {
    const payload = { sub: '123' };
    expect(isJWTExpired(payload)).toBe(false);
  });

  it('should return false if exp is not a number', () => {
    const payload = { exp: '2024-01-01' };
    expect(isJWTExpired(payload)).toBe(false);
  });
});
