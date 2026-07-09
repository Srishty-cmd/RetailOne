import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Archive, AlertTriangle, Plus, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, DashboardStats } from '../../services/dashboardService';

const SalesChart = ({ data }: { data: { label: string; revenue: number; count: number }[] }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  
  return (
    <div className="bg-white rounded-2xl border border-border-main p-6 shadow-sm flex flex-col h-[340px] flex-1">
      <h3 className="text-lg font-semibold text-text-main mb-6">Weekly Revenue Overview</h3>
      {data.length === 0 || data.every(d => d.revenue === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-text-sec space-y-2 p-4">
          <svg className="w-12 h-12 text-border-main mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          <p className="text-sm font-medium">No sales data available yet</p>
          <p className="text-xs">Complete POS checkout transactions to view analytics charts.</p>
        </div>
      ) : (
        <div className="flex-1 flex items-end justify-between gap-2.5 pt-4 pb-2 relative h-full">
          {data.map((day, idx) => {
            const barHeightPercentage = (day.revenue / maxRevenue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-text-main text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold shadow-md pointer-events-none z-10 whitespace-nowrap">
                  ${day.revenue.toFixed(2)} ({day.count} orders)
                </div>
                {/* Bar */}
                <div 
                  style={{ height: `${Math.max(barHeightPercentage, 4)}%` }} 
                  className="w-full bg-primary/20 hover:bg-primary rounded-t-lg transition-all duration-300 relative cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary rounded-t-lg opacity-40"></div>
                </div>
                <span className="text-[10px] sm:text-xs text-text-sec mt-3 font-semibold whitespace-nowrap">{day.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError('Failed to fetch dashboard overview');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while loading manager dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-text-sec">Loading Manager Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-12 text-center space-y-3 bg-white border border-border-main rounded-2xl max-w-md mx-auto mt-8">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="text-sm text-text-sec">{error || 'Could not load statistics'}</p>
        <button onClick={fetchStats} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all">Retry</button>
      </div>
    );
  }

  const hasRealSalesData = stats && stats.salesHistory && stats.salesHistory.some(d => d.revenue > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-semibold text-text-main">Manager Dashboard</h2>
          <p className="text-text-sec mt-1">Daily overview for your store location.</p>
        </div>
        <button onClick={fetchStats} className="p-2.5 bg-white hover:bg-bg-sec border border-border-main text-text-main rounded-xl cursor-pointer shadow-xs transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-main">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-text-sec text-sm font-medium">Today's Sales</h3>
          <p className="text-2xl font-bold text-text-main mt-1">₹{(stats as any).todayRevenue?.toLocaleString() || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-main">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-text-sec text-sm font-medium">Orders Today</h3>
          <p className="text-2xl font-bold text-text-main mt-1">{(stats as any).todayOrders?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-main">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-text-sec text-sm font-medium">Inventory items</h3>
          <p className="text-2xl font-bold text-text-main mt-1">{stats.totalInventory?.toLocaleString() || '0'}</p>
        </div>
        <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-colors ${
          stats.lowStock > 0 ? 'border-red-200 bg-red-50/20' : 'border-border-main'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            stats.lowStock > 0 ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className={`text-sm font-medium ${stats.lowStock > 0 ? 'text-red-700' : 'text-text-sec'}`}>Low Stock Items</h3>
          <p className={`text-2xl font-bold mt-1 ${stats.lowStock > 0 ? 'text-red-700' : 'text-text-main'}`}>
            {stats.lowStock}
          </p>
        </div>
      </div>

      {/* Welcome Empty State Banner */}
      {stats.totalProducts === 0 && (
        <div className="bg-white border border-border-main rounded-2xl p-8 text-center max-w-2xl mx-auto my-6 shadow-sm">
          <h3 className="text-2xl font-bold text-text-main mb-2">Welcome to RetailOne</h3>
          <p className="text-text-sec text-base mb-6">Your store is ready. Start by adding your first product.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/dashboard/products')} className="flex items-center px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover font-semibold cursor-pointer shadow-xs transition-colors">
              <Plus className="w-5 h-5 mr-2" /> + Add Product
            </button>
            <button onClick={() => navigate('/dashboard/stores')} className="flex items-center px-5 py-3 bg-white border border-border-main text-text-main rounded-xl hover:bg-bg-sec font-semibold cursor-pointer shadow-xs transition-colors">
              <Plus className="w-5 h-5 mr-2" /> + Create Store
            </button>
          </div>
        </div>
      )}

      {/* Chart and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hasRealSalesData && (
          <div className="col-span-1 lg:col-span-2 flex">
            <SalesChart data={(stats as any).salesHistory || []} />
          </div>
        )}

        <div className={`col-span-1 bg-white rounded-2xl border border-border-main p-6 shadow-sm flex flex-col h-[340px] ${!hasRealSalesData ? 'lg:col-span-3' : ''}`}>
          <h3 className="text-lg font-semibold text-text-main mb-4 shrink-0">Store Alerts</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {stats.alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-sec py-8">
                <svg className="w-12 h-12 text-emerald-100 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">Inventory is healthy</p>
                <p className="text-xs">No pressing stock warnings.</p>
              </div>
            ) : (
              stats.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-main truncate">{alert.productName}</p>
                    <p className="text-xs text-text-sec mt-0.5">Stock: {alert.currentStock} (Min: {alert.minimumStock})</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-border-main p-6 shadow-sm">
         <h3 className="text-lg font-semibold text-text-main mb-4">Quick Actions</h3>
         <div className="flex flex-wrap gap-4">
           <button onClick={() => navigate('/dashboard/products')} className="flex items-center px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium cursor-pointer">
             <Plus className="w-4 h-4 mr-2" /> Add Product
           </button>
           <button onClick={() => navigate('/dashboard/inventory')} className="flex items-center px-4 py-2.5 bg-white border border-border-main text-text-main rounded-xl hover:bg-bg-sec transition-colors font-medium cursor-pointer">
             <RefreshCw className="w-4 h-4 mr-2" /> Update Inventory
           </button>
           <button onClick={() => navigate('/dashboard/orders')} className="flex items-center px-4 py-2.5 bg-white border border-border-main text-text-main rounded-xl hover:bg-bg-sec transition-colors font-medium cursor-pointer">
             <FileText className="w-4 h-4 mr-2" /> View Orders
           </button>
         </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
