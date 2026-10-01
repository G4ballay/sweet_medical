import { Patient } from "../domain/patient.js";
import { AlreadyExistsError, NotFoundError } from "../errors/domain.errors.js";
import { RepositoryFactory } from "../factories/repository.factory.js";
import { HealthInsuranceService } from "./health-insurance.service.js";
import { UserService } from "./user.service.js";

export class PatientService {
    constructor({
        patientRepository = RepositoryFactory.getPatientRepository(),
        userService = new UserService(),
        healthInsuranceService = new HealthInsuranceService()
    } = {}) {
        this.patientRepository = patientRepository;
        this.userService = userService;
        this.healthInsuranceService = healthInsuranceService;
    }

    #validatePatientProperties = async (healthInsuranceId, planId, userId = null) => {
        const [healthInsurance, user] = await Promise.all([
            this.healthInsuranceService.getById(healthInsuranceId),
            userId ? this.userService.findById(userId) : null
        ]);
        const plan = healthInsurance.getPlan(planId);
        if (!plan) throw new NotFoundError("Plan", planId);
        return { healthInsurance, user };
    }

    #toDto(patient, healthInsurance) {
        if (!healthInsurance) {
            return {
                id: patient.id,
                name: patient.name,
                documentNumber: patient.documentNumber,
                userId: patient.userId,
                healthInsurance: null,
                plan: null
            };
        }
        const plan = healthInsurance.plans.find(p => p.id === patient.planId);
        return {
            id: patient.id,
            name: patient.name,
            documentNumber: patient.documentNumber,
            userId: patient.userId,
            healthInsurance: { id: healthInsurance.id, name: healthInsurance.name },

            plan: plan ? {
                id: plan.id,
                name: plan.name,
                specialtyCoverages: plan.coverageStrategies
                    .SPECIALTY?.coverages || [],
                practiceCoverages: plan.coverageStrategies
                    .PRACTICE?.coverages || []
            } : null
        };
    }

    async getAll(filters = {}) {
        const patients = await this.patientRepository.findAll(filters);
        const healthInsurances = await this.healthInsuranceService.getAll();
        return patients.map(patient => this.#toDto(patient, healthInsurances.find(h => h.id === patient.healthInsuranceId)));
    }

    async getById(id) {
        const patient = await this.patientRepository.findById(id);
        if (!patient) throw new NotFoundError("Paciente", id);

        const { healthInsurance } = await this.#validatePatientProperties(patient.healthInsuranceId, patient.planId);
        return this.#toDto(patient, healthInsurance);
    }

    async create(patientData) {
        const exists = await this.patientRepository.exists({ documentNumber: patientData.documentNumber, userId: patientData.userId });
        if (exists) { throw new AlreadyExistsError({ entity: "Paciente" }); }
        const { healthInsurance } = await this.#validatePatientProperties(patientData.healthInsuranceId, patientData.planId, patientData.userId);
        const newPatient = new Patient(patientData);
        await this.patientRepository.save(new Patient(patientData));
        return this.#toDto(newPatient, healthInsurance);
    }

    async update(patientData) {
        await this.getById(patientData.id);
        const { healthInsurance } = await this.#validatePatientProperties(patientData.healthInsuranceId, patientData.planId, patientData.userId);
        const updatedPatient = await this.patientRepository.update(new Patient(patientData));
        return this.#toDto(updatedPatient, healthInsurance);
    }

    async delete(patientId) {
        await this.getById(patientId);
        return await this.patientRepository.delete(patientId);
    }
}