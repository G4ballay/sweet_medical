import mongoose, { Schema } from "mongoose";

const statusChangeSchema = new mongoose.Schema({
    entryDateTime: { type: Date, default: Date.now },
    status: { type: String, required: true },
    previousStatus: { type: String, default: null },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    userId: { type: String },
    reason: { type: String }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    serviceType: { type: String, required: true },
    serviceId: { type: String, required: true },
    status: { type: String, required: true },
    statusHistory: [statusChangeSchema],
    cost: { type: Number, default: 0 },
    proposedStartTime: { type: Date, default: null },
    proposedEndTime: { type: Date, default: null },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true
});

export const AppointmentModel = mongoose.model('Appointment', appointmentSchema);
