import { Role } from '../enums/role.enum.js';
import { ForbiddenError } from '../errors/domain.errors.js';
import { DoctorPolicy } from '../policies/appointment/doctor.policy.js';
import { PatientPolicy } from '../policies/appointment/patient.policy.js';

const POLICY_MAP = {
    [Role.PATIENT]: () => new PatientPolicy(),
    [Role.DOCTOR]: () => new DoctorPolicy(),
};

export class AppointmentPolicyFactory {
    static getPolicy(role) {
        const factory = POLICY_MAP[role];
        if (!factory) throw new ForbiddenError(`Rol no soportado para operaciones de turnos: ${role}`);
        return factory();
    }
}
