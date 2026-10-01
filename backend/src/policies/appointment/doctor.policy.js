import { Role } from '../../enums/role.enum.js';
import { AppointmentPolicy } from './appointment.policy.js';

export class DoctorPolicy extends AppointmentPolicy {
    canView(appointment, user) { return appointment.doctorId?.toString() === user.doctorId?.toString(); }
    canCancel(appointment, user) { return appointment.doctorId?.toString() === user.doctorId?.toString(); }
    canConfirm(appointment, user) { return appointment.doctorId?.toString() === user.doctorId?.toString(); }
    canComplete(appointment, user) { return appointment.doctorId?.toString() === user.doctorId?.toString(); }
    canProposeReschedule(appointment, user) { return appointment.doctorId?.toString() === user.doctorId?.toString(); }

    getEntityId(user) { return user.doctorId; }

    getAntagonistRole() { return Role.PATIENT; }
    getAntagonistEntityId(appointment) { return appointment.patientId; }
}
