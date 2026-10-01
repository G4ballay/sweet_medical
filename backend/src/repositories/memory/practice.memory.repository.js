import { Practice } from "../../domain/practice.js";
import { IServiceRepository } from "../interfaces/service.repository.interface.js";
import { IdUtils } from "../../utils/id.utils.js";

export class PracticeMemoryRepository extends IServiceRepository {
    constructor() {
        super();
        this.practices = [
            new Practice({ id: "600000000000000000000051", name: "Análisis de Sangre", durationInMins: 15, cost: 1000 }),
            new Practice({ id: "600000000000000000000052", name: "Radiografía de Tórax", durationInMins: 30, cost: 3000 }),
            new Practice({ id: "600000000000000000000053", name: "Consulta General", durationInMins: 20, cost: 2000 }),
            new Practice({ id: "600000000000000000000054", name: "Resonancia", durationInMins: 45, cost: 5000 })
        ];
    }

    findById(id) {
        return this.practices.find(practice => practice.id === id) || null;
    }

    findAll({ name } = {}) {
        return this.practices.filter(practice => !name || practice.name.includes(name));
    }

    exists({ name } = {}) {
        return this.practices.some(practice => !name || practice.name === name);
    }

    save(practice) {
        if (!practice.id)
            practice.id = IdUtils.generateId();
        this.practices.push(practice);
        return practice.id;
    }

    delete(practiceId) {
        const index = this.practices.findIndex(practice => practice.id === practiceId);
        let practiceToDelete = null;
        if (index !== -1) {
            practiceToDelete = this.practices[index];
            this.practices.splice(index, 1);
        }
        return practiceToDelete;
    }

    update(practiceToUpdate) {
        const index = this.practices.findIndex(practice => practice.id === practiceToUpdate.id);
        if (index === -1) return null;
        this.practices[index] = practiceToUpdate;
        return practiceToUpdate;
    }

    getOptions() {
        return this.practices.map(practice => ({ id: practice.id, name: practice.name }));
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}