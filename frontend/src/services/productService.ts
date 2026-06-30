import api from './api';

export interface Product {
  _id: string;
  productName: string;
  sku: string;
  barcode?: string;
  description?: string;
  category: string;
  brand?: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  minimumStock: number;
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
  productName: string;
  sku: string;
  barcode?: string;
  description?: string;
  category: string;
  brand?: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  minimumStock: number;
  status: 'Active' | 'Inactive';
  image?: string;
}

export interface PaginatedProductsResponse {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  data: Product[];
}

export const getProducts = async (params?: { 
  search?: string; 
  category?: string; 
  status?: string; 
  page?: number; 
  limit?: number; 
}) => {
  const response = await api.get<PaginatedProductsResponse>('/api/products', { params });
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
