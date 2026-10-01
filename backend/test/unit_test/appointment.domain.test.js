import { Appointment, AppointmentStatusChange } from "../../src/domain/appointment.js";
import { AppointmentStatus } from "../../src/enums/appointment-status.enum.js";
import { ServiceType } from "../../src/enums/service-type.enum.js";
import { InvalidOperationError } from "../../src/errors/domain.errors.js";
import { DateUtils } from "../../src/utils/date.utils.js";
import { expect, jest, test, describe, afterEach } from "@jest/globals";
import { Types } from "mongoose";

// ─── IDs fijos ────────────────────────────────────────────────────────────────

const IDS = {
    appointment: new Types.ObjectId("507f1f77bcf86cd799439001"),
    doctor:      new Types.ObjectId("507f1f77bcf86cd799439002"),
    patient:     new Types.ObjectId("507f1f77bcf86cd799439003"),
    location:    new Types.ObjectId("507f1f77bcf86cd799439004"),
    service:     new Types.ObjectId("507f1f77bcf86cd799439005"),
    user:        new Types.ObjectId("507f1f77bcf86cd799439006"),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FUTURE_START = new Date("2030-01-01T10:00:00.000Z");
const FUTURE_END   = new Date("2030-01-01T10:15:00.000Z");

function makeAppointment(overrides = {}) {
    return new Appointment({
        id:          IDS.appointment,
        doctorId:    IDS.doctor,
        patientId:   IDS.patient,
        startTime:   FUTURE_START,
        endTime:     FUTURE_END,
        locationId:  IDS.location,
        serviceType: ServiceType.PRACTICE,
        serviceId:   IDS.service,
        status:      AppointmentStatus.BOOKED,
        cost:        1000,
        ...overrides,
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Appointment", () => {

    afterEach(() => jest.restoreAllMocks());

    // ── constructor ───────────────────────────────────────────────────────────

    describe("constructor", () => {

        test("debería crear el turno con los valores correctos", () => {
            const appointment = makeAppointment();

            expect(appointment.id).toStrictEqual(IDS.appointment);
            expect(appointment.doctorId).toStrictEqual(IDS.doctor);
            expect(appointment.patientId).toStrictEqual(IDS.patient);
            expect(appointment.startTime).toStrictEqual(FUTURE_START);
            expect(appointment.endTime).toStrictEqual(FUTURE_END);
            expect(appointment.status).toBe(AppointmentStatus.BOOKED);
            expect(appointment.cost).toBe(1000);
            expect(appointment.statusHistory).toStrictEqual([]);
        });

        test("debería usar BOOKED como status por defecto", () => {
            const appointment = makeAppointment({ status: undefined });
            expect(appointment.status).toBe(AppointmentStatus.BOOKED);
        });

        test("debería usar 0 como costo por defecto", () => {
            const appointment = makeAppointment({ cost: undefined });
            expect(appointment.cost).toBe(0);
        });

        test("debería mapear el historial a instancias de AppointmentStatusChange", () => {
            const history = [{
                status:         AppointmentStatus.CONFIRMED,
                previousStatus: AppointmentStatus.BOOKED,
                appointmentId:  IDS.appointment,
                userId:         IDS.user,
            }];
            const appointment = makeAppointment({ statusHistory: history });
            expect(appointment.statusHistory[0]).toBeInstanceOf(AppointmentStatusChange);
        });

        test("proposedStartTime y proposedEndTime deberían ser null si no se pasan", () => {
            const appointment = makeAppointment();
            expect(appointment.proposedStartTime).toBeNull();
            expect(appointment.proposedEndTime).toBeNull();
        });

    });

    // ── updateStatus ──────────────────────────────────────────────────────────

    describe("updateStatus", () => {

        test("debería actualizar el status y agregar una entrada al historial", () => {
            const appointment = makeAppointment();
            appointment.updateStatus(AppointmentStatus.CONFIRMED, IDS.user);

            expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);
            expect(appointment.statusHistory).toHaveLength(1);
            expect(appointment.statusHistory[0].status).toBe(AppointmentStatus.CONFIRMED);
            expect(appointment.statusHistory[0].previousStatus).toBe(AppointmentStatus.BOOKED);
            expect(appointment.statusHistory[0].userId).toStrictEqual(IDS.user);
        });

        test("debería registrar la razón en el historial si se pasa", () => {
            const appointment = makeAppointment();
            appointment.updateStatus(AppointmentStatus.CANCELLED, IDS.user, "Viaje");
            expect(appointment.statusHistory[0].reason).toBe("Viaje");
        });

    });

    // ── confirm ───────────────────────────────────────────────────────────────

    describe("confirm", () => {

        test("debería confirmar un turno BOOKED", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.BOOKED });
            appointment.confirm(IDS.user);
            expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);
        });

        test("debería lanzar InvalidOperationError si el turno está cancelado", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.CANCELLED });
            expect(() => appointment.confirm(IDS.user)).toThrow(InvalidOperationError);
        });

    });

    // ── complete ──────────────────────────────────────────────────────────────

    describe("complete", () => {

        test("debería completar un turno BOOKED", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.BOOKED });
            appointment.complete(IDS.user);
            expect(appointment.status).toBe(AppointmentStatus.COMPLETED);
        });

        test("debería completar un turno CONFIRMED", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.CONFIRMED });
            appointment.complete(IDS.user);
            expect(appointment.status).toBe(AppointmentStatus.COMPLETED);
        });

        test("debería lanzar InvalidOperationError si el turno está cancelado", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.CANCELLED });
            expect(() => appointment.complete(IDS.user)).toThrow(InvalidOperationError);
        });

        test("debería lanzar InvalidOperationError si el turno ya está completado", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.COMPLETED });
            expect(() => appointment.complete(IDS.user)).toThrow(InvalidOperationError);
        });

    });

    // ── cancel ────────────────────────────────────────────────────────────────

    describe("cancel", () => {

        test("debería cancelar el turno con suficiente anticipación", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);
            const appointment = makeAppointment();
            appointment.cancel(IDS.user, "Viaje");

            expect(appointment.status).toBe(AppointmentStatus.CANCELLED);
            expect(appointment.statusHistory[0].reason).toBe("Viaje");
        });

        test("debería lanzar InvalidOperationError si ya está cancelado", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);
            const appointment = makeAppointment({ status: AppointmentStatus.CANCELLED });
            expect(() => appointment.cancel(IDS.user, "Test")).toThrow(InvalidOperationError);
        });

        test("debería lanzar InvalidOperationError si el turno ya se completó", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);
            const appointment = makeAppointment({ status: AppointmentStatus.COMPLETED });
            expect(() => appointment.cancel(IDS.user, "Test")).toThrow(InvalidOperationError);
        });

        test("debería lanzar InvalidOperationError con menos de 1 hora de anticipación", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(0.5);
            const appointment = makeAppointment();
            expect(() => appointment.cancel(IDS.user, "Test")).toThrow(InvalidOperationError);
        });

    });

    // ── reschedule ────────────────────────────────────────────────────────────

    describe("reschedule", () => {

        const NEW_START = new Date("2030-02-01T10:00:00.000Z");
        const NEW_END   = new Date("2030-02-01T10:15:00.000Z");

        test("debería reprogramar el turno con suficiente anticipación", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);
            const appointment = makeAppointment();
            appointment.reschedule(NEW_START, NEW_END, IDS.user, "Cambio de agenda");

            expect(appointment.status).toBe(AppointmentStatus.BOOKED);
            expect(appointment.startTime).toStrictEqual(NEW_START);
            expect(appointment.endTime).toStrictEqual(NEW_END);
            expect(appointment.proposedStartTime).toBeNull();
            expect(appointment.proposedEndTime).toBeNull();
        });

        test("debería lanzar InvalidOperationError si el turno está cancelado", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);
            const appointment = makeAppointment({ status: AppointmentStatus.CANCELLED });
            expect(() => appointment.reschedule(NEW_START, NEW_END, IDS.user, "Test")).toThrow(InvalidOperationError);
        });

        test("debería lanzar InvalidOperationError si el turno está completado", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);
            const appointment = makeAppointment({ status: AppointmentStatus.COMPLETED });
            expect(() => appointment.reschedule(NEW_START, NEW_END, IDS.user, "Test")).toThrow(InvalidOperationError);
        });

        test("debería lanzar InvalidOperationError con menos de 1 hora de anticipación", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(0.5);
            const appointment = makeAppointment();
            expect(() => appointment.reschedule(NEW_START, NEW_END, IDS.user, "Test")).toThrow(InvalidOperationError);
        });

    });

    // ── proposeReschedule ─────────────────────────────────────────────────────

    describe("proposeReschedule", () => {

        const PROPOSED_START = new Date("2030-02-01T10:00:00.000Z");
        const PROPOSED_END   = new Date("2030-02-01T10:15:00.000Z");

        test("debería setear la propuesta y cambiar el status", () => {
            const appointment = makeAppointment();
            appointment.proposeReschedule(PROPOSED_START, PROPOSED_END, IDS.user, "Emergencia");

            expect(appointment.status).toBe(AppointmentStatus.RESCHEDULE_PROPOSED);
            expect(appointment.proposedStartTime).toStrictEqual(PROPOSED_START);
            expect(appointment.proposedEndTime).toStrictEqual(PROPOSED_END);
        });

        test("debería lanzar InvalidOperationError si el turno está cancelado", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.CANCELLED });
            expect(() => appointment.proposeReschedule(PROPOSED_START, PROPOSED_END, IDS.user, "Test")).toThrow(InvalidOperationError);
        });

        test("debería lanzar InvalidOperationError si el turno está completado", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.COMPLETED });
            expect(() => appointment.proposeReschedule(PROPOSED_START, PROPOSED_END, IDS.user, "Test")).toThrow(InvalidOperationError);
        });

    });

    // ── acceptReschedule ──────────────────────────────────────────────────────

    describe("acceptReschedule", () => {

        test("debería aceptar la propuesta y mover las fechas al turno", () => {
            const PROPOSED_START = new Date("2030-02-01T10:00:00.000Z");
            const PROPOSED_END   = new Date("2030-02-01T10:15:00.000Z");
            const appointment = makeAppointment({
                status:            AppointmentStatus.RESCHEDULE_PROPOSED,
                proposedStartTime: PROPOSED_START,
                proposedEndTime:   PROPOSED_END,
            });

            appointment.acceptReschedule(IDS.user);

            expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);
            expect(appointment.startTime).toStrictEqual(PROPOSED_START);
            expect(appointment.endTime).toStrictEqual(PROPOSED_END);
            expect(appointment.proposedStartTime).toBeNull();
            expect(appointment.proposedEndTime).toBeNull();
        });

        test("debería lanzar InvalidOperationError si no hay propuesta pendiente", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.BOOKED });
            expect(() => appointment.acceptReschedule(IDS.user)).toThrow(InvalidOperationError);
        });

    });

    // ── rejectReschedule ──────────────────────────────────────────────────────

    describe("rejectReschedule", () => {

        test("debería rechazar la propuesta y limpiar las fechas propuestas", () => {
            const appointment = makeAppointment({
                status:            AppointmentStatus.RESCHEDULE_PROPOSED,
                proposedStartTime: new Date("2030-02-01T10:00:00.000Z"),
                proposedEndTime:   new Date("2030-02-01T10:15:00.000Z"),
            });

            appointment.rejectReschedule(IDS.user, "No me viene bien");

            expect(appointment.status).toBe(AppointmentStatus.BOOKED);
            expect(appointment.proposedStartTime).toBeNull();
            expect(appointment.proposedEndTime).toBeNull();
        });

        test("debería lanzar InvalidOperationError si no hay propuesta pendiente", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.BOOKED });
            expect(() => appointment.rejectReschedule(IDS.user, "Test")).toThrow(InvalidOperationError);
        });

    });

});