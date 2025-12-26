import { useState, useMemo } from 'react';
import cronstrue from 'cronstrue';

interface FieldInfo {
  name: string;
  allowed: string;
  special: string;
}

const FIELD_INFO: FieldInfo[] = [
  { name: 'Minute', allowed: '0-59', special: ', - * /' },
  { name: 'Hour', allowed: '0-23', special: ', - * /' },
  { name: 'Day of Month', allowed: '1-31', special: ', - * / L W' },
  { name: 'Month', allowed: '1-12 or JAN-DEC', special: ', - * /' },
  { name: 'Day of Week', allowed: '0-6 or SUN-SAT', special: ', - * / L #' },
];

const EXAMPLES = [
  { expression: '0 0 * * *', description: 'Every day at midnight' },
  { expression: '*/15 * * * *', description: 'Every 15 minutes' },
  { expression: '0 9 * * 1-5', description: 'Weekdays at 9 AM' },
  { expression: '0 0 1 * *', description: 'First day of every month' },
  { expression: '30 4 1,15 * *', description: '4:30 AM on the 1st and 15th' },
];

function CronExplainer() {
  const [expression, setExpression] = useState('');

  const result = useMemo(() => {
    const trimmed = expression.trim();
    if (!trimmed) {
      return { valid: false, explanation: null, error: null, parts: null };
    }

    const parts = trimmed.split(/\s+/);

    // Validate basic structure (5 or 6 parts)
    if (parts.length < 5 || parts.length > 6) {
      return {
        valid: false,
        explanation: null,
        error: `Expected 5 or 6 fields, got ${parts.length}. Format: minute hour day-of-month month day-of-week [year]`,
        parts: null,
      };
    }

    // Validate each field for obviously invalid characters
    const fieldErrors: string[] = [];

    parts.slice(0, 5).forEach((part, i) => {
      // Allow complex patterns - just check for obviously invalid characters
      if (!/^[\d*,\-/JFMASONDLW#]+$/i.test(part)) {
        fieldErrors.push(`${FIELD_INFO[i].name}: contains invalid characters`);
      }
    });

    if (fieldErrors.length > 0) {
      return {
        valid: false,
        explanation: null,
        error: fieldErrors.join('; '),
        parts: parts.slice(0, 5),
      };
    }

    try {
      // Use cronstrue for human-readable explanation
      const explanation = cronstrue.toString(trimmed, {
        throwExceptionOnParseError: true,
        verbose: true,
      });

      return {
        valid: true,
        explanation,
        error: null,
        parts: parts.slice(0, 5),
      };
    } catch (err) {
      return {
        valid: false,
        explanation: null,
        error: err instanceof Error ? err.message : 'Invalid cron expression',
        parts: parts.slice(0, 5),
      };
    }
  }, [expression]);

  const loadExample = (expr: string) => {
    setExpression(expr);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Cron Expression Explainer</h1>
        <p className="tool-description">
          Parse cron expressions and get human-readable explanations. Supports standard 5-field cron format.
        </p>
      </div>

      <div className="input-group">
        <label className="input-label">Cron Expression</label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g., */15 * * * * (every 15 minutes)"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}
        />
      </div>

      {result.error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {result.error}
        </div>
      )}

      {result.valid && result.explanation && (
        <div className="success-message" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
          {result.explanation}
        </div>
      )}

      {result.parts && (
        <div className="output-area" style={{ marginBottom: '1.5rem' }}>
          <div className="output-header">
            <span className="output-title">Field Breakdown</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
            {result.parts.map((part, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  borderTop: result.valid ? '3px solid var(--accent-secondary)' : '3px solid var(--accent-error)',
                }}
              >
                <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                  {part}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {FIELD_INFO[i].name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="output-area" style={{ marginBottom: '1.5rem' }}>
        <div className="output-header">
          <span className="output-title">Examples</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {EXAMPLES.map(({ expression: expr, description }) => (
            <div
              key={expr}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              onClick={() => loadExample(expr)}
            >
              <code style={{ color: 'var(--accent-primary)' }}>{expr}</code>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{description}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Cron Format Reference</strong>
        <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
          {FIELD_INFO.map((field) => (
            <div key={field.name} style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr', gap: '1rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{field.name}</span>
              <code>{field.allowed}</code>
              <span>Special: <code>{field.special}</code></span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
          <strong>Special Characters:</strong>
          <ul style={{ marginTop: '0.25rem', marginLeft: '1.5rem' }}>
            <li><code>*</code> - any value</li>
            <li><code>,</code> - list separator (1,3,5)</li>
            <li><code>-</code> - range (1-5)</li>
            <li><code>/</code> - step (*/15 = every 15)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CronExplainer;
