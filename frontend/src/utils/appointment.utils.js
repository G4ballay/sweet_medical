import { AppointmentStatus, AppointmentTab } from '../enums/appointment-status.enum';
export { AppointmentStatus, AppointmentTab };

export const normalizeAppointments = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.appointments)) return payload.appointments;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const getAppointmentDate = (appointment) => {
  const dateValue = appointment.startTime || appointment.date || appointment.startsAt;
  return dateValue ? new Date(dateValue) : null;
};

export const canBeModifiedByPatient = (appointment) => {
  const date = getAppointmentDate(appointment);
  if (!date) return false;

  return date.getTime() - Date.now() >= 60 * 60 * 1000;
};

export const isValidIdentifier = (value) => (
  value !== undefined
  && value !== null
  && value !== ''
  && String(value).toLowerCase() !== 'undefined'
  && String(value).toLowerCase() !== 'null'
);

export const firstValidIdentifier = (...values) => values.find(isValidIdentifier);

export const getDoctorId = (appointment) => firstValidIdentifier(
  appointment.doctorId,
  appointment.doctor?.id,
  appointment.doctor_id,
  appointment.doctor?.doctorId,
);

export const getPatientId = (appointment) => firstValidIdentifier(
  appointment.patientId,
  appointment.patient?.id,
  appointment.patient_id,
  appointment.patient?.patientId,
);

export const getServiceId = (appointment) => firstValidIdentifier(
  appointment.serviceId,
  appointment.specialtyId,
  appointment.practiceId,
  appointment.service?.id,
);

export const getLocationId = (appointment) => firstValidIdentifier(appointment.locationId, appointment.location?.id);

export const getServiceType = (appointment) => appointment.serviceType || appointment.service?.type;

export const getServiceKey = (serviceId, serviceType) => serviceType ? `${serviceType}:${serviceId}` : String(serviceId);

export const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const mapById = (items) => items.reduce((acc, item) => {
  if (item?.id) acc[item.id] = item;
  return acc;
}, {});

export const mapServicesByKey = (items, serviceType) => items.reduce((acc, item) => {
  if (item?.id) {
    acc[getServiceKey(item.id, serviceType)] = item;
    acc[item.id] = item;
  }
  return acc;
}, {});

export const getDoctorName = (appointment, doctorDetails = {}) => {
  const doctorId = getDoctorId(appointment);
  const doctor = doctorId ? doctorDetails[doctorId] : null;

  return appointment.doctorName
    || appointment.doctor?.name
    || doctor?.name
    || 'Medico no disponible';
};

export const getPatientName = (appointment, patientDetails = {}) => {
  const patientId = getPatientId(appointment);
  const patient = patientId ? patientDetails[patientId] : null;

  return appointment.patientName
    || appointment.patient?.name
    || patient?.name
    || 'Paciente no disponible';
};

export const getServiceName = (appointment, serviceDetails = {}) => {
  const serviceId = getServiceId(appointment);
  const serviceType = getServiceType(appointment);
  const service = serviceId ? serviceDetails[getServiceKey(serviceId, serviceType)] || serviceDetails[serviceId] : null;

  return appointment.serviceName
    || appointment.specialtyName
    || appointment.practiceName
    || appointment.service?.name
    || service?.name
    || 'Servicio no disponible';
};

export const getLocationName = (appointment, locationDetails = {}) => {
  const locationId = getLocationId(appointment);
  const location = locationId ? locationDetails[locationId] : null;

  return appointment.locationName
    || appointment.location?.name
    || location?.name
    || 'Sede no disponible';
};

export const getRawAppointmentStatus = (appointment) => String(appointment.status || appointment.state || '').toUpperCase();

export const getAppointmentStatus = (appointment) => {
  const rawStatus = getRawAppointmentStatus(appointment);

  if (rawStatus === AppointmentStatus.CANCELLED || rawStatus === 'CANCELLED' || rawStatus === 'CANCELED') {
    return AppointmentTab.CANCELLED;
  }

  if (rawStatus === AppointmentStatus.COMPLETED || rawStatus === 'COMPLETED' || rawStatus === 'ATTENDED') {
    return AppointmentTab.PAST;
  }

  const date = getAppointmentDate(appointment);
  if (date && date.getTime() < Date.now()) {
    return AppointmentTab.PAST;
  }

  return AppointmentTab.UPCOMING;
};

export const formatDate = (appointment, format = 'long') => {
  const date = getAppointmentDate(appointment);
  if (!date) return 'Fecha no disponible';

  if (format === 'short') {
    return date.toLocaleDateString('es-AR');
  }

  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (appointment) => {
  const start = appointment.startTime || appointment.startsAt;
  const end = appointment.endTime || appointment.endsAt;
  const format = (value) => new Date(value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  if (start && end) return `${format(start)} - ${format(end)}`;
  if (start) return format(start);
  return 'Horario no disponible';
};

export const formatSlotLabel = (slot) => {
  const start = slot.startTime || slot.startsAt || slot.date;
  const end = slot.endTime || slot.endsAt;
  if (!start) return 'Horario no disponible';

  const date = new Date(start).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const startTime = new Date(start).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const endTime = end ? new Date(end).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : null;

  return `${date} · ${endTime ? `${startTime} - ${endTime}` : startTime}`;
};

export const getStatusMeta = (appointment) => {
  const rawStatus = getRawAppointmentStatus(appointment);

  if (rawStatus === AppointmentStatus.BOOKED) {
    return { label: 'RESERVADO', background: '#2563EB', color: '#FFFFFF', border: '#1D4ED8' };
  }

  if (rawStatus === AppointmentStatus.CONFIRMED) {
    return { label: 'CONFIRMADO', background: '#15803D', color: '#FFFFFF', border: '#166534' };
  }

  if (rawStatus === AppointmentStatus.CANCELLED) {
    return { label: 'CANCELADO', background: '#DC2626', color: '#FFFFFF', border: '#B91C1C' };
  }

  if (rawStatus === AppointmentStatus.RESCHEDULE_PROPOSED) {
    return { label: 'REPROGRAMACION', background: '#EA580C', color: '#FFFFFF', border: '#C2410C' };
  }

  if (rawStatus === AppointmentStatus.COMPLETED) {
    return { label: 'REALIZADO', background: '#4B5563', color: '#FFFFFF', border: '#374151' };
  }

  if (getAppointmentStatus(appointment) === AppointmentTab.PAST) {
    return { label: 'Pasado', background: '#4B5563', color: '#FFFFFF', border: '#374151' };
  }

  return { label: 'RESERVADO', background: '#2563EB', color: '#FFFFFF', border: '#1D4ED8' };
};

export const getCancellationReason = (appointment) => (
  appointment.cancellationReason
  || appointment.cancelReason
  || appointment.reason
  || appointment.cancellation?.reason
  || [...(appointment.statusHistory || [])].reverse().find((entry) => (
    ['cancelled', 'canceled', 'cancelado', 'cancelada'].includes(String(entry.status || '').toLowerCase())
  ))?.reason
  || ''
);

export const getRescheduleReason = (appointment) => (
  appointment.rescheduleReason
  || appointment.reprogrammingReason
  || appointment.modificationReason
  || appointment.reason
  || appointment.reschedule?.reason
  || [...(appointment.statusHistory || [])].reverse().find((entry) => (
    ['reprogramacion_propuesta', 'reschedule_proposed', 'rescheduled'].includes(String(entry.status || '').toLowerCase())
  ))?.reason
  || ''
);

export const getPreviousAppointmentDate = (appointment) => (
  appointment.previousStartTime
  || appointment.originalStartTime
  || appointment.reschedule?.previousStartTime
  || appointment.reschedule?.originalStartTime
  || ''
);

export const getProposedAppointmentDate = (appointment) => (
  appointment.proposedStartTime
  || appointment.reschedule?.proposedStartTime
  || ''
);

export const getProposedAppointmentEndDate = (appointment) => (
  appointment.proposedEndTime
  || appointment.reschedule?.proposedEndTime
  || ''
);
