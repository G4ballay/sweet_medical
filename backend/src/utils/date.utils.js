export class DateUtils {
    static getDifferenceInHours(futureDate, pastDate = new Date()) {
        const diffInMs = futureDate.getTime() - pastDate.getTime();
        return diffInMs / (1000 * 60 * 60);
    }

    static getTimeRange(startTime, durationInMins) {
        const start = new Date(startTime).getTime();
        const end = start + (durationInMins * 60000);
        return { start, end };
    }

    static resolveDateRange(rawDateFrom, rawDateTo, { defaultRangeDays = 7 } = {}) {
        const dateFrom = rawDateFrom ? new Date(rawDateFrom) : new Date();
        const dateTo = rawDateTo
            ? new Date(rawDateTo)
            : new Date(dateFrom.getTime() + defaultRangeDays * 24 * 60 * 60 * 1000);

        dateTo.setUTCHours(23, 59, 59, 999);

        return { dateFrom, dateTo };
    }

    static getTimeIntervals(startTimeMs, endTimeMs, durationMs) {
        const intervals = [];
        let current = startTimeMs;
        while (current + durationMs <= endTimeMs) {
            intervals.push({
                start: current,
                end: current + durationMs
            });
            current += durationMs;
        }
        return intervals;
    }

    static setHourToDate(baseDate, timeString) {
        const [hours, mins] = timeString.split(':').map(Number);
        return new Date(baseDate).setUTCHours(hours, mins, 0, 0);
    }

    static isTimeOverlap(startA, endA, startB, endB) {
        if (!startA || !endA) return false;
        const startAMs = new Date(startA).getTime();
        const endAMs = new Date(endA).getTime();
        const startBMs = startB ? new Date(startB).getTime() : -Infinity;
        const endBMs = endB ? new Date(endB).getTime() : Infinity;
        return startAMs < endBMs && startBMs < endAMs;
    }

    static getDaysBetween(startDate, endDate) {
        const dates = [];
        for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
            dates.push(new Date(d));
        }
        return dates;
    }
    static formatForDisplay(date) {
        return new Date(date).toLocaleString('es-AR', { 
            timeZone: 'America/Argentina/Buenos_Aires',
            hour12: false,
            dateStyle: 'short',
            timeStyle: 'short'
        });
    }
}