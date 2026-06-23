import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, Plus, FileText, Store } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-main hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-text-sec text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-text-main mt-1">{value}</p>
  </div>
);

const QuickAction = ({ icon: Icon, title, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white border border-border-main rounded-2xl hover:border-primary hover:text-primary transition-all group shadow-sm hover:shadow-md"
  >
    <div className="w-10 h-10 rounded-full bg-bg-sec group-hover:bg-primary/10 flex items-center justify-center mb-3 text-text-sec group-hover:text-primary transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-sm font-medium text-text-main group-hover:text-primary">{title}</span>
  </button>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-semibold text-text-main">Admin Overview</h2>
          <p className="text-text-sec mt-1">Here's what's happening across all your stores today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="$45,231.00" icon={DollarSign} trend={+12.5} />
        <StatCard title="Total Orders" value="1,234" icon={ShoppingBag} trend={+5.2} />
        <StatCard title="Total Products" value="8,432" icon={Package} />
        <StatCard title="Total Users" value="142" icon={Users} trend={+2.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-border-main p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-main mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction icon={Plus} title="Add Product" />
            <QuickAction icon={Store} title="Add Store" />
            <QuickAction icon={Users} title="Add User" />
            <QuickAction icon={FileText} title="Reports" />
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="col-span-1 bg-white rounded-2xl border border-border-main p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-main">Alerts</h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">3 New</span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start p-3 bg-red-50/50 rounded-xl border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text-main">Low Stock Alert</p>
                  <p className="text-xs text-text-sec mt-0.5">Product SKU-{100 + i} is below minimum threshold.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
