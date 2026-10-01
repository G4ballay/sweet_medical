import { Router } from "express";
import { SpecialtyController } from "../../controllers/specialty.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/specialty.validations.middleware.js";

const specialtyController = new SpecialtyController();
const router = Router();

router.route('/') 
    .get((req, res, next) => specialtyController.getAll(req, res, next))
    .post(validations.validateSpecialtyCreate(),validateRequest, (req,res,next) => specialtyController.create(req,res,next));


router.route('/options')
    .get((req,res,next) => specialtyController.getOptions(req,res,next));

router.route('/:id')
    .get(validations.validateSpecialtyGetById(), validateRequest, (req, res, next) => specialtyController.getById(req,res,next))
    .put(validations.validateSpecialtyUpdate(),validateRequest, (req,res,next) => specialtyController.update(req,res,next))
    .delete(validations.validateSpecialtyDelete(),validateRequest, (req,res,next) => specialtyController.delete(req,res,next));

export default router;

/**
 * @swagger
 * /specialties/:
 *   get:
 *     summary: Obtiene los datos de todas las espcialidades
 *     description: Obtiene los datos de todas las espcialidades
 *     tags:
 *       - Especialidades 
 *     responses:
 *       200:
 *         description: Lista de especialidades obtenida correctamente
 *   post:
 *     summary: Crea una especialidad
 *     description: Crea una especialidad con los datos proporcionados.
 *     tags:
 *       - Especialidades
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
 * /specialties/options/:
 *   get:
 *     summary: Obtiene todas las opciones de las especialidades
 *     description: Devuelve una lista con todas las especialidades y las opciones
 *     tags:
 *       - Especialidades 
 *     responses:
 *       200:
 *         description: Lista de especialidades y opciones obtenida correctamente
*/

/**
 * @swagger
 * /specialties/{id}:
 *   get:
 *     summary: Obtiene los datos de una especialidad
 *     description: Obtiene los datos de una especialidad
 *     tags:
 *       - Especialidad
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la especialidad
 *         example: "600000000000000000000041"
 *     responses:
 *       200:
 *         description: Especialidad encontrada
 *       404:
 *         description: Especialidad no encontrada
 *   put:
 *     summary: Actualiza los datos base de la especialidad
 *     description: Actualiza los datos base de la especialidad
 *     tags:
 *       - Especialidad
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la especialidad
 *         example: "600000000000000000000041"
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
 *                 example: Cardiología
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
 *     summary: Borra una especialidad
 *     description: Realiza un borrado lógico de la especialidad identificada por id.
 *     tags:
 *       - Especialidad
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la especialidad
 *         example: "600000000000000000000041"
 *     responses:
 *       204:
 *         description: Especialidad eliminado
 *       404:
 *         description: Especialidad no encontrado
 */

