# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Serve stage
FROM nginx:alpine
# Check your angular.json: the path might be /app/dist/01blog or similar
COPY --from=build /app/dist/01blog-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]