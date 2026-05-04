# Build stage
FROM python:3.11-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files
COPY pyproject.toml .

# Install dependencies
RUN uv sync --no-dev --no-install-project

# Copy application code
COPY api/ api/

# API image
FROM python:3.11-slim AS api

WORKDIR /app

# Copy uv and virtual environment from builder
COPY --from=builder /usr/local/bin/uv /usr/local/bin/uv
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/api /app/api
COPY --from=builder /app/pyproject.toml /app/

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8005

CMD ["python", "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8005"]

# React frontend build stage
FROM node:20-slim AS react-builder

WORKDIR /app

COPY frontend-react/package*.json ./
RUN npm ci

COPY frontend-react/ ./

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# React frontend serve stage
FROM nginx:alpine AS frontend-react

# Copy built files to nginx
COPY --from=react-builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing and API proxy
COPY frontend-react/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
