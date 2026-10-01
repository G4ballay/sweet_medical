import { HealthInsurance, Plan } from "../../domain/health-insurance.js";
import { IHealthInsuranceRepository } from "../interfaces/health-insurance.repository.interface.js";
import { HealthInsuranceModel } from "./models/health-insurance.model.js";

export class HealthInsuranceMongoRepository extends IHealthInsuranceRepository {

    #toDomain(dbHealthInsurance) {
        if (!dbHealthInsurance) { return null; }
        return new HealthInsurance({
            id: dbHealthInsurance._id.toString(),
            name: dbHealthInsurance.name,
            plans: dbHealthInsurance.plans.map(
                plan => new Plan({
                    id: plan._id.toString(),
                    name: plan.name,
                    specialtyCoverages: Array.isArray(plan.specialtyCoverages)
                        ? plan.specialtyCoverages : [],

                    practiceCoverages: Array.isArray(plan.practiceCoverages)
                        ? plan.practiceCoverages : []
                })
            )
        });
    }

    async findById(id) {
        const doc = await HealthInsuranceModel.findOne({ _id: id, deletedAt: null }).lean();
        return this.#toDomain(doc);
    }

    async findAll(filters = {}) {
        const query = { deletedAt: null, ...filters };
        const docs = await HealthInsuranceModel.find(query).lean();
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
        const insurance = await HealthInsuranceModel.exists(mongoQuery);
        return insurance !== null;
    }

    async save(newHealthInsurance) {
        const saved = await HealthInsuranceModel.create({
            name: newHealthInsurance.name,
            plans: newHealthInsurance.plans.map(plan => ({
                name: plan.name,
                specialtyCoverages: plan.specialtyCoverages,
                practiceCoverages: plan.practiceCoverages
            }))
        });
        return saved._id.toString();
    }

    async update(healthInsuranceToUpdate) {
        const { id, ...data } = healthInsuranceToUpdate;
        const updated = await HealthInsuranceModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    name: data.name,
                    plans: data.plans.map(plan => ({
                        _id: plan.id,
                        name: plan.name,
                        specialtyCoverages: plan.specialtyCoverages,
                        practiceCoverages: plan.practiceCoverages
                    }))
                }
            },
            { new: true }
        ).lean();
        return this.#toDomain(updated);
    }

    async delete(id) {
        const deleted = await HealthInsuranceModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).lean();
        return this.#toDomain(deleted);
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}
