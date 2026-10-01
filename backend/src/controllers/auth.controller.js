import { matchedData } from 'express-validator';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
    constructor({ authService = new AuthService() } = {}) {
        this.authService = authService;
    }

    async login(req, res, next) {
        const credentials = matchedData(req);
        return this.authService.login(credentials)
            .then(result => res.status(200).json(result))
            .catch(next);
    }
}
