export class AppointmentPolicy {
    canView(appointment, user) { return false; }
    canCancel(appointment, user) { return false; }
    canConfirm(appointment, user) { return false; }
    canComplete(appointment, user) { return false; }
    canReschedule(appointment, user) { return false; }
    canProposeReschedule(appointment, user) { return false; }
    canAcceptReschedule(appointment, user) { return false; }
    canRejectReschedule(appointment, user) { return false; }

    getEntityId(user) { return null; }

    getAntagonistRole() { return null; }
    getAntagonistEntityId(appointment) { return null; }
}
