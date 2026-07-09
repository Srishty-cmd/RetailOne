import api from './api';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalInventory: number;
  lowStock: number;
  totalUsers: number;
  recentActivities: {
    id: string;
    text: string;
    time: string;
  }[];
  alerts: {
    id: string;
    productName: string;
    sku: string;
    status: string;
    currentStock: number;
    minimumStock: number;
  }[];
  salesHistory: {
    date: string;
    label: string;
    revenue: number;
    count: number;
  }[];
}

export const getDashboardStats = async () => {
  const response = await api.get<{ success: boolean; data: DashboardStats }>('/api/dashboard/stats');
  return response.data;
};
