import api from './api';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand?: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  status: 'Active' | 'Inactive';
  image?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand?: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  status: 'Active' | 'Inactive';
  image?: string;
}

export const getProducts = async (params?: { search?: string; category?: string; status?: string }) => {
  const response = await api.get<{ success: boolean; count: number; data: Product[] }>('/api/products', { params });
  return response.data;
};

export const getProduct = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Product }>(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (data: ProductInput) => {
  const response = await api.post<{ success: boolean; data: Product }>('/api/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: ProductInput) => {
  const response = await api.put<{ success: boolean; data: Product }>(`/api/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete<{ success: boolean; data: any }>(`/api/products/${id}`);
  return response.data;
};
