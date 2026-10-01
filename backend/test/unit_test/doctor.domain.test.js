import { Doctor, TimeAvailability } from "../../src/domain/doctor.js";
import { ServiceType } from "../../src/enums/service-type.enum.js";
import { expect, test, describe } from "@jest/globals";
import { Types } from "mongoose";

// ─── IDs fijos ────────────────────────────────────────────────────────────────

const IDS = {
    doctor:     new Types.ObjectId("507f1f77bcf86cd799439001"),
    user:       new Types.ObjectId("507f1f77bcf86cd799439002"),
    location:   new Types.ObjectId("507f1f77bcf86cd799439003"),
    specialty1: new Types.ObjectId("507f1f77bcf86cd799439004"),
    specialty2: new Types.ObjectId("507f1f77bcf86cd799439005"),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeDoctor(overrides = {}) {
    return new Doctor({
        id:           IDS.doctor,
        userId:       IDS.user,
        registration: "ABC123",
        name:         "Dr. Test",
        services:     {},
        locationIds:  [],
        availabilities: [],
        ...overrides,
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Doctor", () => {

    // ── constructor ───────────────────────────────────────────────────────────

    describe("constructor", () => {

        test("debería crear el doctor con los valores correctos", () => {
            const doctor = makeDoctor();

            expect(doctor.id).toStrictEqual(IDS.doctor);
            expect(doctor.userId).toStrictEqual(IDS.user);
            expect(doctor.registration).toBe("ABC123");
            expect(doctor.name).toBe("Dr. Test");
            expect(doctor.services).toStrictEqual({});
            expect(doctor.locationIds).toStrictEqual([]);
            expect(doctor.availabilities).toStrictEqual([]);
        });

        test("debería mapear las disponibilidades a instancias de TimeAvailability", () => {
            const doctor = makeDoctor({
                availabilities: [{ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" }]
            });
            expect(doctor.availabilities[0]).toBeInstanceOf(TimeAvailability);
        });

        test("no debería re-mapear instancias de TimeAvailability existentes", () => {
            const existing = new TimeAvailability({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" });
            const doctor   = makeDoctor({ availabilities: [existing] });
            expect(doctor.availabilities[0]).toBe(existing);
        });

    });

    // ── canAttendAtLocation ───────────────────────────────────────────────────

    describe("canAttendAtLocation", () => {

        test("debería retornar true si la ubicación está en su lista", () => {
            const doctor = makeDoctor({ locationIds: [IDS.location] });
            expect(doctor.canAttendAtLocation(IDS.location)).toBe(true);
        });

        test("debería retornar false si la ubicación no está en su lista", () => {
            const doctor = makeDoctor({ locationIds: [] });
            expect(doctor.canAttendAtLocation(IDS.location)).toBe(false);
        });

    });

    // ── canPerformService ─────────────────────────────────────────────────────

    describe("canPerformService", () => {

        test("debería retornar true si tiene el servicio del tipo indicado", () => {
            const doctor = makeDoctor({
                services: { [ServiceType.SPECIALTY]: [IDS.specialty1] }
            });
            expect(doctor.canPerformService(ServiceType.SPECIALTY, IDS.specialty1)).toBe(true);
        });

        test("debería retornar false si no tiene el servicio del tipo indicado", () => {
            const doctor = makeDoctor({ services: {} });
            expect(doctor.canPerformService(ServiceType.SPECIALTY, IDS.specialty1)).toBe(false);
        });

        test("debería retornar false si tiene servicios de otro tipo pero no del solicitado", () => {
            const doctor = makeDoctor({
                services: { [ServiceType.PRACTICE]: [IDS.specialty1] }
            });
            expect(doctor.canPerformService(ServiceType.SPECIALTY, IDS.specialty1)).toBe(false);
        });

    });

    // ── getServiceIds ─────────────────────────────────────────────────────────

    describe("getServiceIds", () => {

        test("debería retornar los ids del tipo de servicio solicitado", () => {
            const doctor = makeDoctor({
                services: { [ServiceType.SPECIALTY]: [IDS.specialty1, IDS.specialty2] }
            });
            expect(doctor.getServiceIds(ServiceType.SPECIALTY)).toStrictEqual([IDS.specialty1, IDS.specialty2]);
        });

        test("debería retornar un array vacío si no tiene servicios de ese tipo", () => {
            const doctor = makeDoctor({ services: {} });
            expect(doctor.getServiceIds(ServiceType.SPECIALTY)).toStrictEqual([]);
        });

    });

    // ── updateServices ────────────────────────────────────────────────────────

    describe("updateServices", () => {

        test("debería reemplazar los serviceIds del tipo indicado", () => {
            const doctor = makeDoctor({
                services: { [ServiceType.SPECIALTY]: [IDS.specialty1] }
            });
            doctor.updateServices(ServiceType.SPECIALTY, [IDS.specialty2]);
            expect(doctor.getServiceIds(ServiceType.SPECIALTY)).toStrictEqual([IDS.specialty2]);
        });

        test("debería poder setear servicios de un tipo que no tenía", () => {
            const doctor = makeDoctor({ services: {} });
            doctor.updateServices(ServiceType.PRACTICE, [IDS.specialty1]);
            expect(doctor.getServiceIds(ServiceType.PRACTICE)).toStrictEqual([IDS.specialty1]);
        });

        test("debería poder vaciar los servicios de un tipo", () => {
            const doctor = makeDoctor({
                services: { [ServiceType.SPECIALTY]: [IDS.specialty1] }
            });
            doctor.updateServices(ServiceType.SPECIALTY, []);
            expect(doctor.getServiceIds(ServiceType.SPECIALTY)).toStrictEqual([]);
        });

    });

    // ── updateAvailabilities ──────────────────────────────────────────────────

    describe("updateAvailabilities", () => {

        test("debería reemplazar las disponibilidades y mapearlas a TimeAvailability", () => {
            const doctor = makeDoctor();
            doctor.updateAvailabilities([{ dayOfWeek: "TUESDAY", startTime: "08:00", endTime: "16:00" }]);

            expect(doctor.availabilities).toHaveLength(1);
            expect(doctor.availabilities[0]).toBeInstanceOf(TimeAvailability);
            expect(doctor.availabilities[0].dayOfWeek).toBe("TUESDAY");
        });

        test("debería limpiar las disponibilidades si se pasa un array vacío", () => {
            const doctor = makeDoctor({
                availabilities: [{ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" }]
            });
            doctor.updateAvailabilities([]);
            expect(doctor.availabilities).toStrictEqual([]);
        });

    });

    // ── isAvailableAt ─────────────────────────────────────────────────────────
    /*
    describe("isAvailableAt", () => {

        test("debería retornar false si no tiene disponibilidades", () => {
            const doctor = makeDoctor({ availabilities: [] });
            expect(doctor.isAvailableAt(new Date("2030-01-07T10:00:00.000Z"))).toBe(false);
        });

        test("debería retornar true si la fecha y hora caen en una disponibilidad", () => {
            // 2030-01-07 es lunes en UTC
            const monday10am = new Date("2030-01-07T10:00:00.000Z");
            const doctor = makeDoctor({
                availabilities: [{ dayOfWeek: "MONDAY", startTime: "10:00", endTime: "18:00" }]
            });
            expect(doctor.isAvailableAt(monday10am)).toBe(true);
        });

        test("debería retornar false si la hora es anterior al rango de disponibilidad", () => {
            const monday8am = new Date("2030-01-07T08:00:00.000Z");
            const doctor = makeDoctor({
                availabilities: [{ dayOfWeek: "MONDAY", startTime: "10:00", endTime: "18:00" }]
            });
            expect(doctor.isAvailableAt(monday8am)).toBe(false);
        });

        test("debería retornar false si la hora es posterior al rango de disponibilidad", () => {
            const monday20pm = new Date("2030-01-07T20:00:00.000Z");
            const doctor = makeDoctor({
                availabilities: [{ dayOfWeek: "MONDAY", startTime: "10:00", endTime: "18:00" }]
            });
            expect(doctor.isAvailableAt(monday20pm)).toBe(false);
        });

        test("debería retornar false si el día no coincide con ninguna disponibilidad", () => {
            // 2030-01-07 es lunes, pero solo tiene disponibilidad el martes
            const monday10am = new Date("2030-01-07T10:00:00.000Z");
            const doctor = makeDoctor({
                availabilities: [{ dayOfWeek: "TUESDAY", startTime: "10:00", endTime: "18:00" }]
            });
            expect(doctor.isAvailableAt(monday10am)).toBe(false);
        });

        test("debería retornar false exactamente en el endTime (el rango es exclusivo al final)", () => {
            const monday18pm = new Date("2030-01-07T18:00:00.000Z");
            const doctor = makeDoctor({
                availabilities: [{ dayOfWeek: "MONDAY", startTime: "10:00", endTime: "18:00" }]
            });
            expect(doctor.isAvailableAt(monday18pm)).toBe(false);
        });

    });
    */

});