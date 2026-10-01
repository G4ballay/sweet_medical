import { Patient } from "../../domain/patient.js";
import { IPatientRepository } from "../interfaces/patient.repository.interface.js";
import { IdUtils } from "../../utils/id.utils.js";

export class PatientMemoryRepository extends IPatientRepository {
    constructor() {
        super();
        this.patients = [
            new Patient({
                id: "600000000000000000000021",
                userId: "600000000000000000000003",
                documentNumber: "12345678",
                name: "Pedro Pérez",
                healthInsuranceId: "600000000000000000000061",
                planId: "600000000000000000000072"
            })
        ];
    }

    async findById(id) {
        return this.patients.find(
            patient => patient.id === id && !patient.deletedAt
        ) || null;
    }

    async findAll(filters = {}) {
        return this.patients.filter(patient => {
            if (patient.deletedAt) return false;
            return Object.entries(filters).every(
                ([key, value]) => patient[key] === value
            );
        });
    }

    async exists(filter) {
        return this.patients.some(patient => {
            if (patient.deletedAt) return false;
            return Object.entries(filter).every(
                ([key, value]) => patient[key] === value
            );
        });
    }

    async save(newPatient) {
        const patient = new Patient({
            id: IdUtils.generateId(),
            userId: newPatient.userId,
            documentNumber: newPatient.documentNumber,
            name: newPatient.name,
            healthInsuranceId: newPatient.healthInsuranceId,
            planId: newPatient.planId
        });

        this.patients.push(patient);
        return patient.id;
    }

    async update(patientToUpdate) {
        const patient = await this.findById(patientToUpdate.id);
        if (!patient) return null;

        patient.userId = patientToUpdate.userId;
        patient.documentNumber = patientToUpdate.documentNumber;
        patient.name = patientToUpdate.name;
        patient.healthInsuranceId = patientToUpdate.healthInsuranceId;
        patient.planId = patientToUpdate.planId;

        return patient;
    }

    async delete(id) {
        const patient = await this.findById(id);
        if (!patient) return null;
        patient.deletedAt = new Date();
        return patient;
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}