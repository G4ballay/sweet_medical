import { DomainError } from "../errors/domain.errors.js";

export function errorHandler(error, _req, res, next) {
    if (error instanceof SyntaxError && 'body' in error) {
        return res.status(400).json({
            message: 'El formato del JSON enviado es inválido.',
            error: error.message
        });
    }

    if (error instanceof DomainError) {
        return res.status(error.status).json({
            message: error.message
        });
    }

    console.error('Error no manejado:', error);

    return res.status(500).json({
        message: 'Ocurrió un error interno en el servidor.',
        error: error.message
    });
};