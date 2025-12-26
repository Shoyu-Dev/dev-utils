import { useState, useMemo } from 'react';
import yaml from 'js-yaml';

type Direction = 'jsonToYaml' | 'yamlToJson';

function JsonYamlConverter() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('jsonToYaml');
  const [indentSize, setIndentSize] = useState(2);

  const result = useMemo(() => {
    if (!input.trim()) {
      return { success: true, output: '', error: null };
    }

    try {
      if (direction === 'jsonToYaml') {
        // Parse JSON, output YAML
        const parsed = JSON.parse(input);
        const output = yaml.dump(parsed, {
          indent: indentSize,
          lineWidth: -1, // No line wrapping
          noRefs: true,
          sortKeys: false,
        });
        return { success: true, output, error: null };
      } else {
        // Parse YAML, output JSON
        const parsed = yaml.load(input);
        const output = JSON.stringify(parsed, null, indentSize);
        return { success: true, output, error: null };
      }
    } catch (err) {
      return {
        success: false,
        output: '',
        error: err instanceof Error ? err.message : 'Conversion failed',
      };
    }
  }, [input, direction, indentSize]);

  const copyToClipboard = () => {
    if (result.output) {
      navigator.clipboard.writeText(result.output);
    }
  };

  const swapDirection = () => {
    // Try to use the output as the new input
    if (result.success && result.output) {
      setInput(result.output);
    }
    setDirection(direction === 'jsonToYaml' ? 'yamlToJson' : 'jsonToYaml');
  };

  const sourceFormat = direction === 'jsonToYaml' ? 'JSON' : 'YAML';
  const targetFormat = direction === 'jsonToYaml' ? 'YAML' : 'JSON';

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">JSON / YAML Converter</h1>
        <p className="tool-description">
          Convert between JSON and YAML formats with preserved data fidelity.
        </p>
      </div>

      <div className="btn-group">
        <button
          className={`btn ${direction === 'jsonToYaml' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDirection('jsonToYaml')}
        >
          JSON → YAML
        </button>
        <button
          className={`btn ${direction === 'yamlToJson' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDirection('yamlToJson')}
        >
          YAML → JSON
        </button>
        <button
          className="btn btn-secondary"
          onClick={swapDirection}
          title="Swap input/output and reverse direction"
        >
          ⇄ Swap
        </button>
        <span style={{ width: '1rem' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Indent:
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
      </div>

      <div className="two-column">
        <div className="input-group">
          <label className="input-label">Input ({sourceFormat})</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste ${sourceFormat} here...`}
            style={{ minHeight: '350px' }}
          />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Output ({targetFormat})</label>
            {result.output && (
              <button
                className="btn btn-secondary"
                onClick={copyToClipboard}
                style={{ padding: '0.25rem 0.75rem' }}
              >
                Copy
              </button>
            )}
          </div>
          {result.error ? (
            <div className="error-message" style={{ minHeight: '350px' }}>
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <textarea
              value={result.output}
              readOnly
              placeholder={`Converted ${targetFormat} will appear here...`}
              style={{ minHeight: '350px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default JsonYamlConverter;
