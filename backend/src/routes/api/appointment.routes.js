import { Router } from "express";
import { AppointmentController } from "../../controllers/appointment.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/appointment.validations.middleware.js";

const appointmentController = new AppointmentController()

const router = Router();

router.get('/available-slots',
	validations.validateAppointmentSearch(),
	validateRequest,
	(req, res, next) => appointmentController.searchAvailableSlots(req, res, next)
);

const normalizeBodyToArray = (req, res, next) => {
	if (req.body && !Array.isArray(req.body))
		req.body = [req.body];
	next();
};

router.route('/')
	.get(validations.validateAppointmentGet(), validateRequest,
		(req, res, next) => appointmentController.getAll(req, res, next))
	.post(normalizeBodyToArray, validations.validateAppointmentBook(), validateRequest,
		(req, res, next) => appointmentController.book(req, res, next));

router.route('/:id')
	.get(validations.validateAppointmentGetById(), validateRequest,
		(req, res, next) => appointmentController.getById(req, res, next))
	.patch(validations.validateAppointmentPatch(), validateRequest,
		(req, res, next) => appointmentController.patch(req, res, next))
	.delete(validations.validateAppointmentDelete(), validateRequest,
		(req, res, next) => appointmentController.delete(req, res, next));

router.route('/:id/reschedule-proposal')
	.patch(validations.validateRescheduleProposalUpdate(), validateRequest,
		(req, res, next) => appointmentController.updateRescheduleProposal(req, res, next));

export default router;


/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Obtiene el historial de turnos
 *     description: Devuelve una lista de turnos filtrada por los query params provistos. Sin filtros, devuelve todos los turnos. Requiere autenticación JWT.
 *     tags:
 *       - Turnos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: ID del paciente para filtrar turnos
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: ID del doctor para filtrar turnos
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RESERVADO, CONFIRMADO, CANCELADO, REALIZADO, REPROGRAMACION_PROPUESTA]
 *         description: Estado del turno
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha desde (ISO 8601)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha hasta (ISO 8601)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [cost, startTime]
 *       - in: query
 *         name: orderDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Lista de turnos
 *       401:
 *         description: No autenticado
 *   post:
 *     summary: Reserva un turno nuevo
 *     description: Crea un nuevo turno validando disponibilidad del médico y cobertura del paciente. El paciente se identifica automáticamente mediante el token JWT.
 *     tags:
 *       - Turnos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - startTime
 *               - serviceType
 *               - serviceId
 *               - locationId
 *             properties:
 *               doctorId:
 *                 type: string
 *                 example: "600000000000000000000011"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-16T13:00:00Z"
 *               serviceType:
 *                 type: string
 *                 enum: [SPECIALTY, PRACTICE]
 *                 example: "SPECIALTY"
 *               serviceId:
 *                 type: string
 *                 example: "600000000000000000000041"
 *               locationId:
 *                 type: string
 *                 example: "600000000000000000000031"
 *     responses:
 *       201:
 *         description: Turno creado
 *       400:
 *         description: Datos proporcionados inválidos
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Obtiene los datos de un turno
 *     description: Devuelve los datos del turno identificado por id. Requiere autenticación JWT.
 *     tags:
 *       - Turnos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del turno
 *         example: "600000000000000000000081"
 *     responses:
 *       200:
 *         description: Devuelve detalles del turno
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Turno no encontrado
 *   patch:
 *     summary: Modifica el estado o datos de un turno
 *     description: |
 *       Modifica un turno existente. La operación se infiere del rol del usuario autenticado y los campos enviados:
 *       - `{ status: "CONFIRMADO" }` (doctor) → Confirmar turno
 *       - `{ status: "REALIZADO" }` (doctor) → Completar turno
 *       - `{ startTime, reason }` (paciente) → Reprogramar turno
 *       - `{ startTime, reason }` (doctor) → Proponer reprogramación
 *     tags:
 *       - Turnos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del turno
 *         example: "600000000000000000000081"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMADO, REALIZADO]
 *                 description: Estado destino del turno
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha/hora para reprogramación
 *               reason:
 *                 type: string
 *                 description: Motivo del cambio o de la propuesta
 *     responses:
 *       200:
 *         description: Turno modificado
 *       400:
 *         description: Datos proporcionados inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Turno no encontrado
 *   delete:
 *     summary: Cancela un turno
 *     description: Cancela un turno con al menos 1 hora de anticipación. El usuario se identifica por el token JWT.
 *     tags:
 *       - Turnos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del turno
 *         example: "600000000000000000000081"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "No puedo asistir"
 *     responses:
 *       200:
 *         description: Turno cancelado
 *       400:
 *         description: Datos proporcionados inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Turno no encontrado
 */

/**
 * @swagger
 * /appointments/{id}/reschedule-proposal:
 *   patch:
 *     summary: Responde a una propuesta de reprogramación
 *     description: |
 *       El paciente acepta o rechaza una propuesta de reprogramación pendiente.
 *       - `{ status: "ACEPTADO" }` → Acepta la propuesta y reprograma el turno.
 *       - `{ status: "RECHAZADO", reason: "..." }` → Rechaza la propuesta. El turno vuelve a su estado anterior.
 *       El paciente se identifica automáticamente mediante el token JWT.
 *     tags:
 *       - Propuesta de Reprogramación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del turno
 *         example: "600000000000000000000081"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACEPTADO, RECHAZADO]
 *                 description: Respuesta del paciente a la propuesta
 *               reason:
 *                 type: string
 *                 description: Motivo del rechazo (requerido cuando status es RECHAZADO)
 *                 example: "El horario no me queda cómodo"
 *     responses:
 *       200:
 *         description: Propuesta respondida exitosamente
 *       400:
 *         description: Datos proporcionados inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Turno no encontrado
 */

/**
 * @swagger
 * /appointments/available-slots:
 *   get:
 *     summary: Busca turnos disponibles
 *     description: |
 *       Busca slots de turnos disponibles según los filtros proporcionados.
 *       Calcula la cobertura y el costo estimado según la obra social y plan del paciente autenticado.
 *     tags:
 *       - Turnos Disponibles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SPECIALTY, PRACTICE]
 *         description: Tipo de servicio
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servicio (especialidad o práctica)
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha desde (ISO 8601)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha hasta (ISO 8601)
 *       - in: query
 *         name: doctorIds
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: IDs de doctores para filtrar
 *       - in: query
 *         name: locationIds
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: IDs de sedes para filtrar
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [cost, startTime]
 *       - in: query
 *         name: orderDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Lista de slots disponibles con información de cobertura y costo
 *       400:
 *         description: Datos proporcionados inválidos
 *       401:
 *         description: No autenticado
 */