import api from './api';

const API_URL = '/api/auth';

export const loginUser = async (credentials: any) => {
  const response = await api.post(`${API_URL}/login`, credentials);
  return response.data;
};

export const registerUser = async (userData: any) => {
  const response = await api.post(`${API_URL}/register`, userData);
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post(`${API_URL}/logout`);
  } catch (error) {
    console.error('API logout failed:', error);
  }
};

export const forgotPassword = async (email: string) => {
  const response = await api.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token: string, password: any) => {
  const response = await api.post(`${API_URL}/reset-password/${token}`, { password });
  return response.data;
};
