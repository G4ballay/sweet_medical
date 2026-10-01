import { AppointmentStatus } from "../enums/appointment-status.enum.js";
import { InvalidOperationError } from "../errors/domain.errors.js";
import { DateUtils } from "../utils/date.utils.js";

export class AppointmentStatusChange {
    constructor({ entryDateTime, status, previousStatus, appointmentId, userId, reason }) {
        this.entryDateTime = entryDateTime ? new Date(entryDateTime) : new Date();
        this.status = status;
        this.previousStatus = previousStatus;
        this.appointmentId = appointmentId;
        this.userId = userId;
        this.reason = reason;
    }
}

export class Appointment {
    constructor({ id, doctorId, patientId, startTime, endTime, proposedStartTime, proposedEndTime, locationId, serviceType, serviceId, status, statusHistory = [], cost, doctor = null, patient = null, location = null, service = null, coverageLevel = null }) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.startTime = new Date(startTime);
        this.endTime = new Date(endTime);
        this.proposedStartTime = proposedStartTime ? new Date(proposedStartTime) : null;
        this.proposedEndTime = proposedEndTime ? new Date(proposedEndTime) : null;
        this.locationId = locationId;
        this.serviceType = serviceType;
        this.serviceId = serviceId;
        this.status = status || AppointmentStatus.BOOKED;
        this.statusHistory = statusHistory.map(change =>
            change instanceof AppointmentStatusChange ? change : new AppointmentStatusChange(change)
        );
        this.cost = cost || 0;
        this.doctor = doctor;
        this.patient = patient;
        this.location = location;
        this.service = service;
        this.coverageLevel = coverageLevel;
    }

    updateStatus(newStatus, userId, reason = null) {
        const previousStatus = this.status;
        this.status = newStatus;
        this.statusHistory.push(new AppointmentStatusChange({
            status: newStatus,
            previousStatus,
            appointmentId: this.id,
            userId,
            reason
        }));
    }

    confirm(userId) {
        if (this.status === AppointmentStatus.CANCELLED)
            throw new InvalidOperationError("No se puede confirmar un turno cancelado.");
        this.updateStatus(AppointmentStatus.CONFIRMED, userId);
    }

    complete(userId) {
        if (this.status !== AppointmentStatus.CONFIRMED && this.status !== AppointmentStatus.BOOKED)
            throw new InvalidOperationError("Solo se pueden completar turnos vigentes.");
        this.updateStatus(AppointmentStatus.COMPLETED, userId);
    }

    cancel(userId, reason) {
        if (this.status === AppointmentStatus.CANCELLED)
            throw new InvalidOperationError("El turno ya se encuentra cancelado.");

        if (this.status === AppointmentStatus.COMPLETED)
            throw new InvalidOperationError("No se pueden cancelar turnos ya realizados.");

        const diffInHours = DateUtils.getDifferenceInHours(this.startTime);
        if (diffInHours < 1)
            throw new InvalidOperationError("Las cancelaciones requieren al menos 1 hora de anticipación.");

        this.updateStatus(AppointmentStatus.CANCELLED, userId, reason);
    }

    reschedule(newStartTime, newEndTime, userId, reason) {
        if (this.status === AppointmentStatus.CANCELLED || this.status === AppointmentStatus.COMPLETED)
            throw new InvalidOperationError("No se puede reprogramar un turno inactivo.");

        const diffInHours = DateUtils.getDifferenceInHours(this.startTime);
        if (diffInHours < 1)
            throw new InvalidOperationError("Las reprogramaciones requieren al menos 1 hora de anticipación.");

        this.startTime = new Date(newStartTime);
        this.endTime = new Date(newEndTime);
        this.proposedStartTime = null;
        this.proposedEndTime = null;
        this.updateStatus(AppointmentStatus.BOOKED, userId, `Reprogramado: ${reason}`);
    }

    proposeReschedule(proposedStart, proposedEnd, userId, reason) {
        if (this.status === AppointmentStatus.CANCELLED || this.status === AppointmentStatus.COMPLETED)
            throw new InvalidOperationError("No se puede proponer un cambio para un turno inactivo.");

        this.proposedStartTime = new Date(proposedStart);
        this.proposedEndTime = new Date(proposedEnd);
        this.updateStatus(AppointmentStatus.RESCHEDULE_PROPOSED, userId, reason);
    }

    acceptReschedule(userId) {
        if (this.status !== AppointmentStatus.RESCHEDULE_PROPOSED)
            throw new InvalidOperationError("No hay una propuesta de reprogramación pendiente.");

        this.startTime = this.proposedStartTime;
        this.endTime = this.proposedEndTime;
        this.proposedStartTime = null;
        this.proposedEndTime = null;
        this.updateStatus(AppointmentStatus.CONFIRMED, userId, "Reprogramación aceptada por el paciente.");
    }

    rejectReschedule(userId, reason) {
        if (this.status !== AppointmentStatus.RESCHEDULE_PROPOSED)
            throw new InvalidOperationError("No hay una propuesta de reprogramación pendiente para rechazar.");

        this.proposedStartTime = null;
        this.proposedEndTime = null;
        this.updateStatus(AppointmentStatus.BOOKED, userId, `Propuesta de reprogramación rechazada por el paciente: ${reason}`);
    }
}