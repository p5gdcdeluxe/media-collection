FROM node:16-alpine

WORKDIR /app

# Copy package specifications first
COPY package*.json ./

# Install dependencies cleanly, relying on alpine's fast resolver
RUN npm ci --omit=dev || npm install --production

# Copy the rest of your 2000+ lines of application code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
