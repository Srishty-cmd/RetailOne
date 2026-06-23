import { DollarSign, ShoppingBag, Archive, AlertTriangle, Plus, RefreshCw, FileText } from 'lucide-react';

const ManagerDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-text-main">Manager Dashboard</h2>
        <p className="text-text-sec mt-1">Daily overview for your store location.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-main">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-text-sec text-sm font-medium">Today's Sales</h3>
          <p className="text-2xl font-bold text-text-main mt-1">$3,421.50</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-main">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-text-sec text-sm font-medium">Orders Today</h3>
          <p className="text-2xl font-bold text-text-main mt-1">84</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-main">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-text-sec text-sm font-medium">Inventory Items</h3>
          <p className="text-2xl font-bold text-text-main mt-1">1,204</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 bg-red-50/20">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-red-700 text-sm font-medium">Low Stock Items</h3>
          <p className="text-2xl font-bold text-red-700 mt-1">12</p>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-border-main p-6 shadow-sm">
           <h3 className="text-lg font-semibold text-text-main mb-4">Quick Actions</h3>
           <div className="flex flex-wrap gap-4">
             <button className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium">
               <Plus className="w-4 h-4 mr-2" /> Add Product
             </button>
             <button className="flex items-center px-4 py-2 bg-white border border-border-main text-text-main rounded-xl hover:bg-bg-sec transition-colors font-medium">
               <RefreshCw className="w-4 h-4 mr-2" /> Update Inventory
             </button>
             <button className="flex items-center px-4 py-2 bg-white border border-border-main text-text-main rounded-xl hover:bg-bg-sec transition-colors font-medium">
               <FileText className="w-4 h-4 mr-2" /> View Reports
             </button>
           </div>
        </div>

        <div className="col-span-1 bg-white rounded-2xl border border-border-main p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[200px]">
           <div className="w-16 h-16 rounded-full bg-bg-sec flex items-center justify-center mb-4">
             <AlertTriangle className="w-8 h-8 text-text-sec" />
           </div>
           <p className="text-text-main font-medium">No pressing alerts</p>
           <p className="text-sm text-text-sec">Inventory is healthy</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
