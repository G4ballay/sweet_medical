import { RepositoryFactory } from "../factories/repository.factory.js";
import { AlreadyExistsError, NotFoundError } from "../errors/domain.errors.js";
import { Specialty } from "../domain/specialty.js";

export class SpecialtyService {
    constructor({ specialtyRepository = RepositoryFactory.getSpecialtyRepository() } = {}) {
        this.specialtyRepository = specialtyRepository;
    }

    async getAll() {
        return await this.specialtyRepository.findAll();
    }

    async getById(id) {
        const specialty = await this.specialtyRepository.findById(id);
        if (!specialty) throw new NotFoundError("Especialidad", id);
        return specialty;
    }

    async create(specialtyData) {
        const exists = await this.specialtyRepository.exists({ name: specialtyData.name });
        if (exists) throw new AlreadyExistsError({ entity: "Especialidad", identifier: "nombre", value: specialtyData.name });
        const newSpecialty = new Specialty(specialtyData);
        return await this.specialtyRepository.save(newSpecialty);
    }

    async update(specialtyData) {
        await this.getById(specialtyData.id);
        return await this.specialtyRepository.update(new Specialty(specialtyData));
    }

    async delete(specialtyId) {
        const specialty = await this.getById(specialtyId);
        return await this.specialtyRepository.delete(specialty.id);
    }

    async getOptions() {
        return await this.specialtyRepository.getOptions();
    }
}