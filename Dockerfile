# syntax = docker/dockerfile:1

# ---- Build Stage ----
FROM node:20-alpine AS build
# Install build tools for native dependencies (like sharp)
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git

WORKDIR /app
# Install dependencies
COPY package.json package-lock.json ./
RUN npm install -g node-gyp && npm ci

# Copy the rest of the application code
COPY . .

# Build the Strapi admin panel
ENV NODE_ENV=production
RUN npm run build

# Remove development dependencies to keep the image small
RUN npm prune --omit=dev

# ---- Production Stage ----
FROM node:20-alpine
# Install runtime dependencies for image processing
RUN apk add --no-cache vips-dev

WORKDIR /app

# Copy the completely built and pruned app from the build stage
COPY --from=build /app ./

ENV NODE_ENV=production
EXPOSE 1337

CMD ["npm", "run", "start"]
