# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Builder - Install dependencies
# ============================================
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
 && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ============================================
# Stage 2: Runtime - Minimal final image
# ============================================
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PATH="/install/bin:$PATH"
ENV PYTHONPATH="/install/lib/python3.12/site-packages:$PYTHONPATH"

# Copy installed packages from builder
COPY --from=builder /install /install

# Copy application code
COPY core/ ./core/
COPY agents/ ./agents/
COPY data/ ./data/
COPY static/ ./static/
COPY version_utils.py .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser \
 && chown -R appuser:appuser /app
USER appuser

# Expose port (can be overridden by Cloud Run or docker run)
EXPOSE 8080

# Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Run the application with configurable workers for better concurrency
# Workers = (2 x CPU cores) + 1 is a good starting point for production
# Cloud Run provides 1-8 CPUs depending on configuration
# Default: 1 worker for debugging (set WORKERS env var to scale in production)
CMD ["sh","-c","uvicorn core.application:app --host 0.0.0.0 --port ${PORT:-8080} --workers ${WORKERS:-1} --timeout-keep-alive 65"]
