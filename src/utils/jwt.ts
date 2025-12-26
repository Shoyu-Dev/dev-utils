/**
 * JWT utility functions
 * PRIVACY-CRITICAL: JWT decoding is done locally, no signature verification
 */

export interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export interface JWTDecodeResult {
  valid: boolean;
  decoded: DecodedJWT | null;
  error: string | null;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const decoded = atob(base64);
  return decodeURIComponent(
    decoded
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function decodeJWT(token: string): JWTDecodeResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { valid: false, decoded: null, error: null };
  }

  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return { valid: false, decoded: null, error: 'Invalid JWT format. Expected 3 parts separated by dots.' };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    const decoded: DecodedJWT = { header, payload, signature };
    return { valid: true, decoded, error: null };
  } catch (err) {
    return {
      valid: false,
      decoded: null,
      error: `Failed to decode: ${err instanceof Error ? err.message : 'Invalid Base64URL encoding'}`,
    };
  }
}

export function isJWTExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp;
  if (typeof exp !== 'number') return false;
  return exp * 1000 < Date.now();
}
