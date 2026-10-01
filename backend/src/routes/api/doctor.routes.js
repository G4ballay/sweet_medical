import { Router } from "express";
import { DoctorController } from "../../controllers/doctor.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/doctor.validations.middleware.js";

const doctorController = new DoctorController();
const router = Router();


router.route('/')
    .get(validations.validateDoctorSearch(), validateRequest, (req, res, next) => doctorController.getAll(req, res, next))
    .post(validations.validateDoctorCreate(), validateRequest, (req, res, next) => doctorController.create(req, res, next));


router.route('/:id')
    .get(validations.validateDoctorGetById(), validateRequest, (req, res, next) => doctorController.getById(req, res, next))
    .put(validations.validateDoctorUpdate(), validateRequest, (req, res, next) => doctorController.update(req, res, next))
    .delete(validations.validateDoctorDelete(), validateRequest, (req, res, next) => doctorController.delete(req, res, next));


router.route('/:id/availabilities')
    .put(validations.validateDoctorAvailabilities(), validateRequest, (req, res, next) => doctorController.updateAvailabilities(req, res, next));


router.route('/:id/practices')
    .get(validations.validateDoctorServiceGet(), validateRequest, (req, res, next) => doctorController.getPractices(req, res, next))
    .put(validations.validateDoctorServiceModify('practiceIds'), validateRequest, (req, res, next) => doctorController.updatePractices(req, res, next));


router.route('/:id/specialties')
    .get(validations.validateDoctorServiceGet(), validateRequest, (req, res, next) => doctorController.getSpecialties(req, res, next))
    .put(validations.validateDoctorServiceModify('specialtyIds'), validateRequest, (req, res, next) => doctorController.updateSpecialties(req, res, next))

export default router;

/**
 * @swagger
 * /doctors/:
 *   get:
 *     summary: Obtiene los datos de todos los doctores
 *     description: Devuelve una lista con todos los datos de todos los doctores registrados.
 *     tags:
 *       - Doctores 
 *     responses:
 *       200:
 *         description: Lista de doctores obtenida correctamente
 *   post:
 *     summary: Crea un doctor
 *     description: Crea un doctor con los datos proporcionados.
 *     tags:
 *       - Doctores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - registration
 *               - name
 *               - specialtyIds
 *               - practiceIds
 *               - locationIds
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 600000000000000000000001
 *               registration:
 *                 type: string
 *                 example: MED-AR-123456
 *               name:
 *                 type: string
 *                 example: René Favaloro
 *               specialtyIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 600000000000000000000041
 *                   - 600000000000000000000042
 *               practiceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 600000000000000000000051
 *                   - 600000000000000000000052
 *               locationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 600000000000000000000031
 *                   - 600000000000000000000032
 *               availabilities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *                 example:
 *                   - dayOfWeek: "MONDAY"
 *                     startTime: "09:00"
 *                     endTime: "17:00"
 *     responses:
 *       201:
 *         description: Doctor creado
 *       400:
 *         description: Faltan datos o formato inválido
 *       409:
 *         description: Ya existe un doctor con esos datos
 */

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Obtiene los datos de un doctor
 *     description: Devuelve los datos del doctor identificado por id.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor (ObjectId)
 *         example: 600000000000000000000011
 *     responses:
 *       200:
 *         description: Doctor encontrado
 *       404:
 *         description: Doctor no encontrado
 *   put:
 *     summary: Actualiza los datos base del doctor
 *     description: Actualiza los datos principales del doctor (nombre, servicios, locaciones). No modifica el userId ni la matrícula.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor
 *         example: 600000000000000000000011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - specialtyIds
 *               - practiceIds
 *               - locationIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: René Favaloro Modificado
 *               specialtyIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 600000000000000000000041
 *               practiceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 600000000000000000000051
 *               locationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 600000000000000000000031
 *     responses:
 *       200:
 *         description: Doctor actualizado
 *       404:
 *         description: Doctor no encontrado
 *       400:
 *         description: Datos proporcionados inválidos
 *   delete:
 *     summary: Borra un doctor
 *     description: Realiza un borrado lógico del doctor identificado por id.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor
 *         example: 600000000000000000000011
 *     responses:
 *       204:
 *         description: Doctor eliminado
 *       404:
 *         description: Doctor no encontrado
 */

/**
 * @swagger
 * /doctors/{id}/availabilities:
 *   put:
 *     summary: Actualiza las disponibilidades de un doctor
 *     description: Reemplaza la lista completa de horarios de disponibilidad para el doctor.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor
 *         example: 600000000000000000000011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - availabilities
 *             properties:
 *               availabilities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *                 example:
 *                   - dayOfWeek: "TUESDAY"
 *                     startTime: "08:00"
 *                     endTime: "12:00"
 *                   - dayOfWeek: "THURSDAY"
 *                     startTime: "14:00"
 *                     endTime: "18:00"
 *     responses:
 *       200:
 *         description: Disponibilidades actualizadas
 *       400:
 *         description: Formato de horarios inválido
 *       404:
 *         description: Doctor no encontrado
 */

/**
 * @swagger
 * /doctors/{id}/practices:
 *   get:
 *     summary: Obtiene las prácticas de un doctor
 *     description: Devuelve las prácticas asignadas al doctor.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor
 *         example: 600000000000000000000011
 *     responses:
 *       200:
 *         description: Prácticas encontradas
 *       404:
 *         description: Doctor no encontrado
 *   put:
 *     summary: Actualiza las prácticas de un doctor
 *     description: Reemplaza el arreglo actual de prácticas del doctor por uno nuevo.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor
 *         example: 600000000000000000000011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - practiceIds
 *             properties:
 *               practiceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 600000000000000000000051
 *                   - 600000000000000000000052
 *     responses:
 *       200:
 *         description: Prácticas actualizadas correctamente
 *       404:
 *         description: Doctor no encontrado
 *       400:
 *         description: Datos proporcionados inválidos
 */

/**
 * @swagger
 * /doctors/{id}/specialties:
 *   get:
 *     summary: Obtiene las especialidades de un doctor
 *     description: Devuelve las especialidades asignadas al doctor.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor
 *         example: 600000000000000000000011
 *     responses:
 *       200:
 *         description: Especialidades encontradas
 *       404:
 *         description: Doctor no encontrado
 *   put:
 *     summary: Actualiza las especialidades de un doctor
 *     description: Reemplaza el arreglo actual de especialidades del doctor por uno nuevo.
 *     tags:
 *       - Doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del doctor
 *         example: 600000000000000000000011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialtyIds
 *             properties:
 *               specialtyIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - 600000000000000000000041
 *                   - 600000000000000000000043
 *     responses:
 *       200:
 *         description: Especialidades actualizadas correctamente
 *       404:
 *         description: Doctor no encontrado
 *       400:
 *         description: Datos proporcionados inválidos
 */