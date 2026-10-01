import { Doctor } from "../../domain/doctor.js";
import { IDoctorRepository } from "../interfaces/doctor.repository.interface.js";
import { DoctorModel } from "./models/doctor.model.js";

export class DoctorMongoRepository extends IDoctorRepository {

    #toDomain(dbDoctor) {
        if (!dbDoctor) return null;
        return new Doctor({
            id: dbDoctor._id.toString(),
            userId: dbDoctor.userId.toString(),
            registration: dbDoctor.registration,
            name: dbDoctor.name,
            services: Object.fromEntries(
                Object.entries(dbDoctor.services || {}).map(([serviceType, serviceIds]) => [
                    serviceType, serviceIds.map(id => id.toString())
                ])
            ),
            locationIds: dbDoctor.locationIds?.map(id => id.toString()) || [],
            availabilities: dbDoctor.availabilities || []
        });
    }

    async save(doctor) {
        const newDoctor = await DoctorModel.create({
            userId: doctor.userId,
            registration: doctor.registration,
            name: doctor.name,
            services: doctor.services,
            locationIds: doctor.locationIds,
            availabilities: doctor.availabilities
        });
        return newDoctor._id.toString();
    }

    async exists(filters = {}) {
        const mongoQuery = {};
        Object.entries(filters).forEach(([key, value]) => {
            mongoQuery.$or = mongoQuery.$or || [];
            if (Array.isArray(value)) mongoQuery.$or.push({ [key]: { $in: value } });
            else mongoQuery.$or.push({ [key]: value });
        })
        const doctor = await DoctorModel.exists(mongoQuery);
        return doctor !== null;
    }

    async findById(idDoctor) {
        const doc = await DoctorModel.findById(idDoctor).lean();
        return this.#toDomain(doc);
    }

    async findAll(filters = {}) {
        const query = { deletedAt: null };
        if (filters.userId) query.userId = filters.userId;
        if (filters.registration) query.registration = filters.registration;
        if (filters.doctorIds?.length) query._id = { $in: filters.doctorIds };
        if (filters.locationIds?.length) query.locationIds = { $in: filters.locationIds };
        if (filters.serviceType && filters.serviceId) {
            query[`services.${filters.serviceType}`] = filters.serviceId;
        }

        const docs = await DoctorModel.find(query).lean();
        return docs.map(d => this.#toDomain(d));
    }

    async delete(idDoctor) {
        const doc = await DoctorModel.findByIdAndUpdate(idDoctor, {
            deletedAt: new Date()
        }, { new: true }).lean();
        return this.#toDomain(doc);
    }

    async update(doctorToUpdate) {
        const { id, ...data } = doctorToUpdate;
        const updated = await DoctorModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    name: data.name,
                    services: data.services,
                    locationIds: data.locationIds,
                    availabilities: data.availabilities
                }
            },
            { new: true }
        ).lean();
        return this.#toDomain(updated);
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}