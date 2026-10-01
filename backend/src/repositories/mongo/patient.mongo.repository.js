import { Patient } from "../../domain/patient.js";
import { IPatientRepository } from "../interfaces/patient.repository.interface.js";
import { PatientModel } from "./models/patient.model.js";

export class PatientMongoRepository extends IPatientRepository {

    #toDomain(dbPatient) {
        if (!dbPatient) return null;
        return new Patient({
            id: dbPatient._id.toString(),
            userId: dbPatient.userId.toString(),
            name: dbPatient.name,
            documentNumber: dbPatient.documentNumber,
            healthInsuranceId: dbPatient.healthInsuranceId.toString(),
            planId: dbPatient.planId.toString()
        });
    }

    async findById(idPatient) {
        const doc = await PatientModel.findOne({
            _id: idPatient,
            deletedAt: null
        }).lean();
        return this.#toDomain(doc);
    }

    async findAll(filters = {}) {
        const query = {
            deletedAt: null,
            ...filters
        };
        const docs = await PatientModel
            .find(query)
            .lean();
        return docs.map(doc => this.#toDomain(doc));
    }

    async exists(filters = {}, excludeId = null) {
        const mongoQuery = {};
        Object.entries(filters).forEach(([key, value]) => {
            mongoQuery.$or = mongoQuery.$or || [];
            if (Array.isArray(value)) mongoQuery.$or.push({ [key]: { $in: value } });
            else mongoQuery.$or.push({ [key]: value });
        })
        if (excludeId) mongoQuery._id = { $ne: excludeId };
        const patients = await PatientModel.exists(mongoQuery);
        return patients !== null;
    }

    async save(newPatient) {
        const savedPatient = await PatientModel.create({
            userId: newPatient.userId,
            name: newPatient.name,
            documentNumber: newPatient.documentNumber,
            healthInsuranceId: newPatient.healthInsuranceId,
            planId: newPatient.planId
        });
        return savedPatient._id.toString();
    }

    async delete(idPatient) {
        const patient = await PatientModel.findByIdAndUpdate(
            idPatient,
            {
                deletedAt: new Date()
            },
            { new: true }
        ).lean();
        return this.#toDomain(patient);
    }

    async update(patientToUpdate) {
        const { id, ...data } = patientToUpdate;
        const patientUpdated = await PatientModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    userId: data.userId,
                    name: data.name,
                    documentNumber: data.documentNumber,
                    healthInsuranceId: data.healthInsuranceId,
                    planId: data.planId
                }
            },
            { new: true }
        ).lean();
        return this.#toDomain(patientUpdated);
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}