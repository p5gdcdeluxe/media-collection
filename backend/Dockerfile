# Base image for Node.js application
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Configure npm for stable container networking (force IPv4 to prevent hanging)
RUN npm config set fetch-retry-maxtimeout 60000 -g && \
    npm config set prefer-offline true -g

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies with clean flags
RUN npm install --no-audit --progress=false

# Copy application source code
COPY . .

# Expose port and start
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
