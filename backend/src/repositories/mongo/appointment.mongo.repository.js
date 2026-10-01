import { Appointment } from "../../domain/appointment.js";
import { ACTIVE_APPOINTMENT_STATUSES } from "../../enums/appointment-status.enum.js";
import { OrderDirection, OrderFields } from "../../enums/orderables.enum.js";
import { IAppointmentRepository } from "../interfaces/appointment.repository.interface.js";
import { AppointmentModel } from "./models/appointment.model.js";

export class AppointmentMongoRepository extends IAppointmentRepository {

    #toDomain(dbAppointment) {
        if (!dbAppointment) return null;
        return new Appointment({
            id: dbAppointment._id.toString(),
            doctorId: dbAppointment.doctorId.toString(),
            patientId: dbAppointment.patientId.toString(),
            startTime: dbAppointment.startTime,
            endTime: dbAppointment.endTime,
            proposedStartTime: dbAppointment.proposedStartTime,
            proposedEndTime: dbAppointment.proposedEndTime,
            locationId: dbAppointment.locationId.toString(),
            serviceType: dbAppointment.serviceType,
            serviceId: dbAppointment.serviceId,
            status: dbAppointment.status,
            statusHistory: dbAppointment.statusHistory || [],
            cost: dbAppointment.cost,
            coverageLevel: dbAppointment.coverageLevel
        });
    }

    async save(appointment) {
        const saved = await AppointmentModel.create({
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            proposedStartTime: appointment.proposedStartTime,
            proposedEndTime: appointment.proposedEndTime,
            locationId: appointment.locationId,
            serviceType: appointment.serviceType,
            serviceId: appointment.serviceId,
            status: appointment.status,
            statusHistory: appointment.statusHistory,
            cost: appointment.cost
        });
        return saved._id.toString();
    }

    async findById(id) {
        const doc = await AppointmentModel.findById(id).lean();
        return this.#toDomain(doc);
    }

    async findAll(
        { doctorId, patientId, status, onlyActive, dateRange, skip, limit } = {},
        orderBy = OrderFields.DATE,
        orderDir = OrderDirection.ASC
    ) {
        const query = {
            deletedAt: null,
            ...(doctorId && { doctorId }),
            ...(patientId && { patientId }),
            ...(onlyActive
                ? { status: { $in: status && ACTIVE_APPOINTMENT_STATUSES.includes(status) ? [status] : ACTIVE_APPOINTMENT_STATUSES } }
                : status && { status }),
            ...((dateRange?.start || dateRange?.end) && {
                $or: [
                    {
                        ...(dateRange?.start && { endTime: { $gt: dateRange.start } }),
                        ...(dateRange?.end && { startTime: { $lt: dateRange.end } })
                    },
                    {
                        ...(dateRange?.start && { proposedEndTime: { $gt: dateRange.start } }),
                        ...(dateRange?.end && { proposedStartTime: { $lt: dateRange.end } })
                    }
                ]
            })
        };
        const docs = await AppointmentModel.find(query).sort({ [orderBy]: orderDir === OrderDirection.ASC ? 1 : -1 }).lean();
        return docs.map(d => this.#toDomain(d));
    }

    async update(appointmentToUpdate) {
        const { id, ...data } = appointmentToUpdate;
        const updated = await AppointmentModel.findByIdAndUpdate(id, {
            $set: {
                doctorId: data.doctorId,
                patientId: data.patientId,
                startTime: data.startTime,
                endTime: data.endTime,
                locationId: data.locationId,
                serviceType: data.serviceType,
                serviceId: data.serviceId,
                status: data.status,
                statusHistory: data.statusHistory,
                cost: data.cost,
                proposedStartTime: data.proposedStartTime,
                proposedEndTime: data.proposedEndTime
            }
        }, { new: true }).lean();
        return this.#toDomain(updated);
    }

    async delete(id) {
        const doc = await AppointmentModel.findByIdAndUpdate(id, {
            deletedAt: new Date()
        }, { new: true }).lean();
        return this.#toDomain(doc);
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}
