import { Location } from "../../domain/location.js";
import { ILocationRepository } from "../interfaces/location.repository.interface.js";
import { LocationModel } from "./models/location.model.js";

export class LocationMongoRepository extends ILocationRepository {

    #toDomain(dbLocation) {

        if (!dbLocation) {
            return null;
        }

        return new Location({
            id: dbLocation._id.toString(),
            name: dbLocation.name,
            street: dbLocation.street,
            number: dbLocation.number,
            city: dbLocation.city,
            state: dbLocation.state
        });
    }

    async findById(id) {
        const location = await LocationModel.findOne({
            _id: id,
            deletedAt: null
        }).lean();

        return this.#toDomain(location);
    }

    async findAll(filters = {}) {

        const query = {
            deletedAt: null,
            ...filters
        };

        const locations = await LocationModel
            .find(query)
            .lean();

        return locations.map(location =>
            this.#toDomain(location)
        );
    }

    async exists(filters = {}, excludeId = null) {
        const mongoQuery = {};
        Object.entries(filters).forEach(([key, value]) => {
            mongoQuery.$or = mongoQuery.$or || [];
            if (Array.isArray(value)) mongoQuery.$or.push({ [key]: { $in: value } });
            else mongoQuery.$or.push({ [key]: value });
        })
        if (excludeId) mongoQuery._id = { $ne: excludeId };
        const location = await LocationModel.exists(mongoQuery);
        return location !== null;
    }

    async save(newLocation) {
        const saved = await LocationModel.create({
            name: newLocation.name,
            street: newLocation.street,
            number: newLocation.number,
            city: newLocation.city,
            state: newLocation.state
        });

        return saved._id.toString();
    }

    async update(locationToUpdate) {
        const { id, ...data } = locationToUpdate;

        const updated =
            await LocationModel.findByIdAndUpdate(
                id,
                {
                    $set: {
                        name: data.name,
                        street: data.street,
                        number: data.number,
                        city: data.city,
                        state: data.state
                    }
                },
                { new: true }
            ).lean();

        return this.#toDomain(updated);
    }

    async delete(id) {

        const deleted =
            await LocationModel.findByIdAndUpdate(
                id,
                {
                    deletedAt: new Date()
                },
                { new: true }
            ).lean();

        return this.#toDomain(deleted);
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}
