import { Practice } from "../../domain/practice.js";
import { IServiceRepository } from "../interfaces/service.repository.interface.js";
import { PracticeModel } from "./models/practice.model.js";

export class PracticeMongoRepository extends IServiceRepository {

    #toDomain(dbPractice) {
        if (!dbPractice) return null;
        return new Practice({
            id: dbPractice._id.toString(),
            name: dbPractice.name,
            durationInMins: dbPractice.durationInMins,
            cost: dbPractice.cost
        });
    }

    async findById(idPractice) {
        const doc = await PracticeModel.findById(idPractice).lean();
        return this.#toDomain(doc);
    }

    async findAll(filters = {}) {
        const query = { deletedAt: null, ...filters };
        const docs = await PracticeModel.find(query).lean();
        return docs.map(d => this.#toDomain(d));
    }

    async exists(filters = {}, excludeId = null) {
        const mongoQuery = {};
        Object.entries(filters).forEach(([key, value]) => {
            mongoQuery.$or = mongoQuery.$or || [];
            if (Array.isArray(value)) mongoQuery.$or.push({ [key]: { $in: value } });
            else mongoQuery.$or.push({ [key]: value });
        })
        if (excludeId) mongoQuery._id = { $ne: excludeId };
        const practice = await PracticeModel.exists(mongoQuery);
        return practice !== null;
    }

    async save(newPractice) {
        const savedPractice = await PracticeModel.create({
            name: newPractice.name,
            cost: newPractice.cost,
            durationInMins: newPractice.durationInMins
        });
        return savedPractice._id.toString();
    }

    async delete(idPractice) {
        const doc = await PracticeModel.findByIdAndUpdate(idPractice, {
            deletedAt: new Date()
        }, { new: true }).lean();
        return this.#toDomain(doc);
    }

    async update(practiceToUpdate) {
        const { id, ...data } = practiceToUpdate;
        const updated = await PracticeModel.findByIdAndUpdate(id, {
            $set: {
                name: data.name,
                cost: data.cost,
                durationInMins: data.durationInMins
            }
        }, { new: true }).lean();
        return this.#toDomain(updated);
    }

    async getOptions() {
        const practices = await PracticeModel
            .find(
                { deletedAt: null },
                { name: 1 }
            )
            .lean();
        return practices.map(practice => ({
            id: practice._id.toString(),
            name: practice.name
        }));
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}