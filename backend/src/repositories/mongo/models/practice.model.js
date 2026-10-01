import mongoose from "mongoose";

const practiceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    cost: { type: Number, required: true },
    durationInMins: { type: Number, required: true },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true
});

export const PracticeModel = mongoose.model('Practice', practiceSchema);