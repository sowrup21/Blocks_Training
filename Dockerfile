# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace and clockwise package files
COPY package.json ./
COPY clockwise/package*.json ./clockwise/

# Install dependencies
RUN cd clockwise && npm ci --legacy-peer-deps || npm install

# Copy clockwise source code
COPY clockwise/ ./clockwise/

# Build production bundle
RUN cd clockwise && npm run build

# Production Stage: High-performance Nginx web server
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=builder /app/clockwise/dist /usr/share/nginx/html

# Copy Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
