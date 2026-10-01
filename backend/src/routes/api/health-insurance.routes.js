import { Router } from "express";
import { HealthInsuranceController } from "../../controllers/health-insurance.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/health-insurance.validations.middleware.js";

const healthInsuranceController = new HealthInsuranceController();

const router = Router();


router.route('/')
    .get((req, res, next) => healthInsuranceController.getAll(req, res, next))
    .post(validations.validateHealthInsuranceCreate(), validateRequest, (req, res, next) => healthInsuranceController.create(req, res, next));

router.route('/:id')
    .get(validations.validateHealthInsuranceGetById(), validateRequest, (req, res, next) => healthInsuranceController.getById(req, res, next))
    .put(validations.validateHealthInsuranceUpdate(), validateRequest, (req, res, next) => healthInsuranceController.update(req, res, next))
    .delete(validations.validateHealthInsuranceDelete(), validateRequest, (req, res, next) => healthInsuranceController.delete(req, res, next));

export default router;


/**
 * @swagger
 * /medical-coverages:
 *   get:
 *     summary: Obtiene las obras sociales (o prepagas)
 *     description: Obtiene las obras sociales (o prepagas)
 *     tags:
 *       - Obras Sociales
 *     responses:
 *       200:
 *         description: Prácticas encontradas
 *       404:
 *         description: Doctor no encontrado
 *   post:
 *     summary: Crea una obra social con sus planes
 *     tags:
 *       - Obras Sociales
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - plans
 *             properties:
 *               name:
 *                 type: string
 *                 example: OBRASOCIAL1
 *               plans:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - name
 *                     - plans
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: OS1
 *                     name:
 *                       type: string
 *                       example: OSDE
 *                     plans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - id
 *                           - name
 *                           - coverageStrategies
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: PLAN1
 *                           name:
 *                             type: string
 *                             example: Plan 210
 *                           coverageStrategies:
 *                             type: object
 *                             required:
 *                               - SPECIALTY
 *                               - PRACTICE
 *                             properties:
 *                               SPECIALTY:
 *                                 type: object
 *                                 required:
 *                                   - coverages
 *                                   - coverageMap
 *                                 properties:
 *                                   coverages:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       required:
 *                                         - specialtyId
 *                                         - level
 *                                       properties:
 *                                         specialtyId:
 *                                           type: string
 *                                           example: CARDIOLOGIA
 *                                         level:
 *                                           type: string
 *                                           enum:
 *                                             - FULL
 *                                             - PARTIAL
 *                                           example: FULL
 *                                     example:
 *                                       - specialtyId: CARDIOLOGIA
 *                                         level: FULL
 *                                       - specialtyId: DERMATOLOGIA
 *                                         level: PARTIAL
 *                                   coverageMap:
 *                                     type: object
 *                                     additionalProperties: true
 *                                     example: {}
 *                               PRACTICE:
 *                                 type: object
 *                                 required:
 *                                   - coverages
 *                                   - coverageMap
 *                                 properties:
 *                                   coverages:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       required:
 *                                         - practiceId
 *                                         - level
 *                                       properties:
 *                                         practiceId:
 *                                           type: string
 *                                           example: RADIOGRAFIA
 *                                         level:
 *                                           type: string
 *                                           enum:
 *                                             - FULL
 *                                             - PARTIAL
 *                                           example: FULL
 *                                     example:
 *                                       - practiceId: RADIOGRAFIA
 *                                         level: FULL
 *                                   coverageMap:
 *                                     type: object
 *                                     additionalProperties: true
 *                                     example: {}
 *     responses:
 *       201:
 *         description: Obra social creada correctamente
 *       400:
 *         description: Datos inválidos
 */

/**
 * @swagger
 * /medical-coverages/{id}:
 *   get:
 *     summary: Devuelve las obra social (o prepaga) apuntada por id
 *     description: Devuelve las obra social (o prepaga) apuntada por id
 *     tags:
 *       - Obra Social
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la obra social
 *         example: OS1
 *     responses:
 *       200:
 *         description: Obra social encontrada
 *       404:
 *         description: Obra social no encontrada
 *   put:
 *     summary: Actualiza los datos de la Obra Social (o Prepaga) apuntada por ID
 *     description: Actualiza los datos de la Obra Social (o Prepaga) apuntada por ID
 *     tags:
 *       - Obra Social
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la obra social
 *         example: OS1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - plans
 *             properties:
 *               name:
 *                 type: string
 *                 example: OBRASOCIAL1
 *               plans:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - name
 *                     - plans
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: OS1
 *                     name:
 *                       type: string
 *                       example: OSDE
 *                     plans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - id
 *                           - name
 *                           - coverageStrategies
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: PLAN1
 *                           name:
 *                             type: string
 *                             example: Plan 210
 *                           coverageStrategies:
 *                             type: object
 *                             required:
 *                               - SPECIALTY
 *                               - PRACTICE
 *                             properties:
 *                               SPECIALTY:
 *                                 type: object
 *                                 required:
 *                                   - coverages
 *                                   - coverageMap
 *                                 properties:
 *                                   coverages:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       required:
 *                                         - specialtyId
 *                                         - level
 *                                       properties:
 *                                         specialtyId:
 *                                           type: string
 *                                           example: CARDIOLOGIA
 *                                         level:
 *                                           type: string
 *                                           enum:
 *                                             - FULL
 *                                             - PARTIAL
 *                                           example: FULL
 *                                     example:
 *                                       - specialtyId: CARDIOLOGIA
 *                                         level: FULL
 *                                       - specialtyId: DERMATOLOGIA
 *                                         level: PARTIAL
 *                                   coverageMap:
 *                                     type: object
 *                                     additionalProperties: true
 *                                     example: {}
 *                               PRACTICE:
 *                                 type: object
 *                                 required:
 *                                   - coverages
 *                                   - coverageMap
 *                                 properties:
 *                                   coverages:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       required:
 *                                         - practiceId
 *                                         - level
 *                                       properties:
 *                                         practiceId:
 *                                           type: string
 *                                           example: RADIOGRAFIA
 *                                         level:
 *                                           type: string
 *                                           enum:
 *                                             - FULL
 *                                             - PARTIAL
 *                                           example: FULL
 *                                     example:
 *                                       - practiceId: RADIOGRAFIA
 *                                         level: FULL
 *                                   coverageMap:
 *                                     type: object
 *                                     additionalProperties: true
 *                                     example: {}
 *     responses:
 *       201:
 *         description: Obra social actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *   delete:
 *     summary: Borra la obra sociale (o prepaga) apuntada por ID
 *     description: Borra la obra sociale (o prepaga) apuntada por ID
 *     tags:
 *       - Obra Social
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la obra social
 *         example: OS1
 *     responses:
 *       204:
 *         description: Obra social borrada
 *       404:
 *         description: Obra social no encontrada
 */
