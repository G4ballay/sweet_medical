import { body, param, query } from "express-validator";
import { DayOfWeek } from "../../enums/day-of-week.enum.js";
import { ServiceType } from "../../enums/service-type.enum.js";
import { validateArray, validateString, validateMongoId, validateEnum } from "./common.validations.middleware.js";

const validDays = Object.values(DayOfWeek);

export const isValidTimeFormat = (field, customMessage) => {
    const defaultMessage = customMessage || 'La hora debe estar en formato válido HH:MM (ej. 09:30)';
    return body(field)
        .notEmpty().withMessage(`${field} es requerido y debe estar en formato HH:MM (ej. 09:30)`).bail()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage(defaultMessage);
};

export const isAvailabilities = () => {
    return [
        body('availabilities')
            .optional()
            .isArray({ min: 1 }).withMessage('availabilities debe ser una lista no vacía'),
        body('availabilities.*.dayOfWeek')
            .isString().withMessage('El día de la semana debe ser string').bail()
            .toUpperCase()
            .isIn(validDays).withMessage(`El día debe ser uno de los siguientes: ${validDays.join(', ')}`),
        isValidTimeFormat('availabilities.*.startTime', 'La hora de inicio debe estar en formato HH:MM (ej. 09:30)'),
        isValidTimeFormat('availabilities.*.endTime', 'La hora de fin debe estar en formato HH:MM (ej. 18:00)')
    ];
};

const commonDoctorFields = [
    validateString('name', { customMessage: 'El nombre del doctor es obligatorio' }),
    ...validateArray('specialtyIds', { itemType: 'id' }),
    ...validateArray('practiceIds', { itemType: 'id' }),
    ...validateArray('locationIds', { itemType: 'id' }),
    ...isAvailabilities()
];

export const validateDoctorCreate = () => [
    validateMongoId('userId', { customMessage: 'El ID del usuario asociado al doctor es obligatorio' }),
    validateString('registration', { customMessage: 'El número de matrícula del doctor es obligatorio' }),
    ...commonDoctorFields
];

export const validateDoctorUpdate = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del doctor es requerido para la actualización' }),
    ...commonDoctorFields
];

export const validateDoctorGetById = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del doctor es requerido para la consulta' })
];

export const validateDoctorDelete = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del doctor es requerido para eliminar' })
];

export const validateDoctorAvailabilities = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del doctor es requerido para añadir disponibilidades' }),
    ...isAvailabilities()
];

export const validateDoctorServiceGet = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del doctor es requerido para la consulta' })
];

export const validateDoctorServiceModify = (arrayFieldName) => [
    validateMongoId('id', { location: param, customMessage: 'El ID del doctor es requerido para la modificación' }),
    ...validateArray(arrayFieldName, { itemType: 'id' })
];

export const validateDoctorSearch = () => [
    validateEnum('serviceType', ServiceType, { location: query, required: false }),
    validateMongoId('serviceId', { location: query, required: false }),
    ...validateArray('locationIds', { location: query, required: false, itemType: 'id' }),
    ...validateArray('doctorIds', { location: query, required: false, itemType: 'id' })
];