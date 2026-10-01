import { Router } from "express";
import { LocationController } from "../../controllers/location.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/location.validations.middleware.js";

const locationController = new LocationController();

const router = Router();
router.route('/')
    .get((req, res, next) => locationController.getAll(req, res, next)) 
    .post(validations.validateLocationCreate(), validateRequest, (req, res, next) => locationController.create(req, res, next)); 

router.route('/:id')
    .get(validations.validateLocationGetById(), validateRequest, (req, res, next) => locationController.getById(req, res, next)) 
    .put(validations.validateLocationUpdate(), validateRequest, (req, res, next) => locationController.update(req, res, next)) 
    .delete(validations.validateLocationDelete(), validateRequest, (req, res, next) => locationController.delete(req, res, next)); 

export default router;

/**
 * @swagger
 * /locations/:
 *   get:
 *     summary: Obtiene los datos de todas las sedes
 *     description: Devuelve una lista con todos los datos de todas las sedes registradas.
 *     tags:
 *       - Sedes 
 *     responses:
 *       200:
 *         description: Lista de doctores obtenida correctamente
 *   post:
 *     summary: Crea una sede
 *     description: Crea un doctor con los datos proporcionados.
 *     tags:
 *       - Sedes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - state
 *               - city
 *               - number
 *               - street
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hugo Morales
 *               state:
 *                 type: string
 *                 example: Buenos Aires
 *               city:
 *                 type: string
 *                 example: Lanús
 *               street:
 *                 type: string
 *                 example: Ramón Cabrero   
 *               number:
 *                 type: string
 *                 example: 2007
 *     responses:
 *       201:
 *         description: Sede creada
 *       400:
 *         description: Faltan datos
 *       409:
 *         description: Ya existe una sede con esos datos
 */

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Obtiene los datos de una sede
 *     description: Obtiene los datos de una sede identificada por id.
 *     tags:
 *       - Sede
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sede
 *         example: LOC1
 *     responses:
 *       200:
 *         description: Sede encontrada
 *       404:
 *         description: Sede no encontrada
 *   put:
 *     summary: Guarda los datos de la sede
 *     description: Guarda los datos de la sede identificada por id.
 *     tags:
 *       - Sede
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sede
 *         example: LOC1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - state
 *               - city
 *               - number
 *               - street
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hospital de Lanús
 *               state:
 *                 type: string
 *                 example: Buenos Aires
 *               city:
 *                 type: string
 *                 example: Lanús
 *               street:
 *                 type: string
 *                 example: Ramón Cabrero   
 *               number:
 *                 type: string
 *                 example: 2007
 *     responses:
 *       201:
 *         description: Devuelve los datos de la sede
 *       404:
 *         description: Sede no encontrado
 *       400:
 *         description: Datos proporcionados inválidos
 *   delete:
 *     summary: Borra una sede
 *     description: Borra los datos de la sede identificada por id.
 *     tags:
 *       - Sede
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sede
 *         example: LOC1
 *     responses:
 *       204:
 *         description: Sede eliminada
 *       404:
 *         description: Sede no encontrada
 */