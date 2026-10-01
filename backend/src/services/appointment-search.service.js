import { OrderFields } from "../enums/orderables.enum.js";
import { ServiceType } from "../enums/service-type.enum.js";
import { CoverageLevel } from "../enums/coverage-level.enum.js";
import { ArrayUtils } from "../utils/array.utils.js";
import { DateUtils } from "../utils/date.utils.js";
import { PaginationUtils } from "../utils/pagination.utils.js";
import { SlotCalculator } from "../utils/slot-calculator.js";
import { AppointmentService } from "./appointment.service.js";
import { DoctorService } from "./doctor.service.js";
import { HealthInsuranceService } from "./health-insurance.service.js";
import { LocationService } from "./location.service.js";
import { PatientService } from "./patient.service.js";
import { MedicalServiceFactory } from "../factories/medical-service.factory.js";

export class AppointmentSearchService {
    constructor({
        doctorService = new DoctorService(),
        patientService = new PatientService(),
        medicalServiceFactory = new MedicalServiceFactory(),
        healthInsuranceService = new HealthInsuranceService(),
        appointmentService = new AppointmentService(),
        locationService = new LocationService()
    } = {}) {
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.MedicalServiceFactory = medicalServiceFactory;
        this.healthInsuranceService = healthInsuranceService;
        this.appointmentService = appointmentService;
        this.locationService = locationService;
    }

    #prepareDoctors(doctors, locationIds) {
        return doctors.map(doc => ({
            ...doc,
            activeLocations: locationIds?.length
                ? doc.locationIds.filter(id => locationIds.includes(id))
                : doc.locationIds
        })).filter(doc => doc.activeLocations.length > 0);
    }

    async #buildLocationMap(doctors) {
        const uniqueIds = [...new Set(doctors.flatMap(d => d.activeLocations))];
        const locations = await Promise.all(
            uniqueIds.map(id => this.locationService.getById(id))
        );
        return Object.fromEntries(locations.map(loc => [loc.id, loc.name]));
    }

    async calculateAppointmentSlots(filters, patientId) {
        const { serviceType, serviceId, doctorIds, locationIds, orderBy, orderDir, page = 1, limit = 20 } = filters;
        const start = (page - 1) * limit;

        const service = await this.MedicalServiceFactory.getMedicalService(serviceType, serviceId);
        const { dateFrom, dateTo } = DateUtils.resolveDateRange(filters.dateFrom, filters.dateTo);

        const patient = patientId ? await this.patientService.getById(patientId) : null;
        let coverageLevel = CoverageLevel.NOT_COVERED;
        let estimatedCost = service.cost;

        if (patient) {
            const coverageInfo = await this.healthInsuranceService.getCoverageInfo(
                patient.healthInsuranceId || patient.healthInsurance?.id,
                patient.planId || patient.plan?.id,
                serviceType,
                service
            );
            coverageLevel = coverageInfo.coverageLevel;
            estimatedCost = coverageInfo.estimatedCost;
        }

        const doctors = await this.doctorService.getAll({ serviceType, serviceId, doctorIds, locationIds });
        if (!doctors.length) return { total: 0, page: 1, totalPages: 0, availableSlots: [] };

        const preparedDoctors = this.#prepareDoctors(doctors, locationIds);
        const doctorIdList = preparedDoctors.map(d => d.id);
        const existingAppointments = await this.appointmentService.getActiveAppointments(doctorIdList, dateFrom, dateTo);

        const rawSlots = SlotCalculator.generateSlots({
            dateFrom, dateTo, doctors: preparedDoctors, durationInMins: service.durationInMins, existingAppointments
        });

        const uniqueLocationIds = [...new Set(preparedDoctors.flatMap(d => d.activeLocations))];
        const locationMap = await this.#buildLocationMap(preparedDoctors);

        const slots = rawSlots.map(slot => ({
            [OrderFields.DATE]: slot.startTime,
            endTime: slot.endTime,
            doctorId: slot.doctorId,
            doctorName: slot.doctorName,
            locationId: slot.locationId,
            locationName: locationMap[slot.locationId] || null,
            serviceType,
            serviceId,
            serviceName: service.name,
            coverageLevel: coverageLevel,
            [OrderFields.COST]: estimatedCost,
        }));

        const sortedSlots = ArrayUtils.sortObjects(slots, orderBy, orderDir);
        const { items: availableSlots, ...paginationInfo } = PaginationUtils.paginate(sortedSlots, start, limit);
        return { ...paginationInfo, availableSlots };
    }
}