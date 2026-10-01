import { param, query } from "express-validator";
import { validateMongoId, validateBoolean, validateString, validateEnum } from "./common.validations.middleware.js";
import { NotificationType } from "../../enums/notification-type.enum.js";

export const validateNotificationCreate = () => [
    validateEnum('type', NotificationType, { required: false }),
    validateString('recipient'),
    validateString('sender', { required: false }),
    validateString('message')
];

export const validateNotificationGet = () => [
    validateString('recipient', { location: query, required: false }),
    validateBoolean('isread', { location: query, required: false, customMessage: 'status solo puede ser "true" o "false"' })
];

export const validateNotificationGetById = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la notificación es requerido para la consulta' })
];

export const validateNotificationPatch = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la notificacion es requerido para modificarla' }),
    validateString('recipient', { required: false }),
    validateString('sender', { required: false }),
    validateString('message', { required: false }),
    validateBoolean('isRead', { required: false })
];

export const validateNotificationDelete = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la notificacion es requerido para eliminarla' })
];