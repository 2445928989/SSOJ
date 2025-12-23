# React 前端 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build

# 运行阶段 - 使用 Nginx
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
