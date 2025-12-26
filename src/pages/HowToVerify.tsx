function HowToVerify() {
  return (
    <div className="privacy-content">
      <div className="tool-header">
        <h1 className="tool-title">How to Verify</h1>
        <p className="tool-description">
          Don't trust us — verify it yourself. Here's how to confirm that Dev Utils
          makes no network requests.
        </p>
      </div>

      <div className="warning-message" style={{ marginBottom: '2rem' }}>
        <strong>Trust, but verify.</strong> Any privacy claim should be independently verifiable.
        Here's how to check that this app is as private as we claim.
      </div>

      <h2>Method 1: Browser DevTools Network Tab</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        The simplest way to verify no network traffic occurs:
      </p>
      <ol style={{ marginTop: '0.5rem', marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
        <li>Open your browser's Developer Tools (F12 or Cmd+Option+I)</li>
        <li>Go to the <strong>Network</strong> tab</li>
        <li>Check "Disable cache" and reload the page</li>
        <li>After the initial page load, all resources should be from your local machine</li>
        <li>Now use any tool - paste data, run conversions, etc.</li>
        <li>Watch the Network tab - <strong>zero new requests should appear</strong></li>
      </ol>

      <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
        <strong style={{ color: 'var(--accent-primary)' }}>What you should see:</strong>
        <ul style={{ marginTop: '0.5rem' }}>
          <li>Initial load: HTML, JS, CSS files from your server/localhost</li>
          <li>During use: <strong>No additional requests</strong></li>
          <li>When pasting sensitive data: <strong>No requests at all</strong></li>
        </ul>
      </div>

      <h2>Method 2: Offline Mode Test</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        Verify the app works completely offline:
      </p>
      <ol style={{ marginTop: '0.5rem', marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
        <li>Load Dev Utils in your browser</li>
        <li>Open DevTools → Network tab</li>
        <li>Click "Offline" checkbox (or disable your network)</li>
        <li>Navigate through the app and use all tools</li>
        <li><strong>Everything should work normally</strong></li>
      </ol>

      <h2>Method 3: Check Content Security Policy</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        Verify the CSP headers that block network requests:
      </p>
      <ol style={{ marginTop: '0.5rem', marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
        <li>Open DevTools → Network tab</li>
        <li>Click on the main document request (index.html)</li>
        <li>Look at Response Headers or view page source</li>
        <li>Find the <code>Content-Security-Policy</code> header or meta tag</li>
        <li>Verify it includes <code>connect-src 'none'</code></li>
      </ol>

      <pre style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
{`<!-- Look for this in the HTML head -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';
    script-src 'self';
    connect-src 'none'; ...">`}
      </pre>

      <h2>Method 4: Browser Console Errors</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        If something tried to make a network request, CSP would block it and log an error:
      </p>
      <ol style={{ marginTop: '0.5rem', marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
        <li>Open DevTools → Console tab</li>
        <li>Use the app normally</li>
        <li>Look for CSP violation errors (there should be none)</li>
        <li>Any blocked network attempt would show: <code>Refused to connect to...</code></li>
      </ol>

      <h2>Method 5: Inspect Source Code</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        Search the source code for network-related APIs:
      </p>
      <ol style={{ marginTop: '0.5rem', marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
        <li>View the bundled JavaScript source</li>
        <li>Search for: <code>fetch</code>, <code>XMLHttpRequest</code>, <code>WebSocket</code></li>
        <li>Any occurrences should be library code, not actually called</li>
        <li>The ESLint config blocks these APIs in application code</li>
      </ol>

      <h2>What to Look For</h2>

      <div className="success-message" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <strong>Good signs (privacy preserved):</strong>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
          <li>No XHR or Fetch requests in Network tab after initial load</li>
          <li>App works in offline mode</li>
          <li>CSP includes <code>connect-src 'none'</code></li>
          <li>No cookies set (or only essential ones)</li>
          <li>No localStorage entries with your data</li>
        </ul>
      </div>

      <div className="error-message" style={{ marginBottom: '1rem' }}>
        <strong>Red flags (privacy at risk):</strong>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
          <li>Network requests to external domains</li>
          <li>Requests that include your pasted data</li>
          <li>Analytics or tracking scripts</li>
          <li>External font or script loading</li>
          <li>Persistent cookies or localStorage with data</li>
        </ul>
      </div>

      <h2>Advanced: Audit the Build</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        For maximum assurance, build the app yourself:
      </p>
      <pre style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
{`# Clone the repository
git clone <repository-url>
cd dev-utils

# Build using Docker (reproducible)
make build

# Run locally
make run

# Open http://localhost:8080 and verify`}
      </pre>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Remember</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          The goal of Dev Utils is to be a tool you can trust with sensitive data. But trust should
          always be verified. If you find any issue with our privacy claims, please report it
          so we can fix it immediately.
        </p>
      </div>
    </div>
  );
}

export default HowToVerify;
