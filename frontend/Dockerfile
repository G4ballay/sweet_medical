# ---- Build Stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Copiar archivos de configuracion de dependencias
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (incluidas devDependencies para el build)
RUN npm install

# Copiar el codigo fuente
COPY . .

# Variable de entorno para la URL de la API (se puede sobreescribir al compilar)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Generar el build de produccion
RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine

# Copiar la configuracion de nginx para SPA (manejo de rutas de React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estaticos compilados desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
