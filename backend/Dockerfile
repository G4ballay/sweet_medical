FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar solo dependencias de produccion
RUN npm install --omit=dev

# Copiar el codigo fuente completo
COPY src ./src

# Configurar entorno
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Comando de inicio
CMD ["node", "src/server.js"]
