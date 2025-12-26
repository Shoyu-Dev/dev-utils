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

docker run -d -p 8080:80 dev-utils:latest

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



## Verifying Privacy Claims

We encourage you to verify our privacy guarantees yourself:

- **Network:** Open DevTools → Network while using any tool — there should be no outgoing requests after the initial page load.
- **Offline:** Disable network connectivity (or use the browser's offline mode) — the app should continue to function.
- **Inspect source:** Open DevTools → Sources or view the page source to review the bundled code and confirm there are no external calls.

For step-by-step instructions, see the [How to Verify](/verify) page in the app.

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
