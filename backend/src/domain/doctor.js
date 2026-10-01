import { DayOfWeek } from "../enums/day-of-week.enum.js";
import { ServiceType } from "../enums/service-type.enum.js";

export class TimeAvailability {
    constructor({ dayOfWeek, startTime, endTime }) {
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

export class Doctor {
    constructor({ id, userId, registration, name, services = {}, locationIds = [], availabilities = [] }) {
        this.id = id;
        this.userId = userId;
        this.registration = registration;
        this.name = name;
        this.services = services;
        this.locationIds = locationIds;
        this.availabilities = availabilities.map(a =>
            a instanceof TimeAvailability ? a : new TimeAvailability(a)
        );
    }

    updateAvailabilities(availabilities = []) {
        this.availabilities = availabilities.map(a =>
            a instanceof TimeAvailability ? a : new TimeAvailability(a)
        );
    }

    isAvailableAt(requestedStartTime) {
        if (!this.availabilities.length) return false;
        const date = new Date(requestedStartTime);

        const requestedDay = Object.values(DayOfWeek)[date.getUTCDay()];
        const requestedMinutesFromMidnight = (date.getUTCHours() * 60) + date.getUTCMinutes();

        return this.availabilities.some(range => {
            if (range.dayOfWeek !== requestedDay) return false;

            const [startHour, startMin] = range.startTime.split(':').map(Number);
            const [endHour, endMin] = range.endTime.split(':').map(Number);

            const startMinutes = (startHour * 60) + startMin;
            const endMinutes = (endHour * 60) + endMin;

            return requestedMinutesFromMidnight >= startMinutes && requestedMinutesFromMidnight < endMinutes;
        });
    }

    canAttendAtLocation(locationId) {
        return this.locationIds.includes(locationId);
    }

    canPerformService(serviceType, serviceId) {
        const serviceIds = this.getServiceIds(serviceType);
        return serviceIds.includes(serviceId);
    }

    getServiceIds(serviceType) {
        return this.services[serviceType] || [];
    }

    updateServices(serviceType, newServiceIds) {
        this.services[serviceType] = newServiceIds;
    }
}