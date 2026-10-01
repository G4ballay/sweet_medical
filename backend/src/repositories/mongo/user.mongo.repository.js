import { User } from "../../domain/user.js";
import { IUserRepository } from "../interfaces/user.repository.interface.js";
import { UserModel } from "./models/user.model.js";

export class UserMongoRepository extends IUserRepository {

    #toDomain(dbUser) {
        if (!dbUser) return null;
        return new User({
            id: dbUser._id.toString(),
            username: dbUser.username,
            email: dbUser.email,
            password: dbUser.password,
            role: dbUser.role,
        });
    }

    async exists(filters = {}, excludeId = null) {
        const mongoQuery = {};
        Object.entries(filters).forEach(([key, value]) => {
            mongoQuery.$or = mongoQuery.$or || [];
            if (Array.isArray(value)) mongoQuery.$or.push({ [key]: { $in: value } });
            else mongoQuery.$or.push({ [key]: value });
        })
        if (excludeId) mongoQuery._id = { $ne: excludeId };
        const user = await UserModel.exists(mongoQuery);
        return user !== null;
    }

    async findById(id) {
        const doc = await UserModel.findOne({ _id: id, deletedAt: null }).lean();
        return this.#toDomain(doc);
    }

    async findAll(filters = {}) {
        const query = { deletedAt: null, ...filters };
        const docs = await UserModel.find(query).lean();
        return docs.map(d => this.#toDomain(d));
    }

    async save(user) {
        const saved = await UserModel.create({
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role
        });
        return saved._id.toString();
    }

    async delete(id) {
        const doc = await UserModel.findByIdAndUpdate(id, {
            deletedAt: new Date()
        }, { new: true }).lean();
        return this.#toDomain(doc);
    }

    async update(userToUpdate) {
        const { id, ...data } = userToUpdate;

        const updateData = {};

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
            updateData[key] = value;
            }
        });

        const updated = await UserModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();

        return this.#toDomain(updated);
    }

    async findByEmail(email) {
        const user = await UserModel.findOne({
            email,
            deletedAt: null
        }).lean();

        return this.#toDomain(user);
    }

    async findByUsername(username) {
        const user = await UserModel.findOne({
            username,
            deletedAt: null
        }).lean();

        return this.#toDomain(user);
    }

    async findByIdentifier(identifier) {
        const user = await UserModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
            deletedAt: null
        }).lean();

        return this.#toDomain(user);
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}
