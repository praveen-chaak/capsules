FROM node:22-alpine
WORKDIR /app

COPY package*.json ./

# force include devDependencies (so vite plugins exist during build)
ENV NODE_ENV=development
RUN npm install --include=dev

COPY . .
RUN npm run build

EXPOSE 5173
CMD ["npm","run","preview","--","--host","0.0.0.0","--port","5173"]