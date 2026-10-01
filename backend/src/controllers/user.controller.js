import { matchedData } from "express-validator";
import { UserService } from "../services/user.service.js";

export class UserController {
    constructor({ userService = new UserService() } = {}) {
        this.userService = userService;
    }

    async create(req, res, next) {
        const userData = matchedData(req);
        return this.userService.create(userData)
            .then(userId => res.status(201).json({ id: userId }))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id } = matchedData(req);
        return this.userService.delete(id)
            .then(deletedUser => res.status(204).json({ user: deletedUser }))
            .catch(next);
    }

    async update(req, res, next) {
        const userData = matchedData(req);
        return this.userService.update(userData)
            .then(user => res.status(200).json(user))
            .catch(next);
    }

    async getAll(req, res, next) {
        return this.userService.getAll()
            .then(users => res.status(200).json(users))
            .catch(next);
    }

    async getById(req, res, next) {
        const { id } = matchedData(req);
        return this.userService.findById(id)
            .then(user => res.status(200).json(user))
            .catch(next);
    }
}