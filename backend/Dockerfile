FROM node:16-alpine

WORKDIR /app

# Force npm to use local cache and mirror
RUN npm config set registry https://registry.npmmirror.com/ || true

COPY package*.json ./

# Stream every single package and action live to your terminal
RUN npm install --verbose

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
