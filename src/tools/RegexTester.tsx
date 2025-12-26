import { useState, useMemo } from 'react';

interface Match {
  fullMatch: string;
  groups: string[];
  index: number;
}

function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');

  const result = useMemo(() => {
    if (!pattern) {
      return { valid: true, matches: [], error: null, warning: null };
    }

    try {
      // Check for catastrophic backtracking patterns
      const dangerousPatterns = [
        /\([^)]*\+\)[^)]*\+/,  // Nested quantifiers like (a+)+
        /\([^)]*\*\)[^)]*\*/,
        /\([^)]*\+\)[^)]*\*/,
        /\([^)]*\*\)[^)]*\+/,
      ];

      let warning: string | null = null;
      for (const dp of dangerousPatterns) {
        if (dp.test(pattern)) {
          warning = 'Warning: This pattern may cause catastrophic backtracking on certain inputs.';
          break;
        }
      }

      const regex = new RegExp(pattern, flags);
      const matches: Match[] = [];

      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            fullMatch: match[0],
            groups: match.slice(1),
            index: match.index,
          });
          // Prevent infinite loop on zero-width matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            fullMatch: match[0],
            groups: match.slice(1),
            index: match.index,
          });
        }
      }

      return { valid: true, matches, error: null, warning };
    } catch (err) {
      return {
        valid: false,
        matches: [],
        error: err instanceof Error ? err.message : 'Invalid regex',
        warning: null,
      };
    }
  }, [pattern, flags, testString]);

  const highlightedText = useMemo(() => {
    if (!result.valid || result.matches.length === 0 || !testString) {
      return null;
    }

    const parts: { text: string; isMatch: boolean; matchIndex?: number }[] = [];
    let lastEnd = 0;

    result.matches.forEach((match, idx) => {
      if (match.index > lastEnd) {
        parts.push({ text: testString.slice(lastEnd, match.index), isMatch: false });
      }
      parts.push({ text: match.fullMatch, isMatch: true, matchIndex: idx });
      lastEnd = match.index + match.fullMatch.length;
    });

    if (lastEnd < testString.length) {
      parts.push({ text: testString.slice(lastEnd), isMatch: false });
    }

    return parts;
  }, [testString, result]);

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Regex Tester</h1>
        <p className="tool-description">
          Test regular expressions with real-time matching and capture group display.
        </p>
      </div>

      <div className="input-group">
        <label className="input-label">Regular Expression</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            style={{ flex: 1 }}
          />
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            style={{ width: '60px', textAlign: 'center' }}
            placeholder="flags"
          />
        </div>
      </div>

      <div className="btn-group">
        <button
          className={`btn ${flags.includes('g') ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => toggleFlag('g')}
          title="Global - find all matches"
        >
          g (global)
        </button>
        <button
          className={`btn ${flags.includes('i') ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => toggleFlag('i')}
          title="Case insensitive"
        >
          i (ignore case)
        </button>
        <button
          className={`btn ${flags.includes('m') ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => toggleFlag('m')}
          title="Multiline - ^ and $ match line boundaries"
        >
          m (multiline)
        </button>
        <button
          className={`btn ${flags.includes('s') ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => toggleFlag('s')}
          title="Dotall - . matches newlines"
        >
          s (dotall)
        </button>
      </div>

      {result.error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {result.error}
        </div>
      )}

      {result.warning && (
        <div className="warning-message" style={{ marginBottom: '1rem' }}>
          {result.warning}
        </div>
      )}

      <div className="input-group">
        <label className="input-label">Test String</label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          style={{ minHeight: '120px' }}
        />
      </div>

      {highlightedText && (
        <div className="output-area">
          <div className="output-header">
            <span className="output-title">Highlighted Matches</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {highlightedText.map((part, i) => (
              <span
                key={i}
                className={part.isMatch ? 'highlight' : ''}
              >
                {part.text}
              </span>
            ))}
          </pre>
        </div>
      )}

      {result.matches.length > 0 && (
        <div className="output-area" style={{ marginTop: '1rem' }}>
          <div className="output-header">
            <span className="output-title">Match Details</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.matches.map((match, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Match {i + 1}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    at index {match.index}
                  </span>
                </div>
                <code style={{ color: 'var(--accent-primary)' }}>{match.fullMatch}</code>
                {match.groups.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Capture Groups:
                    </div>
                    {match.groups.map((group, gi) => (
                      <div key={gi} style={{ marginLeft: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>${gi + 1}:</span>{' '}
                        <code>{group ?? '(undefined)'}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RegexTester;
