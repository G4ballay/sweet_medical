export class DomainError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends DomainError {
    constructor(entity, value, identifier = "identificador") {
        super(404, `${entity} con ${identifier} '${value}' no encontrado.`);
    }
}

export class AlreadyExistsError extends DomainError {
    constructor({ entity, identifier, value }) {
        super(409, `Ya existe un ${entity}${identifier ? ` con ${identifier} '${value}'` : " con los mismos datos clave"}.`);
    }
}

export class InvalidOperationError extends DomainError {
    constructor(message) {
        super(400, message);
    }
}

export class UnauthorizedError extends DomainError {
    constructor(message = 'Credenciales inválidas o token no proporcionado.') {
        super(401, message);
    }
}

export class ForbiddenError extends DomainError {
    constructor(message = 'No tiene permisos para realizar esta acción.') {
        super(403, message);
    }
}