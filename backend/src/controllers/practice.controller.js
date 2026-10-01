import { matchedData } from "express-validator";
import { PracticeService } from "../services/practice.service.js";

export class PracticeController {
    constructor({ practiceService = new PracticeService() } = {}) {
        this.practiceService = practiceService;
    }

    async create(req, res, next) {
        const practiceData = matchedData(req);
        return this.practiceService.create(practiceData)
            .then(practiceId => res.status(201).json({ id: practiceId }))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id } = matchedData(req);
        return this.practiceService.delete(id)
            .then(deletedPractice => res.status(204).json({ practice: deletedPractice }))
            .catch(next);
    }

    async update(req, res, next) {
        const practiceData = matchedData(req);
        return this.practiceService.update(practiceData)
            .then(practice => res.status(200).json(practice))
            .catch(next);
    }

    async getAll(req, res, next) {
        return this.practiceService.getAll()
            .then(practices => res.status(200).json(practices))
            .catch(next);
    }

    async getById(req, res, next) {
        const { id } = matchedData(req);
        return this.practiceService.getById(id)
            .then(practice => res.status(200).json(practice))
            .catch(next);
    }

    async getOptions(req, res,next) {
        return this.practiceService.getOptions()
        .then(options => res.status(200).json(options))
        .catch(next);
    }
}