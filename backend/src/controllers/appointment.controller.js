import { matchedData } from "express-validator";
import { RescheduleProposalStatus } from "../enums/appointment-status.enum.js";
import { Role } from "../enums/role.enum.js";
import { RoleResolverFactory } from "../factories/role.factory.js";
import { AppointmentSearchService } from "../services/appointment-search.service.js";
import { AppointmentService } from "../services/appointment.service.js";

export class AppointmentController {
    constructor({
        appointmentService = new AppointmentService(),
        appointmentSearchService = new AppointmentSearchService()
    } = {}) {
        this.appointmentService = appointmentService;
        this.appointmentSearchService = appointmentSearchService;
    }

    async getAll(req, res, next) {
        const filters = matchedData(req, { locations: ['query'] });
        const idKey = RoleResolverFactory.getEntityIdKey(req.user.role);
        if (idKey) filters[idKey] = req.user[idKey];

        return this.appointmentService.getAll(filters)
            .then(appointments => res.status(200).json(appointments))
            .catch(next);
    }

    async getById(req, res, next) {
        const { id } = matchedData(req);
        return this.appointmentService.getById(id, req.user)
            .then(appointment => res.status(200).json(appointment))
            .catch(next);
    }

    async book(req, res, next) {
        const matchedObj = matchedData(req);
        const bookingsData = Object.values(matchedObj);
        const { patientId } = req.user;

        const bookingsWithPatient = bookingsData.map(data => ({ ...data, patientId }));
        return this.appointmentService.book(bookingsWithPatient)
            .then(result => {
                if (typeof result === "string") {
                    return res.status(201).json({ status: "Booked", id: result });
                }
                return res.status(201).json({ status: "Booked", ...result });
            })
            .catch(next);
    }

    async patch(req, res, next) {
        const { id, ...patchData } = matchedData(req);
        return this.appointmentService.patch(id, patchData, req.user)
            .then(result => res.status(200).json(result))
            .catch(next);
    }

    async delete(req, res, next) {
        const { id, reason } = matchedData(req);
        return this.appointmentService.cancel({ id, reason, user: req.user })
            .then(() => res.status(200).json({ status: "Canceled" }))
            .catch(next);
    }

    async searchAvailableSlots(req, res, next) {
        const filters = matchedData(req);
        const { patientId, role, doctorId } = req.user;
        if (role === Role.DOCTOR) filters.doctorIds = [doctorId];
        else filters.doctorIds = filters.doctorIds || [];
        filters.locationIds = filters.locationIds || [];
        return this.appointmentSearchService.calculateAppointmentSlots(filters, patientId)
            .then(result => res.status(200).json(result))
            .catch(next);
    }

    async updateRescheduleProposal(req, res, next) {
        const { id, status, reason } = matchedData(req);

        const action = status === RescheduleProposalStatus.ACCEPTED
            ? this.appointmentService.acceptReschedule(id, req.user)
            : this.appointmentService.rejectReschedule(id, req.user, reason);

        return action
            .then(result => res.status(200).json(result))
            .catch(next);
    }
}