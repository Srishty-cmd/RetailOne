import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, Plus, FileText, Store, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, DashboardStats } from '../../services/dashboardService';

const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: number }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-main hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-6 h-6" />
      </div>
      {trend !== undefined && (
        <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-text-sec text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-text-main mt-1">{value}</p>
  </div>
);

const QuickAction = ({ icon: Icon, title, onClick }: { icon: any; title: string; onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white border border-border-main rounded-2xl hover:border-primary hover:text-primary transition-all group shadow-sm hover:shadow-md cursor-pointer"
  >
    <div className="w-10 h-10 rounded-full bg-bg-sec group-hover:bg-primary/10 flex items-center justify-center mb-3 text-text-sec group-hover:text-primary transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-sm font-medium text-text-main group-hover:text-primary">{title}</span>
  </button>
);

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

const AdminDashboard = () => {
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
      setError(err.response?.data?.message || 'Error occurred while loading admin dashboard.');
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
        <p className="text-sm text-text-sec">Loading Admin Overview...</p>
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
          <h2 className="text-2xl font-display font-semibold text-text-main">Admin Overview</h2>
          <p className="text-text-sec mt-1">Here's what's happening across all your stores today.</p>
        </div>
        <button onClick={fetchStats} className="p-2.5 bg-white hover:bg-bg-sec border border-border-main text-text-main rounded-xl cursor-pointer shadow-xs transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingBag} />
        <StatCard title="Total Products" value={stats.totalProducts.toLocaleString()} icon={Package} />
        <StatCard title="Inventory" value={stats.totalInventory.toLocaleString()} icon={Package} />
        <StatCard title="Low Stock" value={stats.lowStock.toLocaleString()} icon={AlertTriangle} />
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

      {/* Chart and Side Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Sales Chart */}
        {hasRealSalesData && (
          <div className="col-span-1 lg:col-span-2 flex">
            <SalesChart data={(stats as any).salesHistory || []} />
          </div>
        )}

        {/* Alerts Panel */}
        <div className={`col-span-1 bg-white rounded-2xl border border-border-main p-6 shadow-sm flex flex-col h-[340px] ${!hasRealSalesData ? 'lg:col-span-3' : ''}`}>
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-lg font-semibold text-text-main">Alerts</h3>
            {stats.alerts.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {stats.alerts.length} New
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {stats.alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-sec py-8">
                <svg className="w-12 h-12 text-emerald-100 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">All items healthy</p>
                <p className="text-xs">No low stock warnings registered.</p>
              </div>
            ) : (
              stats.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-main truncate">{alert.productName}</p>
                    <p className="text-xs text-text-sec mt-0.5">SKU: {alert.sku} | Stock: {alert.currentStock} (Min: {alert.minimumStock})</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction icon={Plus} title="Add Product" onClick={() => navigate('/dashboard/products')} />
          <QuickAction icon={Store} title="Add Store" onClick={() => navigate('/dashboard/stores')} />
          <QuickAction icon={Users} title="Manage Staff" onClick={() => navigate('/dashboard/profile')} />
          <QuickAction icon={FileText} title="View Orders" onClick={() => navigate('/dashboard/orders')} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
