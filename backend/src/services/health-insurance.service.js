import { CoverageLevel } from "../enums/coverage-level.enum.js";
import { AlreadyExistsError, NotFoundError } from "../errors/domain.errors.js";
import { RepositoryFactory } from "../factories/repository.factory.js";

export class HealthInsuranceService {
    constructor({ healthInsuranceRepository = RepositoryFactory.getHealthInsuranceRepository() } = {}) {
        this.healthInsuranceRepository = healthInsuranceRepository;
    }

    calculateFinalCost(baseCost, coverageLevel) {
        switch (coverageLevel) {
            case CoverageLevel.FULL: return 0;
            case CoverageLevel.PARTIAL: return baseCost * 0.5;
            case CoverageLevel.NOT_COVERED:
            default: return baseCost;
        }
    }

    async getById(id) {
        const insurance = await this.healthInsuranceRepository.findById(id);
        if (!insurance) throw new NotFoundError("Obra Social", id);
        return insurance;
    }

    async getAll() {
        return await this.healthInsuranceRepository.findAll();
    }

    async create(data) {
        const exists = await this.healthInsuranceRepository.exists({ name: data.name });
        if (exists) throw new AlreadyExistsError({ entity: 'Obra Social', identifier: 'Nombre', value: data.name });
        return await this.healthInsuranceRepository.save(new HealthInsurance(data));
    }

    async update(data) {
        await this.getById(data.id);
        const exists = await this.healthInsuranceRepository.exists({ name: data.name }, data.id);
        if (exists) throw new AlreadyExistsError({ entity: 'Obra Social', identifier: 'Nombre', value: data.name });
        return await this.healthInsuranceRepository.update(new HealthInsurance(data));
    }

    async delete(id) {
        await this.getById(id);
        return await this.healthInsuranceRepository.delete(id);
    }

    async getCoverageInfo(healthInsuranceId, planId, serviceType, service) {
        const healthInsurance = await this.healthInsuranceRepository.findById(healthInsuranceId);
        const coverageLevel = healthInsurance?.getPlan(planId)?.getCoverage(serviceType, service) ?? CoverageLevel.NOT_COVERED;
        return {
            coverageLevel,
            estimatedCost: this.calculateFinalCost(service.cost, coverageLevel)
        };
    }
}