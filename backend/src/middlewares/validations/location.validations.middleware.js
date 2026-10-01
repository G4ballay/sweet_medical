import { param } from "express-validator";
import { validateNumber, validateString, validateMongoId } from "./common.validations.middleware.js";

const commonLocationFields = [
    validateString('name', { customMessage: "Debe tener nombre la sede" }),
    validateString('street', { customMessage: "Se requiere nombre de la calle" }),
    validateNumber('number', { customMessage: "La altura de la calle es mayor a 0", min: 1 }),
    validateString('city'),
    validateString('state')
];

export const validateLocationCreate = () => [
    ...commonLocationFields
];

export const validateLocationGetById = () => [
    validateMongoId('id', { location: param })
];

export const validateLocationUpdate = () => [
    validateMongoId('id', { location: param }),
    ...commonLocationFields
];

export const validateLocationDelete = () => [
    validateMongoId('id', { location: param })
];