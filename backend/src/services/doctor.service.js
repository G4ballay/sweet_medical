import { Doctor } from "../domain/doctor.js";
import { ServiceType } from "../enums/service-type.enum.js";
import { AlreadyExistsError, NotFoundError } from "../errors/domain.errors.js";
import { RepositoryFactory } from "../factories/repository.factory.js";
import { MedicalServiceFactory } from "../factories/medical-service.factory.js";
import { LocationService } from "./location.service.js";
import { UserService } from "./user.service.js";

export class DoctorService {
    constructor({
        doctorRepository = RepositoryFactory.getDoctorRepository(),
        medicalServiceFactory = new MedicalServiceFactory(),
        locationService = new LocationService(),
        userService = new UserService()
    } = {}) {
        this.doctorRepository = doctorRepository;
        this.medicalServiceFactory = medicalServiceFactory;
        this.locationService = locationService;
        this.userService = userService;
    };

    async #validateServiceIds(serviceType, ids) {
        if (!ids || ids.length === 0) return;
        const service = this.medicalServiceFactory.getService(serviceType);
        await Promise.all(ids.map(id => service.getById(id)));
    }

    async #validateLocationIds(locationIds) {
        if (!locationIds || locationIds.length === 0) return;
        await Promise.all(locationIds.map(id => this.locationService.getById(id)));
    }

    async create(doctorData) {
        const { userId, specialtyIds = [], practiceIds = [], locationIds = [], ...rest } = doctorData;

        await Promise.all([
            this.userService.findById(userId),
            this.#validateServiceIds(ServiceType.SPECIALTY, specialtyIds),
            this.#validateServiceIds(ServiceType.PRACTICE, practiceIds),
            this.#validateLocationIds(locationIds)
        ]);

        const exists = await this.doctorRepository.exists({
            userId: userId,
            registration: doctorData.registration
        });
        if (exists) throw new AlreadyExistsError({ entity: "Médico" });

        const services = {
            [ServiceType.SPECIALTY]: specialtyIds,
            [ServiceType.PRACTICE]: practiceIds
        };

        const newDoctor = new Doctor({ ...rest, userId, services, locationIds });
        console.log(newDoctor)
        return this.doctorRepository.save(newDoctor);
    }

    async getAll(filters = {}) {
        return await this.doctorRepository.findAll(filters);
    }

    async getById(id) {
        const doctor = await this.doctorRepository.findById(id);
        if (!doctor) throw new NotFoundError("Médico", id);
        return doctor;
    }

    async delete(id) {
        const doctor = await this.getById(id);
        return this.doctorRepository.delete(doctor.id);
    }

    async update(doctorData) {
        const { specialtyIds = [], practiceIds = [], locationIds = [], ...rest } = doctorData;

        await Promise.all([
            this.#validateServiceIds(ServiceType.SPECIALTY, specialtyIds),
            this.#validateServiceIds(ServiceType.PRACTICE, practiceIds),
            this.#validateLocationIds(locationIds)
        ]);

        const doctor = await this.getById(doctorData.id);
        const updatedDoctor = new Doctor({ ...doctor, ...doctorData });
        return this.doctorRepository.update(updatedDoctor);
    }

    async updateAvailabilities(newData) {
        const doctor = await this.getById(newData.id);
        doctor.updateAvailabilities(newData.availabilities);
        return this.doctorRepository.update(doctor);
    }

    async getServices(id, serviceType) {
        const doctor = await this.getById(id);
        const service = this.medicalServiceFactory.getService(serviceType);
        const serviceIds = doctor.getServiceIds(serviceType);
        if (!serviceIds || serviceIds.length === 0) return [];
        return await Promise.all(serviceIds.map(sId => service.getById(sId)));
    }

    async updateServices({ id, serviceType, serviceIds }) {
        const doctor = await this.getById(id);
        await this.#validateServiceIds(serviceType, serviceIds);
        doctor.updateServices(serviceType, serviceIds);
        await this.doctorRepository.update(doctor);
        return doctor;
    }
}