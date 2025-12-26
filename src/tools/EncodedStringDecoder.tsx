import { useState, useMemo } from 'react';

type EncodingType = 'base64' | 'base64url' | 'url' | 'hex' | 'unicode';

interface DecodingResult {
  type: EncodingType;
  label: string;
  success: boolean;
  output: string;
  error?: string;
}

// PRIVACY-CRITICAL: All decoding is done locally in the browser

function decodeBase64(input: string): { success: boolean; output: string; error?: string } {
  try {
    const decoded = atob(input);
    // Check if it's valid UTF-8
    try {
      return { success: true, output: decodeURIComponent(escape(decoded)) };
    } catch {
      // Not valid UTF-8, return as-is
      return { success: true, output: decoded };
    }
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid Base64' };
  }
}

function decodeBase64Url(input: string): { success: boolean; output: string; error?: string } {
  try {
    // Convert Base64URL to standard Base64
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeBase64(base64);
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid Base64URL' };
  }
}

function decodeUrl(input: string): { success: boolean; output: string; error?: string } {
  try {
    return { success: true, output: decodeURIComponent(input) };
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid URL encoding' };
  }
}

function decodeHex(input: string): { success: boolean; output: string; error?: string } {
  try {
    // Remove common prefixes and whitespace
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

    // Try to decode as UTF-8
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes));
    return { success: true, output: decoded };
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid hex encoding' };
  }
}

function decodeUnicode(input: string): { success: boolean; output: string; error?: string } {
  try {
    // Handle \uXXXX, \u{XXXXX}, and &#XXXX; formats
    const decoded = input
      // \u{XXXXX} format (ES6)
      .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      // \uXXXX format
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      // &#XXXXX; decimal format
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
      // &#xXXXX; hex format
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));

    return { success: true, output: decoded };
  } catch (e) {
    return { success: false, output: '', error: e instanceof Error ? e.message : 'Invalid unicode escape' };
  }
}

function encodeBase64(input: string): string {
  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return btoa(input);
  }
}

function encodeBase64Url(input: string): string {
  return encodeBase64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

function encodeHex(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function encodeUnicode(input: string): string {
  return Array.from(input).map(char => {
    const code = char.codePointAt(0);
    if (code === undefined) return char;
    if (code > 0xFFFF) {
      return `\\u{${code.toString(16)}}`;
    }
    return `\\u${code.toString(16).padStart(4, '0')}`;
  }).join('');
}

function EncodedStringDecoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'decode' | 'encode'>('decode');
  const [selectedEncoding, setSelectedEncoding] = useState<EncodingType>('base64');

  const decodingResults = useMemo((): DecodingResult[] => {
    if (!input.trim()) return [];

    return [
      { type: 'base64', label: 'Base64', ...decodeBase64(input.trim()) },
      { type: 'base64url', label: 'Base64URL', ...decodeBase64Url(input.trim()) },
      { type: 'url', label: 'URL Encoding', ...decodeUrl(input.trim()) },
      { type: 'hex', label: 'Hexadecimal', ...decodeHex(input.trim()) },
      { type: 'unicode', label: 'Unicode Escapes', ...decodeUnicode(input.trim()) },
    ];
  }, [input]);

  const encodeResult = useMemo(() => {
    if (!input.trim()) return '';

    const encoders: Record<EncodingType, (s: string) => string> = {
      base64: encodeBase64,
      base64url: encodeBase64Url,
      url: encodeUrl,
      hex: encodeHex,
      unicode: encodeUnicode,
    };

    try {
      return encoders[selectedEncoding](input);
    } catch {
      return 'Encoding failed';
    }
  }, [input, selectedEncoding]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const encodingLabels: Record<EncodingType, string> = {
    base64: 'Base64',
    base64url: 'Base64URL',
    url: 'URL Encoding',
    hex: 'Hexadecimal',
    unicode: 'Unicode Escapes',
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Encoded String Decoder</h1>
        <p className="tool-description">
          Decode or encode strings using Base64, URL encoding, Hex, and Unicode escapes.
        </p>
      </div>

      <div className="btn-group">
        <button
          className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('decode')}
        >
          Decode
        </button>
        <button
          className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('encode')}
        >
          Encode
        </button>
      </div>

      {mode === 'encode' && (
        <div className="btn-group">
          {(Object.keys(encodingLabels) as EncodingType[]).map(type => (
            <button
              key={type}
              className={`btn ${selectedEncoding === type ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedEncoding(type)}
            >
              {encodingLabels[type]}
            </button>
          ))}
        </div>
      )}

      <div className="input-group">
        <label className="input-label">
          {mode === 'decode' ? 'Encoded Input' : 'Plain Text Input'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'decode'
            ? 'Paste encoded string here (Base64, URL, Hex, or Unicode)...'
            : 'Enter text to encode...'}
          style={{ minHeight: '120px' }}
        />
      </div>

      {mode === 'decode' && decodingResults.length > 0 && (
        <div className="output-area">
          <div className="output-header">
            <span className="output-title">Decoded Results</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {decodingResults.map((result) => (
              <div
                key={result.type}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `3px solid ${result.success ? 'var(--accent-secondary)' : 'var(--accent-error)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{result.label}</span>
                  {result.success && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => copyToClipboard(result.output)}
                      style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Copy
                    </button>
                  )}
                </div>
                {result.success ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {result.output}
                  </pre>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {result.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'encode' && input.trim() && (
        <div className="output-area">
          <div className="output-header">
            <span className="output-title">Encoded Result ({encodingLabels[selectedEncoding]})</span>
            <button
              className="btn btn-secondary"
              onClick={() => copyToClipboard(encodeResult)}
              style={{ padding: '0.25rem 0.75rem' }}
            >
              Copy
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {encodeResult}
          </pre>
        </div>
      )}
    </div>
  );
}

export default EncodedStringDecoder;
