import cors from "cors";
import 'dotenv/config';
import express, { json } from "express";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { pageNotFoundHandler } from "./middlewares/resource-not-found.middleware.js";

// Swagger
// Para instalarlo: npm install swagger-ui-express swagger-jsdoc
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import router from "./routes/index.js";
const app = express();

app.use(json());
app.use(cors());

// Ruta para la documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(router);

app.use(pageNotFoundHandler);
app.use(errorHandler);

export default app;