import { Location } from "../../domain/location.js";
import { ILocationRepository } from "../interfaces/location.repository.interface.js";
import { IdUtils } from "../../utils/id.utils.js";

export class LocationMemoryRepository extends ILocationRepository {
    constructor() {
        super();
        this.locations = [
            new Location({
                id: "600000000000000000000031",
                name: "Hospital Central",
                street: "Av. Santa Fe",
                number: 1234,
                city: "Buenos Aires",
                state: "Buenos Aires"
            }),
            new Location({
                id: "600000000000000000000032",
                name: "Clínica Norte",
                street: "Cabildo",
                number: 450,
                city: "Buenos Aires",
                state: "Buenos Aires"
            }),
            new Location({
                id: "600000000000000000000033",
                name: "Consultorios Belgrano",
                street: "Monroe",
                number: 121,
                city: "Buenos Aires",
                state: "Buenos Aires"
            })
        ];
    }

    async findById(id) {
        return this.locations.find(
            location => location.id === id && !location.deletedAt
        ) || null;
    }

    async findAll(filters = {}) {
        return this.locations.filter(location => {
            if (location.deletedAt) return false;
            return Object.entries(filters).every(
                ([key, value]) => location[key] === value
            );
        });
    }

    async exists(filter, excludeId = null) {
        return this.locations.some(location => {
            if (location.deletedAt) return false;
            if (excludeId && location.id === excludeId) return false;
            return Object.entries(filter).every(
                ([key, value]) => location[key] === value
            );
        });
    }

    async save(newLocation) {
        const location = new Location({
            id: IdUtils.generateId(),
            name: newLocation.name,
            street: newLocation.street,
            number: newLocation.number,
            city: newLocation.city,
            state: newLocation.state
        });

        this.locations.push(location);
        return location.id;
    }

    async update(locationToUpdate) {
        const location = await this.findById(locationToUpdate.id);
        if (!location) return null;

        location.name = locationToUpdate.name;
        location.street = locationToUpdate.street;
        location.number = locationToUpdate.number;
        location.city = locationToUpdate.city;
        location.state = locationToUpdate.state;

        return location;
    }

    async delete(id) {
        const location = await this.findById(id);
        if (!location) return null;
        location.deletedAt = new Date();
        return location;
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}