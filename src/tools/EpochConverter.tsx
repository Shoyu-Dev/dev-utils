import { useState, useMemo, useEffect } from 'react';

type TimestampUnit = 'seconds' | 'milliseconds';

function EpochConverter() {
  const [epochInput, setEpochInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [unit, setUnit] = useState<TimestampUnit>('seconds');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // PRIVACY-CRITICAL: All time conversions use browser's local Date object
  // No external time APIs are called

  const epochToDate = useMemo(() => {
    if (!epochInput.trim()) return null;

    const value = parseInt(epochInput.trim(), 10);
    if (isNaN(value)) {
      return { error: 'Invalid number' };
    }

    // Convert to milliseconds if needed
    const ms = unit === 'seconds' ? value * 1000 : value;

    // Sanity check - reasonable date range
    const minDate = new Date('1970-01-01').getTime();
    const maxDate = new Date('2100-01-01').getTime();

    if (ms < minDate || ms > maxDate) {
      return { error: 'Timestamp out of reasonable range (1970-2100)' };
    }

    const date = new Date(ms);

    return {
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      relative: getRelativeTime(ms),
    };
  }, [epochInput, unit]);

  const dateToEpoch = useMemo(() => {
    if (!dateInput.trim()) return null;

    const date = new Date(dateInput.trim());
    if (isNaN(date.getTime())) {
      return { error: 'Invalid date format' };
    }

    const ms = date.getTime();
    return {
      seconds: Math.floor(ms / 1000),
      milliseconds: ms,
    };
  }, [dateInput]);

  function getRelativeTime(ms: number): string {
    const now = Date.now();
    const diff = ms - now;
    const absDiff = Math.abs(diff);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);

    let unit: string;
    let value: number;

    if (years > 0) {
      unit = years === 1 ? 'year' : 'years';
      value = years;
    } else if (days > 0) {
      unit = days === 1 ? 'day' : 'days';
      value = days;
    } else if (hours > 0) {
      unit = hours === 1 ? 'hour' : 'hours';
      value = hours;
    } else if (minutes > 0) {
      unit = minutes === 1 ? 'minute' : 'minutes';
      value = minutes;
    } else {
      unit = seconds === 1 ? 'second' : 'seconds';
      value = seconds;
    }

    if (diff > 0) {
      return `in ${value} ${unit}`;
    } else if (diff < 0) {
      return `${value} ${unit} ago`;
    } else {
      return 'now';
    }
  }

  const currentSeconds = Math.floor(currentTime / 1000);
  const currentMs = currentTime;

  const copyToClipboard = (text: string | number) => {
    navigator.clipboard.writeText(String(text));
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h1 className="tool-title">Epoch Timestamp Converter</h1>
        <p className="tool-description">
          Convert between Unix epoch timestamps and human-readable dates. All conversions happen locally in your browser.
        </p>
      </div>

      {/* Current time display */}
      <div className="output-area" style={{ marginBottom: '1.5rem' }}>
        <div className="output-header">
          <span className="output-title">Current Time</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Seconds</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <code style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{currentSeconds}</code>
              <button
                className="btn btn-secondary"
                onClick={() => copyToClipboard(currentSeconds)}
                style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Milliseconds</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <code style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{currentMs}</code>
              <button
                className="btn btn-secondary"
                onClick={() => copyToClipboard(currentMs)}
                style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Local Time</div>
            <code style={{ fontSize: '1rem' }}>{new Date(currentTime).toLocaleString()}</code>
          </div>
        </div>
      </div>

      <div className="two-column">
        {/* Epoch to Date */}
        <div className="input-group">
          <label className="input-label">Epoch Timestamp → Date</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value)}
              placeholder="Enter timestamp (e.g., 1703500800)"
              style={{ flex: 1 }}
            />
            <select value={unit} onChange={(e) => setUnit(e.target.value as TimestampUnit)}>
              <option value="seconds">Seconds</option>
              <option value="milliseconds">Milliseconds</option>
            </select>
          </div>

          {epochToDate && 'error' in epochToDate && (
            <div className="error-message">{epochToDate.error}</div>
          )}

          {epochToDate && !('error' in epochToDate) && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Local Time</div>
                <code style={{ color: 'var(--accent-primary)' }}>{epochToDate.local}</code>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UTC</div>
                <code>{epochToDate.utc}</code>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISO 8601</div>
                <code>{epochToDate.iso}</code>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Relative</div>
                <code style={{ color: 'var(--accent-secondary)' }}>{epochToDate.relative}</code>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Timezone</div>
                <code>{epochToDate.timezone}</code>
              </div>
            </div>
          )}
        </div>

        {/* Date to Epoch */}
        <div className="input-group">
          <label className="input-label">Date → Epoch Timestamp</label>
          <input
            type="text"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            placeholder="Enter date (e.g., 2024-01-01 or Dec 25, 2024 10:00)"
            style={{ marginBottom: '0.5rem' }}
          />

          {dateToEpoch && 'error' in dateToEpoch && (
            <div className="error-message">{dateToEpoch.error}</div>
          )}

          {dateToEpoch && !('error' in dateToEpoch) && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seconds</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{dateToEpoch.seconds}</code>
                  <button
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(dateToEpoch.seconds)}
                    style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Milliseconds</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{dateToEpoch.milliseconds}</code>
                  <button
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(dateToEpoch.milliseconds)}
                    style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <strong>Supported date formats:</strong>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
          <li>ISO 8601: <code>2024-12-25T10:30:00Z</code></li>
          <li>Date only: <code>2024-12-25</code></li>
          <li>Natural: <code>Dec 25, 2024 10:30 AM</code></li>
          <li>RFC 2822: <code>Wed, 25 Dec 2024 10:30:00 GMT</code></li>
        </ul>
      </div>
    </div>
  );
}

export default EpochConverter;
