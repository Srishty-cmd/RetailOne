import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, Calendar, User, DollarSign, RefreshCw } from 'lucide-react';
import { getOrders, Order } from '../services/orderService';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 border border-border-main rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main">Orders</h1>
          <p className="text-sm text-text-sec mt-1">Track and manage sales orders across all stores</p>
        </div>
        <button
          onClick={fetchOrdersData}
          className="flex items-center px-4 py-2 bg-bg-sec border border-border-main hover:bg-border-main text-text-main text-sm font-medium rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-16 border border-border-main rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-text-sec font-medium">Loading sales orders...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-12 border border-border-main rounded-2xl shadow-xs text-center max-w-md mx-auto space-y-3">
          <p className="text-sm text-rose-600 font-semibold">{error}</p>
          <button 
            onClick={fetchOrdersData}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-16 border border-border-main rounded-2xl shadow-xs flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100 shadow-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-main font-display">No Orders Yet</h3>
            <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
              When sales checkout is completed in the POS screen, real orders will automatically populate here.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-sec border-b border-border-main text-xs font-semibold text-text-sec uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Cashier</th>
                  <th className="px-6 py-4">Items Summary</th>
                  <th className="px-6 py-4 text-center">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-sm text-text-main bg-white">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-bg-sec/40 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-primary">
                      {order._id.substring(order._id.length - 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{order.store?.name || 'Default Store'}</span>
                      <span className="text-xs text-text-sec block">{order.store?.code || 'STR-001'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-text-sec shrink-0" />
                        <span>{order.user?.name || 'System Cashier'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="truncate">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((it: any) => `${it.product?.productName} (x${it.quantity})`).join(', ')
                        ) : (
                          <span className="italic text-text-sec">No items logged</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-text-main">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-text-sec whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
