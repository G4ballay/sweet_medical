import { param } from "express-validator";
import { validateMongoId, validateNumber, validateString } from "./common.validations.middleware.js";

const commonsSpecialtyFields = [
    validateString('name', { customMessage: 'El nombre de la especialidad es obligatorio' }),
    validateNumber('durationInMins', { customMessage: 'La duración es obligatoria', min: 1 }),
    validateNumber('cost', { customMessage: 'El costo es obligatorio', min: 1 })
];

export const validateSpecialtyCreate = () => [
    ...commonsSpecialtyFields
];

export const validateSpecialtyGetById = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la especialidad es requerido para la consulta' })
];

export const validateSpecialtyUpdate = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la especialidad es requerido para la consulta' }),
    ...commonsSpecialtyFields
];

export const validateSpecialtyDelete = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID de la especialidad es requerido para la consulta' })
];