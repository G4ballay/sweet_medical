import { param } from "express-validator";
import { CoverageLevel } from "../../enums/coverage-level.enum.js";
import { validateArray, validateEnum, validateMongoId, validateString } from "./common.validations.middleware.js";

const commonFields = [
    validateString('name', { customMessage: 'name es requerido' }),
    validateArray('plans'),
    validateString('plans.*.name', { customMessage: 'El nombre de cada plan es requerido' }),
    validateEnum('plans.*.specialtyCoverages.*.level', CoverageLevel),
    validateEnum('plans.*.practiceCoverages.*.level', CoverageLevel)
];

export const validateHealthInsuranceCreate = () => [
    ...commonFields
];

export const validateHealthInsuranceUpdate = () => [
    validateMongoId('id', { location: param }),
    ...commonFields
];

export const validateHealthInsuranceGetById = () => [
    validateMongoId('id', { location: param })
];

export const validateHealthInsuranceDelete = () => [
    validateMongoId('id', { location: param })
];