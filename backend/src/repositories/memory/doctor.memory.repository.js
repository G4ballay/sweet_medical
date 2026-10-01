import { Doctor } from "../../domain/doctor.js";
import { ServiceType } from "../../enums/service-type.enum.js";
import { IDoctorRepository } from "../interfaces/doctor.repository.interface.js";
import { IdUtils } from "../../utils/id.utils.js";

export class DoctorMemoryRepository extends IDoctorRepository {
    constructor() {
        super();
        this.doctors = [
            new Doctor({
                id: "600000000000000000000011",
                userId: "600000000000000000000001",
                registration: "MED-AR-45872",
                name: "Juan Pérez",
                services: {
                    [ServiceType.SPECIALTY]: ["600000000000000000000041", "600000000000000000000043"],
                    [ServiceType.PRACTICE]: ["600000000000000000000051", "600000000000000000000052"]
                },
                locationIds: ["600000000000000000000031", "600000000000000000000032"],
                availabilities: [
                    { dayOfWeek: "MONDAY", startTime: "08:00", endTime: "16:00" },
                    { dayOfWeek: "WEDNESDAY", startTime: "10:00", endTime: "18:00" }
                ],
            }),
            new Doctor({
                id: "600000000000000000000012",
                userId: "600000000000000000000002",
                registration: "MED-AR-99321",
                name: "María González",
                services: {
                    [ServiceType.SPECIALTY]: ["600000000000000000000042", "600000000000000000000043"],
                    [ServiceType.PRACTICE]: ["600000000000000000000053"]
                },
                locationIds: ["600000000000000000000033"],
                availabilities: [
                    { dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "15:00" },
                    { dayOfWeek: "THURSDAY", startTime: "12:00", endTime: "20:00" }
                ],
            })
        ];
    }

    save(doctor) {
        if (!doctor.id)
            doctor.id = IdUtils.generateId();
        this.doctors.push(doctor)
        return doctor.id;
    }

    findById(id) {
        return this.doctors.find(doctor => doctor.id === id) || null
    }

    findAll({ userId, registration, serviceType, serviceId, doctorIds, locationIds } = {}) {
        return this.doctors.filter(doctor => {
            return (!userId || doctor.userId === userId) &&
                (!registration || doctor.registration === registration) &&
                (!serviceType || !serviceId || doctor.canPerformService(serviceType, serviceId)) &&
                (!doctorIds?.length || doctorIds.includes(doctor.id)) &&
                (!locationIds?.length || doctor.locationIds.some(locId => locationIds.includes(locId)));
        });
    }

    exists({ userId, registration } = {}) {
        return this.doctors.some(doctor =>
            (userId && doctor.userId === userId) ||
            (registration && doctor.registration === registration)
        );
    }

    delete(doctorID) {
        const index = this.doctors.findIndex(doctor => doctor.id === doctorID)
        let doctorToDelete = null
        if (index !== -1) {
            doctorToDelete = this.doctors[index]
            this.doctors.splice(index, 1);
        }
        return doctorToDelete;
    }

    update(doctorToUpdate) {
        const index = this.doctors.findIndex(doctor => doctor.id === doctorToUpdate.id)
        if (index === -1) return null
        this.doctors[index] = doctorToUpdate
        return doctorToUpdate
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}