import { matchedData } from "express-validator";
import { PatientService } from "../services/patient.service.js";

export class PatientController {
    constructor({ patientService = new PatientService() } = {}) {
            this.patientService = patientService;
        }

    async create(req, res, next) {
        const patientData = matchedData(req);
        return this.patientService.create(patientData)
            .then(patientId => res.status(201).json({ id: patientId }))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id } = matchedData(req);
        return this.patientService.delete(id)
            .then(deletedPatient => res.status(204).json({ patient: deletedPatient }))
            .catch(next);
    }

    async update(req, res, next) {
        const patientData = matchedData(req);
        return this.patientService.update(patientData)
            .then(user => res.status(200).json(user))
            .catch(next);
    }

    async getAll(req, res, next) {
        return this.patientService.getAll()
            .then(patients => res.status(200).json(patients))
            .catch(next);
    }

    async getById(req, res, next) {
        const { id } = matchedData(req);
        return this.patientService.getById(id)
            .then(patient => res.status(200).json(patient))
            .catch(next);
    }
}