import { Role } from '../enums/role.enum.js';
import { DoctorService } from '../services/doctor.service.js';
import { PatientService } from '../services/patient.service.js';
import { RepositoryFactory } from './repository.factory.js';

const ROLE_CONFIG = {
    [Role.PATIENT]: {
        entityIdKey: 'patientId',
        getService: () => new PatientService(),
    },
    [Role.DOCTOR]: {
        entityIdKey: 'doctorId',
        getService: () => new DoctorService(),
    }
};

export class RoleResolverFactory {
    static async getEntityByUserId(role, userId) {
        const config = ROLE_CONFIG[role];
        if (!config) return null;
        const entities = await config.getService().getAll({ userId });
        return entities.length > 0 ? entities[0] : null;
    }

    static async getEntityById(role, entityId) {
        const config = ROLE_CONFIG[role];
        if (!config) throw new Error(`Rol no soportado: ${role}`);
        return await config.getService().getById(entityId);
    }

    static getEntityIdKey(role) {
        return ROLE_CONFIG[role]?.entityIdKey || null;
    }
}
