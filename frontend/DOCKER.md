# Guía de Docker - Sweet Medical Frontend

Este documento explica cómo está configurado el entorno de contenedores (Docker) para el Frontend de la aplicación, pensado principalmente para estandarizar el despliegue de desarrollo.

## 1. Arquitectura de Docker (Frontend)

A diferencia del backend, el frontend utiliza un `Dockerfile` de **múltiples etapas (Multi-stage)**. Esto es fundamental para aplicaciones Single Page Application (SPA) construidas con Vite y React.

**¿Qué hacen las etapas?**

1. **Etapa de Construcción (Node):** Instala todas las dependencias y ejecuta `npm run build`. Al finalizar, se generan los archivos estáticos HTML/CSS/JS (carpeta `dist`).
2. **Etapa de Producción (Nginx):** Desecha todo el entorno pesado de Node.js e instala un servidor web ultraligero llamado **Nginx**. Toma los archivos estáticos del paso 1 y los sirve de manera eficiente en el puerto 80.

> [!TIP]
> **Archivo nginx.conf**: Se incluye una configuración especial para Nginx que asegura que el enrutamiento de React Router funcione (evitando errores 404 al refrescar páginas como `/iniciar-sesion`).

---

## 2. Variables de Entorno (IMPORTANTE)

En Vite, las variables de entorno se "inyectan" en el código estático **durante el proceso de construcción (build)**, no mientras la aplicación se está ejecutando.

Por esto, la variable `VITE_API_URL` se define como un `ARG` en el Dockerfile. Al construir esta imagen de manera individual, **es necesario** pasar la URL de la API mediante el parámetro `--build-arg`:

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t sweet-medical-frontend .
```

---

## 3. ¿Cómo probarlo localmente?

Si solo se desea levantar el frontend en un contenedor de manera aislada:

1. Construir la imagen (como se indica en el paso anterior).
2. Levantar el contenedor mapeando los puertos:
   ```bash
   docker run -p 3001:80 sweet-medical-frontend
   ```

> **Orquestación con Backend:** Para levantar todo el proyecto completo, dirigirse al repositorio del **Backend** (`sweet-medical-api`) y utilizar el archivo `docker-compose.yml` siguiendo las instrucciones del archivo `DOCKER.md` que se encuentra allí.
