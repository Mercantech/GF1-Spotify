FROM node:18-alpine

WORKDIR /app

# Kopier package.json og package-lock.json først for bedre caching
COPY package*.json ./

# Installer dependencies
RUN npm ci --only=production

# Kopier resten af applikationen
COPY . .

# Opret mapper til musik og covers hvis de ikke findes
RUN mkdir -p music covers data

# Eksponer port 3001
EXPOSE 3001

# Start applikationen
CMD ["npm", "start"]
