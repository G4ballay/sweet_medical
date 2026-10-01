import { DoctorService } from "../../src/services/doctor.service.js";
import { AlreadyExistsError, NotFoundError } from "../../src/errors/domain.errors.js";
import { Doctor } from "../../src/domain/doctor.js";
import { ServiceType } from "../../src/enums/service-type.enum.js";
import { expect, jest, test, describe } from "@jest/globals";
import { Types } from "mongoose";

// ─── IDs fijos ───────────────────────────────────────────────────────────────

const IDS = {
    doctor:     new Types.ObjectId("507f1f77bcf86cd799439011"),
    user:       new Types.ObjectId("507f1f77bcf86cd799439012"),
    location:   new Types.ObjectId("507f1f77bcf86cd799439013"),
    specialty1: new Types.ObjectId("507f1f77bcf86cd799439014"),
    specialty2: new Types.ObjectId("507f1f77bcf86cd799439015"),
    practice1:  new Types.ObjectId("507f1f77bcf86cd799439016"),
    inexistent: new Types.ObjectId("507f1f77bcf86cd799439099"),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMockRepository(overrides = {}) {
    return {
        save:     jest.fn().mockResolvedValue(IDS.doctor),
        findById: jest.fn().mockResolvedValue(null),
        findAll:  jest.fn().mockResolvedValue([]),
        update:   jest.fn().mockResolvedValue(undefined),
        delete:   jest.fn().mockResolvedValue(undefined),
        exists:   jest.fn().mockResolvedValue(false),
        ...overrides,
    };
}

function makeMockMedicalServiceFactory(getByIdResult = { id: IDS.specialty1 }) {
    const mockService = { getById: jest.fn().mockResolvedValue(getByIdResult) };
    return { getService: jest.fn().mockReturnValue(mockService) };
}

function makeMockUserService(result = { id: IDS.user }) {
    return { findById: jest.fn().mockResolvedValue(result) };
}

function makeMockLocationService(result = { id: IDS.location }) {
    return { getById: jest.fn().mockResolvedValue(result) };
}

const BASE_DOCTOR_DATA = {
    id:           IDS.doctor,
    userId:       IDS.user,
    registration: "ABC123",
    name:         "Dr. Test",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("DoctorService", () => {

    // ── create ───────────────────────────────────────────────────────────────

    describe("create", () => {

        test("debería guardar el doctor y retornar su id", () => {
            const repository            = makeMockRepository();
            const userService           = makeMockUserService();
            const medicalServiceFactory = makeMockMedicalServiceFactory();
            const locationService       = makeMockLocationService();

            const service = new DoctorService({ doctorRepository: repository, userService, medicalServiceFactory, locationService });

            const expectedDoctor = new Doctor({
                ...BASE_DOCTOR_DATA,
                services: { [ServiceType.SPECIALTY]: [], [ServiceType.PRACTICE]: [] },
                locationIds: [],
            });

            return service.create(BASE_DOCTOR_DATA).then(result => {
                expect(repository.save).toHaveBeenCalledWith(expectedDoctor);
                expect(result).toStrictEqual(IDS.doctor);
            });
        });

        test("debería validar el userId antes de guardar", () => {
            const userService = makeMockUserService();
            const service = new DoctorService({
                doctorRepository:      makeMockRepository(),
                userService,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
                locationService:       makeMockLocationService(),
            });

            return service.create(BASE_DOCTOR_DATA).then(() => {
                expect(userService.findById).toHaveBeenCalledWith(IDS.user);
            });
        });

        test("debería validar los specialtyIds cuando se pasan", () => {
            const medicalServiceFactory = makeMockMedicalServiceFactory();
            const service = new DoctorService({
                doctorRepository:      makeMockRepository(),
                userService:           makeMockUserService(),
                medicalServiceFactory,
                locationService:       makeMockLocationService(),
            });

            const doctorData = { ...BASE_DOCTOR_DATA, specialtyIds: [IDS.specialty1, IDS.specialty2] };

            return service.create(doctorData).then(() => {
                expect(medicalServiceFactory.getService).toHaveBeenCalledWith(ServiceType.SPECIALTY);
                const mockService = medicalServiceFactory.getService.mock.results[0].value;
                expect(mockService.getById).toHaveBeenCalledWith(IDS.specialty1);
                expect(mockService.getById).toHaveBeenCalledWith(IDS.specialty2);
            });
        });

        test("debería validar los locationIds cuando se pasan", () => {
            const locationService = makeMockLocationService();
            const service = new DoctorService({
                doctorRepository:      makeMockRepository(),
                userService:           makeMockUserService(),
                medicalServiceFactory: makeMockMedicalServiceFactory(),
                locationService,
            });

            const doctorData = { ...BASE_DOCTOR_DATA, locationIds: [IDS.location] };

            return service.create(doctorData).then(() => {
                expect(locationService.getById).toHaveBeenCalledWith(IDS.location);
            });
        });

        test("debería lanzar AlreadyExistsError si el doctor ya existe", () => {
            const service = new DoctorService({
                doctorRepository:      makeMockRepository({ exists: jest.fn().mockResolvedValue(true) }),
                userService:           makeMockUserService(),
                medicalServiceFactory: makeMockMedicalServiceFactory(),
                locationService:       makeMockLocationService(),
            });

            return service.create(BASE_DOCTOR_DATA)
                .then(() => { throw new Error("Debería haber lanzado AlreadyExistsError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(AlreadyExistsError);
                });
        });

    });

    // ── getById ───────────────────────────────────────────────────────────────

    describe("getById", () => {

        test("debería retornar el doctor cuando existe", () => {
            const doctorPayload = { id: IDS.doctor, name: "Dr. House" };
            const repository    = makeMockRepository({ findById: jest.fn().mockResolvedValue(doctorPayload) });
            const service       = new DoctorService({ doctorRepository: repository });

            return service.getById(IDS.doctor).then(result => {
                expect(repository.findById).toHaveBeenCalledWith(IDS.doctor);
                expect(result).toStrictEqual(doctorPayload);
            });
        });

        test("debería lanzar NotFoundError si el doctor no existe", () => {
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(null) });
            const service    = new DoctorService({ doctorRepository: repository });

            return service.getById(IDS.inexistent)
                .then(() => { throw new Error("Debería haber lanzado NotFoundError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(NotFoundError);
                    expect(error.status).toBe(404);
                    expect(error.message).toContain("no encontrado");
                    expect(repository.findById).toHaveBeenCalledWith(IDS.inexistent);
                });
        });

    });

    // ── getAll ────────────────────────────────────────────────────────────────

    describe("getAll", () => {

        test("debería retornar todos los doctores sin filtros", () => {
            const doctors    = [{ id: IDS.doctor }, { id: IDS.specialty1 }];
            const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue(doctors) });
            const service    = new DoctorService({ doctorRepository: repository });

            return service.getAll().then(result => {
                expect(repository.findAll).toHaveBeenCalledWith({});
                expect(result).toStrictEqual(doctors);
            });
        });

        test("debería pasar los filtros al repositorio", () => {
            const repository = makeMockRepository({ findAll: jest.fn().mockResolvedValue([]) });
            const service    = new DoctorService({ doctorRepository: repository });
            const filters    = { name: "House" };

            return service.getAll(filters).then(() => {
                expect(repository.findAll).toHaveBeenCalledWith(filters);
            });
        });

    });

    // ── delete ────────────────────────────────────────────────────────────────

    describe("delete", () => {

        test("debería eliminar el doctor cuando existe", () => {
            const doctor     = new Doctor(BASE_DOCTOR_DATA);
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(doctor) });
            const service    = new DoctorService({ doctorRepository: repository });

            return service.delete(IDS.doctor).then(() => {
                expect(repository.delete).toHaveBeenCalledWith(IDS.doctor);
            });
        });

        test("debería lanzar NotFoundError si el doctor no existe", () => {
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(null) });
            const service    = new DoctorService({ doctorRepository: repository });

            return service.delete(IDS.inexistent)
                .then(() => { throw new Error("Debería haber lanzado NotFoundError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(NotFoundError);
                });
        });

    });

    // ── update ────────────────────────────────────────────────────────────────

    describe("update", () => {

        test("debería actualizar el doctor correctamente", () => {
            const existing   = new Doctor(BASE_DOCTOR_DATA);
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(existing) });
            const service    = new DoctorService({
                doctorRepository:      repository,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
                locationService:       makeMockLocationService(),
            });

            const updateData = { ...BASE_DOCTOR_DATA, name: "Dr. Wilson" };

            return service.update(updateData).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ name: "Dr. Wilson" })
                );
            });
        });

        test("debería lanzar NotFoundError si el doctor no existe", () => {
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(null) });
            const service    = new DoctorService({
                doctorRepository:      repository,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
                locationService:       makeMockLocationService(),
            });

            return service.update(BASE_DOCTOR_DATA)
                .then(() => { throw new Error("Debería haber lanzado NotFoundError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(NotFoundError);
                });
        });

    });

    // ── updateAvailabilities ──────────────────────────────────────────────────

    describe("updateAvailabilities", () => {

        test("debería actualizar las disponibilidades del doctor", () => {
            const doctor     = new Doctor(BASE_DOCTOR_DATA);
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(doctor) });
            const service    = new DoctorService({ doctorRepository: repository });

            const availabilities = [{ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" }];

            return service.updateAvailabilities({ id: IDS.doctor, availabilities }).then(() => {
                expect(repository.update).toHaveBeenCalledWith(
                    expect.objectContaining({ availabilities: expect.any(Array) })
                );
            });
        });

        test("debería lanzar NotFoundError si el doctor no existe", () => {
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(null) });
            const service    = new DoctorService({ doctorRepository: repository });

            return service.updateAvailabilities({ id: IDS.inexistent, availabilities: [] })
                .then(() => { throw new Error("Debería haber lanzado NotFoundError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(NotFoundError);
                });
        });

    });

    // ── getServices ───────────────────────────────────────────────────────────

    describe("getServices", () => {

        test("debería retornar los servicios del doctor según el tipo", () => {
            const doctor = new Doctor({
                ...BASE_DOCTOR_DATA,
                services: { [ServiceType.SPECIALTY]: [IDS.specialty1, IDS.specialty2] },
            });
            const mockSpecialty         = { id: IDS.specialty1, name: "Cardiología" };
            const medicalServiceFactory = makeMockMedicalServiceFactory(mockSpecialty);
            const repository            = makeMockRepository({ findById: jest.fn().mockResolvedValue(doctor) });
            const service               = new DoctorService({ doctorRepository: repository, medicalServiceFactory });

            return service.getServices(IDS.doctor, ServiceType.SPECIALTY).then(result => {
                expect(medicalServiceFactory.getService).toHaveBeenCalledWith(ServiceType.SPECIALTY);
                expect(result).toHaveLength(2);
            });
        });

        test("debería retornar un array vacío si el doctor no tiene servicios de ese tipo", () => {
            const doctor     = new Doctor(BASE_DOCTOR_DATA);
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(doctor) });
            const service    = new DoctorService({
                doctorRepository:      repository,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.getServices(IDS.doctor, ServiceType.SPECIALTY).then(result => {
                expect(result).toStrictEqual([]);
            });
        });

    });

    // ── updateServices ────────────────────────────────────────────────────────

    describe("updateServices", () => {

        test("debería actualizar los servicios del doctor", () => {
            const doctor                = new Doctor(BASE_DOCTOR_DATA);
            const repository            = makeMockRepository({ findById: jest.fn().mockResolvedValue(doctor) });
            const medicalServiceFactory = makeMockMedicalServiceFactory();
            const service               = new DoctorService({ doctorRepository: repository, medicalServiceFactory });

            return service.updateServices({ id: IDS.doctor, serviceType: ServiceType.SPECIALTY, serviceIds: [IDS.specialty1] })
                .then(result => {
                    expect(repository.update).toHaveBeenCalled();
                    expect(result.getServiceIds(ServiceType.SPECIALTY)).toStrictEqual([IDS.specialty1]);
                });
        });

        test("debería validar los serviceIds antes de actualizar", () => {
            const doctor                = new Doctor(BASE_DOCTOR_DATA);
            const repository            = makeMockRepository({ findById: jest.fn().mockResolvedValue(doctor) });
            const medicalServiceFactory = makeMockMedicalServiceFactory();
            const service               = new DoctorService({ doctorRepository: repository, medicalServiceFactory });

            return service.updateServices({ id: IDS.doctor, serviceType: ServiceType.SPECIALTY, serviceIds: [IDS.specialty1] })
                .then(() => {
                    const mockService = medicalServiceFactory.getService.mock.results[0].value;
                    expect(mockService.getById).toHaveBeenCalledWith(IDS.specialty1);
                });
        });

        test("debería lanzar NotFoundError si el doctor no existe", () => {
            const repository = makeMockRepository({ findById: jest.fn().mockResolvedValue(null) });
            const service    = new DoctorService({
                doctorRepository:      repository,
                medicalServiceFactory: makeMockMedicalServiceFactory(),
            });

            return service.updateServices({ id: IDS.inexistent, serviceType: ServiceType.SPECIALTY, serviceIds: [] })
                .then(() => { throw new Error("Debería haber lanzado NotFoundError"); })
                .catch(error => {
                    expect(error).toBeInstanceOf(NotFoundError);
                });
        });

    });

});