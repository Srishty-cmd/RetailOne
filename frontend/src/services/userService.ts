import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Inventory Manager' | 'Cashier';
  store?: {
    _id: string;
    name: string;
    code: string;
  } | null;
  phone: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Inventory Manager' | 'Cashier';
  store?: string | null;
  phone?: string;
  status?: 'Active' | 'Inactive';
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    summary: {
      total: number;
      admins: number;
      managers: number;
      cashiers: number;
    };
  };
}

export const getUsers = async (params: {
  search?: string;
  role?: string;
  status?: string;
  store?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get<UsersResponse>('/api/users', { params });
  return response.data;
};

export const createUser = async (data: UserInput) => {
  const response = await api.post<{ success: boolean; message: string; user: any }>('/api/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<UserInput>) => {
  const response = await api.put<{ success: boolean; message: string; user: any }>(`/api/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/api/users/${id}`);
  return response.data;
};

export const toggleUserStatus = async (id: string, status: 'Active' | 'Inactive') => {
  const response = await api.patch<{ success: boolean; message: string }>(`/api/users/${id}/status`, { status });
  return response.data;
};

export const resetUserPassword = async (id: string, newPassword: string) => {
  const response = await api.patch<{ success: boolean; message: string }>(`/api/users/${id}/reset-password`, { newPassword });
  return response.data;
};
