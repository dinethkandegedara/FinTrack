# ─── Stage 1: Build Angular Application ─────────────────────────────────────
# Uses the official Node 22 LTS image matching the project's node version requirement.
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching.
# Subsequent npm install runs skip this step if dependencies are unchanged.
COPY package*.json ./
RUN npm ci --silent

# Copy remaining source and build the Angular production bundle.
COPY . .
RUN npm run build

# ─── Stage 2: Serve with Nginx ───────────────────────────────────────────────
# Uses a minimal Alpine-based nginx image for a lean production container.
FROM nginx:1.27-alpine AS runtime

# Remove the default Nginx welcome page.
RUN rm -rf /usr/share/nginx/html/*

# Copy the compiled Angular bundle from the builder stage.
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copy the custom Nginx configuration that enables SPA routing fallback.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
