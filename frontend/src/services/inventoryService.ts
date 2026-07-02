import api from './api';

export interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    productName: string;
    sku: string;
    category: string;
    sellingPrice: number;
    costPrice: number;
    image?: string;
    brand?: string;
    minimumStock: number;
    quantity: number;
  };
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  warehouseLocation?: string;
  lastRestocked?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryInput {
  product: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  warehouseLocation?: string;
}

export interface StockInInput {
  product: string;
  quantity: number;
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
  date?: string;
}

export interface StockOutInput {
  product: string;
  quantity: number;
  reason: 'Sales' | 'Damaged' | 'Lost' | 'Expired' | 'Other';
  notes?: string;
  date?: string;
}

export interface InventoryLogItem {
  _id: string;
  product: string;
  inventory: string;
  type: 'Stock In' | 'Stock Out';
  quantity: number;
  remainingStock: number;
  reason?: 'Sales' | 'Damaged' | 'Lost' | 'Expired' | 'Other';
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
  date: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface PaginatedInventoryResponse {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  summary?: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  data: InventoryItem[];
}

export const getInventoryItems = async (params?: { 
  search?: string; 
  category?: string; 
  status?: string; 
  page?: number; 
  limit?: number; 
}) => {
  const response = await api.get<PaginatedInventoryResponse>('/api/inventory', { params });
  return response.data;
};

export const getInventoryItem = async (id: string) => {
  const response = await api.get<{ success: boolean; data: InventoryItem }>(`/api/inventory/${id}`);
  return response.data;
};

export const createInventoryItem = async (data: InventoryInput) => {
  const response = await api.post<{ success: boolean; data: InventoryItem }>('/api/inventory', data);
  return response.data;
};

export const updateInventoryItem = async (id: string, data: Partial<InventoryInput>) => {
  const response = await api.put<{ success: boolean; data: InventoryItem }>(`/api/inventory/${id}`, data);
  return response.data;
};

export const deleteInventoryItem = async (id: string) => {
  const response = await api.delete<{ success: boolean; data: any }>(`/api/inventory/${id}`);
  return response.data;
};

export const stockIn = async (data: StockInInput) => {
  const response = await api.post<{ success: boolean; data: InventoryItem }>('/api/inventory/stock-in', data);
  return response.data;
};

export const stockOut = async (data: StockOutInput) => {
  const response = await api.post<{ success: boolean; data: InventoryItem }>('/api/inventory/stock-out', data);
  return response.data;
};

export const getInventoryHistory = async (productId: string) => {
  const response = await api.get<{ success: boolean; count: number; data: InventoryLogItem[] }>(`/api/inventory/history/${productId}`);
  return response.data;
};
