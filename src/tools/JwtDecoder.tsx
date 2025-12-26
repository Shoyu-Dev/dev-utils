import { useState, useMemo } from 'react';

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

// PRIVACY-CRITICAL: Pure browser-side Base64URL decoding
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  // Decode
  const decoded = atob(base64);
  // Handle UTF-8
  return decodeURIComponent(
    decoded
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

function formatTimestamp(ts: number): string {
  // Detect if timestamp is in seconds or milliseconds
  const date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000);
  return date.toLocaleString() + ' (local time)';
}

function JwtDecoder() {
  const [token, setToken] = useState('');

  const result = useMemo(() => {
    // Remove all whitespace (spaces, tabs, newlines) that may appear when pasting
    const cleaned = token.replace(/\s/g, '');
    if (!cleaned) {
      return { valid: false, decoded: null, error: null };
    }

    const parts = cleaned.split('.');
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
  }, [token]);

  const renderValue = (key: string, value: unknown): React.ReactNode => {
    // Handle common JWT timestamp fields
    const timestampFields = ['exp', 'iat', 'nbf', 'auth_time'];
    if (timestampFields.includes(key) && typeof value === 'number') {
      const isExpired = key === 'exp' && value * 1000 < Date.now();
      return (
        <span>
          {value}{' '}
          <span style={{ color: isExpired ? 'var(--accent-error)' : 'var(--text-muted)', fontSize: '0.85em' }}>
            ({formatTimestamp(value)})
            {isExpired && ' [EXPIRED]'}
          </span>
        </span>
      );
    }

    if (typeof value === 'string') {
      return <span style={{ color: 'var(--accent-secondary)' }}>"{value}"</span>;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return <span style={{ color: 'var(--accent-primary)' }}>{String(value)}</span>;
    }
    if (value === null) {
      return <span style={{ color: 'var(--text-muted)' }}>null</span>;
    }
    if (Array.isArray(value)) {
      return <span style={{ color: 'var(--text-primary)' }}>{JSON.stringify(value)}</span>;
    }
    if (typeof value === 'object') {
      return <span style={{ color: 'var(--text-primary)' }}>{JSON.stringify(value)}</span>;
    }
    return String(value);
  };

  const renderObject = (obj: Record<string, unknown>, title: string) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</h3>
      <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--accent-warning)' }}>"{key}"</span>
            <span style={{ color: 'var(--text-muted)' }}>: </span>
            {renderValue(key, value)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">JWT Decoder</h1>
        <p className="tool-description">
          Decode and inspect JSON Web Tokens. View header and payload contents.
        </p>
      </div>

      <div className="warning-message" style={{ marginBottom: '1.5rem' }}>
        <strong>Decode only — not verification.</strong> This tool decodes the JWT to display its contents
        but does NOT verify the signature. Do not use this to determine if a token is valid or trustworthy.
      </div>

      <div className="input-group">
        <label className="input-label">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
          style={{ minHeight: '100px', wordBreak: 'break-all' }}
        />
      </div>

      {result.error && (
        <div className="error-message">
          {result.error}
        </div>
      )}

      {result.valid && result.decoded && (
        <div className="output-area">
          {renderObject(result.decoded.header, 'Header (Algorithm & Token Type)')}
          {renderObject(result.decoded.payload, 'Payload (Claims)')}

          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Signature (Base64URL encoded)
            </h3>
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              wordBreak: 'break-all',
              color: 'var(--text-muted)',
            }}>
              {result.decoded.signature}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              The signature is displayed as-is. Signature verification requires the secret key and is not performed here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default JwtDecoder;
