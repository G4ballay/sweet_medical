import api from "./api";

export function getPractices() {
  return api.get('/practices').then(r => r.data);
}