import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sweet Medical',
      version: '1.0.0',
      description: 'Documentación de la API. Grupo-9, DDSW 2026'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido del endpoint /auth/login'
        }
      }
    }
  },
  apis: ['./src/routes/api/*.js'], // acá Swagger busca los comentarios

};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;