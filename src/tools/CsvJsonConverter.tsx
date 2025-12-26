import { useState, useMemo } from 'react';
import Papa from 'papaparse';

type Direction = 'csvToJson' | 'jsonToCsv';

function CsvJsonConverter() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('csvToJson');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) {
      return { success: true, output: '', error: null, preview: null };
    }

    try {
      if (direction === 'csvToJson') {
        // Parse CSV to JSON
        const parsed = Papa.parse(input, {
          delimiter: delimiter || ',',
          header: hasHeader,
          skipEmptyLines: true,
          dynamicTyping: true, // Convert numbers and booleans
        });

        if (parsed.errors.length > 0) {
          const firstError = parsed.errors[0];
          return {
            success: false,
            output: '',
            error: `Row ${firstError.row}: ${firstError.message}`,
            preview: null,
          };
        }

        const output = JSON.stringify(parsed.data, null, 2);
        return {
          success: true,
          output,
          error: null,
          preview: {
            rows: parsed.data.length,
            columns: hasHeader
              ? parsed.meta.fields?.length || 0
              : (parsed.data[0] as unknown[])?.length || 0,
          },
        };
      } else {
        // Parse JSON to CSV
        let data: unknown[];
        try {
          data = JSON.parse(input);
        } catch {
          return { success: false, output: '', error: 'Invalid JSON', preview: null };
        }

        if (!Array.isArray(data)) {
          return { success: false, output: '', error: 'JSON must be an array of objects or arrays', preview: null };
        }

        if (data.length === 0) {
          return { success: true, output: '', error: null, preview: { rows: 0, columns: 0 } };
        }

        // Determine if it's array of objects or array of arrays
        const firstItem = data[0];
        const isObjectArray = typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem);

        const output = Papa.unparse(data, {
          delimiter: delimiter || ',',
          header: hasHeader && isObjectArray,
        });

        return {
          success: true,
          output,
          error: null,
          preview: {
            rows: data.length,
            columns: isObjectArray
              ? Object.keys(firstItem).length
              : Array.isArray(firstItem)
              ? firstItem.length
              : 1,
          },
        };
      }
    } catch (err) {
      return {
        success: false,
        output: '',
        error: err instanceof Error ? err.message : 'Conversion failed',
        preview: null,
      };
    }
  }, [input, direction, delimiter, hasHeader]);

  const copyToClipboard = () => {
    if (result.output) {
      navigator.clipboard.writeText(result.output);
    }
  };

  const sourceFormat = direction === 'csvToJson' ? 'CSV' : 'JSON';
  const targetFormat = direction === 'csvToJson' ? 'JSON' : 'CSV';

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">CSV / JSON Converter</h1>
        <p className="tool-description">
          Convert between CSV and JSON formats with configurable delimiters and header handling.
        </p>
      </div>

      <div className="btn-group">
        <button
          className={`btn ${direction === 'csvToJson' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDirection('csvToJson')}
        >
          CSV → JSON
        </button>
        <button
          className={`btn ${direction === 'jsonToCsv' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setDirection('jsonToCsv')}
        >
          JSON → CSV
        </button>
      </div>

      <div className="btn-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Delimiter:
          <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
          />
          {direction === 'csvToJson' ? 'First row is header' : 'Include header row'}
        </label>
      </div>

      <div className="two-column">
        <div className="input-group">
          <label className="input-label">Input ({sourceFormat})</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'csvToJson'
              ? 'name,age,city\nAlice,30,NYC\nBob,25,LA'
              : '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'}
            style={{ minHeight: '350px' }}
          />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">
              Output ({targetFormat})
              {result.preview && (
                <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                  {result.preview.rows} rows × {result.preview.columns} columns
                </span>
              )}
            </label>
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

export default CsvJsonConverter;
