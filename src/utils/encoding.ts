/**
 * Encoding/Decoding utility functions
 * PRIVACY-CRITICAL: All encoding operations are done locally in the browser
 */

export interface DecodeResult {
  success: boolean;
  output: string;
  error?: string;
}

export function decodeBase64(input: string): DecodeResult {
  try {
    const decoded = atob(input);
    try {
      return { success: true, output: decodeURIComponent(escape(decoded)) };
    } catch {
      return { success: true, output: decoded };
    }
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid Base64' };
  }
}

export function decodeBase64Url(input: string): DecodeResult {
  try {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeBase64(base64);
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid Base64URL' };
  }
}

export function decodeUrl(input: string): DecodeResult {
  try {
    return { success: true, output: decodeURIComponent(input) };
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid URL encoding' };
  }
}

export function decodeHex(input: string): DecodeResult {
  try {
    const cleaned = input.replace(/^0x/i, '').replace(/\s/g, '');

    if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
      return { success: false, output: '', error: 'Invalid hex characters' };
    }

    if (cleaned.length % 2 !== 0) {
      return { success: false, output: '', error: 'Hex string must have even length' };
    }

    const bytes = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(parseInt(cleaned.substr(i, 2), 16));
    }

    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes));
    return { success: true, output: decoded };
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid hex encoding' };
  }
}

export function decodeUnicode(input: string): DecodeResult {
  try {
    const decoded = input
      .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));

    return { success: true, output: decoded };
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid unicode escape' };
  }
}

export function encodeBase64(input: string): string {
  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return btoa(input);
  }
}

export function encodeBase64Url(input: string): string {
  return encodeBase64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

export function encodeHex(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function encodeUnicode(input: string): string {
  return Array.from(input).map(char => {
    const code = char.codePointAt(0);
    if (code === undefined) return char;
    if (code > 0xFFFF) {
      return `\\u{${code.toString(16)}}`;
    }
    return `\\u${code.toString(16).padStart(4, '0')}`;
  }).join('');
}
