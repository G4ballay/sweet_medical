import { Router } from "express";
import { PracticeController } from "../../controllers/practice.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/practice.validations.middleware.js";

const practiceController = new PracticeController();
const router = Router();

router.route('/') 
    .get((req, res, next) => practiceController.getAll(req, res, next))
    .post(validations.validatePracticeCreate(),validateRequest, (req,res,next) => practiceController.create(req,res,next));

router.route('/options')
    .get((req,res,next) => practiceController.getOptions(req,res,next));

router.route('/:id')
    .get(validations.validatePracticeGetById(), validateRequest, (req, res, next) => practiceController.getById(req,res,next))
    .put(validations.validatePracticeUpdate(),validateRequest, (req,res,next) => practiceController.update(req,res,next))
    .delete(validations.validatePracticeDelete(),validateRequest, (req,res,next) => practiceController.delete(req,res,next));

export default router;

/**
 * @swagger
 * /practices/:
 *   get:
 *     summary: Obtiene los datos de todas las prácticas
 *     description: Devuelve una lista con todos los datos de todas las prácticas registradas.
 *     tags:
 *       - Prácticas 
 *     responses:
 *       200:
 *         description: Lista de prácticas obtenida correctamente
 *   post:
 *     summary: Crea una práctica
 *     description: Crea una práctica con los datos proporcionados.
 *     tags:
 *       - Prácticas
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
 *         description: Práctica creada
 *       400:
 *         description: Faltan datos o formato inválido
 *       409:
 *         description: Ya existe un práctica con esos datos
 */

/**
 * @swagger
 * /practices/options/:
 *   get:
 *     summary: Obtiene todas las opciones de las prácticas
 *     description: Devuelve una lista con todas las prácticas y las opciones
 *     tags:
 *       - Prácticas 
 *     responses:
 *       200:
 *         description: Lista de prácticas y opciones obtenida correctamente
*/

/**
 * @swagger
 * /practices/{id}:
 *   get:
 *     summary: Obtiene los datos de un paciente.
 *     description: Obtiene los datos de un paciente.
 *     tags:
 *       - Práctica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la práctica
 *         example: "600000000000000000000051"
 *     responses:
 *       200:
 *         description: Práctica encontrada
 *       404:
 *         description: Práctica no encontrada
 *   put:
 *     summary: Actualiza los datos base de la práctica
 *     description: Actualiza los datos base de la práctica
 *     tags:
 *       - Práctica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la práctica
 *         example: "600000000000000000000051"
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
 *       200:
 *         description: Práctica actualizada
 *       404:
 *         description: Práctica no encontrada
 *       400:
 *         description: Datos proporcionados inválidos
 *   delete:
 *     summary: Borra una práctica
 *     description: Realiza un borrado lógico de la práctica identificado por id.
 *     tags:
 *       - Práctica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la práctica
 *         example: "600000000000000000000051"
 *     responses:
 *       204:
 *         description: Paciente eliminado
 *       404:
 *         description: Paciente no encontrado
 */