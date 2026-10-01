import { User } from "../domain/user.js";
import { AlreadyExistsError, NotFoundError } from "../errors/domain.errors.js";
import { RepositoryFactory } from "../factories/repository.factory.js";

export class UserService {
    constructor({
        userRepository = RepositoryFactory.getUserRepository()
    } = {}) {
        this.userRepository = userRepository;
    }

    async findById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) throw new NotFoundError("Usuario", id);
        return user;
    }

    async getAll() {
        return await this.userRepository.findAll();
    }

    async create(userData) {
        const existsEmail = await this.userRepository.exists({ email: userData.email });
        const existsUsername = await this.userRepository.exists({ username: userData.username });
        if (existsEmail) throw new AlreadyExistsError({ entity: "Usuario", identifier: "Email", value: userData.email });
        if (existsUsername) throw new AlreadyExistsError({ entity: "Usuario", identifier: "Nombre de Usuario", value: userData.username });
        return await this.userRepository.save(new User(userData));
    }

    async update(userData) {
        await this.findById(userData.id);

        if (userData.email !== undefined) {
            const existsUserEmail = await this.userRepository.findByEmail(userData.email);

            if (existsUserEmail && existsUserEmail.id !== userData.id) {
            throw new AlreadyExistsError({
                entity: "Usuario",
                identifier: "Email",
                value: userData.email
            });
            }
        }

        if (userData.username !== undefined) {
            const existsUserUsername = await this.userRepository.findByUsername(userData.username);

            if (existsUserUsername && existsUserUsername.id !== userData.id) {
            throw new AlreadyExistsError({
                entity: "Usuario",
                identifier: "Nombre de Usuario",
                value: userData.username
            });
            }
        }

        return await this.userRepository.update(userData);
    }

    async delete(userId) {
        await this.findById(userId);
        return await this.userRepository.delete(userId);
    }
}