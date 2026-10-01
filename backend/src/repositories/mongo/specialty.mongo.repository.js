import { Specialty } from "../../domain/specialty.js";
import { IServiceRepository } from "../interfaces/service.repository.interface.js";
import { SpecialtyModel } from "./models/specialty.model.js";

export class SpecialtyMongoRepository extends IServiceRepository {

    #toDomain(dbSpecialty) {
        if (!dbSpecialty) return null;
        return new Specialty({
            id: dbSpecialty._id.toString(),
            name: dbSpecialty.name,
            durationInMins: dbSpecialty.durationInMins,
            cost: dbSpecialty.cost
        });
    }

    async findById(id) {
        const doc = await SpecialtyModel.findById(id).lean();
        return this.#toDomain(doc);
    }

    async findAll(filters = {}) {
        const query = { deletedAt: null, ...filters };
        const docs = await SpecialtyModel.find(query).lean();
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
        const specialty = await SpecialtyModel.exists(mongoQuery);
        return specialty !== null;
    }

    async save(newSpecialty) {
        const savedSpecialty = await SpecialtyModel.create({
            name: newSpecialty.name,
            cost: newSpecialty.cost,
            durationInMins: newSpecialty.durationInMins
        });
        return savedSpecialty._id.toString();
    }

    async delete(idSpecialty) {
        const doc = await SpecialtyModel.findByIdAndUpdate(idSpecialty, {
            deletedAt: new Date()
        }, { new: true }).lean();
        return this.#toDomain(doc);
    }

    async update(specialtyToUpdate) {
        const { id, ...data } = specialtyToUpdate;
        const updated = await SpecialtyModel.findByIdAndUpdate(id, {
            $set: {
                name: data.name,
                cost: data.cost,
                durationInMins: data.durationInMins
            }
        }, { new: true }).lean();
        return this.#toDomain(updated);
    }

    async getOptions() {
        const specialties = await SpecialtyModel
            .find(
                { deletedAt: null },
                { name: 1 }
            )
            .lean();
        return specialties.map(specialty => ({
            id: specialty._id.toString(),
            name: specialty.name
        }));
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}
