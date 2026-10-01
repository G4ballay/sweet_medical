import mongoose, { Schema } from "mongoose";

const patientSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    documentNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    planId: { type: Schema.Types.ObjectId, required: true },
    healthInsuranceId: { type: Schema.Types.ObjectId, ref: 'HealthInsurance', required: true },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true
})

export const PatientModel = mongoose.model('Patient', patientSchema);