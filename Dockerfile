# Use Node.js 20 as the base image
FROM node:20-slim AS base

# Install system dependencies for canvas (required by captcha-canvas)
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# --- Release Stage ---
FROM node:20-slim AS release

# Install runtime libraries for canvas
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy node_modules from base stage
COPY --from=base /app/node_modules ./node_modules
COPY package.json ./

# Copy the rest of the application
COPY src ./src

# Set environment variables
ENV NODE_ENV=production

# Start the bot
CMD ["yarn", "start"]
