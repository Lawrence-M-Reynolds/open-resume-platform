# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Pass your API URL at build time (Crucial for React!)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# If using React Router, you'll need a custom nginx.conf to handle routing
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]