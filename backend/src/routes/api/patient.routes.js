import { Router } from "express";
import { PatientController } from "../../controllers/patient.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/patient.validations.middleware.js";

const patientController = new PatientController();

const router = Router();
router.route('/')
    .get((req, res, next) => patientController.getAll(req, res, next)) 
    .post(validations.validatePatientCreate(), validateRequest, (req, res, next) => patientController.create(req, res, next)); 

router.route('/:id')
    .get(validations.validatePatientGetById(), validateRequest, (req, res, next) => patientController.getById(req, res, next)) 
    .put(validations.validatePatientUpdate(), validateRequest, (req, res, next) => patientController.update(req, res, next)) 
    .delete(validations.validatePatientDelete(), validateRequest, (req, res, next) => patientController.delete(req, res, next)); 
    
export default router;

/**
 * @swagger
 * /patients/:
 *   get:
 *     summary: Obtiene los datos de todos los pacientes
 *     description: Devuelve una lista con todos los datos de todos los pacientes registrados.
 *     tags:
 *       - Pacientes 
 *     responses:
 *       200:
 *         description: Lista de pacientes obtenida correctamente
 *   post:
 *     summary: Crea un paciente
 *     description: Crea un paciente con los datos proporcionados.
 *     tags:
 *       - Pacientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - documentNumber
 *               - name
 *               - healthInsuranceId
 *               - planId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "600000000000000000000001"
 *               documentNumber:
 *                 type: string
 *                 example: 12.345.678
 *               name:
 *                 type: string
 *                 example: Juan López
 *               healthInsuranceId:
 *                 type: string
 *                 example: "600000000000000000000061"
 *               planId:
 *                 type: string
 *                 example: "600000000000000000000071"
 *     responses:
 *       201:
 *         description: Paciente creado
 *       400:
 *         description: Faltan datos o formato inválido
 *       409:
 *         description: Ya existe un paciente con esos datos
 */

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Obtiene los datos de un paciente.
 *     description: Obtiene los datos de un paciente.
 *     tags:
 *       - Paciente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del Paciente
 *         example: "600000000000000000000021"
 *     responses:
 *       200:
 *         description: Paciente encontrado
 *       404:
 *         description: Paciente no encontrado
 *   put:
 *     summary: Actualiza los datos base del paciente
 *     description: Actualiza los datos base del paciente
 *     tags:
 *       - Paciente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *         example: "600000000000000000000021"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - documentNumber
 *               - name
 *               - healthInsuranceId
 *               - planId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "600000000000000000000001"
 *               documentNumber:
 *                 type: string
 *                 example: 12.345.678
 *               name:
 *                 type: string
 *                 example: Juan López
 *               healthInsuranceId:
 *                 type: string
 *                 example: "600000000000000000000061"
 *               planId:
 *                 type: string
 *                 example: "600000000000000000000071"
 *     responses:
 *       200:
 *         description: Paciente actualizado
 *       404:
 *         description: Paciente no encontrado
 *       400:
 *         description: Datos proporcionados inválidos
 *   delete:
 *     summary: Borra un doctor
 *     description: Realiza un borrado lógico del doctor identificado por id.
 *     tags:
 *       - Paciente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *         example: "600000000000000000000021"
 *     responses:
 *       204:
 *         description: Paciente eliminado
 *       404:
 *         description: Paciente no encontrado
 */