import mongoose from "mongoose";

const specialtyCoverageSchema = new mongoose.Schema({
    specialtyId: { type: String, required: true },
    level: { type: String, required: true }
}, { _id: false });

const practiceCoverageSchema = new mongoose.Schema({
    practiceId: { type: String, required: true },
    level: { type: String, required: true }
}, { _id: false });

const planSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialtyCoverages: [specialtyCoverageSchema],
    practiceCoverages: [practiceCoverageSchema]
}, { _id: true });

const healthInsuranceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    plans: [planSchema],
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true
});

export const HealthInsuranceModel = mongoose.model('HealthInsurance', healthInsuranceSchema);
