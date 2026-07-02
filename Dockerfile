FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json

RUN npm ci

FROM deps AS builder
WORKDIR /app

COPY apps/web ./apps/web

RUN npm run build --workspace web

FROM nginx:1.27-alpine AS runner

COPY docker/nginx/web.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
