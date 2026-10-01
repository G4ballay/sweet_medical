import { body, param } from "express-validator";
import { validateMongoId } from "./common.validations.middleware.js";

export const isValidDocumentNumber = (field = 'documentNumber') =>
    body(field)
        .exists().withMessage(`${field} es requerido`).bail()
        .isString().withMessage(`${field} debe ser un string`).bail()
        .notEmpty().withMessage(`${field} no puede estar vacío`).bail()
        .isLength({ min: 7, max: 20 }).withMessage(`${field} debe tener entre 7 y 20 caracteres`);

export const isValidForeignId = (field) =>
    validateMongoId(field, { customMessage: `${field} es requerido y debe ser un Id válido` });

export const isValidName = (field = 'name') =>
    body(field)
        .exists().withMessage(`${field} es requerido`).bail()
        .isString().withMessage(`${field} debe ser un string`).bail()
        .isLength({ min: 2, max: 100 }).withMessage(`${field} debe tener entre 2 y 100 caracteres`);

const commonPatientFields = [
    isValidForeignId('userId'),
    isValidDocumentNumber(),
    isValidName(),
    isValidForeignId('healthInsuranceId'),
    isValidForeignId('planId')
];

export const validatePatientCreate = () => [
    ...commonPatientFields
];

export const validatePatientGetById = () => [
    validateMongoId('id', { location: param })
];

export const validatePatientUpdate = () => [
    validateMongoId('id', { location: param }),
    ...commonPatientFields
];

export const validatePatientDelete = () => [
    validateMongoId('id', { location: param })
];