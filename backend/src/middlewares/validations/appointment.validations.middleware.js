import { param, query } from "express-validator";
import { AppointmentStatus, RescheduleProposalStatus } from "../../enums/appointment-status.enum.js";
import { OrderDirection, OrderFields } from "../../enums/orderables.enum.js";
import { ServiceType } from "../../enums/service-type.enum.js";
import {
    validateArray,
    validateDate,
    validateDateRange,
    validateEnum,
    validateMongoId,
    validateNumber,
    validateString
} from "./common.validations.middleware.js";

export const validateAppointmentGet = () => [
    validateMongoId('patientId', { location: query, required: false }),
    validateMongoId('doctorId', { location: query, required: false }),
    validateEnum('status', AppointmentStatus, { location: query, required: false }),
    validateDate('dateFrom', { location: query, required: false, allowPastDate: false }),
    validateDate('dateTo', { location: query, required: false, allowPastDate: false }),
    validateDateRange('dateFrom', 'dateTo', query),
    validateEnum('orderBy', OrderFields, { location: query, required: false }),
    validateEnum('orderDir', OrderDirection, { location: query, required: false }),
    validateNumber('page', { location: query, required: false, min: 1 }),
    validateNumber('limit', { location: query, required: false, min: 1 })
];

export const validateAppointmentGetById = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del turno es requerido para la consulta' })
];

export const validateAppointmentBook = () => [
    validateMongoId('*.doctorId', { customMessage: 'El ID del doctor es requerido para reservar una cita' }),
    validateDate('*.startTime', { customMessage: 'La fecha y hora de la cita son obligatorias', allowPastDate: false }),
    validateEnum('*.serviceType', ServiceType, { customMessage: 'El tipo de servicio es obligatorio y debe ser válido' }),
    validateMongoId('*.serviceId', { customMessage: 'El ID del servicio es requerido para reservar una cita' }),
    validateMongoId('*.locationId', { customMessage: 'El ID de la ubicación es requerido para reservar una cita' })
];

export const validateAppointmentPatch = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del turno es requerido' }),
    validateEnum('status', AppointmentStatus, { required: false, customMessage: 'El estado debe ser uno de: ' + Object.values(AppointmentStatus).join(', ') }),
    validateDate('startTime', { required: false, allowPastDate: false }),
    validateString('reason', { required: false })
];

export const validateAppointmentDelete = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del turno es requerido' }),
    validateString('reason', { customMessage: 'El motivo de cancelación es requerido' })
];

export const validateAppointmentSearch = () => [
    validateEnum('serviceType', ServiceType, { location: query, customMessage: 'El tipo de servicio es obligatorio y debe ser uno de: ' + Object.values(ServiceType).join(', ') }),
    validateMongoId('serviceId', { location: query, customMessage: 'El ID del servicio es requerido para la búsqueda' }),
    validateDate('dateFrom', { location: query, required: false, allowPastDate: false }),
    validateDate('dateTo', { location: query, required: false, allowPastDate: false }),
    validateDateRange('dateFrom', 'dateTo', query),
    ...validateArray('doctorIds', { location: query, required: false, itemType: 'id' }),
    ...validateArray('locationIds', { location: query, required: false, itemType: 'id' }),
    validateEnum('orderBy', OrderFields, { location: query, required: false, customMessage: 'El campo orderBy debe ser uno de: ' + Object.values(OrderFields).join(', ') }),
    validateEnum('orderDir', OrderDirection, { location: query, required: false, customMessage: 'El campo orderDir debe ser uno de: ' + Object.values(OrderDirection).join(', ') }),
    validateNumber('page', { location: query, required: false, min: 1 }),
    validateNumber('limit', { location: query, required: false, min: 1 })
];

export const validateRescheduleProposalUpdate = () => [
    validateMongoId('id', { location: param, customMessage: 'El ID del turno es requerido' }),
    validateEnum('status', RescheduleProposalStatus, { customMessage: 'El status debe ser uno de: ' + Object.values(RescheduleProposalStatus).join(', ') }),
    validateString('reason', { required: false, customMessage: 'El motivo del rechazo es requerido cuando se rechaza la propuesta' })
];