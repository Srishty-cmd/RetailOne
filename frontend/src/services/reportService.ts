import api from './api';

export interface ReportSummary {
  totalRevenue: number;
  todaySales: number;
  monthlyRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
}

export interface SalesTrendItem {
  date: string;
  label: string;
  revenue: number;
  ordersCount: number;
}

export interface MonthlySalesTrendItem {
  month: string;
  label: string;
  revenue: number;
  ordersCount: number;
}

export interface CategorySalesItem {
  category: string;
  revenue: number;
  quantity: number;
}

export interface PaymentDistributionItem {
  method: string;
  revenue: number;
  count: number;
}

export interface TopProductItem {
  _id: string;
  productName: string;
  sku: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

export interface LowStockListItem {
  inventoryId: string;
  productId: string | null;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  status: string;
}

export interface StoreSalesItem {
  storeId: string;
  name: string;
  code: string;
  revenue: number;
  ordersCount: number;
}

export interface InventorySummary {
  totalItemsStock: number;
  totalCostValue: number;
  totalSellingValue: number;
  totalCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
}

export interface ReportData {
  summary: ReportSummary;
  salesTrend: SalesTrendItem[];
  monthlySalesTrend: MonthlySalesTrendItem[];
  categorySales: CategorySalesItem[];
  paymentDistribution: PaymentDistributionItem[];
  topProducts: TopProductItem[];
  lowStockList: LowStockListItem[];
  storeSales: StoreSalesItem[];
  inventorySummary: InventorySummary;
}

export interface ReportParams {
  filter: 'today' | '7days' | '30days' | 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export const getReportData = async (params: ReportParams) => {
  const response = await api.get<{ success: boolean; data: ReportData }>('/api/reports', { params });
  return response.data;
};
