/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for Dev Utils
 *
 * PRIVACY-CRITICAL: This configuration ensures:
 * 1. No external assets are loaded (all dependencies are bundled)
 * 2. CSP meta tag is injected into the HTML
 * 3. No source maps in production (prevents code inspection attacks)
 * 4. All assets are self-contained
 */
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-csp',
      transformIndexHtml(html) {
        // Inject strict CSP meta tag
        // PRIVACY-CRITICAL: This CSP prevents any network requests
        const csp = `
          default-src 'none';
          script-src 'self';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data:;
          font-src 'self';
          connect-src 'none';
          media-src 'none';
          object-src 'none';
          frame-src 'none';
          base-uri 'self';
          form-action 'none';
        `.replace(/\s+/g, ' ').trim();

        return html.replace(
          '<head>',
          `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`
        );
      }
    }
  ],
  build: {
    // PRIVACY-CRITICAL: No source maps in production
    sourcemap: false,
    // Ensure all assets are bundled
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Ensure predictable chunk names for caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          tools: ['diff', 'js-yaml', 'ajv', 'papaparse', 'cronstrue']
        }
      }
    }
  },
  // PRIVACY-CRITICAL: No external dependencies at runtime
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'diff', 'js-yaml', 'ajv', 'papaparse', 'cronstrue']
  },
  // Vitest configuration
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['tests/**/*', 'node_modules/**/*'],
  },
});
