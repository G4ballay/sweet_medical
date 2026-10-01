import { matchedData } from "express-validator";
import { DoctorService } from "../services/doctor.service.js";
import { ServiceType } from "../enums/service-type.enum.js";

export class DoctorController {
    constructor({ doctorService = new DoctorService() } = {}) {
        this.doctorService = doctorService;
    }

    async create(req, res, next) {
        const doctorData = matchedData(req);
        return this.doctorService.create(doctorData)
            .then(doctorId => res.status(201).json({ id: doctorId }))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id } = matchedData(req);
        return this.doctorService.delete(id)
            .then(deletedDoctor => res.status(204).json({ doctor: deletedDoctor }))
            .catch(next);
    }

    async update(req, res, next) {
        const doctorData = matchedData(req);
        return this.doctorService.update(doctorData)
            .then(doctor => res.status(200).json(doctor))
            .catch(next);
    }

    async getAll(req, res, next) {
        const filters = matchedData(req, { locations: ['query'] });
        return this.doctorService.getAll(filters)
            .then(doctors => res.status(200).json(doctors))
            .catch(next);
    }

    async getById(req, res, next) {
        const { id } = matchedData(req);
        return this.doctorService.getById(id)
            .then(doctor => res.status(200).json(doctor))
            .catch(next);
    }

    async updateAvailabilities(req, res, next) {
        const doctorData = matchedData(req);
        return this.doctorService.updateAvailabilities(doctorData)
            .then(doctor => res.status(200).json(doctor))
            .catch(next);
    }

    async getPractices(req, res, next) {
        const { id } = matchedData(req);
        return this.doctorService.getServices(id, ServiceType.PRACTICE)
            .then(practices => res.status(200).json(practices))
            .catch(next);
    }

    async updatePractices(req, res, next) {
        const { id, practiceIds } = matchedData(req);
        return this.doctorService.updateServices({ id, serviceType: ServiceType.PRACTICE, serviceIds: practiceIds })
            .then(doctor => res.status(200).json(doctor))
            .catch(next);
    }

    async getSpecialties(req, res, next) {
        const { id } = matchedData(req);
        return this.doctorService.getServices(id, ServiceType.SPECIALTY)
            .then(specialties => res.status(200).json(specialties))
            .catch(next);
    }

    async updateSpecialties(req, res, next) {
        const { id, specialtyIds } = matchedData(req);
        return this.doctorService.updateServices({ id, serviceType: ServiceType.SPECIALTY, serviceIds: specialtyIds })
            .then(doctor => res.status(200).json(doctor))
            .catch(next);
    }
}