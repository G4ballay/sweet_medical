import { Appointment } from "../domain/appointment.js";
import { AppointmentStatus } from "../enums/appointment-status.enum.js";
import { CoverageLevel } from "../enums/coverage-level.enum.js";
import { DomainError, ForbiddenError, InvalidOperationError, NotFoundError } from "../errors/domain.errors.js";
import { MedicalServiceFactory } from "../factories/medical-service.factory.js";
import { AppointmentPolicyFactory } from "../factories/policy.factory.js";
import { RepositoryFactory } from "../factories/repository.factory.js";
import { RoleResolverFactory } from "../factories/role.factory.js";
import { DateUtils } from "../utils/date.utils.js";
import { DoctorService } from "./doctor.service.js";
import { HealthInsuranceService } from "./health-insurance.service.js";
import { LocationService } from "./location.service.js";
import { NotificationService } from "./notification.service.js";
import { PatientService } from "./patient.service.js";

export class AppointmentService {
    constructor({
        appointmentRepository = RepositoryFactory.getAppointmentRepository(),
        doctorService = new DoctorService(),
        patientService = new PatientService(),
        locationService = new LocationService(),
        healthInsuranceService = new HealthInsuranceService(),
        notificationService = new NotificationService(),
        medicalServiceFactory = new MedicalServiceFactory()
    } = {}) {
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.locationService = locationService;
        this.healthInsuranceService = healthInsuranceService;
        this.notificationService = notificationService;
        this.medicalServiceFactory = medicalServiceFactory;
    }

    async #fetchEntities(ids, batchFn, singleFn, label) {
        if (!ids || ids.length === 0) return [];

        if (batchFn) {
            try {
                const results = await batchFn(ids);
                if (Array.isArray(results) && results.length > 0) return results;
            } catch (e) {
                console.error(`Error in batch lookup for ${label}:`, e.message);
            }
        }

        if (singleFn) {
            try {
                const results = await Promise.all(
                    ids.map(id => singleFn(id).catch(() => null))
                );
                return results.filter(Boolean);
            } catch (e) {
                console.error(`Error in individual lookup for ${label}:`, e.message);
            }
        }

        return [];
    }

    async populateDetails(appointments) {
        if (!appointments || appointments.length === 0) return appointments;

        const doctorIds = [...new Set(appointments.map(a => a.doctorId).filter(Boolean))];
        const patientIds = [...new Set(appointments.map(a => a.patientId).filter(Boolean))];
        const locationIds = [...new Set(appointments.map(a => a.locationId).filter(Boolean))];

        const [doctors, patients, locations] = await Promise.all([
            this.#fetchEntities(
                doctorIds,
                this.doctorService?.doctorRepository?.findAll
                    ? (ids) => this.doctorService.doctorRepository.findAll({ doctorIds: ids })
                    : null,
                this.doctorService?.getById
                    ? (id) => this.doctorService.getById(id)
                    : null,
                'doctors'
            ),
            this.#fetchEntities(
                patientIds,
                this.patientService?.patientRepository?.findAll
                    ? (ids) => this.patientService.patientRepository.findAll({ _id: { $in: ids } })
                    : null,
                this.patientService?.getById
                    ? (id) => this.patientService.getById(id)
                    : null,
                'patients'
            ),
            this.#fetchEntities(
                locationIds,
                this.locationService?.locationRepository?.findAll
                    ? (ids) => this.locationService.locationRepository.findAll({ _id: { $in: ids } })
                    : null,
                this.locationService?.getById
                    ? (id) => this.locationService.getById(id)
                    : null,
                'locations'
            ),
        ]);

        const healthInsuranceIds = [...new Set(patients.map(p => p.healthInsuranceId || p.healthInsurance?.id).filter(Boolean))];
        const healthInsurances = await this.#fetchEntities(
            healthInsuranceIds,
            this.healthInsuranceService?.healthInsuranceRepository?.findAll
                ? (ids) => this.healthInsuranceService.healthInsuranceRepository.findAll({ _id: { $in: ids } })
                : null,
            this.healthInsuranceService?.getById
                ? (id) => this.healthInsuranceService.getById(id)
                : null,
            'healthInsurances'
        );

        let specialties = [];
        let practices = [];
        try {
            const specialtyService = this.medicalServiceFactory?.getService('SPECIALTY');
            if (specialtyService) {
                specialties = await (typeof specialtyService.getAll === 'function'
                    ? specialtyService.getAll()
                    : []);
            }
        } catch (e) {
            console.error("Error populating specialties:", e.message);
        }

        try {
            const practiceService = this.medicalServiceFactory?.getService('PRACTICE');
            if (practiceService) {
                practices = await (typeof practiceService.getAll === 'function'
                    ? practiceService.getAll()
                    : []);
            }
        } catch (e) {
            console.error("Error populating practices:", e.message);
        }

        const doctorsMap = new Map(doctors.map(d => [d.id, d]));
        const patientsMap = new Map(patients.map(p => [p.id, p]));
        const locationsMap = new Map(locations.map(l => [l.id, l]));
        const healthInsurancesMap = new Map(healthInsurances.map(hi => [hi.id, hi]));
        const servicesMap = new Map([
            ...specialties.map(s => [s.id, s]),
            ...practices.map(p => [p.id, p])
        ]);

        for (const appointment of appointments) {
            const doctor = doctorsMap.get(appointment.doctorId);
            const patient = patientsMap.get(appointment.patientId);
            const location = locationsMap.get(appointment.locationId);
            const service = servicesMap.get(appointment.serviceId);

            if (doctor) appointment.doctor = { id: doctor.id, name: doctor.name };
            if (patient) appointment.patient = { id: patient.id, name: patient.name };
            if (location) appointment.location = { id: location.id, name: location.name };
            if (service) appointment.service = { id: service.id, name: service.name };

            // Calculate and populate coverageLevel
            if (patient && service) {
                const healthInsuranceId = patient.healthInsuranceId || patient.healthInsurance?.id;
                const planId = patient.planId || patient.plan?.id;
                const healthInsurance = healthInsurancesMap.get(healthInsuranceId);
                const plan = healthInsurance?.getPlan(planId);
                const coverageLevel = plan?.getCoverage(appointment.serviceType, service) ?? CoverageLevel.NOT_COVERED;
                appointment.coverageLevel = coverageLevel;
            } else {
                appointment.coverageLevel = CoverageLevel.NOT_COVERED;
            }
        }

        return appointments;
    }

    async getById(appointmentId, user = null) {
        const appointment = await this.appointmentRepository.findById(appointmentId);
        if (!appointment) throw new NotFoundError("Turno", appointmentId);

        if (user) {
            const policy = AppointmentPolicyFactory.getPolicy(user.role);
            if (!policy.canView(appointment, user))
                throw new ForbiddenError("No tiene permiso para ver este turno.");
        }

        const [populated] = await this.populateDetails([appointment]);
        return populated;
    }

    async getAll(filters = {}) {
        const { patientId, doctorId, status, dateFrom, dateTo, orderBy, orderDir } = filters;

        const repoFilters = {
            ...(patientId && { patientId }),
            ...(doctorId && { doctorId }),
            ...(status && { status }),
            ...((dateFrom || dateTo) && {
                dateRange: {
                    ...(dateFrom && { start: new Date(dateFrom) }),
                    ...(dateTo && { end: new Date(dateTo) })
                }
            }),
        };

        const appointments = await this.appointmentRepository.findAll(repoFilters, orderBy, orderDir);
        return await this.populateDetails(appointments);
    }

    async getActiveAppointments(doctorIds, dateFrom, dateTo) {
        const allAppointments = [];
        for (const doctorId of doctorIds) {
            const appointments = await this.appointmentRepository.findAll({
                doctorId,
                onlyActive: true,
                dateRange: { start: dateFrom, end: dateTo }
            });
            allAppointments.push(...appointments);
        }
        return allAppointments;
    }

    #validateDoctorCapabilities(doctor, locationId, startTime, serviceType, serviceId) {
        if (!doctor.canAttendAtLocation(locationId))
            throw new InvalidOperationError("El Médico no atiende en la ubicación solicitada.");

        if (!doctor.isAvailableAt(startTime))
            throw new InvalidOperationError("El Médico no trabaja en la fecha y hora solicitadas.");

        if (!doctor.canPerformService(serviceType, serviceId))
            throw new InvalidOperationError("El Médico no realiza este servicio.");
    }

    async #validateOverlaps(doctorId, start, end, excludeAppointmentId = null) {
        const activeAppointments = await this.appointmentRepository.findAll({
            doctorId,
            onlyActive: true,
            dateRange: { start, end }
        });

        const hasOverlap = activeAppointments.some(app => app.id !== excludeAppointmentId);
        if (hasOverlap)
            throw new InvalidOperationError("El Médico tiene otro turno programado en ese horario.");
    }

    async book(bookingsData) {
        if (!Array.isArray(bookingsData)) return this.#bookSingle(bookingsData);
        if (bookingsData.length === 1) return this.#bookSingle(bookingsData[0]);

        const successes = [];
        const failures = [];

        for (let i = 0; i < bookingsData.length; i++) {
            const data = bookingsData[i];
            try {
                const id = await this.#bookSingle(data);
                successes.push({ index: i, id });
            } catch (err) {
                if (!(err instanceof DomainError)) console.error("Error interno al reservar turno:", err);
                failures.push({
                    index: i,
                    error: err instanceof DomainError ? err.message : "Ocurrió un error inesperado al reservar el turno."
                });
            }
        }

        return { successes, failures };
    }

    async #bookSingle(bookingData) {
        const { doctorId, patientId, startTime, serviceType, serviceId, locationId } = bookingData;

        const serviceResolver = this.medicalServiceFactory.getService(serviceType);

        const [doctor, patient, service, location] = await Promise.all([
            this.doctorService.getById(doctorId),
            this.patientService.getById(patientId),
            serviceResolver.getById(serviceId),
            this.locationService.getById(locationId)
        ]);

        this.#validateDoctorCapabilities(doctor, locationId, startTime, serviceType, serviceId);

        const { start, end } = DateUtils.getTimeRange(startTime, service.durationInMins);
        await this.#validateOverlaps(doctorId, start, end);

        const { estimatedCost } = await this.healthInsuranceService.getCoverageInfo(
            patient.healthInsurance?.id, patient.plan?.id, serviceType, service
        );

        const appointment = new Appointment({
            ...bookingData,
            startTime,
            endTime: end,
            status: AppointmentStatus.BOOKED,
            cost: estimatedCost
        });

        await this.notificationService.create({
            recipient: doctor.userId,
            message: `Paciente ${patient.name} solicitó un turno de ${service.name} para el ${DateUtils.formatForDisplay(startTime)}.`
        });

        return await this.appointmentRepository.save(appointment);
    }

    async confirm(id, user) {
        const appointment = await this.getById(id, user);
        const policy = AppointmentPolicyFactory.getPolicy(user.role);

        if (!policy.canConfirm(appointment, user))
            throw new ForbiddenError("No tiene permiso para confirmar el turno.");

        appointment.confirm(policy.getEntityId(user));

        const targetRole = policy.getAntagonistRole();
        const targetEntityId = policy.getAntagonistEntityId(appointment);
        const targetEntity = await RoleResolverFactory.getEntityById(targetRole, targetEntityId);

        const serviceResolver = this.medicalServiceFactory.getService(appointment.serviceType);
        const service = await serviceResolver.getById(appointment.serviceId);

        await this.notificationService.create({
            recipient: targetEntity.userId,
            message: `Profesional ${appointment.doctor.name} confirmó su turno de ${service.name} para el ${DateUtils.formatForDisplay(appointment.startTime)}.`
        });

        return await this.appointmentRepository.update(appointment);
    }

    async complete(id, user) {
        const appointment = await this.getById(id, user);
        const policy = AppointmentPolicyFactory.getPolicy(user.role);

        if (!policy.canComplete(appointment, user))
            throw new ForbiddenError("No tiene permiso para completar el turno.");

        appointment.complete(policy.getEntityId(user));
        return await this.appointmentRepository.update(appointment);
    }

    async cancel({ id, reason, user }) {
        const appointment = await this.getById(id, user);
        const policy = AppointmentPolicyFactory.getPolicy(user.role);

        if (!policy.canCancel(appointment, user))
            throw new ForbiddenError("No tiene permiso para cancelar este turno.");

        appointment.cancel(user.userId, reason);

        const targetRole = policy.getAntagonistRole();
        const targetEntityId = policy.getAntagonistEntityId(appointment);
        const targetEntity = await RoleResolverFactory.getEntityById(targetRole, targetEntityId);

        const serviceResolver = this.medicalServiceFactory.getService(appointment.serviceType);
        const service = await serviceResolver.getById(appointment.serviceId);

        const cancellerName = user.role === 'doctor' ? `Profesional ${appointment.doctor.name}` : `Paciente ${appointment.patient.name}`;

        await this.notificationService.create({
            recipient: targetEntity.userId,
            message: `${cancellerName} canceló el turno de ${service.name} programado para el ${DateUtils.formatForDisplay(appointment.startTime)}. Motivo: ${reason}`
        });

        return await this.appointmentRepository.update(appointment);
    }

    async #prepareRescheduleData(appointment, startTime) {
        const serviceResolver = this.medicalServiceFactory.getService(appointment.serviceType);

        const [doctor, service, patient] = await Promise.all([
            this.doctorService.getById(appointment.doctorId),
            serviceResolver.getById(appointment.serviceId),
            this.patientService.getById(appointment.patientId)
        ]);

        this.#validateDoctorCapabilities(doctor, appointment.locationId, startTime, appointment.serviceType, appointment.serviceId);

        const { start, end } = DateUtils.getTimeRange(startTime, service.durationInMins);
        await this.#validateOverlaps(appointment.doctorId, start, end, appointment.id);

        return { doctor, service, patient, end };
    }

    async reschedule({ id, startTime, user, reason }) {
        const appointment = await this.getById(id, user);
        const policy = AppointmentPolicyFactory.getPolicy(user.role);

        if (!policy.canReschedule(appointment, user))
            throw new ForbiddenError("No tiene permiso para reprogramar el turno.");

        const { service, end } = await this.#prepareRescheduleData(appointment, startTime);

        appointment.reschedule(startTime, end, policy.getEntityId(user), reason);

        const targetRole = policy.getAntagonistRole();
        const targetEntityId = policy.getAntagonistEntityId(appointment);
        const targetEntity = await RoleResolverFactory.getEntityById(targetRole, targetEntityId);

        await this.notificationService.create({
            recipient: targetEntity.userId,
            message: `Paciente ${appointment.patient.name} reprogramó su turno de ${service.name}. Nueva fecha: ${DateUtils.formatForDisplay(startTime)}. Motivo: ${reason}`
        });

        return await this.appointmentRepository.update(appointment);
    }

    async proposeReschedule({ id, startTime, user, reason }) {
        const appointment = await this.getById(id, user);
        const policy = AppointmentPolicyFactory.getPolicy(user.role);

        if (!policy.canProposeReschedule(appointment, user))
            throw new ForbiddenError("No tiene permiso para proponer una reprogramación.");

        const { service, end } = await this.#prepareRescheduleData(appointment, startTime);

        appointment.proposeReschedule(startTime, end, policy.getEntityId(user), reason);

        const targetRole = policy.getAntagonistRole();
        const targetEntityId = policy.getAntagonistEntityId(appointment);
        const targetEntity = await RoleResolverFactory.getEntityById(targetRole, targetEntityId);

        await this.notificationService.create({
            recipient: targetEntity.userId,
            message: `Profesional ${appointment.doctor.name} propuso reprogramar su turno de ${service.name} para el ${DateUtils.formatForDisplay(startTime)}. Motivo: ${reason}`
        });

        return await this.appointmentRepository.update(appointment);
    }

    async acceptReschedule(id, user) {
        const appointment = await this.getById(id, user);
        const policy = AppointmentPolicyFactory.getPolicy(user.role);

        if (!policy.canAcceptReschedule(appointment, user))
            throw new ForbiddenError("No tiene permiso para aceptar la propuesta de reprogramación.");

        const { service } = await this.#prepareRescheduleData(appointment, appointment.proposedStartTime);

        appointment.acceptReschedule(policy.getEntityId(user));

        const targetRole = policy.getAntagonistRole();
        const targetEntityId = policy.getAntagonistEntityId(appointment);
        const targetEntity = await RoleResolverFactory.getEntityById(targetRole, targetEntityId);

        await this.notificationService.create({
            recipient: targetEntity.userId,
            message: `Paciente ${appointment.patient.name} aceptó el nuevo horario para su turno de ${service.name}. Fecha confirmada: ${DateUtils.formatForDisplay(appointment.startTime)}.`
        });

        return await this.appointmentRepository.update(appointment);
    }

    async rejectReschedule(id, user, reason) {
        const appointment = await this.getById(id, user);
        const policy = AppointmentPolicyFactory.getPolicy(user.role);

        if (!policy.canRejectReschedule(appointment, user))
            throw new ForbiddenError("No tiene permiso para rechazar la propuesta de reprogramación.");

        appointment.rejectReschedule(policy.getEntityId(user), reason);

        const targetRole = policy.getAntagonistRole();
        const targetEntityId = policy.getAntagonistEntityId(appointment);
        const targetEntity = await RoleResolverFactory.getEntityById(targetRole, targetEntityId);

        await this.notificationService.create({
            recipient: targetEntity.userId,
            message: `Paciente ${appointment.patient.name} rechazó la reprogramación de su turno de ${appointment.service?.name}. El turno se mantiene para el ${DateUtils.formatForDisplay(appointment.startTime)}. Motivo del rechazo: ${reason}`
        });

        return await this.appointmentRepository.update(appointment);
    }

    async patch(id, patchData, user) {
        const { status, startTime, reason } = patchData;

        const appointment = await this.getById(id, user);
        const policy = AppointmentPolicyFactory.getPolicy(user.role);

        if (status === AppointmentStatus.CONFIRMED && policy.canConfirm(appointment, user))
            return this.confirm(id, user);

        if (status === AppointmentStatus.COMPLETED && policy.canComplete(appointment, user))
            return this.complete(id, user);

        if (startTime && reason && policy.canReschedule(appointment, user))
            return this.reschedule({ id, startTime, user, reason });

        if (startTime && reason && policy.canProposeReschedule(appointment, user))
            return this.proposeReschedule({ id, startTime, user, reason });

        throw new InvalidOperationError("No se pudo determinar la operación. Verifique su rol y los parámetros enviados.");
    }
}