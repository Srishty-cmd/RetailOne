import React, { useState, useEffect } from 'react';
import { MonitorSmartphone, CreditCard, ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, DashboardStats } from '../../services/dashboardService';
import { getOrders, Order } from '../../services/orderService';

const CashierDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsRes = await getDashboardStats();
      const ordersRes = await getOrders();

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (ordersRes.success) {
        // Take the 5 most recent orders
        setRecentTransactions(ordersRes.data.slice(0, 5));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load cashier overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-text-sec">Loading Cashier Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-12 text-center space-y-3 bg-white border border-border-main rounded-2xl max-w-md mx-auto mt-8">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="text-sm text-text-sec">{error || 'Could not load stats'}</p>
        <button onClick={fetchDashboardData} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center py-8">
        <h2 className="text-3xl font-display font-bold text-text-main mb-2">Ready for the next customer?</h2>
        <p className="text-text-sec mb-8">Shift active. Tap below to begin a new POS checkout sale.</p>
        
        <button 
          onClick={() => navigate('/dashboard/pos')}
          className="inline-flex items-center px-8 py-4 text-lg font-bold bg-primary text-white rounded-2xl hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-lg shadow-primary/30 cursor-pointer"
        >
          <MonitorSmartphone className="w-6 h-6 mr-3" />
          Start New Sale
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-border-main text-center">
          <p className="text-text-sec text-sm font-medium mb-1">Today's Transactions</p>
          <p className="text-3xl font-bold text-text-main">{(stats as any).todayOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border-main text-center">
          <p className="text-text-sec text-sm font-medium mb-1">Items Sold Today</p>
          <p className="text-3xl font-bold text-text-main">{(stats as any).todayItemsSold || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border-main text-center">
          <p className="text-text-sec text-sm font-medium mb-1">Revenue Generated Today</p>
          <p className="text-3xl font-bold text-text-main">₹{((stats as any).todayRevenue || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-main bg-bg-sec/50 flex justify-between items-center">
          <h3 className="font-semibold text-text-main">Recent Transactions</h3>
          <button onClick={() => navigate('/dashboard/orders')} className="text-sm text-primary font-medium hover:underline cursor-pointer bg-transparent border-0">View All</button>
        </div>
        <div className="overflow-x-auto">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-sec">
              No transactions recorded today.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main text-xs uppercase text-text-sec bg-white">
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Store</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-main text-sm">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-bg-sec/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-primary">
                      {tx._id.substring(tx._id.length - 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-text-main">{tx.store?.name || 'Default Store'}</td>
                    <td className="px-6 py-4 text-text-sec text-xs">
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-text-main">₹{tx.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
