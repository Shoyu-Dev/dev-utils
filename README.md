# Dev Utils

A privacy-first suite of developer utilities that runs entirely in your browser. Deploy once to your home server or internal endpoint, and access from any machine in your network—no installation required.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why Dev Utils?

Inspired by [DevToys](https://github.com/DevToys-app/DevToys), Dev Utils brings the same convenience of essential developer tools with a different deployment model:

| DevToys | Dev Utils |
|---------|-----------|
| Install on each machine | Deploy once, access from anywhere |
| Desktop application | Web-based, runs in browser |
| Windows/macOS/Linux binaries | Docker container or static files |

**Perfect for:**
- Home labs and self-hosted environments
- Air-gapped or restricted networks
- Teams sharing a single internal endpoint
- Environments where installing software on each machine isn't practical

## Privacy Guarantee

Your data **never leaves your browser**. This isn't a policy—it's a technical constraint:

- **Zero network requests** after initial page load (enforced by Content Security Policy)
- **No backend server** processing your data—nginx serves static files only
- **No analytics, tracking, or telemetry** of any kind
- **Fully offline capable** after first visit
- **Open source** and auditable

## Tools

### Text Tools
- **Diff Checker** — Compare two texts with line or word-level highlighting
- **Regex Tester** — Test patterns with real-time matching and capture groups

### Formatters
- **JSON/YAML Prettifier** — Format, beautify, or minify structured data
- **Schema Validator** — Validate JSON/YAML against JSON Schema

### Decoders
- **JWT Decoder** — Inspect JWT tokens (header, payload, expiration)
- **String Decoder** — Encode/decode Base64, URL, Hex, Unicode

### Converters
- **JSON/YAML Converter** — Convert between JSON and YAML
- **CSV/JSON Converter** — Convert between CSV and JSON

### Date & Time
- **Epoch Converter** — Convert Unix timestamps to human-readable dates
- **Cron Explainer** — Understand cron expressions in plain English

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/user/dev-utils.git
cd dev-utils

# Build and run
make build
make run
```

Access at `http://localhost:8080`

### Using Docker Compose

```yaml
services:
  dev-utils:
    image: dev-utils:latest
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

### Available Commands

```bash
make build      # Build production Docker image
make run        # Start server on port 8080
make stop       # Stop the server
make validate   # Run linting and tests
make test       # Run unit tests
make test-ui    # Run Playwright integration tests
```

## Deployment

### Home Server / NAS

Deploy once on your home server and access from any device on your network:

```bash
# On your server
docker run -d \
  --name dev-utils \
  --restart unless-stopped \
  -p 8080:80 \
  dev-utils:latest
```

Access from any device: `http://your-server:8080`

### Behind a Reverse Proxy

Works seamlessly behind nginx, Traefik, Caddy, or any reverse proxy:

```nginx
location /dev-utils/ {
    proxy_pass http://dev-utils:80/;
}
```

### Air-Gapped Environments

For networks without internet access:

```bash
# On a connected machine
docker save dev-utils:latest > dev-utils.tar

# Transfer dev-utils.tar to air-gapped network

# On the air-gapped machine
docker load < dev-utils.tar
docker run -d -p 8080:80 dev-utils:latest
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                             │
│  ┌─────────────────────────────────────────────────────┐│
│  │              React SPA + Service Worker             ││
│  │     All processing happens here. Zero network.      ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                    (initial load only)
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Nginx (Static Files)                     │
│         Serves HTML, JS, CSS. No backend logic.         │
└─────────────────────────────────────────────────────────┘
```

### Security Headers

All responses include strict security headers:

```
Content-Security-Policy: default-src 'none'; script-src 'self';
                         style-src 'self' 'unsafe-inline';
                         connect-src 'none'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

The `connect-src 'none'` directive is the key privacy guarantee—it makes network requests from JavaScript impossible.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** CSS with CSS variables (light/dark theme)
- **Runtime:** Nginx Alpine (~25MB image)
- **Build:** Multi-stage Docker with validation gates
- **Testing:** Vitest (unit), Playwright (integration)

## Development

### Prerequisites

- Docker and Docker Compose, or
- Node.js 20+ for local development

### Local Development

```bash
npm install
npm run dev     # Start Vite dev server with HMR
```

### Running Tests

```bash
npm run test        # Unit tests
npm run test:ui     # Playwright integration tests
npm run lint        # ESLint
```

### Project Structure

```
dev-utils/
├── src/
│   ├── tools/          # Tool components (DiffChecker, JwtDecoder, etc.)
│   ├── pages/          # Home, PrivacyGuarantee, HowToVerify
│   ├── components/     # Layout, navigation
│   ├── context/        # Theme context
│   ├── utils/          # Pure utility functions
│   └── styles/         # Global CSS
├── tests/              # Playwright integration tests
├── Dockerfile          # Multi-stage build
├── nginx.conf          # Security headers, compression
└── Makefile            # Docker workflow commands
```

## Verifying Privacy Claims

Don't trust us—verify it yourself:

1. **Network Tab:** Open DevTools → Network → Use any tool → Zero requests
2. **Offline Mode:** Disconnect from internet → App works fully
3. **Source Inspection:** All code is bundled and readable in DevTools

See the [How to Verify](/verify) page in the app for detailed instructions.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-tool`)
3. Ensure tests pass (`make validate`)
4. Submit a pull request

## License

MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by [DevToys](https://github.com/DevToys-app/DevToys) — the excellent Windows/macOS/Linux developer toolkit
- Built with [Vite](https://vitejs.dev/), [React](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/)
