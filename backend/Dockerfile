FROM node:16-alpine

WORKDIR /app

# Force npm to use local cache and mirror
RUN npm config set registry https://registry.npmmirror.com/ || true

# Copy package files from the backend subdirectory into /app
COPY backend/package*.json ./

# Install dependencies using your cached network bridge
RUN npm install --verbose

# Copy TypeScript and Nest CLI configuration files from root into /app
COPY tsconfig*.json ./
COPY nest-cli*.json ./

# Copy all backend source code into /app
COPY backend/ ./

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
