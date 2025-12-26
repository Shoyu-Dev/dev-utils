import { useState, useMemo } from 'react';
import yaml from 'js-yaml';

type Format = 'json' | 'yaml';
type Action = 'prettify' | 'minify';

function JsonYamlPrettifier() {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState<Format>('json');
  const [action, setAction] = useState<Action>('prettify');
  const [indentSize, setIndentSize] = useState(2);

  const result = useMemo(() => {
    if (!input.trim()) {
      return { success: true, output: '', error: null };
    }

    try {
      let parsed: unknown;

      // Try to parse based on format
      if (format === 'json') {
        parsed = JSON.parse(input);
      } else {
        parsed = yaml.load(input);
      }

      // Format output
      let output: string;
      if (format === 'json') {
        output = action === 'prettify'
          ? JSON.stringify(parsed, null, indentSize)
          : JSON.stringify(parsed);
      } else {
        output = action === 'prettify'
          ? yaml.dump(parsed, { indent: indentSize, lineWidth: -1 })
          : yaml.dump(parsed, { flowLevel: 0, lineWidth: -1 });
      }

      return { success: true, output, error: null };
    } catch (err) {
      return {
        success: false,
        output: '',
        error: err instanceof Error ? err.message : 'Parse error',
      };
    }
  }, [input, format, action, indentSize]);

  const copyToClipboard = () => {
    if (result.output) {
      navigator.clipboard.writeText(result.output);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">JSON / YAML Prettifier</h1>
        <p className="tool-description">
          Format, beautify, or minify JSON and YAML data with syntax highlighting.
        </p>
      </div>

      <div className="btn-group">
        <button
          className={`btn ${format === 'json' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFormat('json')}
        >
          JSON
        </button>
        <button
          className={`btn ${format === 'yaml' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFormat('yaml')}
        >
          YAML
        </button>
        <span style={{ width: '1rem' }} />
        <button
          className={`btn ${action === 'prettify' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAction('prettify')}
        >
          Prettify
        </button>
        <button
          className={`btn ${action === 'minify' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAction('minify')}
        >
          Minify
        </button>
        {action === 'prettify' && (
          <>
            <span style={{ width: '1rem' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Indent:
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </label>
          </>
        )}
      </div>

      <div className="two-column">
        <div className="input-group">
          <label className="input-label">Input ({format.toUpperCase()})</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste ${format.toUpperCase()} here...`}
            style={{ minHeight: '300px' }}
          />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Output</label>
            {result.output && (
              <button className="btn btn-secondary" onClick={copyToClipboard} style={{ padding: '0.25rem 0.75rem' }}>
                Copy
              </button>
            )}
          </div>
          {result.error ? (
            <div className="error-message" style={{ minHeight: '300px' }}>
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <textarea
              value={result.output}
              readOnly
              placeholder="Formatted output will appear here..."
              style={{ minHeight: '300px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default JsonYamlPrettifier;
