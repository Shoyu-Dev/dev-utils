function PrivacyGuarantee() {
  return (
    <div className="privacy-content">
      <div className="tool-header">
        <h1 className="tool-title">Privacy Guarantee</h1>
        <p className="tool-description">
          Dev Utils is designed with privacy as a hard technical guarantee, not a policy statement.
        </p>
      </div>

      <div className="success-message" style={{ marginBottom: '2rem' }}>
        <strong>Your data never leaves your browser.</strong> This is enforced by technical constraints, not promises.
      </div>

      <h2>Zero Network Traffic</h2>
      <ul>
        <li>No fetch, XMLHttpRequest, WebSocket, or EventSource calls</li>
        <li>No analytics, telemetry, or error reporting</li>
        <li>No remote fonts, scripts, or WASM files</li>
        <li>No CDNs or external asset loading</li>
        <li>No API calls of any kind</li>
      </ul>

      <h2>Browser-Only Execution</h2>
      <ul>
        <li>All processing happens entirely in your browser</li>
        <li>No backend servers or cloud services</li>
        <li>No data stored outside your local machine</li>
        <li>Works completely offline after initial load</li>
      </ul>

      <h2>Content Security Policy Enforced</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        This application runs under a strict Content Security Policy that prevents network requests:
      </p>
      <pre style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
{`Content-Security-Policy:
  default-src 'none';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'none';
  media-src 'none';
  object-src 'none';
  frame-src 'none';`}
      </pre>

      <h2>No Tracking</h2>
      <ul>
        <li>No cookies (except essential for functionality)</li>
        <li>No local storage of sensitive data</li>
        <li>No fingerprinting or device identification</li>
        <li>No session tracking or user identification</li>
        <li>No third-party scripts</li>
      </ul>

      <h2>No Account Required</h2>
      <ul>
        <li>No login or registration</li>
        <li>No email collection</li>
        <li>No consent banners (because there's nothing to consent to)</li>
        <li>No terms of service agreements</li>
      </ul>

      <h2>Open Source & Auditable</h2>
      <ul>
        <li>All code is open source and auditable</li>
        <li>Dependencies are vendored and bundled locally</li>
        <li>No obfuscation or minification that hides behavior</li>
        <li>Build process is reproducible via Docker</li>
      </ul>

      <h2>Third-Party Libraries</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        We use the following open-source libraries, all bundled locally:
      </p>
      <ul style={{ marginTop: '0.5rem' }}>
        <li><code>react</code> / <code>react-dom</code> - UI framework</li>
        <li><code>react-router-dom</code> - Client-side routing</li>
        <li><code>diff</code> - Text diffing algorithms</li>
        <li><code>js-yaml</code> - YAML parsing and serialization</li>
        <li><code>ajv</code> - JSON Schema validation</li>
        <li><code>papaparse</code> - CSV parsing</li>
        <li><code>cronstrue</code> - Cron expression parsing</li>
      </ul>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
        All libraries are bundled at build time. No external scripts are loaded at runtime.
      </p>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Why This Matters</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          When you paste sensitive data like API keys, JWT tokens, configuration files, or internal code
          into online tools, you're trusting that website with your data. Many "free" online tools
          collect and store this data, or worse, send it to third parties.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Dev Utils solves this by making it technically impossible for your data to leave your browser.
          The privacy guarantee is enforced by code, not policy.
        </p>
      </div>
    </div>
  );
}

export default PrivacyGuarantee;
