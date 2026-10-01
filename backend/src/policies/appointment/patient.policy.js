import { Role } from '../../enums/role.enum.js';
import { AppointmentPolicy } from './appointment.policy.js';

export class PatientPolicy extends AppointmentPolicy {
    canView(appointment, user) { return appointment.patientId?.toString() === user.patientId?.toString(); }
    canCancel(appointment, user) { return appointment.patientId?.toString() === user.patientId?.toString(); }
    canReschedule(appointment, user) { return appointment.patientId?.toString() === user.patientId?.toString(); }
    canAcceptReschedule(appointment, user) { return appointment.patientId?.toString() === user.patientId?.toString(); }
    canRejectReschedule(appointment, user) { return appointment.patientId?.toString() === user.patientId?.toString(); }

    getEntityId(user) { return user.patientId; }

    getAntagonistRole() { return Role.DOCTOR; }
    getAntagonistEntityId(appointment) { return appointment.doctorId; }
}
