import api from './api';

export interface Store {
  _id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StoreInput {
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export const getStores = async () => {
  const response = await api.get<{ success: boolean; count: number; data: Store[] }>('/api/stores');
  return response.data;
};

export const createStore = async (data: StoreInput) => {
  const response = await api.post<{ success: boolean; data: Store }>('/api/stores', data);
  return response.data;
};
