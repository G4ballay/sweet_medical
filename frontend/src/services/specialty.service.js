import api from "./api";

export function getSpecialties() {
  return api.get('/specialties').then(r => r.data);
}