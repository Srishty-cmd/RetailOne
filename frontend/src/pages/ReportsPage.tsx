import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Calendar, 
  Download, 
  Printer, 
  FileText, 
  Loader2, 
  ArrowUpRight, 
  CreditCard,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { getReportData, ReportData, ReportParams } from '../services/reportService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const ReportsPage: React.FC = () => {
  const [filter, setFilter] = useState<'today' | '7days' | '30days' | 'monthly' | 'custom'>('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const fetchReports = async (currentFilter = filter, start = startDate, end = endDate) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: ReportParams = { filter: currentFilter };
      if (currentFilter === 'custom' && start && end) {
        params.startDate = start;
        params.endDate = end;
      }

      const res = await getReportData(params);
      if (res.success) {
        setReportData(res.data);
      } else {
        setError('Failed to fetch analytics reports');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while aggregating report database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter !== 'custom') {
      fetchReports(filter);
    }
  }, [filter]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    fetchReports('custom', startDate, endDate);
    setShowCustomPicker(false);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (!reportData) return;
    
    // Generate CSV content of the Sales Trend
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Label,Revenue ($),Orders Count\r\n';
    
    reportData.salesTrend.forEach((item) => {
      csvContent += `${item.date},"${item.label}",${item.revenue.toFixed(2)},${item.ordersCount}\r\n`;
    });
    
    // Download Link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RetailOne_Revenue_Report_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export placeholder alert
  const handleExportPDF = () => {
    alert(
      'Export PDF (Placeholder Action):\n\nIn a production environment, this triggers a server-side PDF generation template (using pdfkit or puppeteer) or utilizes a client library like jspdf to export this dashboard as an audit-ready document.'
    );
  };

  // Print Window handler
  const handlePrint = () => {
    window.print();
  };

  const hasOrders = reportData && reportData.summary.totalOrders > 0;

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-border-main rounded-2xl shadow-xs print:shadow-none print:border-none">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main">Analytics & Reports</h1>
          <p className="text-sm text-text-sec mt-1">View store performance, sales revenue trends, and inventory valuation</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto print:hidden">
          <div className="flex bg-bg-sec p-1 rounded-xl border border-border-main text-xs font-semibold">
            {(['today', '7days', '30days', 'monthly'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setFilter(opt);
                  setShowCustomPicker(false);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer capitalize ${
                  filter === opt 
                    ? 'bg-white text-primary shadow-xs' 
                    : 'text-text-sec hover:text-text-main'
                }`}
              >
                {opt === '7days' ? '7 Days' : opt === '30days' ? '30 Days' : opt}
              </button>
            ))}
            <button
              onClick={() => {
                setFilter('custom');
                setShowCustomPicker(true);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'custom' 
                  ? 'bg-white text-primary shadow-xs' 
                  : 'text-text-sec hover:text-text-main'
              }`}
            >
              Custom
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={loading || !hasOrders}
              className="p-2 border border-border-main bg-white hover:bg-bg-sec rounded-xl text-text-main hover:text-primary transition-colors disabled:opacity-40 cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportPDF}
              disabled={loading || !hasOrders}
              className="p-2 border border-border-main bg-white hover:bg-bg-sec rounded-xl text-text-main hover:text-primary transition-colors disabled:opacity-40 cursor-pointer"
              title="Export PDF (Placeholder)"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              disabled={loading || !hasOrders}
              className="p-2 border border-border-main bg-white hover:bg-bg-sec rounded-xl text-text-main hover:text-primary transition-colors disabled:opacity-40 cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom range picker overlay */}
      {showCustomPicker && (
        <div className="bg-white p-5 border border-border-main rounded-2xl shadow-md max-w-sm ml-auto animate-fade-in print:hidden">
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border-main">
              <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Select Custom Date Range
              </span>
              <button 
                type="button" 
                onClick={() => setShowCustomPicker(false)}
                className="text-text-sec hover:text-text-main p-0.5 rounded hover:bg-bg-sec"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-sec block">START DATE</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-border-main rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-sec block">END DATE</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-border-main rounded-lg text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Apply Filter
            </button>
          </form>
        </div>
      )}

      {loading ? (
        /* Loading overlay screen */
        <div className="p-20 flex flex-col items-center justify-center space-y-4 bg-white border border-border-main rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-text-sec">Generating Report Dashboard...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center space-y-3 bg-white border border-border-main rounded-2xl max-w-md mx-auto">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
          <p className="text-sm font-medium text-text-main">Report Generation Error</p>
          <p className="text-xs text-text-sec">{error}</p>
          <button onClick={() => fetchReports()} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all">Retry</button>
        </div>
      ) : !hasOrders ? (
        /* Empty State */
        <div className="bg-white p-20 border border-border-main rounded-2xl shadow-xs flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto animate-fade-in animate-once">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100 shadow-sm animate-pulse">
            <BarChart2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-main font-display">No Report Data Available</h3>
            <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
              Reports will appear after checkout sales orders are created. Match other dates or start checking out transactions in the POS billing register.
            </p>
          </div>
        </div>
      ) : reportData ? (
        /* Loaded Dashboard Stats */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
            <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-sec font-semibold">Total Revenue ({filter === 'custom' ? 'Range' : 'Filter'})</span>
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-main">${reportData.summary.totalRevenue.toFixed(2)}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-sec font-semibold">Today's Sales</span>
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-main">${reportData.summary.todaySales.toFixed(2)}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-sec font-semibold">Monthly Sales ({new Date().toLocaleDateString('en-US', { month: 'short' })})</span>
                <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-main">${reportData.summary.monthlyRevenue.toFixed(2)}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-sec font-semibold">Completed / Total Orders</span>
                <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-main">
                {reportData.summary.completedOrders} <span className="text-xs text-text-sec font-normal">/ {reportData.summary.totalOrders}</span>
              </p>
              {reportData.summary.pendingOrders > 0 && (
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                  {reportData.summary.pendingOrders} orders currently pending
                </span>
              )}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-sec font-semibold">Total Products</span>
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Package className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-main">{reportData.summary.totalProducts}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-sec font-semibold">Low Stock Items</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  reportData.summary.lowStockProducts > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-text-sec'
                }`}>
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-main">{reportData.summary.lowStockProducts}</p>
            </div>

            {/* Valuation Cost & Sale Cards */}
            <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-sec font-semibold">Stock Valuation (Cost)</span>
                <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-main">${reportData.inventorySummary.totalCostValue.toFixed(2)}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-text-sec font-semibold">Expected Sales Value</span>
                <div className="w-9 h-9 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-main">${reportData.inventorySummary.totalSellingValue.toFixed(2)}</p>
            </div>
          </div>

          {/* Charts Row 1: Line and Area Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            {/* Revenue Trend Line Chart */}
            <div className="bg-white border border-border-main p-6 rounded-2xl shadow-xs flex flex-col h-[340px] print:border-none">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Revenue Trend Chart ($)
              </h3>
              <div className="flex-1 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.salesTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders Trend Area Chart */}
            <div className="bg-white border border-border-main p-6 rounded-2xl shadow-xs flex flex-col h-[340px] print:border-none">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                Orders Volume Trend (Count)
              </h3>
              <div className="flex-1 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.salesTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#64748b" />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip formatter={(value) => [value, 'Orders']} />
                    <Area type="monotone" dataKey="ordersCount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.12} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Bar Chart & Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
            {/* Monthly Sales Bar Chart (last 12 months) */}
            <div className="bg-white border border-border-main p-6 rounded-2xl shadow-xs flex flex-col h-[320px] lg:col-span-1 print:border-none">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                Monthly Revenue History
              </h3>
              <div className="flex-1 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.monthlySalesTrend} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Sales']} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Category Pie Chart */}
            <div className="bg-white border border-border-main p-6 rounded-2xl shadow-xs flex flex-col h-[320px] lg:col-span-1 print:border-none">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                Sales by Product Category
              </h3>
              <div className="flex-1 w-full text-xs relative flex items-center justify-center">
                {reportData.categorySales.length === 0 ? (
                  <p className="text-text-sec text-xs">No category details found</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.categorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="revenue"
                        nameKey="category"
                      >
                        {reportData.categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Sales']} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payment Method Pie Chart */}
            <div className="bg-white border border-border-main p-6 rounded-2xl shadow-xs flex flex-col h-[320px] lg:col-span-1 print:border-none">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Payment Method Share
              </h3>
              <div className="flex-1 w-full text-xs relative flex items-center justify-center">
                {reportData.paymentDistribution.length === 0 ? (
                  <p className="text-text-sec text-xs">No payment splits recorded</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.paymentDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        dataKey="count"
                        nameKey="method"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.paymentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} orders ($${props.payload.revenue.toFixed(2)})`, 'Usage']} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Aggregated Lists: Top Products, Stores, Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            
            {/* Top Selling Products */}
            <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-sec/10">
                <h3 className="text-sm font-bold text-text-main">Top Selling Products</h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 border border-emerald-100 rounded-full">Top 10 list</span>
              </div>
              <div className="flex-1 overflow-x-auto">
                {reportData.topProducts.length === 0 ? (
                  <div className="p-8 text-center text-text-sec text-sm">No items matching range sales.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-sec/30 border-b border-border-main text-[10px] font-semibold text-text-sec uppercase tracking-wider">
                        <th className="py-2.5 px-4">Product Name</th>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4 text-center">Qty Sold</th>
                        <th className="py-2.5 px-4 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main text-xs text-text-sec">
                      {reportData.topProducts.map((p, idx) => (
                        <tr key={p._id || idx} className="hover:bg-bg-sec/20">
                          <td className="py-3 px-4 font-semibold text-text-main">{p.productName}</td>
                          <td className="py-3 px-4 font-mono">{p.sku}</td>
                          <td className="py-3 px-4">{p.category}</td>
                          <td className="py-3 px-4 text-center font-bold text-text-main">{p.quantitySold}</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600">${p.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Store-wise Sales Performance */}
            <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-sec/10">
                <h3 className="text-sm font-bold text-text-main">Store-wise Sales Performance</h3>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 border border-blue-100 rounded-full">All Channels</span>
              </div>
              <div className="flex-1 overflow-x-auto">
                {reportData.storeSales.length === 0 ? (
                  <div className="p-8 text-center text-text-sec text-sm">No checkout records linked to stores yet.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-sec/30 border-b border-border-main text-[10px] font-semibold text-text-sec uppercase tracking-wider">
                        <th className="py-2.5 px-4">Store Name</th>
                        <th className="py-2.5 px-4">Store Code</th>
                        <th className="py-2.5 px-4 text-center">Orders Count</th>
                        <th className="py-2.5 px-4 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main text-xs text-text-sec">
                      {reportData.storeSales.map((s, idx) => (
                        <tr key={s.storeId || idx} className="hover:bg-bg-sec/20">
                          <td className="py-3 px-4 font-semibold text-text-main">{s.name}</td>
                          <td className="py-3 px-4 font-mono font-semibold">{s.code}</td>
                          <td className="py-3 px-4 text-center">{s.ordersCount} orders</td>
                          <td className="py-3 px-4 text-right font-bold text-primary">${s.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Low Stock Audit List */}
            <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden flex flex-col lg:col-span-2">
              <div className="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-sec/10">
                <h3 className="text-sm font-bold text-text-main">Low Stock & Out of Stock Audit</h3>
                <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 border border-rose-100 rounded-full">Requires Reorder</span>
              </div>
              <div className="overflow-x-auto">
                {reportData.lowStockList.length === 0 ? (
                  <div className="p-8 text-center text-emerald-600 font-medium text-xs">
                    ✔ All inventory parameters are fully stocked. No active reorders required.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-sec/30 border-b border-border-main text-[10px] font-semibold text-text-sec uppercase tracking-wider">
                        <th className="py-2.5 px-6">Product Details</th>
                        <th className="py-2.5 px-6">SKU Code</th>
                        <th className="py-2.5 px-6">Category</th>
                        <th className="py-2.5 px-6 text-center">Current Qty</th>
                        <th className="py-2.5 px-6 text-center">Safety Stock Limit</th>
                        <th className="py-2.5 px-6 text-right">Status Badge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main text-xs text-text-sec">
                      {reportData.lowStockList.map((inv) => (
                        <tr key={inv.inventoryId} className="hover:bg-bg-sec/20">
                          <td className="py-3 px-6 font-semibold text-text-main">{inv.productName}</td>
                          <td className="py-3 px-6 font-mono">{inv.sku}</td>
                          <td className="py-3 px-6">{inv.category}</td>
                          <td className="py-3 px-6 text-center font-bold text-text-main">{inv.currentStock}</td>
                          <td className="py-3 px-6 text-center font-semibold">{inv.minimumStock}</td>
                          <td className="py-3 px-6 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              inv.currentStock === 0
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {inv.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default ReportsPage;
