import { HealthInsuranceService }from "../services/health-insurance.service.js";
import { matchedData } from "express-validator";

export class HealthInsuranceController {

    constructor({healthInsuranceService =new HealthInsuranceService()} = {}) {
        this.healthInsuranceService = healthInsuranceService;
    }

    async getAll(_req, res, next) {
        return await this.healthInsuranceService.getAll()
        .then(healthInsurances => res.status(200).json(healthInsurances))
        .catch(next);
    }

    async getById(req, res, next) {
        const { id } = matchedData(req);
        return this.healthInsuranceService.getById(id)
            .then(healthInsurance => res.status(200).json(healthInsurance))
            .catch(next);
    }

    async create(req, res, next) {
        const healthInsuranceData = matchedData(req);
        return this.healthInsuranceService.create(healthInsuranceData)
            .then(healthInsuranceId => res.status(201).json({ id: healthInsuranceId }))
            .catch(next);
    }

    async update(req, res, next) {
        const healthInsuranceData = matchedData(req);
        return this.healthInsuranceService.update(healthInsuranceData)
            .then(healthInsurance => res.status(200).json(healthInsurance))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id } = matchedData(req);
        return this.healthInsuranceService.delete(id)
            .then(deletedHealthInsurance => res.status(204).json({ healthInsurance: deletedHealthInsurance }))
            .catch(next);
    }
}