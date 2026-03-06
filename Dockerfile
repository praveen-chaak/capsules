FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache bash
COPY package*.json ./

# force include devDependencies (so vite plugins exist during build)
ENV NODE_ENV=development
RUN npm install --include=dev

COPY . .
RUN npm run build

# EXPOSE 5173
# CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
# Serve stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80