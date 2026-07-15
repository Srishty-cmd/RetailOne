import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  ShoppingBag, 
  Loader2, 
  Calendar, 
  User, 
  DollarSign, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Printer, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check,
  FileText,
  CreditCard,
  Clock,
  CheckCircle
} from 'lucide-react';
import { 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder, 
  getOrderStats,
  Order
} from '../services/orderService';

interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdminOrManager = user?.role === 'Admin' || user?.role?.toLowerCase().includes('manager');

  // Stats State
  const [stats, setStats] = useState<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    todayRevenue: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Orders Table State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchVal, setSearchVal] = useState('');
  const [statusVal, setStatusVal] = useState('All');
  const [paymentVal, setPaymentVal] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active Query Filters for Fetching
  const [queryFilters, setQueryFilters] = useState({
    search: '',
    status: 'All',
    paymentMethod: 'All',
    startDate: '',
    endDate: ''
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limitPerPage = 10;

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Delete State
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch stats from MongoDB
  const fetchStatsData = async () => {
    try {
      setStatsLoading(true);
      const res = await getOrderStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch orders with pagination & filters
  const fetchOrdersData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: limitPerPage
      };

      if (queryFilters.search.trim()) {
        params.search = queryFilters.search.trim();
      }
      if (queryFilters.status !== 'All') {
        params.status = queryFilters.status;
      }
      if (queryFilters.paymentMethod !== 'All') {
        params.paymentMethod = queryFilters.paymentMethod;
      }
      if (queryFilters.startDate) {
        params.startDate = queryFilters.startDate;
      }
      if (queryFilters.endDate) {
        params.endDate = queryFilters.endDate;
      }

      const res = await getOrders(params);
      if (res.success) {
        setOrders(res.data);
        setTotalPages(res.pages || 1);
        setTotalCount(res.count || 0);
        setCurrentPage(res.page || 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load customer orders.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters trigger
  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setQueryFilters({
      search: searchVal,
      status: statusVal,
      paymentMethod: paymentVal,
      startDate: startDate,
      endDate: endDate
    });
    setCurrentPage(1);
  };

  // Reset filters
  const handleClearFilters = () => {
    setSearchVal('');
    setStatusVal('All');
    setPaymentVal('All');
    setStartDate('');
    setEndDate('');
    setQueryFilters({
      search: '',
      status: 'All',
      paymentMethod: 'All',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  // Initial and reactive effects
  useEffect(() => {
    fetchStatsData();
  }, []);

  useEffect(() => {
    fetchOrdersData(currentPage);
  }, [queryFilters, currentPage]);

  // Open Details Modal and fetch latest details
  const handleViewDetails = async (orderId: string) => {
    try {
      setDetailsLoading(true);
      setSelectedOrder(null);
      setIsDetailModalOpen(true);
      const res = await getOrderById(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
      } else {
        addToast('Failed to fetch order details', 'error');
        setIsDetailModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred while loading order details.', 'error');
      setIsDetailModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Delete Order confirmed
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      setActionLoading(true);
      const res = await deleteOrder(orderToDelete._id);
      if (res.success) {
        addToast('Order and associated stock logs deleted successfully.', 'success');
        setIsDeleteOpen(false);
        setOrderToDelete(null);
        // Refresh
        fetchStatsData();
        fetchOrdersData(currentPage);
      } else {
        addToast(res.message || 'Failed to delete order', 'error');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error occurred during deletion.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Update status inline or from modal
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        addToast(`Order status successfully updated to ${newStatus}.`, 'success');
        // Refresh local details if open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
        // Refresh lists
        fetchStatsData();
        fetchOrdersData(currentPage);
      } else {
        addToast('Failed to update status', 'error');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Print Receipt in standard POS styling
  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('Popup blocker prevented printing receipt.', 'error');
      return;
    }

    const itemsHTML = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #E1E3E5;">
          <div style="font-weight: 600; font-size: 14px; color: #202223;">${item.product?.productName || 'Product'}</div>
          <div style="font-size: 11px; color: #6D7175;">SKU: ${item.product?.sku || 'N/A'}</div>
        </td>
        <td style="padding: 10px 0; text-align: center; border-bottom: 1px solid #E1E3E5; color: #202223;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #E1E3E5; color: #202223;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #E1E3E5; font-weight: 600; color: #202223;">₹${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order._id.substring(order._id.length - 8).toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #202223;
              margin: 0;
              padding: 30px;
              background-color: #ffffff;
            }
            .receipt-container {
              max-width: 500px;
              margin: 0 auto;
              border: 1px solid #E1E3E5;
              padding: 30px;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
            .header {
              text-align: center;
              margin-bottom: 24px;
              border-bottom: 2px dashed #E1E3E5;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 22px;
              color: #008060;
              font-weight: 700;
            }
            .meta-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 24px;
              font-size: 12px;
              line-height: 1.6;
              color: #6D7175;
            }
            .table-items {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              font-size: 13px;
            }
            .totals {
              margin-left: auto;
              width: 60%;
              font-size: 13px;
              line-height: 2.2;
              border-top: 2px solid #E1E3E5;
              padding-top: 12px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              color: #6D7175;
            }
            .grand-total {
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #E1E3E5;
              padding-top: 8px;
              margin-top: 8px;
              font-size: 15px;
              font-weight: 700;
              color: #008060;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #6D7175;
              border-top: 2px dashed #E1E3E5;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1>${order.store?.name || 'RetailOne Store'}</h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #6D7175;">
                ${order.store?.address || 'RetailOne Address Outlet'}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #6D7175;">
                Phone: ${order.store?.phone || '000-000-0000'} | Code: ${order.store?.code || 'STR-001'}
              </p>
            </div>
            <div class="meta-info">
              <div>
                <strong>Order ID:</strong> #${order._id.substring(order._id.length - 8).toUpperCase()}<br/>
                <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}<br/>
                <strong>Cashier:</strong> ${order.user?.name || 'Store Operator'}
              </div>
              <div style="text-align: right;">
                <strong>Customer:</strong> ${order.customerName || 'Walk-in Customer'}<br/>
                <strong>Payment:</strong> ${order.paymentMethod}<br/>
                <strong>Status:</strong> ${order.status}
              </div>
            </div>
            <table class="table-items">
              <thead>
                <tr style="border-bottom: 2px solid #E1E3E5; font-weight: 700; text-align: left; color: #202223;">
                  <th style="padding: 8px 0;">Item</th>
                  <th style="padding: 8px 0; text-align: center; width: 50px;">Qty</th>
                  <th style="padding: 8px 0; text-align: right; width: 80px;">Price</th>
                  <th style="padding: 8px 0; text-align: right; width: 90px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            <div class="totals">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span style="color: #202223; font-weight: 500;">₹${(order.subtotal || order.total).toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span>Discount:</span>
                <span style="color: #b32e2e; font-weight: 500;">-₹${(order.discount || 0).toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span>Tax:</span>
                <span style="color: #202223; font-weight: 500;">₹${(order.tax || 0).toFixed(2)}</span>
              </div>
              <div class="grand-total">
                <span>Grand Total:</span>
                <span>₹${order.total.toFixed(2)}</span>
              </div>
            </div>
            <div class="footer">
              <p style="font-weight: 600; margin: 0; color: #202223;">Thank you for shopping!</p>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #a9acb0;">System powered by RetailOne POS Engine</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download Invoice offline HTML placeholder
  const handleDownloadInvoice = (order: Order) => {
    const itemsRows = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #EEEEEE;">${item.product?.productName || 'Product'}</td>
        <td style="padding: 10px 0; text-align: center; border-bottom: 1px solid #EEEEEE;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #EEEEEE;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #EEEEEE; font-weight: bold;">₹${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${order._id.substring(order._id.length - 8).toUpperCase()}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #333333; background: #FFFFFF; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #DDDDDD; padding: 30px; border-radius: 12px; }
            h1 { color: #008060; font-size: 24px; text-align: center; border-bottom: 1px solid #DDDDDD; padding-bottom: 12px; margin-top: 0; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
            .items-table th { border-bottom: 2px solid #DDDDDD; padding: 10px 0; text-align: left; }
            .totals { margin-left: auto; width: 50%; font-size: 13px; line-height: 2; margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; }
            .grand-total { font-weight: bold; font-size: 15px; color: #008060; border-top: 1px solid #DDDDDD; padding-top: 8px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>INVOICE BILL</h1>
            <div style="text-align: center; font-size: 12px; color: #666666; margin-bottom: 24px;">
              <strong>Store Name:</strong> ${order.store?.name || 'RetailOne Store'}<br/>
              <strong>Address:</strong> ${order.store?.address || 'Store Outlet Location'}
            </div>
            <div class="meta">
              <div>
                <strong>Order ID:</strong> #${order._id.substring(order._id.length - 8).toUpperCase()}<br/>
                <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}<br/>
                <strong>Cashier:</strong> ${order.user?.name || 'System Cashier'}
              </div>
              <div style="text-align: right;">
                <strong>Customer:</strong> ${order.customerName || 'Walk-in Customer'}<br/>
                <strong>Payment Method:</strong> ${order.paymentMethod}<br/>
                <strong>Order Status:</strong> ${order.status}
              </div>
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
            <div class="totals">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>₹${(order.subtotal || order.total).toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span>Discount:</span>
                <span>-₹${(order.discount || 0).toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span>Tax:</span>
                <span>₹${(order.tax || 0).toFixed(2)}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Grand Total:</span>
                <span>₹${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order._id.substring(order._id.length - 8).toUpperCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Invoice HTML document downloaded successfully.', 'success');
  };

  // Export current orders table list to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      addToast('No order records to export.', 'error');
      return;
    }

    const headers = ['Order ID', 'Store Name', 'Cashier Name', 'Customer Name', 'Status', 'Payment Method', 'Subtotal', 'Discount', 'Tax', 'Grand Total', 'Created Date'];
    const rows = orders.map(order => [
      order._id,
      order.store?.name || 'Default Store',
      order.user?.name || 'System Cashier',
      order.customerName || 'Walk-in Customer',
      order.status,
      order.paymentMethod,
      order.subtotal || order.total,
      order.discount || 0,
      order.tax || 0,
      order.total,
      new Date(order.createdAt).toISOString()
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Orders list exported to CSV successfully.', 'success');
  };

  // Format Dates beautifully
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4.5 py-3.5 rounded-xl border shadow-xl text-sm font-semibold animate-slide-in duration-300 ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-border-main rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main">Orders</h1>
          <p className="text-sm text-text-sec mt-1">View and manage all customer orders.</p>
        </div>
        <div className="flex gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              fetchStatsData();
              fetchOrdersData(currentPage);
              addToast('Order logs refreshed.', 'success');
            }}
            className="flex items-center justify-center p-2.5 bg-bg-sec border border-border-main hover:bg-border-main text-text-main text-sm font-semibold rounded-xl transition-all cursor-pointer"
            title="Refresh order logs"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-sec border border-border-main hover:bg-border-main text-text-main text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4.5 h-4.5 text-text-sec" />
            Export CSV
          </button>
          <button
            onClick={() => navigate('/dashboard/pos')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            Go to POS
          </button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-text-sec font-semibold uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-bold text-text-main mt-0.5">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-text-sec" /> : stats?.totalOrders || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-text-sec font-semibold uppercase tracking-wider">Completed Orders</p>
            <p className="text-2xl font-bold text-text-main mt-0.5">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-text-sec" /> : stats?.completedOrders || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-text-sec font-semibold uppercase tracking-wider">Pending Orders</p>
            <p className="text-2xl font-bold text-text-main mt-0.5">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-text-sec" /> : stats?.pendingOrders || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-text-sec font-semibold uppercase tracking-wider">Today's Revenue</p>
            <p className="text-2xl font-bold text-text-main mt-0.5">
              {statsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-text-sec" />
              ) : (
                `₹${(stats?.todayRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Search & Filtering panel */}
      <div className="bg-white p-6 border border-border-main rounded-2xl shadow-xs">
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search inputs */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-text-sec" />
              <input
                type="text"
                placeholder="Search Order ID or Customer Name..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary placeholder:text-text-sec text-text-main"
              />
            </div>

            {/* Status filters */}
            <div className="md:col-span-2">
              <select
                value={statusVal}
                onChange={e => setStatusVal(e.target.value)}
                className="w-full px-3 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary text-text-main"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            {/* Payment Method filter */}
            <div className="md:col-span-2">
              <select
                value={paymentVal}
                onChange={e => setPaymentVal(e.target.value)}
                className="w-full px-3 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary text-text-main"
              >
                <option value="All">All Payments</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            {/* Start Date filter */}
            <div className="md:col-span-2">
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary text-text-main"
              />
            </div>

            {/* End Date filter */}
            <div className="md:col-span-2">
              <input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary text-text-main"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2.5 pt-1 border-t border-bg-sec">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 border border-border-main hover:bg-bg-sec text-text-main text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table Section */}
      {loading ? (
        <div className="bg-white p-16 border border-border-main rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-text-sec font-semibold">Fetching transaction records from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-12 border border-border-main rounded-2xl shadow-xs text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm text-rose-600 font-semibold">{error}</p>
          <button 
            onClick={() => fetchOrdersData(currentPage)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-16 border border-border-main rounded-2xl shadow-xs flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto animate-fade-in">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100 shadow-xs">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-main font-display text-center w-full block">No Orders Yet</h3>
            <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
              Orders created through the POS system will appear here.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/pos')}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-xs cursor-pointer duration-150 active:scale-95 transition-all"
          >
            Go to POS
          </button>
        </div>
      ) : (
        /* Order Table */
        <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-sec border-b border-border-main text-xs font-bold text-text-sec uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4 text-center">Items</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4 text-center">Payment Method</th>
                  <th className="px-6 py-4 text-center">Order Status</th>
                  <th className="px-6 py-4 text-right">Date & Time</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-sm text-text-main bg-white">
                {orders.map((order) => {
                  const itemCount = (order.items || []).reduce((acc, curr) => acc + curr.quantity, 0);
                  const productsSummary = (order.items || [])
                    .map(it => `${it.product?.productName || 'Product'} (x${it.quantity})`)
                    .join(', ');

                  return (
                    <tr key={order._id} className="hover:bg-bg-sec/30 transition-colors duration-150">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-primary whitespace-nowrap">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-medium text-text-main">
                        {order.customerName || 'Walk-in Customer'}
                      </td>
                      <td className="px-6 py-4 max-w-[200px] sm:max-w-[280px]">
                        <div className="truncate text-xs text-text-sec" title={productsSummary}>
                          {productsSummary || <span className="italic">No items logged</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {itemCount}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-text-main whitespace-nowrap">
                        ₹{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-md border bg-slate-50 border-slate-200 text-slate-700">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${
                          order.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : order.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-text-sec whitespace-nowrap text-xs">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewDetails(order._id)}
                            className="p-1.5 hover:bg-bg-sec text-primary hover:text-primary-hover rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Inline quick status updates */}
                          <div className="relative group">
                            <select
                              value={order.status}
                              disabled={actionLoading}
                              onChange={e => handleStatusChange(order._id, e.target.value)}
                              className="px-2 py-1 bg-bg-sec border border-border-main rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-primary disabled:opacity-50 text-text-main"
                              title="Update Status"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Returned">Returned</option>
                            </select>
                          </div>

                          {isAdminOrManager && (
                            <button
                              onClick={() => {
                                setOrderToDelete(order);
                                setIsDeleteOpen(true);
                              }}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-bg-sec/50 border-t border-border-main flex items-center justify-between text-sm">
              <span className="text-text-sec font-medium">
                Showing <strong className="text-text-main font-semibold">{(currentPage - 1) * limitPerPage + 1}</strong> to{' '}
                <strong className="text-text-main font-semibold">
                  {Math.min(currentPage * limitPerPage, totalCount)}
                </strong>{' '}
                of <strong className="text-text-main font-semibold">{totalCount}</strong> orders
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-border-main rounded-lg hover:bg-white text-text-main disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'border-border-main hover:bg-white text-text-main'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-border-main rounded-lg hover:bg-white text-text-main disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice / Order Details Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-border-main overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-main bg-bg-sec/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-text-main">
                  Order Details {selectedOrder ? `#${selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}` : ''}
                </h2>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 hover:bg-border-main rounded-lg text-text-sec hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-text-sec">Retrieving order details from MongoDB...</p>
                </div>
              ) : !selectedOrder ? (
                <div className="py-20 text-center text-text-sec space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
                  <p className="text-sm font-semibold">Failed to load order records.</p>
                </div>
              ) : (
                <>
                  {/* Summary grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4.5 bg-bg-sec/50 border border-border-main rounded-xl">
                    <div>
                      <span className="text-[10px] text-text-sec uppercase tracking-wider block font-semibold">Store Outlet</span>
                      <span className="text-sm font-bold text-text-main block mt-0.5">
                        {selectedOrder.store?.name || 'Main Branch'}
                      </span>
                      <span className="text-xs text-text-sec block mt-0.5">
                        Code: {selectedOrder.store?.code || 'STR-001'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-sec uppercase tracking-wider block font-semibold">Cashier Name</span>
                      <span className="text-sm font-bold text-text-main block mt-0.5">
                        {selectedOrder.user?.name || 'System cashier'}
                      </span>
                      <span className="text-xs text-text-sec block mt-0.5">
                        {selectedOrder.user?.email || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-sec uppercase tracking-wider block font-semibold">Customer Details</span>
                      <span className="text-sm font-bold text-text-main block mt-0.5">
                        {selectedOrder.customerName || 'Walk-in Customer'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-sec uppercase tracking-wider block font-semibold">Order Date</span>
                      <span className="text-sm font-bold text-text-main block mt-0.5">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-text-sec block mt-0.5">
                        {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Payment and Status details */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-slate-500" />
                        Method: {selectedOrder.paymentMethod}
                      </div>
                      <div className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${
                        selectedOrder.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : selectedOrder.status === 'Pending'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : selectedOrder.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        <Check className="w-4 h-4" />
                        Status: {selectedOrder.status}
                      </div>
                    </div>
                    
                    {/* Status updates control */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-sec font-semibold">Change Status:</span>
                      <select
                        value={selectedOrder.status}
                        disabled={actionLoading}
                        onChange={e => handleStatusChange(selectedOrder._id, e.target.value)}
                        className="px-3 py-1.5 border border-border-main rounded-xl text-xs font-semibold focus:outline-none focus:border-primary bg-white text-text-main cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>
                  </div>

                  {/* Product items lists */}
                  <div>
                    <h3 className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider">Product Checklist</h3>
                    <div className="border border-border-main rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-bg-sec text-xs font-bold text-text-sec uppercase tracking-wider border-b border-border-main">
                            <th className="px-4 py-3">Product Name / SKU</th>
                            <th className="px-4 py-3 text-center">Quantity</th>
                            <th className="px-4 py-3 text-right">Unit Price</th>
                            <th className="px-4 py-3 text-right">Total Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main text-xs text-text-main">
                          {(selectedOrder.items || []).map((item) => (
                            <tr key={item._id} className="hover:bg-bg-sec/20">
                              <td className="px-4 py-3.5">
                                <span className="font-semibold text-text-main block">{item.product?.productName || 'Unknown Product'}</span>
                                <span className="text-[10px] text-text-sec font-mono mt-0.5 block">SKU: {item.product?.sku || 'N/A'}</span>
                              </td>
                              <td className="px-4 py-3.5 text-center font-bold">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3.5 text-right font-medium">
                                ₹{item.price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-bold text-text-main">
                                ₹{(item.quantity * item.price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-full sm:w-80 space-y-2.5 text-sm border-t border-border-main pt-4">
                      <div className="flex justify-between text-text-sec">
                        <span>Subtotal</span>
                        <span className="font-semibold text-text-main">
                          ₹{(selectedOrder.subtotal || selectedOrder.total).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-sec">
                        <span>Discount Coupon</span>
                        <span className="font-semibold text-rose-700">
                          -₹{(selectedOrder.discount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-sec">
                        <span>Applicable GST Tax</span>
                        <span className="font-semibold text-text-main">
                          ₹{(selectedOrder.tax || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border-main pt-2 text-base font-bold text-primary">
                        <span>Grand Total</span>
                        <span>
                          ₹{selectedOrder.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-main bg-bg-sec/50 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-border-main hover:bg-border-main text-text-main text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Close View
              </button>
              <div className="flex gap-2">
                {selectedOrder && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-bg-sec border border-border-main hover:bg-border-main text-text-main text-sm font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-text-sec" />
                      Save Bill
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintReceipt(selectedOrder)}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Print Invoice
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteOpen && orderToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border-main p-6 space-y-4 transform transition-all duration-300 scale-100 animate-fade-in">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <h2 className="text-lg font-display font-bold">Permanently Delete Order</h2>
            </div>
            
            <p className="text-sm text-text-sec leading-relaxed">
              Are you sure you want to delete order <strong className="text-text-main font-semibold">#{orderToDelete._id.substring(orderToDelete._id.length - 8).toUpperCase()}</strong>? 
              This will automatically restore quantity stock back to inventory logs for products listed in this sale. This action is irreversible.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-bg-sec">
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setOrderToDelete(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-border-main hover:bg-bg-sec text-text-main text-sm font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer disabled:bg-rose-600/50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
