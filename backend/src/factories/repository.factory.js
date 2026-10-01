import { AppointmentMemoryRepository } from "../repositories/memory/appointment.memory.repository.js";
import { DoctorMemoryRepository } from "../repositories/memory/doctor.memory.repository.js";
import { HealthInsuranceMemoryRepository } from "../repositories/memory/health-insurance.memory.repository.js";
import { LocationMemoryRepository } from "../repositories/memory/location.memory.repository.js";
import { NotificationMemoryRepository } from "../repositories/memory/notification.memory.repository.js";
import { PatientMemoryRepository } from "../repositories/memory/patient.memory.repository.js";
import { PracticeMemoryRepository } from "../repositories/memory/practice.memory.repository.js";
import { SpecialtyMemoryRepository } from "../repositories/memory/specialty.memory.repository.js";
import { UserMemoryRepository } from "../repositories/memory/user.memory.repository.js";
import { AppointmentMongoRepository } from "../repositories/mongo/appointment.mongo.repository.js";
import { DoctorMongoRepository } from "../repositories/mongo/doctor.mongo.repository.js";
import { HealthInsuranceMongoRepository } from "../repositories/mongo/health-insurance.mongo.repository.js";
import { LocationMongoRepository } from "../repositories/mongo/location.mongo.repository.js";
import { NotificationMongoRepository } from "../repositories/mongo/notification.mongo.repository.js";
import { PatientMongoRepository } from "../repositories/mongo/patient.mongo.repository.js";
import { PracticeMongoRepository } from "../repositories/mongo/practice.mongo.repository.js";
import { SpecialtyMongoRepository } from "../repositories/mongo/specialty.mongo.repository.js";
import { UserMongoRepository } from "../repositories/mongo/user.mongo.repository.js";

const implementations = {
    MEMORY: {
        doctor: DoctorMemoryRepository,
        patient: PatientMemoryRepository,
        practice: PracticeMemoryRepository,
        specialty: SpecialtyMemoryRepository,
        appointment: AppointmentMemoryRepository,
        healthInsurance: HealthInsuranceMemoryRepository,
        location: LocationMemoryRepository,
        notification: NotificationMemoryRepository,
        user: UserMemoryRepository
    },
    MONGO: {
        doctor: DoctorMongoRepository,
        patient: PatientMongoRepository,
        practice: PracticeMongoRepository,
        specialty: SpecialtyMongoRepository,
        appointment: AppointmentMongoRepository,
        healthInsurance: HealthInsuranceMongoRepository,
        location: LocationMongoRepository,
        notification: NotificationMongoRepository,
        user: UserMongoRepository
    }
};

export class RepositoryFactory {
    static get dbType() {
        return process.env.DB_TYPE || 'MEMORY';
    }

    static #getImplementation(entity) {
        const type = this.dbType;
        const typeImpls = implementations[type];

        if (!typeImpls)
            throw new Error(`Unsupported DB_TYPE: ${type}`);

        const RepoClass = typeImpls[entity];

        if (!RepoClass) {
            console.warn(`[RepositoryFactory] Fallback to MEMORY for '${entity}' (No ${type} implementation found).`);
            return implementations.MEMORY[entity].instance();
        }

        return RepoClass.instance();
    }

    static getDoctorRepository() { return this.#getImplementation('doctor'); }
    static getPatientRepository() { return this.#getImplementation('patient'); }
    static getPracticeRepository() { return this.#getImplementation('practice'); }
    static getSpecialtyRepository() { return this.#getImplementation('specialty'); }
    static getAppointmentRepository() { return this.#getImplementation('appointment'); }
    static getHealthInsuranceRepository() { return this.#getImplementation('healthInsurance'); }
    static getLocationRepository() { return this.#getImplementation('location'); }
    static getNotificationRepository() { return this.#getImplementation('notification'); }
    static getUserRepository() { return this.#getImplementation('user'); }
}
