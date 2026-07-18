# ---- Build Stage ----
FROM node:20-alpine AS build
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git
WORKDIR /opt/
COPY package.json package-lock.json ./
# User's snippet used yarn, but this project has package-lock.json. I'll stick to npm to match the existing lockfile.
RUN npm install -g node-gyp && npm ci
WORKDIR /opt/app
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine
RUN apk add --no-cache vips-dev
WORKDIR /opt/
COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev
WORKDIR /opt/app
COPY --from=build /opt/app ./
EXPOSE 1337
CMD ["npm", "run", "start"]
