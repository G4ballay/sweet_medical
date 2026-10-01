import { HealthInsurance, Plan } from "../../domain/health-insurance.js";
import { IHealthInsuranceRepository } from "../interfaces/health-insurance.repository.interface.js";
import { IdUtils } from "../../utils/id.utils.js";

export class HealthInsuranceMemoryRepository extends IHealthInsuranceRepository {
    constructor() {
        super();
        this.healthInsurances = [
            new HealthInsurance({
                id: '600000000000000000000061',
                name: 'OSDE',
                plans: [
                    new Plan({
                        id: '600000000000000000000071',
                        name: 'Plan 210',
                        specialtyCoverages: [
                            { specialtyId: '600000000000000000000041', level: 'FULL' }, // Cardiología
                            { specialtyId: '600000000000000000000042', level: 'PARTIAL' } // Dermatología
                        ],
                        practiceCoverages: [
                            { practiceId: '600000000000000000000052', level: 'FULL' } // Radiografía
                        ]
                    }),
                    new Plan({
                        id: '600000000000000000000072',
                        name: 'Plan 310',
                        specialtyCoverages: [
                            { specialtyId: '600000000000000000000044', level: 'FULL' } // Traumatología
                        ],
                        practiceCoverages: [
                            { practiceId: '600000000000000000000054', level: 'FULL' } // Resonancia
                        ]
                    })
                ]
            }),
            new HealthInsurance({
                id: '600000000000000000000062',
                name: 'Swiss Medical',
                plans: [
                    new Plan({
                        id: '600000000000000000000073',
                        name: 'SMG20',
                        specialtyCoverages: [
                            { specialtyId: '600000000000000000000043', level: 'FULL' } // Pediatría
                        ],
                        practiceCoverages: [
                            { practiceId: '600000000000000000000051', level: 'FULL' } // Análisis de sangre / Laboratorio
                        ]
                    })
                ]
            })
        ];
    }

    async findById(id) {
        return this.healthInsurances.find(
            healthInsurance =>
                healthInsurance.id === id &&
                !healthInsurance.deletedAt
        ) || null;
    }

    async findAll(filters = {}) {
        return this.healthInsurances.filter(
            healthInsurance => {
                if (healthInsurance.deletedAt) return false;
                return Object.entries(filters)
                    .every(([key, value]) => healthInsurance[key] === value);
            }
        );
    }

    async exists(filter, excludeId = null) {
        return this.healthInsurances.some(
            healthInsurance => {
                if (healthInsurance.deletedAt) return false;
                if (excludeId && healthInsurance.id === excludeId) return false;
                return Object.entries(filter)
                    .every(([key, value]) => healthInsurance[key] === value);
            }
        );
    }

    async save(newHealthInsurance) {
        const healthInsurance = new HealthInsurance({
            id: IdUtils.generateId(),
            name: newHealthInsurance.name,
            plans: newHealthInsurance.plans
        });

        this.healthInsurances.push(healthInsurance);
        return healthInsurance.id;
    }

    async update(healthInsuranceToUpdate) {
        const healthInsurance = await this.findById(healthInsuranceToUpdate.id);
        if (!healthInsurance) return null;

        healthInsurance.name = healthInsuranceToUpdate.name;
        healthInsurance.plans = healthInsuranceToUpdate.plans;

        return healthInsurance;
    }

    async delete(id) {
        const healthInsurance = await this.findById(id);
        if (!healthInsurance) return null;

        healthInsurance.deletedAt = new Date();
        return healthInsurance;
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}