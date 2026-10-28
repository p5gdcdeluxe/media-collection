FROM node:16-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies reliably
RUN npm install

# Copy application source code
COPY . .

EXPOSE 3000

# Match whatever start script your package.json uses (e.g., "start" or "start:dev")
CMD ["npm", "start"]
