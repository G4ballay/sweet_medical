import api from "./api";

export const getPatientById = async (patientId) => {
  const response = await api.get(`/patients/${patientId}`);
  return response.data;
};

export const updatePatient = async (patientId, payload) => {
  const response = await api.put(`/patients/${patientId}`, payload);
  return response.data;
};

export const createPatient = async (payload) => {
  const response = await api.post('/patients', payload);
  return response.data;
};