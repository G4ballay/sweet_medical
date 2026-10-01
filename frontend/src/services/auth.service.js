import api from './api';

export const loginUser = async ({ identifier, password }) => {
  const response = await api.post('/sessions', { identifier, password });
  return response.data;
};
