import { Specialty } from "../../domain/specialty.js";
import { IServiceRepository } from "../interfaces/service.repository.interface.js";
import { IdUtils } from "../../utils/id.utils.js";

export class SpecialtyMemoryRepository extends IServiceRepository {
    constructor() {
        super();
        this.specialties = [
            new Specialty({ id: "600000000000000000000041", name: "Cardiologia", durationInMins: 45, cost: 5000 }),
            new Specialty({ id: "600000000000000000000042", name: "Dermatologia", durationInMins: 30, cost: 4000 }),
            new Specialty({ id: "600000000000000000000043", name: "Pediatria", durationInMins: 40, cost: 4500 }),
            new Specialty({ id: "600000000000000000000044", name: "Traumatologia", durationInMins: 35, cost: 4200 })
        ];
    }

    findById(id) {
        return this.specialties.find(specialty => specialty.id === id) || null;
    }

    findAll({ name } = {}) {
        return this.specialties.filter(specialty => !name || specialty.name.includes(name));
    }

    exists({ name } = {}) {
        return this.specialties.some(specialty => !name || specialty.name === name);
    }

    save(specialty) {
        if (!specialty.id)
            specialty.id = IdUtils.generateId();
        this.specialties.push(specialty)
        return specialty.id;
    }

    delete(specialtyId) {
        const index = this.specialties.findIndex(specialty => specialty.id === specialtyId)
        let specialtyToDelete = null
        if (index !== -1) {
            specialtyToDelete = this.specialties[index]
            this.specialties.splice(index, 1);
        }
        return specialtyToDelete;
    }

    update(specialtyToUpdate) {
        const index = this.specialties.findIndex(specialty => specialty.id === specialtyToUpdate.id)
        if (index === -1) return null
        this.specialties[index] = specialtyToUpdate
        return specialtyToUpdate
    }

    getOptions() {
        return this.specialties.map(specialty => ({ id: specialty.id, name: specialty.name }));
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}