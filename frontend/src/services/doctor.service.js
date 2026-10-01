import api from "./api";

export function getDoctors(filters) {
  return api.get('/doctors', { params: filters }).then(r => r.data);
}

export const getDoctorById = async (doctorId) => {
  const response = await api.get(`/doctors/${doctorId}`);
  return response.data;
};

export const updateDoctor = async (doctorId, payload) => {
  const response = await api.put(`/doctors/${doctorId}`, payload);
  return response.data;
};

export const createDoctor = async (payload) => {
  const response = await api.post('/doctors', payload);
  return response.data;
};