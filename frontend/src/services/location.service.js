import api from "./api";

export function getLocations() {
  return api.get('/locations').then(r => r.data);
}
