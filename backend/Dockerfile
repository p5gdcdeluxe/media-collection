FROM node:16-alpine

WORKDIR /app

# Force npm to use local cache and offline mode where possible
RUN npm config set registry https://registry.npmmirror.com/ || true

COPY package*.json ./

# Install with maximum verbosity turned off and strict timeout limits
RUN npm install --prefer-offline --no-audit --progress=false || npm install --offline || npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
