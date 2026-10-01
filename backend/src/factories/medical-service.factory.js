import { ServiceType } from "../enums/service-type.enum.js";
import { SpecialtyService } from "../services/specialty.service.js";
import { PracticeService } from "../services/practice.service.js";

export class MedicalServiceFactory {
    constructor({
        specialtyService = new SpecialtyService(),
        practiceService = new PracticeService()
    } = {}) {
        this.services = {
            [ServiceType.SPECIALTY]: specialtyService,
            [ServiceType.PRACTICE]: practiceService
        };
    }

    getService(type) {
        const service = this.services[type];
        if (!service) throw new Error(`Tipo de servicio médico no reconocido: ${type}`);
        return service;
    }

    async getMedicalService(type, serviceId) {
        const service = this.getService(type);
        return await service.getById(serviceId);
    }
}
