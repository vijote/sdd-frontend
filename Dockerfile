# Multi-stage build: bun builds the static bundle, nginx serves it on port 80.
# Port 80 matches the infra Deployment probes (app-frontend-ingress.yaml).
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
