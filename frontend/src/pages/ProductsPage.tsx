import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  Product, 
  ProductInput 
} from '../services/productService';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Package, 
  Tag, 
  AlertCircle, 
  X, 
  Check, 
  Info,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Upload,
  Eye
} from 'lucide-react';

interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

const PRESET_CATEGORIES = ['Electronics', 'Furniture', 'Accessories', 'Apparel', 'Food & Beverage', 'Cosmetics', 'Fitness', 'Others'];

const ProductsPage: React.FC = () => {
  const { user } = useAuthStore();
  const userRole = user?.role || 'Admin';
  
  // Permissions
  const canModify = userRole === 'Admin' || userRole === 'Inventory Manager';
  const canDelete = userRole === 'Admin';

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(PRESET_CATEGORIES);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formProductName, setFormProductName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formIsCustomCategory, setFormIsCustomCategory] = useState(false);
  const [formBrand, setFormBrand] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('0');
  const [formMinimumStock, setFormMinimumStock] = useState('5');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formImage, setFormImage] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch Products
  const fetchProductsList = async (page = currentPage) => {
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
      
      const response = await getProducts(params);
      if (response.success) {
        setProducts(response.data);
        setTotalItems(response.pagination.total);
        setTotalPages(response.pagination.pages);
        setCurrentPage(response.pagination.page);
        
        // Dynamically build category list based on existing DB items combined with presets
        const dbCategories = response.data.map(p => p.category);
        const combined = Array.from(new Set([...PRESET_CATEGORIES, ...dbCategories])).filter(Boolean);
        setCategories(combined);
      } else {
        setError('Failed to retrieve products');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'An error occurred while loading products.');
    } finally {
      setLoading(false);
    }
  };

  // Run fetch on search/filter changes - reset page to 1
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProductsList(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Run fetch on page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchProductsList(page);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  // Image Upload handler (Base64 conversion)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setModalError('Image size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    if (!canModify) return;
    setEditingProduct(null);
    setFormProductName('');
    setFormSku('');
    setFormBarcode('');
    setFormCategory('Electronics');
    setFormCustomCategory('');
    setFormIsCustomCategory(false);
    setFormBrand('');
    setFormDescription('');
    setFormSellingPrice('');
    setFormCostPrice('');
    setFormQuantity('0');
    setFormMinimumStock('5');
    setFormStatus('Active');
    setFormImage('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (product: Product) => {
    if (!canModify) return;
    setEditingProduct(product);
    setFormProductName(product.productName);
    setFormSku(product.sku);
    setFormBarcode(product.barcode || '');
    
    if (PRESET_CATEGORIES.includes(product.category)) {
      setFormCategory(product.category);
      setFormIsCustomCategory(false);
    } else {
      setFormCategory('Custom');
      setFormCustomCategory(product.category);
      setFormIsCustomCategory(true);
    }
    
    setFormBrand(product.brand || '');
    setFormDescription(product.description || '');
    setFormSellingPrice(product.sellingPrice.toString());
    setFormCostPrice(product.costPrice.toString());
    setFormQuantity(product.quantity.toString());
    setFormMinimumStock(product.minimumStock.toString());
    setFormStatus(product.status);
    setFormImage(product.image || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDeleteModal = (product: Product) => {
    if (!canDelete) return;
    setProductToDelete(product);
    setIsDeleting(true);
  };

  // Submit Modal (Save/Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) return;

    // Frontend Validations
    if (!formProductName.trim()) return setModalError('Product name is required');
    if (!formSku.trim()) return setModalError('SKU is required');
    
    const finalCategory = formIsCustomCategory ? formCustomCategory.trim() : formCategory;
    if (!finalCategory) return setModalError('Category is required');

    const sellingPriceNum = parseFloat(formSellingPrice);
    const costPriceNum = parseFloat(formCostPrice);
    const quantityNum = parseInt(formQuantity);
    const minimumStockNum = parseInt(formMinimumStock);

    if (isNaN(sellingPriceNum) || sellingPriceNum < 0) return setModalError('Selling price must be a valid positive number');
    if (isNaN(costPriceNum) || costPriceNum < 0) return setModalError('Cost price must be a valid positive number');
    if (isNaN(quantityNum) || quantityNum < 0) return setModalError('Quantity must be a valid positive integer');
    if (isNaN(minimumStockNum) || minimumStockNum < 0) return setModalError('Minimum stock level must be a valid positive integer');

    const productInput: ProductInput = {
      productName: formProductName.trim(),
      sku: formSku.trim().toUpperCase(),
      barcode: formBarcode.trim() || undefined,
      category: finalCategory,
      brand: formBrand.trim() || undefined,
      description: formDescription.trim() || undefined,
      sellingPrice: sellingPriceNum,
      costPrice: costPriceNum,
      quantity: quantityNum,
      minimumStock: minimumStockNum,
      status: formStatus,
      image: formImage.trim() || undefined
    };

    try {
      setModalLoading(true);
      setModalError(null);

      if (editingProduct) {
        // Update
        const response = await updateProduct(editingProduct._id, productInput);
        if (response.success) {
          showToast(`Product "${productInput.productName}" updated successfully.`);
          setIsModalOpen(false);
          fetchProductsList(currentPage);
        }
      } else {
        // Create
        const response = await createProduct(productInput);
        if (response.success) {
          showToast(`Product "${productInput.productName}" created successfully.`);
          setIsModalOpen(false);
          fetchProductsList(1);
        }
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      setModalError(err.response?.data?.message || 'Error occurred while saving product. Please verify inputs.');
    } finally {
      setModalLoading(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!canDelete || !productToDelete) return;

    try {
      setModalLoading(true);
      const response = await deleteProduct(productToDelete._id);
      if (response.success) {
        showToast(`Product "${productToDelete.productName}" deleted successfully.`, 'success');
        setIsDeleting(false);
        setProductToDelete(null);
        
        // Adjust page if current page becomes empty
        const remainingOnPage = products.length - 1;
        const newPage = remainingOnPage === 0 && currentPage > 1 ? currentPage - 1 : currentPage;
        fetchProductsList(newPage);
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Calculate Margin Helper
  const priceVal = parseFloat(formSellingPrice) || 0;
  const costVal = parseFloat(formCostPrice) || 0;
  const marginPercentage = priceVal > 0 ? (((priceVal - costVal) / priceVal) * 100).toFixed(1) : '0.0';

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
          <h1 className="text-2xl font-display font-bold text-text-main">Products</h1>
          <p className="text-sm text-text-sec mt-1">
            Manage all store products
          </p>
        </div>
        {canModify && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        )}
      </div>

      {/* Filter and Query Section */}
      <div className="bg-white border border-border-main rounded-2xl shadow-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sec w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search products by name, SKU or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto shrink-0">
            <div className="min-w-[160px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main cursor-pointer"
              >
                <option value="All">Category Filter</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="min-w-[160px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main cursor-pointer"
              >
                <option value="All">Status Filter</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 bg-bg-sec hover:bg-border-main text-text-main text-sm font-medium rounded-xl border border-border-main cursor-pointer transition-colors duration-150"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Listing Grid/Table */}
      <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-text-sec">Loading products catalog...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <h3 className="font-semibold text-text-main">Error loading products</h3>
            <p className="text-sm text-text-sec">{error}</p>
            <button 
              onClick={() => fetchProductsList(currentPage)}
              className="px-4 py-2 bg-bg-sec hover:bg-border-main border border-border-main text-sm font-medium rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100 shadow-sm animate-pulse">
              <Package className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-main font-display">No Products Found</h3>
              <p className="text-sm text-text-sec mt-2 leading-relaxed">
                {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                  ? 'Try modifying your search queries or filter parameters.'
                  : 'Start adding items to catalog to begin checkout sales and inventory counts.'}
              </p>
            </div>
            {canModify && !searchQuery && selectedCategory === 'All' && selectedStatus === 'All' && (
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl shadow-xs cursor-pointer duration-150 active:scale-95"
              >
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-sec border-b border-border-main text-xs font-semibold text-text-sec uppercase tracking-wider">
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Selling Price</th>
                    <th className="px-6 py-4 text-center">Available Stock</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main text-sm text-text-main">
                  {products.map((product) => {
                    const isOutOfStock = product.quantity <= 0;
                    const isLowStock = product.quantity > 0 && product.quantity <= product.minimumStock;

                    return (
                      <tr key={product._id} className="hover:bg-bg-sec/40 transition-colors duration-150 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 rounded-lg bg-bg-sec border border-border-main flex items-center justify-center shadow-inner overflow-hidden shrink-0 select-none">
                            {product.image ? (
                              product.image.startsWith('http') || product.image.startsWith('data:image') ? (
                                <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xl">{product.image}</span>
                              )
                            ) : (
                              <Package className="w-6 h-6 text-text-sec" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <span className="font-semibold block truncate text-text-main max-w-xs sm:max-w-md">
                              {product.productName}
                            </span>
                            {product.brand && (
                              <span className="text-xs text-text-sec block mt-0.5">
                                by {product.brand}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-text-sec bg-bg-sec px-2 py-1 rounded border border-border-main font-mono">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium bg-primary-light text-primary border border-primary/20">
                            <Tag className="w-3 h-3 mr-1" />
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium whitespace-nowrap">
                          ${product.sellingPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <span className={`font-semibold ${
                              isOutOfStock 
                                ? 'text-rose-600' 
                                : isLowStock 
                                  ? 'text-amber-600' 
                                  : 'text-text-main'
                            }`}>
                              {product.quantity}
                            </span>
                            {isOutOfStock ? (
                              <span className="text-[10px] text-rose-500 font-medium">Out of stock</span>
                            ) : isLowStock ? (
                              <span className="text-[10px] text-amber-500 font-medium">Low stock (&le;{product.minimumStock})</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            product.status === 'Active'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-gray-100 border-gray-200 text-gray-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              product.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                            }`} />
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenViewModal(product)}
                              title="View Product"
                              className="p-2 hover:bg-primary-light hover:text-primary rounded-lg text-text-sec transition-colors cursor-pointer"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            {canModify && (
                              <button
                                onClick={() => handleOpenEditModal(product)}
                                title="Edit Product"
                                className="p-2 hover:bg-primary-light hover:text-primary rounded-lg text-text-sec transition-colors cursor-pointer"
                              >
                                <Edit className="w-4.5 h-4.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleOpenDeleteModal(product)}
                                title="Delete Product"
                                className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-text-sec transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
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

            {/* Pagination Panel */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-main flex items-center justify-between bg-bg-sec/30">
                <div className="text-xs text-text-sec">
                  Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
                  <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                  <span className="font-semibold">{totalItems}</span> products
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-border-main rounded-lg bg-white text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-sec cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-border-main overflow-hidden max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-main bg-bg-sec/50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-text-main">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-border-main rounded-lg text-text-sec cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
              {modalError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium leading-relaxed">{modalError}</span>
                </div>
              )}

              {/* Grid 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Wireless Headphones"
                    value={formProductName}
                    onChange={(e) => setFormProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none text-text-main"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WH-PH100-GRY"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none text-text-main font-mono uppercase"
                  />
                </div>
              </div>

              {/* Grid 2: Barcode, Category, Brand */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 451039485"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none text-text-main"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  {formIsCustomCategory ? (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type category..."
                        value={formCustomCategory}
                        onChange={(e) => setFormCustomCategory(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-white border border-border-main focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none text-text-main"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormIsCustomCategory(false);
                          setFormCategory(PRESET_CATEGORIES[0]);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-sec hover:text-rose-600 cursor-pointer"
                        title="Select preset category"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        if (e.target.value === 'Custom') {
                          setFormIsCustomCategory(true);
                          setFormCustomCategory('');
                        } else {
                          setFormCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none text-text-main cursor-pointer"
                    >
                      {PRESET_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="Custom">+ Create New Category</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none text-text-main"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details about features, specs, and packaging..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm outline-none text-text-main resize-none"
                />
              </div>

              {/* Pricing & Stock Card */}
              <div className="bg-bg-sec/40 p-4 border border-border-main rounded-xl space-y-4">
                <span className="text-xs font-bold text-text-main uppercase tracking-wider block">
                  Pricing & Inventory Control
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-semibold text-text-sec block">
                      Selling Price ($) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      placeholder="0.00"
                      value={formSellingPrice}
                      onChange={(e) => setFormSellingPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-semibold text-text-sec block">
                      Cost Price ($) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      placeholder="0.00"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-semibold text-text-sec block">
                      Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 50"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-semibold text-text-sec block">
                      Minimum Stock <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 5"
                      value={formMinimumStock}
                      onChange={(e) => setFormMinimumStock(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                    />
                  </div>
                </div>

                {/* Profit Margin Info Bar */}
                <div className="flex justify-between items-center p-3 bg-white border border-border-main rounded-lg text-xs">
                  <div className="flex items-center text-text-sec gap-1.5">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    <span>Estimated Profit Margin:</span>
                  </div>
                  <span className={`font-bold text-sm ${
                    parseFloat(marginPercentage) >= 30 
                      ? 'text-emerald-600' 
                      : parseFloat(marginPercentage) >= 10
                        ? 'text-amber-600'
                        : 'text-rose-600'
                  }`}>
                    {marginPercentage}%
                  </span>
                </div>
              </div>

              {/* Status and Image Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Product Status <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center px-4 py-2 border border-border-main rounded-xl text-sm cursor-pointer select-none bg-white hover:bg-bg-sec/30 flex-1">
                      <input
                        type="radio"
                        name="status"
                        checked={formStatus === 'Active'}
                        onChange={() => setFormStatus('Active')}
                        className="accent-primary mr-2"
                      />
                      Active
                    </label>
                    <label className="flex items-center px-4 py-2 border border-border-main rounded-xl text-sm cursor-pointer select-none bg-white hover:bg-bg-sec/30 flex-1">
                      <input
                        type="radio"
                        name="status"
                        checked={formStatus === 'Inactive'}
                        onChange={() => setFormStatus('Inactive')}
                        className="accent-primary mr-2"
                      />
                      Inactive
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Product Image (URL / Emoji / File Upload)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 🎧 or http://img-url.com"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                    />
                    
                    {/* Simulated File Upload Input */}
                    <label className="flex items-center justify-center p-2 border border-border-main bg-bg-sec hover:bg-border-main text-text-sec hover:text-text-main rounded-xl cursor-pointer transition-colors duration-150 w-11 h-10 select-none">
                      <Upload className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formImage && formImage.startsWith('data:image') && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5 font-medium flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Local File Loaded
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border-main flex justify-end gap-3 bg-bg-sec/30 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border-main hover:bg-bg-sec text-text-main text-sm font-medium rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-all shadow-xs cursor-pointer disabled:bg-primary/50 disabled:cursor-not-allowed"
                >
                  {modalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border-main p-6 space-y-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-lg font-display font-bold">Delete Product</h2>
            </div>
            
            <p className="text-sm text-text-sec leading-relaxed">
              Are you sure you want to permanently delete the product <strong className="text-text-main font-semibold">"{productToDelete.productName}"</strong>? This will remove all records of this item and cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleting(false)}
                disabled={modalLoading}
                className="px-4 py-2 border border-border-main hover:bg-bg-sec text-text-main text-sm font-medium rounded-xl cursor-pointer transition-colors disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={modalLoading}
                className="flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer disabled:bg-rose-600/50 disabled:cursor-not-allowed"
              >
                {modalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      {isViewModalOpen && viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-border-main overflow-hidden max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-main bg-bg-sec/50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-text-main">
                  Product Details
                </h2>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 hover:bg-border-main rounded-lg text-text-sec cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product Info Summary Row */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-24 h-24 rounded-2xl bg-bg-sec border border-border-main flex items-center justify-center shadow-inner overflow-hidden shrink-0 select-none">
                  {viewingProduct.image ? (
                    viewingProduct.image.startsWith('http') || viewingProduct.image.startsWith('data:image') ? (
                      <img src={viewingProduct.image} alt={viewingProduct.productName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{viewingProduct.image}</span>
                    )
                  ) : (
                    <Package className="w-12 h-12 text-text-sec" />
                  )}
                </div>
                
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-display font-bold text-text-main">{viewingProduct.productName}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      viewingProduct.status === 'Active'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-gray-100 border-gray-200 text-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        viewingProduct.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />
                      {viewingProduct.status}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap text-xs font-mono text-text-sec">
                    <span className="bg-bg-sec border border-border-main px-2 py-0.5 rounded">SKU: {viewingProduct.sku}</span>
                    {viewingProduct.barcode && (
                      <span className="bg-bg-sec border border-border-main px-2 py-0.5 rounded">Barcode: {viewingProduct.barcode}</span>
                    )}
                  </div>
                  {viewingProduct.brand && (
                    <p className="text-sm text-text-sec mt-1">
                      Brand: <strong className="text-text-main font-semibold">{viewingProduct.brand}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {viewingProduct.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-sec uppercase tracking-wider">Description</h4>
                  <p className="text-sm text-text-main bg-bg-sec/40 p-4 border border-border-main rounded-xl leading-relaxed whitespace-pre-wrap">
                    {viewingProduct.description}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-bg-sec/30 border border-border-main rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Category</span>
                  <span className="text-sm font-semibold text-text-main truncate block">{viewingProduct.category}</span>
                </div>
                
                <div className="p-3 bg-bg-sec/30 border border-border-main rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Selling Price</span>
                  <span className="text-sm font-bold text-text-main block">${viewingProduct.sellingPrice.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-bg-sec/30 border border-border-main rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Cost Price</span>
                  <span className="text-sm font-bold text-text-main block">${viewingProduct.costPrice.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-bg-sec/30 border border-border-main rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Estimated Profit</span>
                  <span className={`text-sm font-bold block ${
                    viewingProduct.sellingPrice - viewingProduct.costPrice > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    ${(viewingProduct.sellingPrice - viewingProduct.costPrice).toFixed(2)} 
                    <span className="text-xs font-medium ml-1">
                      ({viewingProduct.sellingPrice > 0 
                        ? (((viewingProduct.sellingPrice - viewingProduct.costPrice) / viewingProduct.sellingPrice) * 100).toFixed(0) 
                        : '0'}%)
                    </span>
                  </span>
                </div>
              </div>

              {/* Stock and Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-bg-sec/20 border border-border-main rounded-xl space-y-2">
                  <span className="text-xs font-bold text-text-sec uppercase tracking-wider block">Inventory Details</span>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-sec">Available Quantity:</span>
                    <span className={`font-bold ${
                      viewingProduct.quantity <= 0 
                        ? 'text-rose-600' 
                        : viewingProduct.quantity <= viewingProduct.minimumStock 
                          ? 'text-amber-600' 
                          : 'text-text-main'
                    }`}>{viewingProduct.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-sec">Minimum Stock Threshold:</span>
                    <span className="font-semibold text-text-main">{viewingProduct.minimumStock}</span>
                  </div>
                  {viewingProduct.quantity <= viewingProduct.minimumStock && (
                    <div className={`text-xs px-2.5 py-1.5 border rounded-lg flex items-center gap-1.5 font-medium ${
                      viewingProduct.quantity <= 0 
                        ? 'bg-rose-50 border-rose-100 text-rose-700' 
                        : 'bg-amber-50 border-amber-100 text-amber-700'
                    }`}>
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{viewingProduct.quantity <= 0 ? 'Stock depleted! Reorder immediately.' : 'Low stock warning! Item is below safety stock level.'}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-bg-sec/20 border border-border-main rounded-xl space-y-2">
                  <span className="text-xs font-bold text-text-sec uppercase tracking-wider block">System Metadata</span>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-sec">Created By:</span>
                    <span className="font-semibold text-text-main truncate max-w-[150px]" title={viewingProduct.createdBy?.email}>
                      {viewingProduct.createdBy?.name || 'System'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-sec">Created At:</span>
                    <span className="text-text-main">{new Date(viewingProduct.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-sec">Last Updated:</span>
                    <span className="text-text-main">{new Date(viewingProduct.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-border-main flex justify-end gap-3 bg-bg-sec/30 p-6">
              {canModify && (
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(viewingProduct);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl cursor-pointer transition-colors shadow-xs"
                >
                  Edit Product
                </button>
              )}
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-border-main hover:bg-bg-sec text-text-main text-sm font-medium rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
