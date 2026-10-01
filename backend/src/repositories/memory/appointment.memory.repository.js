import { Appointment } from "../../domain/appointment.js";
import { ACTIVE_APPOINTMENT_STATUSES, AppointmentStatus } from "../../enums/appointment-status.enum.js";
import { ServiceType } from "../../enums/service-type.enum.js";
import { ArrayUtils } from "../../utils/array.utils.js";
import { DateUtils } from "../../utils/date.utils.js";
import { IdUtils } from "../../utils/id.utils.js";
import { IAppointmentRepository } from "../interfaces/appointment.repository.interface.js";

export class AppointmentMemoryRepository extends IAppointmentRepository {
    constructor() {
        super();
        this.appointments = [
            new Appointment({
                id: IdUtils.generateId(),
                doctorId: "600000000000000000000011",
                patientId: "600000000000000000000021",
                startTime: new Date("2026-05-01T13:00:00.000Z"),
                endTime: new Date("2026-05-01T13:15:00.000Z"),
                locationId: "600000000000000000000031",
                serviceType: ServiceType.PRACTICE,
                serviceId: "600000000000000000000051",
                status: AppointmentStatus.BOOKED,
                cost: 1000
            }),
        ];
    }

    save(appointment) {
        if (!appointment.id)
            appointment.id = IdUtils.generateId();

        this.appointments.push(appointment)
        return appointment.id;
    }

    update(appointmentToUpdate) {
        const index = this.appointments.findIndex(appointment => appointment.id === appointmentToUpdate.id)
        if (index === -1) return null
        this.appointments[index] = appointmentToUpdate
        return appointmentToUpdate
    }

    findById(id) {
        return this.appointments.find(appointment => appointment.id === id) || null
    }

    #matchesDateRange(app, range) {
        if (!range?.start && !range?.end) return true;
        return DateUtils.isTimeOverlap(app.startTime, app.endTime, range.start, range.end) ||
            DateUtils.isTimeOverlap(app.proposedStartTime, app.proposedEndTime, range.start, range.end);
    }

    findAll({ doctorId, patientId, status, onlyActive, dateRange } = {}, orderBy, orderDir) {
        const appointments = this.appointments.filter(app =>
            app.deletedAt === null &&
            (!doctorId || app.doctorId === doctorId) &&
            (!patientId || app.patientId === patientId) &&
            (onlyActive ? ACTIVE_APPOINTMENT_STATUSES.includes(app.status) : (!status || app.status === status)) &&
            this.#matchesDateRange(app, dateRange)
        );
        return ArrayUtils.sortObjects(appointments, orderBy, orderDir);
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}