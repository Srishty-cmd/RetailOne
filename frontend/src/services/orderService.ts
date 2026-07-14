import api from './api';

export interface OrderItem {
  _id: string;
  order: string;
  product: {
    _id: string;
    productName: string;
    sku: string;
    barcode?: string;
    category: string;
    sellingPrice: number;
  };
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  store: {
    _id: string;
    name: string;
    code: string;
    address?: string;
    phone?: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Returned';
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  subtotal?: number;
  discount?: number;
  tax?: number;
  customerName?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderInput {
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  storeId?: string;
  customerName?: string;
  paymentMethod?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const getOrders = async (params?: GetOrdersParams) => {
  const response = await api.get<{ success: boolean; count: number; page: number; pages: number; data: Order[] }>('/api/orders', { params });
  return response.data;
};

export const createOrder = async (data: OrderInput) => {
  const response = await api.post<{ success: boolean; data: Order }>('/api/orders', data);
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Order }>(`/api/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await api.put<{ success: boolean; data: Order }>(`/api/orders/${id}/status`, { status });
  return response.data;
};

export const deleteOrder = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/api/orders/${id}`);
  return response.data;
};

export const getOrderStats = async () => {
  const response = await api.get<{
    success: boolean;
    data: {
      totalOrders: number;
      completedOrders: number;
      pendingOrders: number;
      todayRevenue: number;
    };
  }>('/api/orders/stats');
  return response.data;
};
