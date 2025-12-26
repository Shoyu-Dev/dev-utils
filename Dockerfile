# =============================================================================
# Dev Utils - Multi-Stage Docker Build
# =============================================================================
# PRIVACY-CRITICAL: This Dockerfile ensures reproducible builds with all
# validation steps running in containers. The final image contains only
# static assets with no runtime dependencies.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Install dependencies
# -----------------------------------------------------------------------------
FROM node:20.10-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
# Use npm install if no lock file exists, npm ci if it does
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# -----------------------------------------------------------------------------
# Stage 2: Lint - Run linting
# -----------------------------------------------------------------------------
FROM base AS lint

RUN npm run lint

# -----------------------------------------------------------------------------
# Stage 3: Test - Run unit tests
# -----------------------------------------------------------------------------
FROM base AS test

RUN npm run test

# -----------------------------------------------------------------------------
# Stage 4: Build - Create production build
# -----------------------------------------------------------------------------
FROM base AS build

# Run TypeScript compilation and Vite build
RUN npm run build

# Verify the build output exists and contains expected files
RUN test -f dist/index.html && \
    echo "Build verification: index.html exists" && \
    grep -q "Content-Security-Policy" dist/index.html && \
    echo "Build verification: CSP meta tag present"

# -----------------------------------------------------------------------------
# Stage 5: Playwright - Run integration tests
# -----------------------------------------------------------------------------
FROM mcr.microsoft.com/playwright:v1.40.0-focal AS playwright

WORKDIR /app

# Copy package files and install
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Copy source and built assets
COPY . .
COPY --from=build /app/dist ./dist

# Run Playwright tests against the built app
RUN npm run test:ui

# -----------------------------------------------------------------------------
# Stage 6: Runtime - Minimal static server
# -----------------------------------------------------------------------------
# PRIVACY-CRITICAL: Final image contains ONLY static files
# No Node.js, no build tools, no test frameworks
FROM nginx:1.25-alpine AS runtime

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# PRIVACY-CRITICAL: Add security headers via nginx config
# The CSP is also in the HTML meta tag as defense-in-depth

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
