import { CoverageLevel } from "../enums/coverage-level.enum.js";
import { ServiceType } from "../enums/service-type.enum.js";

export class HealthInsurance {
    constructor({ id, name, plans = [] }) {
        this.id = id;
        this.name = name;
        this.plans = plans.map(p => p instanceof Plan ? p : new Plan(p));
    }

    getPlan(planId) {
        return this.plans.find(plan => plan.id === planId) || null;
    }
}

class BaseCoverageStrategy {
    constructor(coverages, idField) {
        this.coverages = coverages;
        this.coverageMap = new Map(
            coverages.map(c => [c[idField]?.toString(), c.level || CoverageLevel.NOT_COVERED])
        );
    }

    getCoverageLevel(service) {
        if (!service || !service.name) return CoverageLevel.NOT_COVERED;
        return this.coverageMap.get(service.id) || CoverageLevel.NOT_COVERED;
    }
}

export class SpecialtyCoverageStrategy extends BaseCoverageStrategy {
    constructor(coverages = []) {
        super(coverages, 'specialtyId');
    }
}

export class PracticeCoverageStrategy extends BaseCoverageStrategy {
    constructor(coverages = []) {
        super(coverages, 'practiceId');
    }
}

export class Plan {
    constructor({ id, name, specialtyCoverages = [], practiceCoverages = [] }) {
        this.id = id;
        this.name = name;
        this.specialtyCoverages = specialtyCoverages;
        this.practiceCoverages = practiceCoverages;

        Object.defineProperty(this, 'coverageStrategies', {
            enumerable: false,
            configurable: false,
            value: {
                [ServiceType.SPECIALTY]: new SpecialtyCoverageStrategy(specialtyCoverages),
                [ServiceType.PRACTICE]: new PracticeCoverageStrategy(practiceCoverages),
            }
        });
    }

    getCoverage(serviceType, service) {
        const strategy = this.coverageStrategies[serviceType];
        if (strategy) return strategy.getCoverageLevel(service);
        return CoverageLevel.NOT_COVERED;
    }
}