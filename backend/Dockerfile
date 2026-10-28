# Base image for Node.js application
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (cached unless package.json changes)
RUN npm install

# Copy application source code after dependencies are installed
COPY . .

# Expose the internal application port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "start:dev"]
