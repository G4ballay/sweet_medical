export const AppointmentStatus = Object.freeze({
    BOOKED: 'RESERVADO',
    CONFIRMED: 'CONFIRMADO',
    CANCELLED: 'CANCELADO',
    COMPLETED: 'REALIZADO',
    RESCHEDULE_PROPOSED: 'REPROGRAMACION_PROPUESTA'
});

export const ACTIVE_APPOINTMENT_STATUSES = [
    AppointmentStatus.BOOKED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.RESCHEDULE_PROPOSED
];

export const RescheduleProposalStatus = Object.freeze({
    ACCEPTED: 'ACEPTADO',
    REJECTED: 'RECHAZADO'
});