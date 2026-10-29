FROM node:16-alpine

WORKDIR /app

# Force npm to use local cache and mirror
RUN npm config set registry https://registry.npmmirror.com/ || true

# Copy package files from backend/ into /app
COPY backend/package*.json ./

# Install dependencies
RUN npm install --verbose

# Copy all source files, tsconfig.json, and nest-cli.json from backend/ into /app
COPY backend/ .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
