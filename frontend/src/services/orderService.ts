import api from './api';

export interface OrderItem {
  _id: string;
  order: string;
  product: {
    _id: string;
    productName: string;
    sku: string;
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
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
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
}

export const getOrders = async () => {
  const response = await api.get<{ success: boolean; count: number; data: Order[] }>('/api/orders');
  return response.data;
};

export const createOrder = async (data: OrderInput) => {
  const response = await api.post<{ success: boolean; data: Order }>('/api/orders', data);
  return response.data;
};
