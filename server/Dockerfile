# ==========================================
# Stage 1: Build stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies required by Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package specifications
COPY package*.json ./

# Install dependencies (including Prisma CLI and client)
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# ==========================================
# Stage 2: Production runner stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install system dependencies:
# - python3, py3-pip: for python execution
# - ffmpeg: audio processing
# - yt-dlp: youtube audio extraction
# - openssl, libc6-compat: Prisma runtime query engine support on Alpine
# - curl: for container health checks
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    openssl \
    libc6-compat \
    curl \
    && (apk add --no-cache yt-dlp || pip install --no-cache-dir yt-dlp --break-system-packages)

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"

# Copy installed dependencies and Prisma generated artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Copy application source code
COPY . .

# Expose backend service port
EXPOSE 5000

# Run database migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
