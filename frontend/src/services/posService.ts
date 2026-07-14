import api from './api';
import { Product } from './productService';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    _id: string;
    user: string;
    items: CartItem[];
  };
}

export interface CheckoutResponse {
  success: boolean;
  order: {
    _id: string;
    store: {
      _id: string;
      name: string;
      code: string;
      address: string;
      phone?: string;
    };
    user: {
      _id: string;
      name: string;
      email: string;
    };
    total: number;
    status: string;
    paymentMethod: 'Cash' | 'Card' | 'UPI';
    subtotal: number;
    discount: number;
    tax: number;
    createdAt: string;
  };
  items: Array<{
    _id: string;
    product: {
      _id: string;
      productName: string;
      sku: string;
      barcode?: string;
      category: string;
    };
    quantity: number;
    price: number;
  }>;
  warnings: string[];
}

export const getPOSProducts = async (params?: { search?: string; category?: string; barcode?: string }) => {
  const response = await api.get<{ success: boolean; data: Product[] }>('/api/pos/products', { params });
  return response.data;
};

export const getCart = async () => {
  const response = await api.get<CartResponse>('/api/pos/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number) => {
  const response = await api.post<CartResponse>('/api/pos/cart', { product: productId, quantity });
  return response.data;
};

export const updateCartItem = async (productId: string, quantity: number) => {
  const response = await api.put<CartResponse>(`/api/pos/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId: string) => {
  const response = await api.delete<CartResponse>(`/api/pos/cart/${productId}`);
  return response.data;
};

export const checkoutPOS = async (data: { paymentMethod: 'Cash' | 'Card' | 'UPI'; discount?: number; tax?: number; customerName?: string }) => {
  const response = await api.post<CheckoutResponse>('/api/pos/checkout', data);
  return response.data;
};
