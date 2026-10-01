import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Types } from "mongoose";
import { Appointment } from "../../src/domain/appointment.js";
import { AppointmentStatus } from "../../src/enums/appointment-status.enum.js";
import { Role } from "../../src/enums/role.enum.js";
import { ServiceType } from "../../src/enums/service-type.enum.js";
import { ForbiddenError, InvalidOperationError, NotFoundError } from "../../src/errors/domain.errors.js";
import { RoleResolverFactory } from "../../src/factories/role.factory.js";
import { AppointmentService } from "../../src/services/appointment.service.js";
import { DateUtils } from "../../src/utils/date.utils.js";

// ─── IDs fijos ────────────────────────────────────────────────────────────────

const IDS = {
    appointment: new Types.ObjectId("507f1f77bcf86cd799439001"),
    doctor: new Types.ObjectId("507f1f77bcf86cd799439002"),
    patient: new Types.ObjectId("507f1f77bcf86cd799439003"),
    location: new Types.ObjectId("507f1f77bcf86cd799439004"),
    service: new Types.ObjectId("507f1f77bcf86cd799439005"),
    userDoctor: new Types.ObjectId("507f1f77bcf86cd799439006"),
    userPatient: new Types.ObjectId("507f1f77bcf86cd799439007"),
    insurance: new Types.ObjectId("507f1f77bcf86cd799439008"),
    plan: new Types.ObjectId("507f1f77bcf86cd799439009"),
    inexistent: new Types.ObjectId("507f1f77bcf86cd799439099"),
};

const MOCK_USER_PATIENT = {
    userId: IDS.userPatient.toString(),
    role: Role.PATIENT,
    patientId: IDS.patient.toString(),
};

const MOCK_USER_DOCTOR = {
    userId: IDS.userDoctor.toString(),
    role: Role.DOCTOR,
    doctorId: IDS.doctor.toString(),
};

const MOCK_USER_OTHER_PATIENT = {
    userId: IDS.inexistent.toString(),
    role: Role.PATIENT,
    patientId: IDS.inexistent.toString(),
};

const MOCK_USER_OTHER_DOCTOR = {
    userId: IDS.inexistent.toString(),
    role: Role.DOCTOR,
    doctorId: IDS.inexistent.toString(),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FUTURE_DATE = new Date("2030-01-01T10:00:00.000Z");
const FUTURE_END = new Date("2030-01-01T10:15:00.000Z");

function makeAppointment(overrides = {}) {
    return new Appointment({
        id: IDS.appointment,
        doctorId: IDS.doctor,
        patientId: IDS.patient,
        startTime: FUTURE_DATE,
        endTime: FUTURE_END,
        locationId: IDS.location,
        serviceType: ServiceType.PRACTICE,
        serviceId: IDS.service,
        status: AppointmentStatus.BOOKED,
        cost: 1000,
        patient: { name: "Juan Pérez" },
        ...overrides,
    });
}

const MOCK_DOCTOR = {
    id: IDS.doctor,
    userId: IDS.userDoctor,
    canAttendAtLocation: jest.fn().mockReturnValue(true),
    isAvailableAt: jest.fn().mockReturnValue(true),
    canPerformService: jest.fn().mockReturnValue(true),
};

const MOCK_PATIENT = {
    id: IDS.patient,
    userId: IDS.userPatient,
    name: "Juan Pérez",
    healthInsuranceId: IDS.insurance,
    planId: IDS.plan,
};

const MOCK_SERVICE = {
    id: IDS.service,
    name: "Consulta",
    durationInMins: 15,
};

const MOCK_LOCATION = { id: IDS.location };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMockRepository(overrides = {}) {
    return {
        findById: jest.fn().mockResolvedValue(null),
        findAll: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue(IDS.appointment),
        update: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

function makeMockDoctorService(doctor = MOCK_DOCTOR) {
    return { getById: jest.fn().mockResolvedValue(doctor) };
}

function makeMockPatientService(patient = MOCK_PATIENT) {
    return { getById: jest.fn().mockResolvedValue(patient) };
}

function makeMockLocationService(location = MOCK_LOCATION) {
    return { getById: jest.fn().mockResolvedValue(location) };
}

function makeMockHealthInsuranceService(estimatedCost = 1000) {
    return { getCoverageInfo: jest.fn().mockResolvedValue({ estimatedCost }) };
}

function makeMockNotificationService() {
    return { create: jest.fn().mockResolvedValue(undefined) };
}

function makeMockMedicalServiceFactory(service = MOCK_SERVICE) {
    const mockService = { getById: jest.fn().mockResolvedValue(service) };
    return { getService: jest.fn().mockReturnValue(mockService) };
}

function makeFullService(repoOverrides = {}) {
    return new AppointmentService({
        appointmentRepository: makeMockRepository(repoOverrides),
        doctorService: makeMockDoctorService(),
        patientService: makeMockPatientService(),
        locationService: makeMockLocationService(),
        healthInsuranceService: makeMockHealthInsuranceService(),
        notificationService: makeMockNotificationService(),
        medicalServiceFactory: makeMockMedicalServiceFactory(),
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AppointmentService", () => {

    beforeEach(() => {
        jest.spyOn(RoleResolverFactory, "getEntityById").mockImplementation((role, entityId) => {
            if (role === Role.PATIENT) return Promise.resolve(MOCK_PATIENT);
            if (role === Role.DOCTOR) return Promise.resolve(MOCK_DOCTOR);
            return Promise.resolve(null);
        });
    });

    afterEach(() => jest.restoreAllMocks());

    // ── getById ───────────────────────────────────────────────────────────────

    describe("getById", () => {

        test("debería retornar el turno cuando existe", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.getById(IDS.appointment).then(result => {
                expect(repository.findById).toHaveBeenCalledWith(IDS.appointment);
                expect(result).toBeInstanceOf(Appointment);
                expect(result.id).toStrictEqual(IDS.appointment);
            });
        });

        test("debería lanzar NotFoundError si el turno no existe", () => {
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(null) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.getById(IDS.inexistent)
                .then(() => { throw new Error("Debería haber lanzado NotFoundError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(NotFoundError);
                    expect(error.status).toBe(404);
                    expect(repository.findById).toHaveBeenCalledWith(IDS.inexistent);
                });
        });

    });

    // ── getAll ────────────────────────────────────────────────────────────────

    describe("getAll", () => {

        test("debería retornar todos los turnos sin filtros", () => {
            const appointments = [makeAppointment()];
            const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue(appointments) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.getAll().then(result => {
                expect(repository.findAll).toHaveBeenCalledWith({}, undefined, undefined);
                expect(result).toStrictEqual(appointments);
            });
        });

        test("debería filtrar por patientId", () => {
            const appointments = [makeAppointment()];
            const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue(appointments) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.getAll({ patientId: IDS.patient }).then(result => {
                expect(repository.findAll).toHaveBeenCalledWith(
                    expect.objectContaining({ patientId: IDS.patient }),
                    undefined, undefined
                );
                expect(result).toStrictEqual(appointments);
            });
        });

        test("debería filtrar por doctorId", () => {
            const appointments = [makeAppointment()];
            const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue(appointments) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.getAll({ doctorId: IDS.doctor }).then(result => {
                expect(repository.findAll).toHaveBeenCalledWith(
                    expect.objectContaining({ doctorId: IDS.doctor }),
                    undefined, undefined
                );
            });
        });

        test("debería filtrar por status", () => {
            const appointments = [makeAppointment()];
            const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue(appointments) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.getAll({ status: AppointmentStatus.BOOKED }).then(result => {
                expect(repository.findAll).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.BOOKED }),
                    undefined, undefined
                );
            });
        });

    });

    // ── patch ─────────────────────────────────────────────────────────────────

    describe("patch", () => {

        test("debería confirmar el turno cuando se envía status CONFIRMADO con doctorId", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.patch(IDS.appointment, { status: AppointmentStatus.CONFIRMED }, MOCK_USER_DOCTOR).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.CONFIRMED })
                );
            });
        });

        test("debería completar el turno cuando se envía status REALIZADO con doctorId", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.CONFIRMED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.patch(IDS.appointment, { status: AppointmentStatus.COMPLETED }, MOCK_USER_DOCTOR).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.COMPLETED })
                );
            });
        });

        test("debería reprogramar cuando se envía startTime + reason con patientId", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment), findAll: jest.fn().mockResolvedValue([]) });
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                locationService: makeMockLocationService(),
                notificationService: makeMockNotificationService(),
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            const newStart = new Date("2030-02-01T10:00:00.000Z");
            return service.patch(IDS.appointment, { startTime: newStart, reason: "Cambio" }, MOCK_USER_PATIENT).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.BOOKED })
                );
            });
        });

        test("debería proponer reprogramación cuando se envía startTime + reason con doctorId", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment), findAll: jest.fn().mockResolvedValue([]) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            const newStart = new Date("2030-02-01T10:00:00.000Z");
            return service.patch(IDS.appointment, { startTime: newStart, reason: "Congreso médico" }, MOCK_USER_DOCTOR).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.RESCHEDULE_PROPOSED })
                );
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userPatient })
                );
            });
        });

        test("debería lanzar InvalidOperationError si no se puede determinar la operación", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.patch(IDS.appointment, {}, MOCK_USER_DOCTOR)
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

    });

    // ── book ──────────────────────────────────────────────────────────────────

    describe("book", () => {

        const bookingData = {
            doctorId: IDS.doctor,
            patientId: IDS.patient,
            startTime: FUTURE_DATE,
            serviceType: ServiceType.PRACTICE,
            serviceId: IDS.service,
            locationId: IDS.location,
        };

        test("debería crear y guardar el turno correctamente", () => {
            const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue([]) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                locationService: makeMockLocationService(),
                healthInsuranceService: makeMockHealthInsuranceService(500),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.book(bookingData).then((id) => {
                expect(id).toBeDefined();
                expect(repository.save).toHaveBeenCalledWith(
                    expect.objectContaining({
                        doctorId: IDS.doctor,
                        patientId: IDS.patient,
                        status: AppointmentStatus.BOOKED,
                        cost: 500,
                    })
                );
            });
        });

        test("debería notificar al médico al crear el turno", () => {
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: makeMockRepository({ findAll: jest.fn().mockResolvedValue([]) }),
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                locationService: makeMockLocationService(),
                healthInsuranceService: makeMockHealthInsuranceService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.book(bookingData).then(() => {
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userDoctor })
                );
            });
        });

        test("debería lanzar InvalidOperationError si el médico no atiende en esa ubicación", () => {
            const doctor = { ...MOCK_DOCTOR, canAttendAtLocation: jest.fn().mockReturnValue(false) };
            const service = new AppointmentService({
                appointmentRepository: makeMockRepository(),
                doctorService: makeMockDoctorService(doctor),
                patientService: makeMockPatientService(),
                locationService: makeMockLocationService(),
                healthInsuranceService: makeMockHealthInsuranceService(),
                notificationService: makeMockNotificationService(),
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.book(bookingData)
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

        test("debería lanzar InvalidOperationError si el médico no está disponible en ese horario", () => {
            const doctor = { ...MOCK_DOCTOR, isAvailableAt: jest.fn().mockReturnValue(false) };
            const service = new AppointmentService({
                appointmentRepository: makeMockRepository(),
                doctorService: makeMockDoctorService(doctor),
                patientService: makeMockPatientService(),
                locationService: makeMockLocationService(),
                healthInsuranceService: makeMockHealthInsuranceService(),
                notificationService: makeMockNotificationService(),
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.book(bookingData)
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

        test("debería lanzar InvalidOperationError si hay solapamiento con otro turno", () => {
            const otherAppointment = makeAppointment({ id: IDS.inexistent });
            const service = new AppointmentService({
                appointmentRepository: makeMockRepository({ findAll: jest.fn().mockResolvedValue([otherAppointment]) }),
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                locationService: makeMockLocationService(),
                healthInsuranceService: makeMockHealthInsuranceService(),
                notificationService: makeMockNotificationService(),
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.book(bookingData)
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

        describe("lote de turnos (bulk)", () => {
            test("debería guardar múltiples turnos si todos son válidos", async () => {
                const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue([]) });
                const service = new AppointmentService({
                    appointmentRepository: repository,
                    doctorService: makeMockDoctorService(),
                    patientService: makeMockPatientService(),
                    locationService: makeMockLocationService(),
                    healthInsuranceService: makeMockHealthInsuranceService(500),
                    notificationService: makeMockNotificationService(),
                    medicalServiceFactory: makeMockMedicalServiceFactory(),
                });

                const bookings = [
                    { ...bookingData, startTime: FUTURE_DATE },
                    { ...bookingData, startTime: new Date(new Date(FUTURE_DATE).getTime() + 60 * 60 * 1000).toISOString() }
                ];

                const result = await service.book(bookings);
                expect(result.successes).toHaveLength(2);
                expect(result.successes[0].index).toBe(0);
                expect(result.successes[1].index).toBe(1);
                expect(result.failures).toHaveLength(0);
                expect(repository.save).toHaveBeenCalledTimes(2);
            });

            test("debería registrar éxitos y fallas si ocurre un error parcial", async () => {
                const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue([]) });

                // Mock doctor that fails availability for the second appointment
                const doctor = {
                    ...MOCK_DOCTOR,
                    isAvailableAt: jest.fn().mockImplementation((time) => {
                        // Fail for the second booking which is 1 hour later
                        return new Date(time).getTime() === new Date(FUTURE_DATE).getTime();
                    })
                };

                const service = new AppointmentService({
                    appointmentRepository: repository,
                    doctorService: makeMockDoctorService(doctor),
                    patientService: makeMockPatientService(),
                    locationService: makeMockLocationService(),
                    healthInsuranceService: makeMockHealthInsuranceService(500),
                    notificationService: makeMockNotificationService(),
                    medicalServiceFactory: makeMockMedicalServiceFactory(),
                });

                const bookings = [
                    { ...bookingData, startTime: FUTURE_DATE },
                    { ...bookingData, startTime: new Date(new Date(FUTURE_DATE).getTime() + 60 * 60 * 1000).toISOString() }
                ];

                const result = await service.book(bookings);
                expect(result.successes).toHaveLength(1);
                expect(result.successes[0].index).toBe(0);
                expect(result.failures).toHaveLength(1);
                expect(result.failures[0].index).toBe(1);
                expect(result.failures[0].error).toContain("El Médico no trabaja en la fecha y hora solicitadas.");
                expect(repository.save).toHaveBeenCalledTimes(1);
            });

            test("debería enmascarar errores internos y mostrar un mensaje genérico", async () => {
                const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue([]) });

                // Mock doctor that throws a non-DomainError (generic Error)
                const doctor = {
                    ...MOCK_DOCTOR,
                    isAvailableAt: jest.fn().mockImplementation(() => {
                        throw new Error("Internal database connection failed");
                    })
                };

                // Suppress console.error output during test to avoid cluttering the test logs
                const originalConsoleError = console.error;
                console.error = jest.fn();

                const service = new AppointmentService({
                    appointmentRepository: repository,
                    doctorService: makeMockDoctorService(doctor),
                    patientService: makeMockPatientService(),
                    locationService: makeMockLocationService(),
                    healthInsuranceService: makeMockHealthInsuranceService(500),
                    notificationService: makeMockNotificationService(),
                    medicalServiceFactory: makeMockMedicalServiceFactory(),
                });

                const bookings = [
                    { ...bookingData, startTime: FUTURE_DATE },
                    { ...bookingData, startTime: new Date(new Date(FUTURE_DATE).getTime() + 60 * 60 * 1000).toISOString() }
                ];

                try {
                    const result = await service.book(bookings);
                    expect(result.successes).toHaveLength(0);
                    expect(result.failures).toHaveLength(2);
                    expect(result.failures[0].error).toBe("Ocurrió un error inesperado al reservar el turno.");
                    expect(result.failures[1].error).toBe("Ocurrió un error inesperado al reservar el turno.");
                    expect(console.error).toHaveBeenCalled();
                } finally {
                    console.error = originalConsoleError;
                }
            });
        });

    });

    // ── confirm ───────────────────────────────────────────────────────────────

    describe("confirm", () => {

        test("debería confirmar el turno y notificar al paciente", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.confirm(IDS.appointment, MOCK_USER_DOCTOR).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.CONFIRMED })
                );
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userPatient })
                );
            });
        });

        test("debería lanzar ForbiddenError si no es el médico asignado", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.confirm(IDS.appointment, MOCK_USER_OTHER_DOCTOR)
                .then(() => { throw new Error("Debería haber lanzado ForbiddenError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(ForbiddenError);
                });
        });

    });

    // ── complete ──────────────────────────────────────────────────────────────

    describe("complete", () => {

        test("debería completar un turno BOOKED", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.BOOKED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.complete(IDS.appointment, MOCK_USER_DOCTOR).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.COMPLETED })
                );
            });
        });

        test("debería completar un turno CONFIRMED", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.CONFIRMED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.complete(IDS.appointment, MOCK_USER_DOCTOR).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.COMPLETED })
                );
            });
        });

        test("debería lanzar InvalidOperationError si el turno está cancelado", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.CANCELLED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.complete(IDS.appointment, MOCK_USER_DOCTOR)
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

    });

    // ── cancel ────────────────────────────────────────────────────────────────

    describe("cancel", () => {

        test("debería cancelar el turno cuando lo solicita el paciente con suficiente anticipación", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);

            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                patientService: makeMockPatientService(),
                doctorService: makeMockDoctorService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.cancel({ id: IDS.appointment, user: MOCK_USER_PATIENT, reason: "Viaje" }).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.CANCELLED })
                );
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userDoctor })
                );
            });
        });

        test("debería cancelar el turno cuando lo solicita el médico con suficiente anticipación", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);

            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                patientService: makeMockPatientService(),
                doctorService: makeMockDoctorService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.cancel({ id: IDS.appointment, user: MOCK_USER_DOCTOR, reason: "Emergencia" }).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.CANCELLED })
                );
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userPatient })
                );
            });
        });

        test("debería lanzar ForbiddenError si no es el paciente ni el médico asignado", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.cancel({ id: IDS.appointment, user: MOCK_USER_OTHER_PATIENT, reason: "Test" })
                .then(() => { throw new Error("Debería haber lanzado ForbiddenError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(ForbiddenError);
                });
        });

        test("debería lanzar InvalidOperationError si se cancela con menos de 1 hora de anticipación", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(0.5);

            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({
                appointmentRepository: repository,
                patientService: makeMockPatientService(),
                doctorService: makeMockDoctorService(),
                notificationService: makeMockNotificationService(),
            });

            return service.cancel({ id: IDS.appointment, user: MOCK_USER_PATIENT, reason: "Tarde" })
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

        test("debería lanzar InvalidOperationError si el turno ya está cancelado", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);

            const appointment = makeAppointment({ status: AppointmentStatus.CANCELLED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({
                appointmentRepository: repository,
                patientService: makeMockPatientService(),
                doctorService: makeMockDoctorService(),
                notificationService: makeMockNotificationService(),
            });

            return service.cancel({ id: IDS.appointment, user: MOCK_USER_PATIENT, reason: "Test" })
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

    });

    // ── reschedule ────────────────────────────────────────────────────────────

    describe("reschedule", () => {

        const NEW_START = new Date("2030-02-01T10:00:00.000Z");

        test("debería reprogramar el turno y notificar al médico", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(24);

            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment), findAll: jest.fn().mockResolvedValue([]) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                locationService: makeMockLocationService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.reschedule({ id: IDS.appointment, startTime: NEW_START, user: MOCK_USER_PATIENT, reason: "Cambio de agenda" }).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.BOOKED })
                );
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userDoctor })
                );
            });
        });

        test("debería lanzar ForbiddenError si no es el paciente asignado", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.reschedule({ id: IDS.appointment, startTime: NEW_START, user: MOCK_USER_OTHER_PATIENT, reason: "Test" })
                .then(() => { throw new Error("Debería haber lanzado ForbiddenError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(ForbiddenError);
                });
        });

        test("debería lanzar InvalidOperationError con menos de 1 hora de anticipación", () => {
            jest.spyOn(DateUtils, "getDifferenceInHours").mockReturnValue(0.5);

            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment), findAll: jest.fn().mockResolvedValue([]) });
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                medicalServiceFactory: makeMockMedicalServiceFactory(),
                notificationService: makeMockNotificationService(),
            });

            return service.reschedule({ id: IDS.appointment, startTime: NEW_START, user: MOCK_USER_PATIENT, reason: "Test" })
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

    });

    // ── proposeReschedule ─────────────────────────────────────────────────────

    describe("proposeReschedule", () => {

        const NEW_START = new Date("2030-02-01T10:00:00.000Z");

        test("debería proponer reprogramación y notificar al paciente", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment), findAll: jest.fn().mockResolvedValue([]) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.proposeReschedule({ id: IDS.appointment, startTime: NEW_START, user: MOCK_USER_DOCTOR, reason: "Emergencia" }).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.RESCHEDULE_PROPOSED })
                );
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userPatient })
                );
            });
        });

        test("debería lanzar ForbiddenError si no es el médico asignado", () => {
            const appointment = makeAppointment();
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.proposeReschedule({ id: IDS.appointment, startTime: NEW_START, user: MOCK_USER_OTHER_DOCTOR, reason: "Test" })
                .then(() => { throw new Error("Debería haber lanzado ForbiddenError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(ForbiddenError);
                });
        });

    });

    // ── acceptReschedule ──────────────────────────────────────────────────────

    describe("acceptReschedule", () => {

        test("debería aceptar la propuesta y notificar al médico", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.RESCHEDULE_PROPOSED, proposedStartTime: FUTURE_DATE, proposedEndTime: FUTURE_END });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment), findAll: jest.fn().mockResolvedValue([]) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                notificationService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.acceptReschedule(IDS.appointment, MOCK_USER_PATIENT).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.CONFIRMED })
                );
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userDoctor })
                );
            });
        });

        test("debería lanzar ForbiddenError si no es el paciente asignado", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.RESCHEDULE_PROPOSED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.acceptReschedule(IDS.appointment, MOCK_USER_OTHER_PATIENT)
                .then(() => { throw new Error("Debería haber lanzado ForbiddenError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(ForbiddenError);
                });
        });

        test("debería lanzar InvalidOperationError si no hay propuesta pendiente", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.BOOKED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment), findAll: jest.fn().mockResolvedValue([]) });
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                patientService: makeMockPatientService(),
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.acceptReschedule(IDS.appointment, MOCK_USER_PATIENT)
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

    });

    // ── rejectReschedule ──────────────────────────────────────────────────────

    describe("rejectReschedule", () => {

        test("debería rechazar la propuesta y notificar al médico", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.RESCHEDULE_PROPOSED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const notificationService = makeMockNotificationService();
            const service = new AppointmentService({
                appointmentRepository: repository,
                doctorService: makeMockDoctorService(),
                notificationService,
            });

            return service.rejectReschedule(IDS.appointment, MOCK_USER_PATIENT, "No me viene bien").then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ status: AppointmentStatus.BOOKED })
                );
                expect(notificationService.create).toHaveBeenCalledWith(
                    expect.objectContaining({ recipient: IDS.userDoctor })
                );
            });
        });

        test("debería lanzar ForbiddenError si no es el paciente asignado", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.RESCHEDULE_PROPOSED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.rejectReschedule(IDS.appointment, MOCK_USER_OTHER_PATIENT, "Test")
                .then(() => { throw new Error("Debería haber lanzado ForbiddenError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(ForbiddenError);
                });
        });

        test("debería lanzar InvalidOperationError si no hay propuesta pendiente", () => {
            const appointment = makeAppointment({ status: AppointmentStatus.BOOKED });
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(appointment) });
            const service = new AppointmentService({ appointmentRepository: repository });

            return service.rejectReschedule(IDS.appointment, MOCK_USER_PATIENT, "Test")
                .then(() => { throw new Error("Debería haber lanzado InvalidOperationError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(InvalidOperationError);
                });
        });

    });

});