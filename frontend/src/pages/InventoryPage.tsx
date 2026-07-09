import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  getInventoryItems, 
  updateInventoryItem, 
  stockIn, 
  stockOut, 
  InventoryItem, 
  InventoryInput,
  StockInInput,
  StockOutInput
} from '../services/inventoryService';
import { getProducts, Product } from '../services/productService';
import { 
  Plus, 
  Minus, 
  Download, 
  AlertTriangle, 
  Loader2, 
  Check, 
  X, 
  AlertCircle,
  PackageOpen
} from 'lucide-react';
import InventorySummaryCards from '../components/inventory/InventorySummaryCards';
import InventoryFilters from '../components/inventory/InventoryFilters';
import InventoryTable from '../components/inventory/InventoryTable';
import StockInModal from '../components/inventory/StockInModal';
import StockOutModal from '../components/inventory/StockOutModal';
import UpdateStockModal from '../components/inventory/UpdateStockModal';
import InventoryDetailsModal from '../components/inventory/InventoryDetailsModal';
import InventoryHistoryModal from '../components/inventory/InventoryHistoryModal';

interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

const PRESET_CATEGORIES = ['Electronics', 'Furniture', 'Accessories', 'Apparel', 'Food & Beverage', 'Cosmetics', 'Fitness', 'Others'];

const InventoryPage: React.FC = () => {
  const { user } = useAuthStore();
  const userRole = user?.role || 'Admin';
  
  // Permissions
  const canModify = userRole === 'Admin' || userRole === 'Inventory Manager';

  // Data State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats State
  const [summary, setSummary] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [categories, setCategories] = useState<string[]>(PRESET_CATEGORIES);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal Control States
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Selected Item Active States
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch Inventory and Products
  const fetchInventoryData = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: itemsPerPage
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }

      // Fetch inventory page
      const response = await getInventoryItems(params);
      if (response.success) {
        setItems(response.data);
        setTotalItems(response.pagination.total);
        setTotalPages(response.pagination.pages);
        setCurrentPage(response.pagination.page);
        
        if (response.summary) {
          setSummary(response.summary);
        }

        // Dynamically build category list based on current elements
        const dbCategories = response.data.map(item => item.product?.category);
        const combined = Array.from(new Set([...PRESET_CATEGORIES, ...dbCategories])).filter(Boolean);
        setCategories(combined);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve inventory records.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch product list for modals
  const fetchProductsList = async () => {
    try {
      const res = await getProducts({ limit: 1000 });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products list', err);
    }
  };

  // Run fetch on search/filter changes - reset page to 1
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInventoryData(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Initial load
  useEffect(() => {
    fetchProductsList();
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchInventoryData(page);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  // Modal Submissions
  const handleStockInSubmit = async (data: StockInInput) => {
    const res = await stockIn(data);
    if (res.success) {
      showToast('Stock added successfully!');
      fetchInventoryData(currentPage);
    }
  };

  const handleStockOutSubmit = async (data: StockOutInput) => {
    const res = await stockOut(data);
    if (res.success) {
      showToast('Stock removed successfully!');
      fetchInventoryData(currentPage);
    }
  };

  const handleUpdateStockSubmit = async (id: string, data: Partial<InventoryInput>) => {
    const res = await updateInventoryItem(id, data);
    if (res.success) {
      showToast('Stock parameters updated successfully!');
      fetchInventoryData(currentPage);
    }
  };

  // Trigger Modals
  const handleViewItem = (item: InventoryItem) => {
    setActiveItem(item);
    setIsDetailsOpen(true);
  };

  const handleUpdateStockItem = (item: InventoryItem) => {
    setActiveItem(item);
    setIsUpdateOpen(true);
  };

  const handleHistoryItem = (item: InventoryItem) => {
    setActiveItem(item);
    setIsHistoryOpen(true);
  };

  // Quick Restock Shortcut from Low Stock Alert Banner
  const handleQuickRestock = (item: InventoryItem) => {
    setActiveItem(item);
    setIsStockInOpen(true);
  };

  // Map product ID to available stock for validation
  const maxStockMap = items.reduce((acc, item) => {
    if (item.product?._id) {
      acc[item.product._id] = item.currentStock;
    }
    return acc;
  }, {} as Record<string, number>);

  // Gather low stock items to show in Low Stock Alert Section
  const lowStockItems = items.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock');

  // Export as CSV
  const handleExportCSV = () => {
    if (items.length === 0) return showToast('No inventory records to export', 'error');

    // Header row
    const headers = ['Product Name', 'SKU', 'Category', 'Current Stock', 'Minimum Stock', 'Maximum Stock', 'Reorder Level', 'Status', 'Warehouse Location', 'Last Restocked'];
    
    // Values rows
    const rows = items.map(item => [
      `"${item.product?.productName || 'N/A'}"`,
      `"${item.product?.sku || 'N/A'}"`,
      `"${item.product?.category || 'N/A'}"`,
      item.currentStock,
      item.minimumStock,
      item.maximumStock,
      item.reorderLevel,
      `"${item.status}"`,
      `"${item.warehouseLocation || 'N/A'}"`,
      item.lastRestocked ? `"${new Date(item.lastRestocked).toLocaleDateString()}"` : 'Never'
    ]);

    // Build content
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    // Download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventory_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory report exported as CSV!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`flex items-center p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-auto p-1 rounded-lg text-emerald-800 hover:bg-emerald-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-border-main rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main">Inventory</h1>
          <p className="text-sm text-text-sec mt-1">
            Monitor and manage product stock levels across stores
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {/* Export Report CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center px-4 py-2.5 bg-white border border-border-main hover:bg-bg-sec text-text-main text-sm font-medium rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2 text-text-sec" />
            Export CSV
          </button>

          {canModify && (
            <>
              {/* Stock In Button */}
              <button
                onClick={() => setIsStockInOpen(true)}
                className="flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 duration-150 flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Stock In
              </button>

              {/* Stock Out Button */}
              <button
                onClick={() => setIsStockOutOpen(true)}
                className="flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 duration-150 flex-1 sm:flex-none"
              >
                <Minus className="w-4 h-4 mr-1.5" />
                Stock Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Indicator Cards */}
      <InventorySummaryCards counts={summary} />

      {/* Low Stock Alerts Banner Section */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="font-bold text-sm">Low Stock Alert Panel</h3>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            The following products have depleted stock levels below their defined safety stock thresholds. Please review and reorder.
          </p>
          <div className="flex gap-2 flex-wrap pt-1.5">
            {lowStockItems.slice(0, 5).map(item => (
              <div 
                key={item._id} 
                className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs text-text-main"
              >
                <span className="font-semibold">{item.product?.productName}</span>
                <span className="font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-100 font-bold">
                  Stock: {item.currentStock}
                </span>
                {canModify && (
                  <button
                    onClick={() => handleQuickRestock(item)}
                    className="text-xs font-bold text-primary hover:underline hover:text-primary-hover cursor-pointer"
                  >
                    Restock
                  </button>
                )}
              </div>
            ))}
            {lowStockItems.length > 5 && (
              <div className="flex items-center bg-amber-100/50 border border-amber-200 rounded-lg px-2.5 py-1 text-[11px] font-medium text-amber-800">
                + {lowStockItems.length - 5} more items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <InventoryFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Inventory Table Listing */}
      <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-text-sec">Loading inventory catalog...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <h3 className="font-semibold text-text-main">Error loading inventory</h3>
            <p className="text-sm text-text-sec">{error}</p>
            <button 
              onClick={() => fetchInventoryData(currentPage)}
              className="px-4 py-2 bg-bg-sec hover:bg-border-main border border-border-main text-sm font-medium rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100 shadow-sm">
              <PackageOpen className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-main font-display text-center w-full block">
                {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All' ? 'No Inventory Found' : 'No Inventory Available'}
              </h3>
              <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
                {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                  ? 'Try modifying your search queries or filter parameters.'
                  : 'Inventory will appear after products are created.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <InventoryTable
              items={items}
              canModify={canModify}
              onView={handleViewItem}
              onUpdateStock={handleUpdateStockItem}
              onHistory={handleHistoryItem}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-main flex items-center justify-between bg-bg-sec/30">
                <div className="text-xs text-text-sec">
                  Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
                  <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                  <span className="font-semibold">{totalItems}</span> items
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-border-main rounded-lg bg-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-sec cursor-pointer"
                  >
                    &larr; Prev
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg border cursor-pointer ${
                        currentPage === p
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-text-main border-border-main hover:bg-bg-sec'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-border-main rounded-lg bg-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-sec cursor-pointer"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock In Modal */}
      <StockInModal
        isOpen={isStockInOpen}
        onClose={() => {
          setIsStockInOpen(false);
          setActiveItem(null);
        }}
        products={products}
        onSubmit={handleStockInSubmit}
      />

      {/* Stock Out Modal */}
      <StockOutModal
        isOpen={isStockOutOpen}
        onClose={() => {
          setIsStockOutOpen(false);
          setActiveItem(null);
        }}
        products={products}
        onSubmit={handleStockOutSubmit}
        maxStockMap={maxStockMap}
      />

      {/* Update Stock Parameters Modal */}
      <UpdateStockModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setActiveItem(null);
        }}
        item={activeItem}
        onSubmit={handleUpdateStockSubmit}
      />

      {/* Inventory Item Details Modal */}
      <InventoryDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setActiveItem(null);
        }}
        item={activeItem}
      />

      {/* Stock Logs History Modal */}
      <InventoryHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setActiveItem(null);
        }}
        product={activeItem ? (activeItem.product as any) : null}
      />
    </div>
  );
};

export default InventoryPage;
