# Guía de Docker - Sweet Medical Backend

Este documento explica cómo está configurado el entorno de contenedores (Docker) para el Backend de la aplicación y cómo ejecutar el proyecto completo localmente de manera unificada.

## 1. Arquitectura de Docker (Backend)

El backend utiliza un `Dockerfile` de **una sola etapa (Single-stage)** basado en la imagen ultraligera `node:22-alpine`.

**¿Qué hace el Dockerfile?**

1. Instala únicamente las dependencias necesarias para producción (`npm install --omit=dev`).
2. Copia el código fuente original (`src/`).
3. Expone el puerto `3000` y define las variables de entorno básicas (`NODE_ENV=production`).
4. Inicia el servidor nativamente con `node src/server.js`.

> Al estar construido en JavaScript puro (ES Modules) y no requerir compilación como TypeScript, una sola etapa es el método más rápido y eficiente.

---

## 2. Docker Compose

Para facilitar el despliegue unificado, en la raíz de este repositorio se encuentra el archivo `docker-compose.yml`. Este archivo se encarga de levantar **toda la aplicación** (Backend + Frontend) con un solo comando.

### Requisitos Previos

Para que el `docker-compose.yml` pueda construir también el contenedor del frontend, hay que indicarle dónde se encuentra su repositorio.

1. Abrir el archivo `docker-compose.yml`.
2. Buscar la sección del servicio `frontend` y modificar la propiedad `context` con la ruta del repositorio del frontend (puede ser ruta relativa o absoluta).

```yaml
frontend:
  build:
    context: ../sweet-medical-frontend # <-- CAMBIAR POR LA RUTA CORRESPONDIENTE
```

### ¿Cómo levantar el proyecto completo?

1. Abrir una terminal dentro de esta carpeta (`sweet-medical-api`).
2. Configurar localmente el archivo `.env`.
3. Ejecutar el siguiente comando:

```bash
docker-compose up --build
```

**Resultado:**

- El **Backend** estará corriendo en `http://localhost:3000`.
- El **Frontend** se compilará y estará disponible en `http://localhost:3001` (ya conectado a la API local).

Para detener todo, presionar `Ctrl + C` en la terminal.
