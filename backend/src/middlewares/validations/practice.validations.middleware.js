import { param } from "express-validator";
import { validateMongoId, validateNumber, validateString } from "./common.validations.middleware.js";

const commonsPracticeFields = [
    validateString('name', { customMessage: 'El nombre de la practica es obligatorio' }),
    validateNumber('durationInMins', { customMessage: 'La duración es obligatoria', min: 1 }),
    validateNumber('cost', { customMessage: 'El costo es obligatorio', min: 1 })
];

export const validatePracticeCreate = () => [
    ...commonsPracticeFields
];

export const validatePracticeGetById = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la practica es requerido para la consulta' })
];

export const validatePracticeUpdate = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la practica es requerido para la consulta' }),
    ...commonsPracticeFields
];

export const validatePracticeDelete = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la practica es requerido para la consulta' })
];