import { User } from "../../domain/user.js";
import { IUserRepository } from "../interfaces/user.repository.interface.js";
import { IdUtils } from "../../utils/id.utils.js";

export class UserMemoryRepository extends IUserRepository {
    constructor() {
        super();
        this.users = [
            new User({
                id: "600000000000000000000001",
                username: "juani",
                email: "juani@test.com",
                password: "Juani12345"
            }),
            new User({
                id: "600000000000000000000002",
                username: "maria",
                email: "maria@test.com",
                password: "Maria12345"
            }),
            new User({
                id: "600000000000000000000003",
                username: "pedro",
                email: "pedro@test.com",
                password: "Pedro12345"
            })
        ]
    }

    findById(id) {
        return this.users.find(user => user.id === id && !user.deletedAt) || null
    }

    async findAll(filters = {}) {
        return this.users.filter(user => {
            return Object.entries(filters).every(
                ([key, value]) => user[key] === value
            );
        });
    }

    async save(user) {
        const newUser = new User({
            id: IdUtils.generateId(),
            username: user.username,
            email: user.email,
            password: user.password
        });

        this.users.push(newUser);
        return newUser.id;
    }

    async delete(userId) {
        const index = this.users.findIndex(user => user.id === userId);
        let userToDelete = null;
        if (index !== -1) {
            userToDelete = this.users[index];
            this.users.splice(index, 1);
        }
        return userToDelete;
    }

    async update(userToUpdate) {
        const index = this.users.findIndex(user => user.id === userToUpdate.id);
        if (index === -1) return null;
        this.users[index] = userToUpdate;
        return userToUpdate;
    }

    async exists(filter) {
        return this.users.some(user => {
            if (user.deletedAt) return false;

            return Object.entries(filter).every(
                ([key, value]) => user[key] === value
            );
        });
    }

    async findByEmail(email) {
        return this.users.find(
            user => user.email === email && !user.deletedAt
        ) || null;
    }

    async findByUsername(username) {
        return this.users.find(
            user => user.username === username && !user.deletedAt
        ) || null;
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}