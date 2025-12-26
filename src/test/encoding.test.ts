import { describe, it, expect } from 'vitest';
import {
  decodeBase64,
  decodeBase64Url,
  decodeUrl,
  decodeHex,
  decodeUnicode,
  encodeBase64,
  encodeBase64Url,
  encodeUrl,
  encodeHex,
  encodeUnicode,
} from '../utils/encoding';

describe('Base64 Encoding/Decoding', () => {
  it('should decode valid Base64', () => {
    const result = decodeBase64('SGVsbG8gV29ybGQ=');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello World');
  });

  it('should decode Base64 with UTF-8 characters', () => {
    const result = decodeBase64('w6nDqMOgw7w=');
    expect(result.success).toBe(true);
    expect(result.output).toBe('éèàü');
  });

  it('should return error for invalid Base64', () => {
    const result = decodeBase64('not-valid-base64!!!');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should encode to Base64', () => {
    const result = encodeBase64('Hello World');
    expect(result).toBe('SGVsbG8gV29ybGQ=');
  });

  it('should handle round-trip encoding/decoding', () => {
    const original = 'Test string with special chars: éèà!@#$%';
    const encoded = encodeBase64(original);
    const decoded = decodeBase64(encoded);
    expect(decoded.success).toBe(true);
    expect(decoded.output).toBe(original);
  });
});

describe('Base64URL Encoding/Decoding', () => {
  it('should decode valid Base64URL', () => {
    const result = decodeBase64Url('SGVsbG8gV29ybGQ');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello World');
  });

  it('should handle URL-safe characters', () => {
    // Base64URL uses - and _ instead of + and /
    const urlSafe = encodeBase64Url('test?data+here');
    expect(urlSafe).not.toContain('+');
    expect(urlSafe).not.toContain('/');
    expect(urlSafe).not.toContain('=');
  });

  it('should decode Base64URL without padding', () => {
    const result = decodeBase64Url('SGVsbG8');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello');
  });
});

describe('URL Encoding/Decoding', () => {
  it('should decode URL-encoded string', () => {
    const result = decodeUrl('Hello%20World');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello World');
  });

  it('should decode special characters', () => {
    const result = decodeUrl('%3Fquery%3Dvalue%26other%3D123');
    expect(result.success).toBe(true);
    expect(result.output).toBe('?query=value&other=123');
  });

  it('should return error for invalid URL encoding', () => {
    const result = decodeUrl('%ZZ');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should encode URL special characters', () => {
    const result = encodeUrl('Hello World?test=value');
    expect(result).toBe('Hello%20World%3Ftest%3Dvalue');
  });

  it('should handle round-trip URL encoding', () => {
    const original = 'path/to/resource?query=value&foo=bar';
    const encoded = encodeUrl(original);
    const decoded = decodeUrl(encoded);
    expect(decoded.success).toBe(true);
    expect(decoded.output).toBe(original);
  });
});

describe('Hex Encoding/Decoding', () => {
  it('should decode hex string', () => {
    const result = decodeHex('48656c6c6f');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello');
  });

  it('should handle 0x prefix', () => {
    const result = decodeHex('0x48656c6c6f');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello');
  });

  it('should handle uppercase hex', () => {
    const result = decodeHex('48454C4C4F');
    expect(result.success).toBe(true);
    expect(result.output).toBe('HELLO');
  });

  it('should handle spaces in hex', () => {
    const result = decodeHex('48 65 6c 6c 6f');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello');
  });

  it('should return error for invalid hex characters', () => {
    const result = decodeHex('GHIJ');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid hex');
  });

  it('should return error for odd-length hex', () => {
    const result = decodeHex('123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('even length');
  });

  it('should encode to hex', () => {
    const result = encodeHex('Hello');
    expect(result).toBe('48656c6c6f');
  });

  it('should handle round-trip hex encoding', () => {
    const original = 'Test 123';
    const encoded = encodeHex(original);
    const decoded = decodeHex(encoded);
    expect(decoded.success).toBe(true);
    expect(decoded.output).toBe(original);
  });
});

describe('Unicode Escape Decoding', () => {
  it('should decode \\uXXXX format', () => {
    const result = decodeUnicode('\\u0048\\u0065\\u006c\\u006c\\u006f');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello');
  });

  it('should decode \\u{XXXXX} format', () => {
    const result = decodeUnicode('\\u{1F600}');
    expect(result.success).toBe(true);
    expect(result.output).toBe('😀');
  });

  it('should decode &#XXXX; decimal format', () => {
    const result = decodeUnicode('&#72;&#101;&#108;&#108;&#111;');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello');
  });

  it('should decode &#xXXXX; hex format', () => {
    const result = decodeUnicode('&#x48;&#x65;&#x6c;&#x6c;&#x6f;');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello');
  });

  it('should handle mixed content', () => {
    const result = decodeUnicode('Hello \\u0057orld');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello World');
  });

  it('should encode to unicode escapes', () => {
    const result = encodeUnicode('Hi');
    expect(result).toBe('\\u0048\\u0069');
  });

  it('should handle emoji encoding', () => {
    const result = encodeUnicode('😀');
    expect(result).toBe('\\u{1f600}');
  });
});
