import { RepositoryFactory } from "../factories/repository.factory.js";
import { AlreadyExistsError, NotFoundError } from "../errors/domain.errors.js";
import { Practice } from "../domain/practice.js";

export class PracticeService {
    constructor({ practiceRepository = RepositoryFactory.getPracticeRepository() } = {}) {
        this.practiceRepository = practiceRepository;
    }

    async getAll() {
        return this.practiceRepository.findAll();
    }

    async getById(id) {
        const practice = await this.practiceRepository.findById(id);
        if (!practice) throw new NotFoundError("Práctica", id);
        return practice;
    }

    async create(practiceData) {
        const exists = await this.practiceRepository.exists({ name: practiceData.name });
        if (exists) throw new AlreadyExistsError({ entity: "Práctica", identifier: "nombre", value: practiceData.name });
        const newPractice = new Practice(practiceData);
        return await this.practiceRepository.save(newPractice);
    }

    async update(practiceData) {
        await this.getById(practiceData.id);
        return await this.practiceRepository.update(new Practice(practiceData));
    }

    async delete(practiceId) {
        const practice = await this.getById(practiceId);
        return await this.practiceRepository.delete(practice.id);
    }

    async getOptions() {
        return await this.practiceRepository.getOptions();
    }


}