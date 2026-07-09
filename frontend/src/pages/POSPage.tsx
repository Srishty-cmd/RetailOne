import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, ShoppingCart, Package, Loader2, AlertCircle } from 'lucide-react';
import { getProducts, Product } from '../services/productService';
import { createOrder } from '../services/orderService';
import { useNavigate } from 'react-router-dom';

interface CartItem extends Product {
  quantity: number;
}

const POSPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProductsList = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all active products
      const res = await getProducts({ status: 'Active', limit: 100 });
      if (res.success) {
        setProducts(res.data);
        const uniqueCategories = ['All', ...Array.from(new Set(res.data.map((p: Product) => p.category))).filter(Boolean)];
        setCategories(uniqueCategories);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while loading POS products catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = 
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      showToast('Product is currently out of stock!', 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          showToast(`Cannot add more. Only ${product.quantity} units available in stock.`, 'error');
          return prev;
        }
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.quantity && delta > 0) {
          showToast(`Cannot exceed available stock limit.`, 'error');
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setCheckingOut(true);
      const items = cart.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.sellingPrice
      }));
      const res = await createOrder({
        items,
        total: parseFloat(total.toFixed(2))
      });
      if (res.success) {
        showToast('Checkout completed successfully!');
        setCart([]);
        fetchProductsList(); // Refresh quantities
      } else {
        showToast('Checkout failed. Try again.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to process checkout transaction.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] relative">
      
      {/* Toast notifications */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-slide-in duration-300 bg-white ${
          toast.type === 'success' ? 'border-emerald-200 text-emerald-800 bg-emerald-50/90' : 'border-rose-200 text-rose-800 bg-rose-50/90'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          {toast.message}
        </div>
      )}

      {/* Left Area: Products Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-border-main shadow-sm overflow-hidden">
        {/* Header Options */}
        <div className="p-4 border-b border-border-main space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-sec" />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border-main rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-bg-sec focus:bg-white text-sm"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? 'bg-text-main text-white' 
                     : 'bg-bg-sec text-text-sec hover:bg-border-main'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-4 flex-1 overflow-y-auto bg-bg-sec/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-text-sec">Loading cashier catalog...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 max-w-sm mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <p className="text-sm text-text-sec">{error}</p>
              <button onClick={fetchProductsList} className="px-4 py-2 bg-white border border-border-main hover:bg-bg-sec rounded-xl text-xs font-semibold text-text-main shadow-sm">Try Again</button>
            </div>
          ) : products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100 shadow-sm">
                <Package className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-main font-display text-center w-full block">No products available in database</h3>
                <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
                  The retail system starts empty. Click below to add catalog items and stock levels before starting checkout sales.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/products')}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl shadow-xs cursor-pointer duration-150 active:scale-95 animate-bounce"
              >
                Add Product
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-text-sec text-sm font-medium">
              No products found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const isOutOfStock = product.quantity <= 0;
                return (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className="bg-white p-4 rounded-2xl border border-border-main hover:border-primary hover:shadow-md transition-all text-left flex flex-col h-full group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="w-full aspect-square bg-bg-sec rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden border border-border-main select-none shrink-0 relative">
                      {product.image ? (
                        <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-10 h-10 text-text-sec/60" />
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-bold px-2 py-1 bg-rose-600 rounded-md">OUT OF STOCK</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-text-main text-sm leading-tight mb-1 line-clamp-2 pl-1 select-none">{product.productName}</h3>
                    <div className="mt-auto pl-1 flex items-center justify-between w-full">
                      <p className="font-bold text-primary">₹{product.sellingPrice.toFixed(2)}</p>
                      <p className={`text-[10px] font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-text-sec'}`}>
                        Qty: {product.quantity}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Cart Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-border-main shadow-sm h-[500px] lg:h-auto overflow-hidden shrink-0">
        <div className="p-4 border-b border-border-main bg-bg-sec/30">
          <h2 className="font-display font-semibold text-text-main text-lg">Current Order</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-sec space-y-3">
              <ShoppingCart className="w-12 h-12 text-border-main animate-pulse" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex flex-col gap-2 p-3 bg-bg-sec/50 rounded-xl border border-border-main">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-text-main text-sm pr-2">{item.productName}</span>
                  <span className="font-bold text-text-main">₹{(item.sellingPrice * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center space-x-2 bg-white border border-border-main rounded-lg max-w-max">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-bg-sec rounded-l-lg text-text-sec cursor-pointer"><Minus className="w-4 h-4" /></button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-bg-sec rounded-r-lg text-text-sec cursor-pointer"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="p-1.5 text-red-500 hover:bg-red-55 rounded-lg transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        <div className="border-t border-border-main bg-white p-4 space-y-3 shrink-0">
          <div className="flex justify-between text-sm text-text-sec">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-sec">
            <span>Tax (8%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-sec">
            <span>Discount</span>
            <span>₹0.00</span>
          </div>
          <div className="border-t border-dashed border-border-main pt-2 flex justify-between items-end mb-4">
            <span className="text-text-main font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
          </div>

          <button 
            disabled={cart.length === 0 || checkingOut}
            onClick={handleCheckout}
            className="w-full flex items-center justify-center py-3.5 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
          >
            {checkingOut ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <CreditCard className="w-5 h-5 mr-2" />
            )}
            Complete Sale
          </button>
        </div>
      </div>

    </div>
  );
};

export default POSPage;
