import { useState, useMemo } from 'react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';

interface ValidationError {
  path: string;
  message: string;
}

/**
 * Auto-detect and parse JSON or YAML
 * Try JSON first (stricter), fall back to YAML
 */
function autoParse(input: string): { data: unknown; format: 'json' | 'yaml' } {
  const trimmed = input.trim();

  // Try JSON first
  try {
    return { data: JSON.parse(trimmed), format: 'json' };
  } catch {
    // Fall back to YAML
    return { data: yaml.load(trimmed), format: 'yaml' };
  }
}

function SchemaValidator() {
  const [data, setData] = useState('');
  const [schema, setSchema] = useState('');

  const result = useMemo(() => {
    if (!data.trim() || !schema.trim()) {
      return { validated: false, valid: false, errors: [], parseError: null, detectedDataFormat: null, detectedSchemaFormat: null };
    }

    try {
      // Auto-detect and parse data
      let parsedData: unknown;
      let detectedDataFormat: 'json' | 'yaml';
      try {
        const result = autoParse(data);
        parsedData = result.data;
        detectedDataFormat = result.format;
      } catch (err) {
        return {
          validated: false,
          valid: false,
          errors: [],
          parseError: `Data parse error: ${err instanceof Error ? err.message : 'Invalid JSON or YAML'}`,
          detectedDataFormat: null,
          detectedSchemaFormat: null,
        };
      }

      // Auto-detect and parse schema
      let parsedSchema: unknown;
      let detectedSchemaFormat: 'json' | 'yaml';
      try {
        const result = autoParse(schema);
        parsedSchema = result.data;
        detectedSchemaFormat = result.format;
      } catch (err) {
        return {
          validated: false,
          valid: false,
          errors: [],
          parseError: `Schema parse error: ${err instanceof Error ? err.message : 'Invalid JSON or YAML'}`,
          detectedDataFormat,
          detectedSchemaFormat: null,
        };
      }

      // Validate with AJV
      // PRIVACY-CRITICAL: Disable remote schema loading
      const ajv = new Ajv({
        allErrors: true,
        verbose: true,
        loadSchema: undefined, // Explicitly disable remote schema loading
      });
      addFormats(ajv);

      const validate = ajv.compile(parsedSchema as object);
      const valid = validate(parsedData);

      const errors: ValidationError[] = validate.errors?.map((err) => ({
        path: err.instancePath || '/',
        message: `${err.message}${err.params ? ` (${JSON.stringify(err.params)})` : ''}`,
      })) || [];

      return { validated: true, valid, errors, parseError: null, detectedDataFormat, detectedSchemaFormat };
    } catch (err) {
      return {
        validated: false,
        valid: false,
        errors: [],
        parseError: `Validation error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        detectedDataFormat: null,
        detectedSchemaFormat: null,
      };
    }
  }, [data, schema]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">JSON / YAML Schema Validator</h1>
        <p className="tool-description">
          Validate JSON or YAML data against a JSON Schema. Format is auto-detected. No remote schema resolution.
        </p>
      </div>

      <div className="two-column">
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="input-label" style={{ margin: 0 }}>Data</label>
            {result.detectedDataFormat && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                Detected: {result.detectedDataFormat.toUpperCase()}
              </span>
            )}
          </div>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Paste JSON or YAML data to validate..."
            style={{ minHeight: '250px' }}
          />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="input-label" style={{ margin: 0 }}>Schema (JSON Schema)</label>
            {result.detectedSchemaFormat && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                Detected: {result.detectedSchemaFormat.toUpperCase()}
              </span>
            )}
          </div>
          <textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder="Paste JSON Schema (in JSON or YAML format)..."
            style={{ minHeight: '250px' }}
          />
        </div>
      </div>

      {result.parseError && (
        <div className="error-message" style={{ marginTop: '1rem' }}>
          {result.parseError}
        </div>
      )}

      {result.validated && result.valid && (
        <div className="success-message" style={{ marginTop: '1rem' }}>
          Validation successful! The data matches the schema.
        </div>
      )}

      {result.validated && !result.valid && result.errors.length > 0 && (
        <div className="output-area" style={{ marginTop: '1rem' }}>
          <div className="output-header">
            <span className="output-title" style={{ color: 'var(--accent-error)' }}>
              Validation Failed
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.errors.map((error, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 68, 102, 0.1)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--accent-error)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                  {error.path}
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {error.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <strong>Example Schema:</strong>
        <pre style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
{`{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}`}
        </pre>
      </div>
    </div>
  );
}

export default SchemaValidator;
