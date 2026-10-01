import { matchedData } from "express-validator";
import { SpecialtyService } from "../services/specialty.service.js";

export class SpecialtyController {
    constructor({ specialtyService = new SpecialtyService() } = {}) {
        this.specialtyService = specialtyService;
    }

    async create(req, res, next) {
        const specialtyData = matchedData(req);
        return this.specialtyService.create(specialtyData)
            .then(specialtyId => res.status(201).json({ id: specialtyId }))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id } = matchedData(req);
        return this.specialtyService.delete(id)
            .then(deletedSpecialty => res.status(204).json({ specialty: deletedSpecialty }))
            .catch(next);
    }

    async update(req, res, next) {
        const specialtyData = matchedData(req);
        return this.specialtyService.update(specialtyData)
            .then(specialty => res.status(200).json(specialty))
            .catch(next);
    }

    async getAll(req, res, next) {
        return this.specialtyService.getAll()
            .then(specialties => res.status(200).json(specialties))
            .catch(next);
    }

    async getById(req, res, next) {
        const { id } = matchedData(req);
        return this.specialtyService.getById(id)
            .then(specialty => res.status(200).json(specialty))
            .catch(next);
    }

    async getOptions(req, res,next) {
        return this.specialtyService.getOptions()
        .then(options => res.status(200).json(options))
        .catch(next);
    }


}