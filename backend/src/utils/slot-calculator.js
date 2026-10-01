import { DayOfWeek } from "../enums/day-of-week.enum.js";
import { DateUtils } from "../utils/date.utils.js";

const DAYS_MAP = Object.values(DayOfWeek)

export class SlotCalculator {
    static generateSlots({ dateFrom, dateTo, doctors, durationInMins, existingAppointments }) {
        const dates = DateUtils.getDaysBetween(dateFrom, dateTo);
        const durationMs = durationInMins * 60000;
        const nowMs = dateFrom.getTime();

        return doctors.flatMap(doctor => {
            const doctorAppointments = SlotCalculator.#appointmentsByDoctor(existingAppointments)[doctor.id] || [];
            const doctorAvailabilities = SlotCalculator.#availabilitiesByDay(doctor);
            return dates.flatMap(date => {
                const dayOfWeek = DAYS_MAP[date.getUTCDay()];
                const availabilitiesForDay = doctorAvailabilities[dayOfWeek];
                if (!availabilitiesForDay) return [];
                return SlotCalculator.#slotsForDoctor(doctor, date, availabilitiesForDay, doctorAppointments, nowMs, durationMs);
            });
        })
    }

    static #availabilitiesByDay(doctor) {
        return doctor.availabilities.reduce((acc, availability) => {
            if (!acc[availability.dayOfWeek]) acc[availability.dayOfWeek] = [];
            acc[availability.dayOfWeek].push(availability);
            return acc;
        }, {});
    }

    static #appointmentsByDoctor(existingAppointments) {
        return existingAppointments.reduce((acc, app) => {
            if (!acc[app.doctorId]) acc[app.doctorId] = [];
            acc[app.doctorId].push(app);
            return acc;
        }, {});
    }

    static #slotsForDoctor(doctor, date, availabilities, doctorAppointments, nowMs, durationMs) {
        return availabilities.flatMap(availability => {
            const startMs = DateUtils.setHourToDate(date, availability.startTime);
            const endMs = DateUtils.setHourToDate(date, availability.endTime);
            const intervals = DateUtils.getTimeIntervals(startMs, endMs, durationMs);

            return intervals
                .filter(interval => interval.start > nowMs)
                .filter(interval => !doctorAppointments.some(app => {
                    const overlapsCurrent = DateUtils.isTimeOverlap(interval.start, interval.end, app.startTime, app.endTime);
                    const overlapsProposed = app.proposedStartTime && DateUtils.isTimeOverlap(interval.start, interval.end, app.proposedStartTime, app.proposedEndTime);
                    return overlapsCurrent || overlapsProposed;
                }))
                .flatMap(interval =>
                    doctor.activeLocations.map(locationId => ({
                        doctorId: doctor.id,
                        doctorName: doctor.name,
                        locationId,
                        startTime: new Date(interval.start).toISOString(),
                        endTime: new Date(interval.end).toISOString()
                    }))
                );
        });
    }
}