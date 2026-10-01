import { Router } from "express";
import { NotificationController } from "../../controllers/notification.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import * as validations from "../../middlewares/validations/notification.validations.middleware.js";
import { authMiddleware } from '../../middlewares/auth.middleware.js'

const notificationController = new NotificationController();
const router = Router();



router.route('/')
    .get(authMiddleware, validations.validateNotificationGet(), validateRequest, (req, res, next) => notificationController.findAll(req, res, next))
    .post(authMiddleware, validations.validateNotificationCreate(), validateRequest, (req, res, next) => notificationController.create(req, res, next))

router.route('/:id')
    .get(validations.validateNotificationGetById(), validateRequest, (req, res, next) => notificationController.findById(req, res, next))
    .patch(validations.validateNotificationPatch(), validateRequest, (req, res, next) => notificationController.patch(req, res, next))
    .delete(validations.validateNotificationDelete(), validateRequest, (req, res, next) => notificationController.delete(req, res, next));

export default router;

/**
 * @swagger
 * /notifications/:
 *   get:
 *     summary: Obtiene los datos de todas las notificaciones
 *     description: Obtiene los datos de todas las notificaciones
 *     tags:
 *       - Notificaciones 
 *     responses:
 *       200:
 *         description: Lista de notificaciones obtenida correctamente
 *   post:
 *     summary: Crea una notificación
 *     description: Crea una notificación con los datos proporcionados.
 *     tags:
 *       - Notificaciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - recipient
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 example: PLATAFORMA
 *               recipient:
 *                 type: string
 *                 example: "600000000000000000000002"
 *               message:
 *                 type: string
 *                 example: "Mensaje de la notificación"
 *     responses:
 *       201:
 *         description: Notificación creada
 *       400:
 *         description: Faltan datos o formato inválido
 *       409:
 *         description: Ya existe una notificación con esos datos
 */


/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Obtiene los datos de una notificación
 *     description: Devuelve los datos de la notificación identificada por id.
 *     tags:
 *       - Notificación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *         example: "600000000000000000000091"
 *     responses:
 *       200:
 *         description: Notificación encontrada
 *       404:
 *         description: Notificación no encontrada
 *   patch:
 *     summary: Actualiza los datos de la notificación
 *     description: "Actualiza los datos de la notificación. Enviar isRead: true marca la notificación como leída (establece readTimestamp)."
 *     tags:
 *       - Notificación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *         example: "600000000000000000000091"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - sender
 *               - message
 *               - isRead
 *             properties:
 *               recipient:
 *                 type: string
 *                 example: "600000000000000000000012"
 *               sender:
 *                 type: string
 *                 example: "600000000000000000000001"
 *               message:
 *                 type: string
 *                 example: "Texto de la notificación modificado"
 *               isRead:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Notificación actualizada
 *       404:
 *         description: Notificación no encontrada
 *       400:
 *         description: Datos proporcionados inválidos
 *   delete:
 *     summary: Borra una notificación
 *     description: Realiza un borrado lógico de la notificación identificada por id.
 *     tags:
 *       - Notificación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *         example: "600000000000000000000091"
 *     responses:
 *       204:
 *         description: Notificación eliminada
 *       404:
 *         description: Notificación no encontrada
 */