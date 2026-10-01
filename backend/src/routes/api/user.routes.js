import { Router } from "express";
import { UserController } from "../../controllers/user.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/user.validations.middleware.js";

const userController = new UserController();

const router = Router();
router.route('/')
    .get((req, res, next) => userController.getAll(req, res, next)) 
    .post(validations.validateUserCreate(), validateRequest, (req, res, next) => userController.create(req, res, next)); 

router.route('/:id')
    .get(validations.validateUserGetById(), validateRequest, (req, res, next) => userController.getById(req, res, next)) 
    .patch(validations.validateUserUpdate(), validateRequest, (req, res, next) => userController.update(req, res, next)) 
    .delete(validations.validateUserDelete(), validateRequest, (req, res, next) => userController.delete(req, res, next)); 
    
export default router;

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Obtiene los datos de todas las espcialidades
 *     description: Obtiene los datos de todas las espcialidades
 *     tags:
 *       - Usuarios 
 *     responses:
 *       200:
 *         description: Lista de Usuarios obtenida correctamente
 *   post:
 *     summary: Crea una especialidad
 *     description: Crea una especialidad con los datos proporcionados.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - durationInMins
 *               - cost
 *             properties:
 *               name:
 *                 type: string
 *                 example: Radiografía
 *               durationInMins:
 *                 type: integer
 *                 example: 30
 *               cost:
 *                 type: integer
 *                 example: 112
 *     responses:
 *       201:
 *         description: Especialidad creada
 *       400:
 *         description: Faltan datos o formato inválido
 *       409:
 *         description: Ya existe una especialidad con esos datos
 */


/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene los datos de un Usuario
 *     description: Obtiene los datos de un Usuario
 *     tags:
 *       - Usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de Usuario
 *         example: "600000000000000000000001"
 *     responses:
 *       200:
 *         description: Usuario encontrada
 *       404:
 *         description: Usuario no encontrada
 *   put:
 *     summary: Actualiza los datos base del Usuario
 *     description: Actualiza los datos base del Usuario
 *     tags:
 *       - Usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del Usuario
 *         example: "600000000000000000000001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Nombre usuario"
 *               email:
 *                 type: string
 *                 example: "test@email.com"
 *               password:
 *                 type: string
 *                 example: "12345678A@a"
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 *       400:
 *         description: Datos proporcionados inválidos
 *   delete:
 *     summary: Borra un Usuario
 *     description: Realiza un borrado lógico del Usuario identificado por id.
 *     tags:
 *       - Usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del Usuario
 *         example: "600000000000000000000001"
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */

