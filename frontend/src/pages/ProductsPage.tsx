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
  Layers,
  Archive
} from 'lucide-react';

interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

const PRESET_CATEGORIES = ['Electronics', 'Furniture', 'Accessories', 'Apparel', 'Food & Beverage', 'Cosmetics', 'Fitness', 'Others'];
const PRESET_UNITS = ['pcs', 'kg', 'g', 'lbs', 'box', 'pack', 'ml', 'liters'];

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formIsCustomCategory, setFormIsCustomCategory] = useState(false);
  const [formBrand, setFormBrand] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formUnit, setFormUnit] = useState('pcs');
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
  const fetchProductsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProductsList();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    if (!canModify) return;
    setEditingProduct(null);
    setFormName('');
    setFormSku('');
    setFormDescription('');
    setFormCategory('Electronics');
    setFormCustomCategory('');
    setFormIsCustomCategory(false);
    setFormBrand('');
    setFormPrice('');
    setFormCostPrice('');
    setFormStock('0');
    setFormUnit('pcs');
    setFormStatus('Active');
    setFormImage('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (product: Product) => {
    if (!canModify) return;
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormDescription(product.description || '');
    
    if (PRESET_CATEGORIES.includes(product.category)) {
      setFormCategory(product.category);
      setFormIsCustomCategory(false);
    } else {
      setFormCategory('Custom');
      setFormCustomCategory(product.category);
      setFormIsCustomCategory(true);
    }
    
    setFormBrand(product.brand || '');
    setFormPrice(product.price.toString());
    setFormCostPrice(product.costPrice.toString());
    setFormStock(product.stock.toString());
    setFormUnit(product.unit);
    setFormStatus(product.status);
    setFormImage(product.image || '');
    setModalError(null);
    setIsModalOpen(true);
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
    if (!formName.trim()) return setModalError('Product name is required');
    if (!formSku.trim()) return setModalError('SKU is required');
    
    const finalCategory = formIsCustomCategory ? formCustomCategory.trim() : formCategory;
    if (!finalCategory) return setModalError('Category is required');

    const priceNum = parseFloat(formPrice);
    const costNum = parseFloat(formCostPrice);
    const stockNum = parseFloat(formStock);

    if (isNaN(priceNum) || priceNum < 0) return setModalError('Price must be a valid positive number');
    if (isNaN(costNum) || costNum < 0) return setModalError('Cost price must be a valid positive number');
    if (isNaN(stockNum) || stockNum < 0) return setModalError('Stock must be a valid positive number');

    const productInput: ProductInput = {
      name: formName.trim(),
      sku: formSku.trim().toUpperCase(),
      description: formDescription.trim() || undefined,
      category: finalCategory,
      brand: formBrand.trim() || undefined,
      price: priceNum,
      costPrice: costNum,
      stock: stockNum,
      unit: formUnit,
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
          showToast(`Product "${productInput.name}" updated successfully.`);
          setIsModalOpen(false);
          fetchProductsList();
        }
      } else {
        // Create
        const response = await createProduct(productInput);
        if (response.success) {
          showToast(`Product "${productInput.name}" created successfully.`);
          setIsModalOpen(false);
          fetchProductsList();
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
        showToast(`Product "${productToDelete.name}" deleted successfully.`, 'success');
        setIsDeleting(false);
        setProductToDelete(null);
        fetchProductsList();
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Calculate Margin Helper
  const priceVal = parseFloat(formPrice) || 0;
  const costVal = parseFloat(formCostPrice) || 0;
  const marginPercentage = priceVal > 0 ? (((priceVal - costVal) / priceVal) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
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
            Manage your omnichannel catalog, pricing, and live inventory.
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sec w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Listing Grid/Table */}
      <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-text-sec">Loading product inventory...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <h3 className="font-semibold text-text-main">Error loading products</h3>
            <p className="text-sm text-text-sec">{error}</p>
            <button 
              onClick={fetchProductsList}
              className="px-4 py-2 bg-bg-sec hover:bg-border-main border border-border-main text-sm font-medium rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-bg-sec rounded-full flex items-center justify-center text-text-sec">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-main">No products found</h3>
              <p className="text-sm text-text-sec mt-1">
                {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                  ? 'Try modifying your search queries or filter parameters.'
                  : 'Start adding items to catalog to begin checkout sales and inventory counts.'}
              </p>
            </div>
            {canModify && !searchQuery && selectedCategory === 'All' && selectedStatus === 'All' && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl shadow-xs"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-sec border-b border-border-main text-xs font-semibold text-text-sec uppercase tracking-wider">
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Selling Price</th>
                  <th className="px-6 py-4 text-right">Cost Price</th>
                  <th className="px-6 py-4 text-center">Margin</th>
                  <th className="px-6 py-4 text-center">Stock Level</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  {canModify && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-sm text-text-main">
                {products.map((product) => {
                  const profitMargin = product.price > 0 
                    ? (((product.price - product.costPrice) / product.price) * 100).toFixed(0) 
                    : '0';

                  // Calculate stock badge colors
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= 10;

                  return (
                    <tr key={product._id} className="hover:bg-bg-sec/50 transition-colors duration-150 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-bg-sec border border-border-main flex items-center justify-center text-lg shadow-inner select-none overflow-hidden shrink-0">
                            {product.image ? (
                              product.image.startsWith('http') || product.image.startsWith('/') ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{product.image}</span>
                              )
                            ) : (
                              <Package className="w-5 h-5 text-text-sec" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold block truncate text-text-main max-w-xs sm:max-w-md">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-text-sec bg-bg-sec px-1.5 py-0.5 rounded border border-border-main font-mono">
                                {product.sku}
                              </span>
                              {product.brand && (
                                <span className="text-xs text-text-sec">
                                  by {product.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium bg-primary-light text-primary border border-primary/20">
                          <Tag className="w-3 h-3 mr-1" />
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium whitespace-nowrap">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-text-sec whitespace-nowrap">
                        ${product.costPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                          parseFloat(profitMargin) >= 30 
                            ? 'text-emerald-700 bg-emerald-50' 
                            : parseFloat(profitMargin) >= 10
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                        }`}>
                          {profitMargin}%
                        </span>
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
                            {product.stock} {product.unit}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-[10px] text-rose-500 font-medium">Out of stock</span>
                          ) : isLowStock ? (
                            <span className="text-[10px] text-amber-500 font-medium">Low stock</span>
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
                      {canModify && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              title="Edit product details"
                              className="p-1.5 hover:bg-primary-light hover:text-primary rounded-lg text-text-sec transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleOpenDeleteModal(product)}
                                title="Delete product"
                                className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-text-sec transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    SKU / Barcode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WH-PH100-GRY"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main font-mono uppercase"
                  />
                </div>
              </div>

              {/* Grid 2: Brand, Category, Unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
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
                        className="w-full pl-3 pr-8 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
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
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main cursor-pointer"
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
                    Unit of Measurement <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main cursor-pointer"
                  >
                    {PRESET_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 3: Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details about features, specs, and packaging..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main resize-none"
                />
              </div>

              {/* Grid 4: Pricing and Stock */}
              <div className="bg-bg-sec/40 p-4 border border-border-main rounded-xl space-y-4">
                <span className="text-xs font-bold text-text-main uppercase tracking-wider block">
                  Pricing & Inventory Control
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-sec block">
                      Selling Price ($) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      placeholder="0.00"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                    />
                  </div>

                  <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-sec block">
                      Initial Stock Level <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 50"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
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

              {/* Grid 5: Status and Image Mock */}
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
                    Image / Thumbnail (Emoji or URL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 📦 or http://img-url.com"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                  />
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
              Are you sure you want to permanently delete the product <strong className="text-text-main font-semibold">"{productToDelete.name}"</strong>? This will remove all records of this item and cannot be undone.
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
    </div>
  );
};

export default ProductsPage;
