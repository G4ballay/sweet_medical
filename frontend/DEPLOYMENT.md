# Sweet Medical - Guía de Despliegue del Frontend

Esta guía detalla los pasos para desplegar el frontend de **Sweet Medical** en **Netlify** y cómo configurar el flujo de **CI/CD** con **GitHub Actions** usando **Netlify CLI**.

---

## 1. Crear el Sitio en Netlify (Primer Despliegue Manual)

Como el repositorio pertenece a la organización `ddsw-mn` y no disponemos de permisos de propietario en la misma, se desplegará con un método alternativo mediante la consola y Actions, sin enlazar directamente la aplicación de Netlify a nivel de organización.

1. Abrir la terminal local en la carpeta `sweet-medical-frontend`.
2. Generar el build de producción local corriendo:
   ```bash
   npm run build
   ```
   Esto creará una carpeta llamada `dist/` en el directorio raíz.
3. Iniciar sesión en la cuenta de [Netlify](https://app.netlify.com).
4. Ir a la pestaña **Sites** y bajar hasta el fondo.
5. Buscar la sección que dice: **"Want to deploy a site without Git? Drag and drop your site folder here"** (¿Quieres desplegar un sitio sin Git? Arrastrar y soltar la carpeta de tu sitio aquí).
6. Arrastrar y soltar la carpeta `dist/` creada localmente.
7. Netlify desplegará el sitio al instante y proveerá una URL (ej: `https://sweet-medical-xxxxxx.netlify.app`).

---

## 2. Obtener las Claves y Tokens

Para que GitHub Actions pueda subir las nuevas versiones del frontend automáticamente, se necesitan dos datos:

### A. Site ID (API ID)

1. En Netlify, entrar al panel del sitio recién creado.
2. Ir a **Site configuration** -> **Site details**.
3. Copiar el valor de **API ID** (ej: `a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d`). Este será el `NETLIFY_SITE_ID`.

### B. Personal Access Token

1. En Netlify, hacer clic en la foto de perfil (arriba a la derecha) y seleccionar **User settings**.
2. En el menú de la izquierda, hacer clic en **Applications**.
3. En la sección **Personal access tokens**, hacer clic en **Generate new token**.
4. Poner un nombre (ej: `github-actions-deploy`) y hacer clic en **Generate token**.
5. Copiar el token generado (no se volverá a mostrar). Este será el `NETLIFY_AUTH_TOKEN`.

---

## 3. Configurar CI/CD en GitHub

Para automatizar la actualización en cada push o merge a la rama `main`:

1. Ir al repositorio de frontend en **GitHub**.
2. Entrar a **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
3. Agregar los siguientes secretos requeridos para el despliegue automático:
   - **`NETLIFY_SITE_ID`**: Pegar el API ID obtenido en el paso 2A.
   - **`NETLIFY_AUTH_TOKEN`**: Pegar el Personal Access Token obtenido en el paso 2B.
   - **`VITE_API_URL`**: Pegar la URL del backend desplegado en Render (ej: `https://sweet-medical-api.onrender.com`).

_Nota sobre `VITE_API_URL`: Como el flujo de CI/CD compila la aplicación en los servidores de GitHub antes de subir los archivos a Netlify, esta variable se lee directamente desde los secretos del repositorio de GitHub al momento de generar el build._

---

Luego de hacer esto, cada push o merge en `main` ejecutará el flujo de GitHub Actions, verificará que el build no tenga errores y subirá la nueva versión directamente a Netlify.
