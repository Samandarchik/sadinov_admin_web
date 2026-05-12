# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

# Lockfile bilan deterministic install
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .

# Build-time env: API manzili va base href.
# docker build --build-arg VITE_API_BASE_URL=http://31.187.74.228:8001 ...
ARG VITE_API_BASE_URL=http://31.187.74.228:8001
ARG VITE_BASE_HREF=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_HREF=$VITE_BASE_HREF

RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine AS runtime

# Nginx config (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Built static fayllarni nginx html papkasiga
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
