import api from "./api";

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, payload) => {
  const response = await api.patch(`/users/${userId}`, payload);
  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post('/users', payload);
  return response.data;
};