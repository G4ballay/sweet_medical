import mongoose from "mongoose";

const specialtySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    cost: { type: Number, required: true },
    durationInMins: { type: Number, required: true },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true
});

export const SpecialtyModel = mongoose.model('Specialty', specialtySchema);
