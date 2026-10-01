import jwt from 'jsonwebtoken';
import { ForbiddenError, UnauthorizedError } from '../errors/domain.errors.js';

export function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new UnauthorizedError('Token de autenticación no proporcionado.');

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { iat, exp, ...userData } = decoded;
        req.user = userData;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError')
            throw new UnauthorizedError('Token expirado. Inicie sesión nuevamente.');
        throw new UnauthorizedError('Token inválido.');
    }
}

export function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user)
            throw new UnauthorizedError('Token de autenticación no proporcionado.');
        if (!roles.includes(req.user.role))
            throw new ForbiddenError(`Se requiere rol: ${roles.join(' o ')}.`);
        next();
    };
}

