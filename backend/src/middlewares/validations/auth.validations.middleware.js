import { body } from 'express-validator';
import { validateString } from './common.validations.middleware.js';

export const validateLogin = () => [
    validateString('identifier', { customMessage: 'El email o username es requerido' }),
    validateString('password', { customMessage: 'La contraseña es requerida' })
];
