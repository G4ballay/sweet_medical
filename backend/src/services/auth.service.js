import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/domain.errors.js';
import { RoleResolverFactory } from '../factories/role.factory.js';
import { RepositoryFactory } from '../factories/repository.factory.js';

export class AuthService {
    constructor({ userRepository = RepositoryFactory.getUserRepository() } = {}) {
        this.userRepository = userRepository;
    }

    #generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
    }

    async login({ identifier, password }) {
        const user = await this.userRepository.findByIdentifier(identifier);
        if (!user) throw new UnauthorizedError('Credenciales incorrectas.');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) throw new UnauthorizedError('Credenciales incorrectas.');

        const roleEntity = await RoleResolverFactory.getEntityByUserId(user.role, user.id);

        const tokenPayload = {
            userId: user.id,
            role: user.role,
            name: roleEntity?.name,
            username: user.username,
            email: user.email
        };

        const idKey = RoleResolverFactory.getEntityIdKey(user.role);
        if (idKey && roleEntity) tokenPayload[idKey] = roleEntity.id;

        return {
            token: this.#generateToken(tokenPayload),
            user: tokenPayload
        };
    }
}
