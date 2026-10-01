import api from "./api";

export function getHealthInsurances() {
  return api.get('/medical-coverages').then(r => r.data);
}