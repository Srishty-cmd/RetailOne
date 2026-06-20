import { useState } from 'react';
import { 
  BarChart3, Package, ShoppingCart, MonitorSmartphone, Search, 
  Filter, Plus, RefreshCw, Eye, Check, ChevronRight, DollarSign,
  TrendingUp, HelpCircle, User, ArrowDownRight, Tag, CreditCard,
  Percent, Trash2
} from 'lucide-react';

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', name: 'Dashboard Analytics', icon: BarChart3 },
    { id: 'inventory', name: 'Inventory Screen', icon: Package },
    { id: 'orders', name: 'Orders Management', icon: ShoppingCart },
    { id: 'pos', name: 'POS Checkout Interface', icon: MonitorSmartphone },
  ];

  // Inventory Mock Data
  const [inventoryItems, setInventoryItems] = useState([
    { id: 1, name: 'Minimalist Leather Sneaker', sku: 'SH-MIN-09', stock: 45, status: 'In Stock', price: '$120.00', cost: '$45.00', location: 'Main Warehouse' },
    { id: 2, name: 'Organic Cotton Crewneck', sku: 'AP-CRE-12', stock: 3, status: 'Low Stock', price: '$48.00', cost: '$18.00', location: 'Main Street Store' },
    { id: 3, name: 'Water-Resistant Backpack', sku: 'AC-BAC-01', stock: 12, status: 'In Stock', price: '$85.00', cost: '$32.00', location: 'Main Street Store' },
    { id: 4, name: 'Wool Knit Beanie Hat', sku: 'AC-BEA-05', stock: 0, status: 'Out of Stock', price: '$24.00', cost: '$9.00', location: 'Eastside Store' },
    { id: 5, name: 'Classic Denim Jacket', sku: 'AP-DEN-02', stock: 28, status: 'In Stock', price: '$95.00', cost: '$38.00', location: 'Main Warehouse' },
  ]);

  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [inventorySearch, setInventorySearch] = useState('');

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase()) || item.sku.toLowerCase().includes(inventorySearch.toLowerCase());
    if (inventoryFilter === 'all') return matchesSearch;
    if (inventoryFilter === 'low') return matchesSearch && (item.stock <= 5 && item.stock > 0);
    if (inventoryFilter === 'out') return matchesSearch && item.stock === 0;
    return matchesSearch;
  });

  // Orders Mock Data
  const [orders, setOrders] = useState([
    { id: '#1045', date: 'Just Now', customer: 'Sarah Connor', items: '2 Items', total: '$168.00', payment: 'Paid', status: 'Unfulfilled', channel: 'Online Store' },
    { id: '#1044', date: '12 mins ago', customer: 'John Doe', items: '1 Item', total: '$120.00', payment: 'Paid', status: 'Fulfilled', channel: 'POS Terminal' },
    { id: '#1043', date: '1 hour ago', customer: 'Arthur Dent', items: '3 Items', total: '$157.00', payment: 'Paid', status: 'Fulfilled', channel: 'POS Terminal' },
    { id: '#1042', date: '3 hours ago', customer: 'Lois Lane', items: '2 Items', total: '$215.00', payment: 'Pending', status: 'Unfulfilled', channel: 'Online Store' },
    { id: '#1041', date: 'Yesterday', customer: 'Bruce Wayne', items: '5 Items', total: '$480.00', payment: 'Paid', status: 'Fulfilled', channel: 'Online Store' },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(orders[0]);

  // POS Checkout Mock Data
  const posProducts = [
    { id: 1, name: 'Leather Sneaker', price: 120, category: 'Footwear', color: 'bg-amber-100 text-amber-800' },
    { id: 2, name: 'Crewneck Sweatshirt', price: 48, category: 'Apparel', color: 'bg-emerald-100 text-emerald-800' },
    { id: 3, name: 'Denim Jacket', price: 95, category: 'Apparel', color: 'bg-blue-100 text-blue-800' },
    { id: 4, name: 'Canvas Backpack', price: 85, category: 'Accessories', color: 'bg-purple-100 text-purple-800' },
    { id: 5, name: 'Knit Beanie', price: 24, category: 'Accessories', color: 'bg-rose-100 text-rose-800' },
    { id: 6, name: 'Wool Socks (3-pack)', price: 18, category: 'Accessories', color: 'bg-slate-100 text-slate-800' },
  ];

  const [cart, setCart] = useState([
    { id: 2, name: 'Crewneck Sweatshirt', price: 48, quantity: 1 },
    { id: 4, name: 'Canvas Backpack', price: 85, quantity: 1 },
  ]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQty = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cartSubtotal * 0.08;
  const cartTotal = cartSubtotal + cartTax;

  return (
    <section id="showcase" className="bg-bg-sec py-16 sm:py-24 border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary-light px-3 py-1 rounded-full">
            Product Walkthrough
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-main mt-3">
            Explore the RetailOne Workspace
          </h2>
          <p className="text-text-sec mt-4 text-sm sm:text-base">
            Click through our main screens to see how you can inspect analytics, edit inventory, manage sales, and process transactions.
          </p>
        </div>

        {/* Tab Switcher Segmented Control */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-white border border-border-main p-1.5 rounded-2xl max-w-4xl mx-auto shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-text-sec hover:text-text-main hover:bg-bg-sec'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Showcase Canvas Frame */}
        <div className="bg-white border border-border-main rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto min-h-[500px]">
          
          {/* TAB CONTENT 1: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="p-4 sm:p-6 animate-in fade-in duration-200">
              {/* Analytics Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-main pb-4 mb-6 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-text-main">Sales Analytics Overview</h3>
                  <p className="text-xs text-text-sec">Live business metrics aggregated across all active locations</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-bg-sec border border-border-main px-3 py-1.5 rounded-lg font-semibold text-text-main">Last 7 Days</span>
                  <button className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer">
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 text-left">
                <div className="bg-bg-sec p-4 rounded-xl border border-border-main">
                  <span className="text-[11px] font-semibold text-text-sec uppercase tracking-wider">Total Sales</span>
                  <div className="text-xl font-extrabold text-text-main mt-1">$34,840.00</div>
                  <span className="text-xs font-bold text-success-main flex items-center gap-0.5 mt-1.5">
                    <TrendingUp className="h-3 w-3" /> +14.8% <span className="font-normal text-text-sec">vs last week</span>
                  </span>
                </div>
                <div className="bg-bg-sec p-4 rounded-xl border border-border-main">
                  <span className="text-[11px] font-semibold text-text-sec uppercase tracking-wider">Orders Count</span>
                  <div className="text-xl font-extrabold text-text-main mt-1">294</div>
                  <span className="text-xs font-bold text-success-main flex items-center gap-0.5 mt-1.5">
                    <TrendingUp className="h-3 w-3" /> +6.2% <span className="font-normal text-text-sec">vs last week</span>
                  </span>
                </div>
                <div className="bg-bg-sec p-4 rounded-xl border border-border-main">
                  <span className="text-[11px] font-semibold text-text-sec uppercase tracking-wider">Avg. Order Value</span>
                  <div className="text-xl font-extrabold text-text-main mt-1">$118.50</div>
                  <span className="text-xs font-bold text-red-500 flex items-center gap-0.5 mt-1.5">
                    <ArrowDownRight className="h-3 w-3" /> -1.4% <span className="font-normal text-text-sec">vs last week</span>
                  </span>
                </div>
                <div className="bg-bg-sec p-4 rounded-xl border border-border-main">
                  <span className="text-[11px] font-semibold text-text-sec uppercase tracking-wider">Conversion Rate</span>
                  <div className="text-xl font-extrabold text-text-main mt-1">3.42%</div>
                  <span className="text-xs font-bold text-success-main flex items-center gap-0.5 mt-1.5">
                    <TrendingUp className="h-3 w-3" /> +0.4% <span className="font-normal text-text-sec">vs last week</span>
                  </span>
                </div>
              </div>

              {/* Charts & Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Main Graph (Left/ColSpan2) */}
                <div className="lg:col-span-2 border border-border-main rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Weekly Revenue Curve</h4>
                    <div className="flex gap-3 text-[10px] font-semibold text-text-sec">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary"></span>Current Period</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-border-main"></span>Previous Period</span>
                    </div>
                  </div>
                  {/* Detailed Graph simulation */}
                  <div className="relative h-48 bg-bg-sec/50 border border-border-main/50 rounded-lg flex flex-col justify-end p-2 overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full text-primary" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0 80 Q 20 60, 40 70 T 80 30 T 100 20 L 100 100 L 0 100 Z" fill="currentColor" fillOpacity="0.04" />
                      <path d="M0 80 Q 20 60, 40 70 T 80 30 T 100 20" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    </svg>
                    <svg className="absolute inset-0 w-full h-full text-slate-300" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0 90 Q 20 80, 40 75 T 80 50 T 100 45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3" fill="none" />
                    </svg>
                    <div className="flex justify-between text-[10px] text-text-sec font-medium px-2">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                {/* Sales Channels Breakdown */}
                <div className="border border-border-main rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">Sales by Channel</h4>
                    <div className="space-y-3.5">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-text-main">In-Store Register (POS)</span>
                          <span className="font-bold text-text-main">$21,600.80 (62%)</span>
                        </div>
                        <div className="w-full bg-bg-sec rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: '62%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-text-main">Online Store (Shopify/Web)</span>
                          <span className="font-bold text-text-main">$10,452.00 (30%)</span>
                        </div>
                        <div className="w-full bg-bg-sec rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-text-main">Social Channels (IG/Amazon)</span>
                          <span className="font-bold text-text-main">$2,787.20 (8%)</span>
                        </div>
                        <div className="w-full bg-bg-sec rounded-full h-2 overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: '8%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-border-main pt-3 mt-4 text-center">
                    <button className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 mx-auto cursor-pointer">
                      View channel report
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: INVENTORY SCREEN */}
          {activeTab === 'inventory' && (
            <div className="p-4 sm:p-6 animate-in fade-in duration-200 text-left">
              {/* Inventory Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-main pb-4 mb-4 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-text-main">Inventory Directory</h3>
                  <p className="text-xs text-text-sec">Manage stocks, categories, supplier costs, and shop distribution</p>
                </div>
                <button className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Add New Item
                </button>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-sec" />
                  <input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-border-main rounded-lg text-xs bg-bg-sec focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                {/* State Filters */}
                <div className="flex border border-border-main rounded-lg overflow-hidden text-xs bg-bg-sec">
                  <button
                    onClick={() => setInventoryFilter('all')}
                    className={`px-3 py-2 font-semibold cursor-pointer ${inventoryFilter === 'all' ? 'bg-white border-r border-l border-border-main text-primary' : 'text-text-sec hover:text-text-main'}`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => setInventoryFilter('low')}
                    className={`px-3 py-2 font-semibold cursor-pointer ${inventoryFilter === 'low' ? 'bg-white border-r border-l border-border-main text-primary animate-pulse' : 'text-text-sec hover:text-text-main'}`}
                  >
                    Low Stock
                  </button>
                  <button
                    onClick={() => setInventoryFilter('out')}
                    className={`px-3 py-2 font-semibold cursor-pointer ${inventoryFilter === 'out' ? 'bg-white border-r border-l border-border-main text-red-500' : 'text-text-sec hover:text-text-main'}`}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto border border-border-main rounded-xl">
                <table className="min-w-full divide-y divide-border-main text-left">
                  <thead className="bg-bg-sec text-[10px] sm:text-xs font-bold text-text-sec uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Store Location</th>
                      <th className="px-4 py-3 text-center">Stock Count</th>
                      <th className="px-4 py-3">Retail Price</th>
                      <th className="px-4 py-3">Unit Cost</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs bg-white">
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-bg-sec/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-text-main">{item.name}</td>
                          <td className="px-4 py-3 text-text-sec font-mono">{item.sku}</td>
                          <td className="px-4 py-3 text-text-sec">{item.location}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              item.stock === 0 
                                ? 'bg-red-50 text-red-500' 
                                : item.stock <= 5 
                                  ? 'bg-amber-50 text-amber-600' 
                                  : 'bg-green-50 text-primary'
                            }`}>
                              {item.stock} units ({item.status})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-main font-semibold">{item.price}</td>
                          <td className="px-4 py-3 text-text-sec">{item.cost}</td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-primary hover:text-primary-hover font-bold text-xs cursor-pointer">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-text-sec">
                          No products found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="p-4 sm:p-6 animate-in fade-in duration-200 text-left">
              {/* Header */}
              <div className="border-b border-border-main pb-4 mb-4">
                <h3 className="text-lg font-bold text-text-main">Order Logs & Fulfillment</h3>
                <p className="text-xs text-text-sec">Track customer purchases, fulfillment flows, and payment details</p>
              </div>

              {/* Layout: Sidebar list (Left), Detail pane (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Orders list */}
                <div className="md:col-span-7 space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {orders.map((order) => {
                    const isSelected = selectedOrder.id === order.id;
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-primary-light border-primary/40 shadow-sm'
                            : 'bg-white border-border-main hover:bg-bg-sec'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-text-main">{order.id} &bull; {order.customer}</span>
                          <span className="text-[10px] font-semibold text-text-sec">{order.date}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-text-sec">{order.items} &bull; {order.total}</span>
                          <div className="flex gap-1.5 text-[9px] font-bold">
                            <span className={`px-1.5 py-0.5 rounded ${
                              order.payment === 'Paid' ? 'bg-green-50 text-primary' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {order.payment}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded ${
                              order.status === 'Fulfilled' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-500'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Order Detail Pane */}
                <div className="md:col-span-5 bg-bg-sec border border-border-main rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-border-main pb-2.5 mb-3">
                      <span className="text-xs font-bold text-text-main">Order Details {selectedOrder.id}</span>
                      <span className="text-[10px] font-bold bg-white border border-border-main px-2 py-0.5 rounded text-text-sec">
                        {selectedOrder.channel}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-sec">Customer Name:</span>
                        <span className="font-semibold text-text-main">{selectedOrder.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-sec">Date Recorded:</span>
                        <span className="text-text-main">{selectedOrder.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-sec">Payment Status:</span>
                        <span className="font-bold text-success-main">{selectedOrder.payment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-sec">Fulfillment:</span>
                        <span className={`font-bold ${selectedOrder.status === 'Fulfilled' ? 'text-blue-500' : 'text-rose-500'}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="border-t border-border-main pt-2.5 mt-2.5 flex justify-between font-bold text-sm">
                        <span className="text-text-main">Total Charge:</span>
                        <span className="text-primary">{selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    {selectedOrder.status === 'Unfulfilled' ? (
                      <button 
                        onClick={() => {
                          const updated = orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'Fulfilled' } : o);
                          setOrders(updated);
                          setSelectedOrder({ ...selectedOrder, status: 'Fulfilled' });
                        }}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer"
                      >
                        Mark as Fulfilled
                      </button>
                    ) : (
                      <button className="flex-1 bg-white border border-border-main text-text-sec text-xs font-bold py-2 rounded-lg text-center cursor-not-allowed">
                        Fulfillment Complete
                      </button>
                    )}
                    <button className="bg-white border border-border-main hover:bg-bg-sec text-text-main text-xs font-semibold p-2 rounded-lg cursor-pointer">
                      Print Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: POS CHECKOUT INTERFACE */}
          {activeTab === 'pos' && (
            <div className="animate-in fade-in duration-200 text-left">
              {/* POS Interface: simulated tablet UI */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
                
                {/* Left Panel: Register Grid (8 cols) */}
                <div className="lg:col-span-8 p-4 border-r border-border-main">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-text-main uppercase tracking-wider">Store Quick Keys</span>
                    <span className="text-[10px] text-text-sec bg-bg-sec px-2 py-0.5 rounded border border-border-main">
                      Terminal #01
                    </span>
                  </div>
                  
                  {/* Grid of keys */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {posProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="bg-white border border-border-main p-3 rounded-xl hover:border-primary hover:shadow-sm cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between h-20"
                      >
                        <span className={`text-[9px] font-bold uppercase ${p.color} px-1.5 py-0.5 rounded self-start`}>
                          {p.category}
                        </span>
                        <div className="mt-1">
                          <div className="text-xs font-bold text-text-main truncate">{p.name}</div>
                          <div className="text-xs font-semibold text-primary">${p.price}.00</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel: Active Cart Sidebar (4 cols) */}
                <div className="lg:col-span-4 bg-bg-sec p-4 flex flex-col justify-between border-t lg:border-t-0 border-border-main">
                  <div>
                    <div className="flex justify-between items-center border-b border-border-main pb-2 mb-3">
                      <span className="text-xs font-bold text-text-main">Current Cart</span>
                      <span className="text-[10px] bg-primary-light text-primary px-2 py-0.5 rounded-full font-bold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                      </span>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {cart.length > 0 ? (
                        cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-border-main">
                            <div className="truncate max-w-[120px]">
                              <span className="font-semibold text-text-main block truncate">{item.name}</span>
                              <span className="text-[10px] text-text-sec">${item.price} each</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateCartQty(item.id, -1)}
                                className="h-5 w-5 bg-bg-sec border border-border-main hover:bg-border-main text-text-main font-bold rounded flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-bold text-text-main">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQty(item.id, 1)}
                                className="h-5 w-5 bg-bg-sec border border-border-main hover:bg-border-main text-text-main font-bold rounded flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 ml-1.5 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-text-sec text-xs">
                          Cart is currently empty.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Checkout Sums */}
                  <div className="border-t border-border-main pt-3 mt-4">
                    <div className="space-y-1.5 text-xs text-text-sec mb-3">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-text-main">${cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales Tax (8%):</span>
                        <span className="font-semibold text-text-main">${cartTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-text-main border-t border-border-main/50 pt-1.5 mt-1.5">
                        <span>Total Due:</span>
                        <span className="text-primary">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button 
                      onClick={() => {
                        if (cart.length === 0) return;
                        alert(`Checkout simulation complete! Paid: $${cartTotal.toFixed(2)}`);
                        setCart([]);
                      }}
                      className={`w-full text-center text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        cart.length > 0 
                          ? 'bg-primary hover:bg-primary-hover shadow-sm' 
                          : 'bg-border-main text-text-sec cursor-not-allowed'
                      }`}
                    >
                      <CreditCard className="h-4.5 w-4.5" />
                      Charge ${cartTotal.toFixed(2)}
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
