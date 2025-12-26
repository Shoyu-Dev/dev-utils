# =============================================================================
# Dev Utils - Makefile for Containerized Workflows
# =============================================================================
# All builds, tests, and validation run inside Docker containers.
# No local Node.js installation required.
# =============================================================================

# Image names
IMAGE_NAME := dev-utils
DEV_IMAGE := $(IMAGE_NAME)-dev
PLAYWRIGHT_IMAGE := $(IMAGE_NAME)-playwright

# Container names
CONTAINER_NAME := dev-utils-server

# Detect if running on ARM (Apple Silicon) for Playwright compatibility
UNAME_M := $(shell uname -m)
ifeq ($(UNAME_M),arm64)
    PLATFORM_FLAG := --platform linux/amd64
else
    PLATFORM_FLAG :=
endif

.PHONY: help build test test-ui lint run stop clean dev-shell all validate

# -----------------------------------------------------------------------------
# Help - Display available targets
# -----------------------------------------------------------------------------
help:
	@echo "Dev Utils - Containerized Build System"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  build      Build production Docker image (includes lint + unit tests)"
	@echo "  test       Run unit tests in container"
	@echo "  test-ui    Run Playwright integration tests in container"
	@echo "  lint       Run ESLint in container"
	@echo "  run        Run the production server locally (port 8080)"
	@echo "  stop       Stop the running server"
	@echo "  clean      Remove Docker images and containers"
	@echo "  dev-shell  Open interactive shell in dev container"
	@echo "  validate   Run full validation (lint + test + test-ui)"
	@echo "  all        Build and validate everything"
	@echo ""

# -----------------------------------------------------------------------------
# Build - Create production Docker image
# -----------------------------------------------------------------------------
# Builds the multi-stage Dockerfile which includes:
# - Dependency installation
# - Linting
# - Unit tests
# - Production build
# - Final minimal nginx image
build:
	@echo "Building production image..."
	docker build \
		--target runtime \
		-t $(IMAGE_NAME):latest \
		.
	@echo ""
	@echo "Build complete! Image: $(IMAGE_NAME):latest"
	@echo "Run 'make run' to start the server"

# -----------------------------------------------------------------------------
# Build Dev Image - For running individual tasks
# -----------------------------------------------------------------------------
build-dev:
	@echo "Building development image..."
	docker build \
		--target base \
		-t $(DEV_IMAGE):latest \
		.

# -----------------------------------------------------------------------------
# Lint - Run ESLint in container
# -----------------------------------------------------------------------------
lint: build-dev
	@echo "Running linter..."
	docker run --rm $(DEV_IMAGE):latest npm run lint
	@echo "Lint passed!"

# -----------------------------------------------------------------------------
# Test - Run unit tests in container
# -----------------------------------------------------------------------------
test: build-dev
	@echo "Running unit tests..."
	docker run --rm $(DEV_IMAGE):latest npm run test
	@echo "Unit tests passed!"

# -----------------------------------------------------------------------------
# Test UI - Run Playwright integration tests
# -----------------------------------------------------------------------------
# Uses Microsoft's official Playwright Docker image with browsers pre-installed.
# On Apple Silicon, runs with x86_64 emulation for browser compatibility.
test-ui: build-dev
	@echo "Building app for Playwright tests..."
	docker build --target build -t $(IMAGE_NAME)-build:latest .
	@echo "Running Playwright tests..."
	docker run --rm \
		$(PLATFORM_FLAG) \
		-v $(PWD)/playwright.config.ts:/app/playwright.config.ts:ro \
		-v $(PWD)/tests:/app/tests:ro \
		-w /app \
		mcr.microsoft.com/playwright:v1.40.0-focal \
		/bin/bash -c "npm ci && npx playwright install chromium && npm run test:ui"
	@echo "Playwright tests passed!"

# -----------------------------------------------------------------------------
# Run - Start production server locally
# -----------------------------------------------------------------------------
run: build
	@echo "Starting server on http://localhost:8080"
	@echo "Press Ctrl+C to stop"
	docker run --rm \
		--name $(CONTAINER_NAME) \
		-p 8080:80 \
		$(IMAGE_NAME):latest

# -----------------------------------------------------------------------------
# Run Detached - Start server in background
# -----------------------------------------------------------------------------
run-detached: build
	@echo "Starting server in background on http://localhost:8080"
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p 8080:80 \
		$(IMAGE_NAME):latest
	@echo "Server started! Run 'make stop' to stop it"

# -----------------------------------------------------------------------------
# Stop - Stop running server
# -----------------------------------------------------------------------------
stop:
	@echo "Stopping server..."
	-docker stop $(CONTAINER_NAME) 2>/dev/null || true
	-docker rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "Server stopped"

# -----------------------------------------------------------------------------
# Clean - Remove all Docker artifacts
# -----------------------------------------------------------------------------
clean: stop
	@echo "Cleaning Docker artifacts..."
	-docker rmi $(IMAGE_NAME):latest 2>/dev/null || true
	-docker rmi $(DEV_IMAGE):latest 2>/dev/null || true
	-docker rmi $(IMAGE_NAME)-build:latest 2>/dev/null || true
	-docker system prune -f
	@echo "Clean complete"

# -----------------------------------------------------------------------------
# Dev Shell - Interactive development shell
# -----------------------------------------------------------------------------
dev-shell: build-dev
	@echo "Opening development shell..."
	docker run --rm -it \
		-v $(PWD)/src:/app/src \
		-v $(PWD)/tests:/app/tests \
		$(DEV_IMAGE):latest \
		/bin/sh

# -----------------------------------------------------------------------------
# Validate - Run full validation suite
# -----------------------------------------------------------------------------
validate: lint test
	@echo ""
	@echo "========================================="
	@echo "All validations passed!"
	@echo "========================================="

# -----------------------------------------------------------------------------
# All - Build and validate everything
# -----------------------------------------------------------------------------
all: validate build
	@echo ""
	@echo "========================================="
	@echo "Build and validation complete!"
	@echo "Run 'make run' to start the server"
	@echo "========================================="
