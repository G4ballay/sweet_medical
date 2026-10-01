import { body, param } from "express-validator";
import { Role } from "../../enums/role.enum.js";
import { validateEnum, validateMongoId, validateString } from "./common.validations.middleware.js";

export const isValidEmail = (field = 'email', { optional = false } = {}) => {
  let validator = body(field);

  if (optional) {
    validator = validator.optional({ checkFalsy: true });
  } else {
    validator = validator.exists().withMessage(`${field} es requerido`).bail();
  }

  return validator
    .isEmail().withMessage(`${field} debe tener un formato válido`).bail()
    .normalizeEmail();
};

export const isValidPassword = (field = 'password', { optional = false } = {}) => {
  let validator = body(field);

  if (optional) {
    validator = validator.optional({ checkFalsy: true });
  } else {
    validator = validator.exists().withMessage(`${field} es requerida`).bail();
  }

  return validator
    .isLength({ min: 8 }).withMessage(`${field} debe tener al menos 8 caracteres`).bail()
    .matches(/[A-Z]/).withMessage(`${field} debe tener al menos una mayúscula`).bail()
    .matches(/[a-z]/).withMessage(`${field} debe tener al menos una minúscula`).bail()
    .matches(/[0-9]/).withMessage(`${field} debe tener al menos un número`);
};

export const isValidUsername = (field = 'username', { optional = false } = {}) => {
  let validator = body(field);

  if (optional) {
    validator = validator.optional({ checkFalsy: true });
  } else {
    validator = validator.exists().withMessage(`${field} es requerido`).bail();
  }

  return validator
    .isString().withMessage(`${field} debe ser texto`).bail()
    .notEmpty().withMessage(`${field} no puede estar vacío`).bail();
};

const commonUserFields = [
    isValidUsername(),
    isValidEmail(),
    isValidPassword()
];

export const validateUserCreate = () => [
    ...commonUserFields,
    validateEnum('role', Role, { customMessage: 'El rol es requerido y debe ser patient o doctor' })
];

export const validateUserGetById = () => [
    validateMongoId('id', { location: param })
];

export const validateUserUpdate = () => [
  validateMongoId('id', { location: param }),

  isValidUsername('username', { optional: true }),
  isValidEmail('email', { optional: true }),
  isValidPassword('password', { optional: true }),

  validateEnum('role', Role, {
    optional: true,
    customMessage: 'El rol debe ser patient o doctor',
  }),
];

export const validateUserDelete = () => [
    validateMongoId('id', { location: param })
];