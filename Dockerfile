FROM node:20-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Remove development dependencies
RUN yarn install --production --frozen-lockfile

# Set environment variable
ENV NODE_ENV=production

EXPOSE 3000

# Start the server using the compiled JavaScript
CMD ["node", "./build/server/index.js"]