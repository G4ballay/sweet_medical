import api from "./api";
export function getAppointments(filters) {
  return api.get('/appointments', { params: filters }).then(r => r.data);
}

export function searchAvailableSlots(filters) {
  return api.get('/appointments/available-slots', { params: filters }).then(r => r.data);
}

export function bookAppointments(bookingsData) {
  return api.post('/appointments', bookingsData).then(r => r.data);
}

export function cancelAppointment(appointmentId, reason) {
  return api.delete(`/appointments/${appointmentId}`, {
    data: {
      id: appointmentId,
      reason,
    }
  }).then(r => r.data);
}

export function confirmAppointment(appointmentId) {
  return api.patch(`/appointments/${appointmentId}`, {
    id: appointmentId,
    status: 'CONFIRMADO',
  }).then(r => r.data);
}

export function rescheduleAppointment(appointmentId, startTime, reason, status) {
  return api.patch(`/appointments/${appointmentId}`, {
    startTime,
    reason,
    ...(status ? { status } : {}),
  }).then(r => r.data);
}

export function acceptRescheduleAppointment(appointmentId) {
  return api.patch(`/appointments/${appointmentId}/reschedule-proposal`, {
    status: 'ACEPTADO',
  }).then(r => r.data);
}

export function rejectRescheduleAppointment(appointmentId, reason) {
  return api.patch(`/appointments/${appointmentId}/reschedule-proposal`, {
    status: 'RECHAZADO',
    reason,
  }).then(r => r.data);
}
