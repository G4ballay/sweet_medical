import { RepositoryFactory } from "../factories/repository.factory.js";
import { NotFoundError } from "../errors/domain.errors.js";
import { Location } from "../domain/location.js";

export class LocationService {
    constructor({ locationRepository = RepositoryFactory.getLocationRepository() } = {}) {
        this.locationRepository = locationRepository;
    }

    #toDto(location) {
        return {
            id: location.id,
            name: location.name,
            fullAddress: location.fullAddress
        };
    }

    #buildDuplicateFilter(locationData) {
        return {
            name: locationData.name,
            street: locationData.street,
            number: locationData.number,
            city: locationData.city,
            state: locationData.state
        };
    }

    async getById(id) {
        const location = await this.locationRepository.findById(id);
        if (!location) throw new NotFoundError("Ubicación",id);
        return this.#toDto(location);
    }

    async getAll() {
        const locations = await this.locationRepository.findAll();
        return locations.map(location => this.#toDto(location));
    }

    async create(locationData) {

        const exists = await this.locationRepository.exists( this.#buildDuplicateFilter(locationData));
        if (exists) {
            throw new AlreadyExistsError({
                entity: "Ubicación",
                identifier: "Dirección",
                value: locationData.fullAddress
            });
        }

        return await this.locationRepository.save(
            new Location(locationData)
        );
    }

    async update(locationData) {

        await this.getById(locationData.id);

        const exists =
            await this.locationRepository.exists(
                this.#buildDuplicateFilter(locationData)
            );

        if (exists) {
            throw new AlreadyExistsError({
                entity: "Ubicación",
                identifier: "Dirección",
                value: locationData.fullAddress
            });
        }

        const updated =
            await this.locationRepository.update(
                new Location(locationData)
            );

        return this.#toDto(updated);
    }

    async delete(id) {

        await this.getById(id);

        const deleted =
            await this.locationRepository.delete(id);

        return this.#toDto(deleted);
    }
}