# Sweet Medical - Guía de Despliegue del Backend (API)

Esta guía detalla los pasos para desplegar el backend (API) de **Sweet Medical** en **Render** usando **MongoDB Atlas** para la persistencia, y cómo configurar el flujo de **CI/CD** con **GitHub Actions**.

---

## 1. Configurar la Base de Datos (MongoDB Atlas)

El backend de Sweet Medical usa MongoDB para persistir los datos de turnos, médicos y pacientes.

1. Registrarse o iniciar sesión en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crear un nuevo **Cluster** gratuito (M0).
3. En **Database Access**, crear un usuario de base de datos con el rol **Read and write to any database** (Lectura y escritura) y definir una contraseña segura.
4. En **Network Access**, agregar la dirección IP `0.0.0.0/0` (para permitir accesos desde cualquier lugar). _Nota: Esto es necesario porque las IPs de Render cambian constantemente en la versión gratuita._
5. Ir a **Database** -> **Connect** -> **Drivers** y copiar la cadena de conexión (Connection String). Se verá de este estilo:
   `mongodb+srv://<usuario>:<contraseña>@cluster.mongodb.net/<nombre-db>?retryWrites=true&w=majority`

   Realizar las siguientes modificaciones sobre esa cadena:
   - Reemplazar `<usuario>` y `<contraseña>` con los datos del usuario de base de datos creado en el paso 3.
   - Reemplazar `<nombre-db>` (que por defecto suele figurar como `test` o venir vacío justo antes del `?`) por el nombre asignado a la base de datos (por ejemplo, `sweet-medical`).
   - _Nota: No es necesario crear la base de datos de antemano en el panel de Atlas. MongoDB la creará de forma automática la primera vez que la aplicación se conecte e intente escribir datos._

---

## 2. Desplegar la API en Render

1. Entrar al dashboard de [Render](https://dashboard.render.com) e iniciar sesión con la cuenta de GitHub.
2. Hacer clic en **New** -> **Web Service**.
3. Seleccionar el repositorio de backend **`sweet-medical-api`** (es posible usar la opción de "Public Git Repository" ingresando la URL HTTPS del repositorio).
4. Completar la configuración del servicio:
   - **Name:** `sweet-medical-api`
   - **Region:** Elegir la región preferida (ej: `Virginia`).
   - **Branch:** `main`
   - **Root Directory:** _Dejar vacío_
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Instance Type:** `Free`
5. Hacer clic en **Advanced** y agregar las siguientes **Environment Variables** (Variables de Entorno):
   - `PORT`: `3000`
   - `HOST`: `0.0.0.0`
   - `DB_TYPE`: `MONGO`
   - `MONGODB_URI`: _La cadena de conexión a MongoDB Atlas obtenida en el Paso 1_
   - `JWT_SECRET`: _Una clave segura elegida para firmar los tokens_
   - `JWT_EXPIRES_IN`: `24h`
6. Hacer clic en **Create Web Service**. Render comenzará a compilar y levantar el servicio. Una vez finalizado, se verá una URL pública arriba a la izquierda (ej: `https://sweet-medical-api.onrender.com`).

---

## 3. Configurar CI/CD en GitHub

Para automatizar la actualización cada vez que se haga un push o merge a la rama `main`:

1. En el panel del Web Service en **Render**, ir a **Settings**.
2. Bajar hasta la sección **Deploy Hook** y copiar la URL generada.
3. Ir al repositorio de backend en **GitHub**.
4. Entrar a **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
5. Crear un secreto con el nombre:
   - `RENDER_DEPLOY_HOOK_URL`
   - Y pegar la URL del deploy hook como valor.

Una vez configurado esto, cada push o merge a `main` disparará los tests automatizados en GitHub Actions. Si pasan con éxito, se le avisará a Render para que despliegue la nueva versión del código de manera automática.
