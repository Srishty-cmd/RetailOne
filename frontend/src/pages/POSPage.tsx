import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  ShoppingCart, 
  Package, 
  Loader2, 
  AlertCircle, 
  Printer, 
  Download, 
  Barcode, 
  CheckCircle2, 
  History, 
  X,
  Keyboard,
  Info
} from 'lucide-react';
import { Product } from '../services/productService';
import { 
  getPOSProducts, 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  checkoutPOS,
  CartItem
} from '../services/posService';
import { getOrders, Order } from '../services/orderService';
import { useNavigate } from 'react-router-dom';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const POSPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Refs for focusing inputs via shortcuts
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeQuery, setBarcodeQuery] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [checkingOut, setCheckingOut] = useState<boolean>(false);
  
  // Recent Transactions
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [showRecentOrders, setShowRecentOrders] = useState<boolean>(false);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);

  // Modal & Printing States
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<any[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  // Custom Stacking Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Fetch initial data: Products catalog & current active cart
  const initPOSData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load products catalog
      const prodRes = await getPOSProducts();
      if (prodRes.success) {
        setProducts(prodRes.data);
        const uniqueCategories = ['All', ...Array.from(new Set(prodRes.data.map(p => p.category))).filter(Boolean)];
        setCategories(uniqueCategories);
      }

      // Load active cart from DB
      const cartRes = await getCart();
      if (cartRes.success && cartRes.data) {
        setCartItems(cartRes.data.items || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while loading POS system. Please verify connections.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent transactions
  const fetchRecentOrders = async () => {
    try {
      setLoadingRecent(true);
      const res = await getOrders();
      if (res.success) {
        // filter/sort latest 5
        setRecentOrders(res.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load recent transactions:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    initPOSData();
    fetchRecentOrders();

    // Setup global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2: Focus Barcode Input
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        addToast('Focused barcode scanner', 'success');
      }
      // F4: Focus Product Search Input
      if (e.key === 'F4') {
        e.preventDefault();
        searchInputRef.current?.focus();
        addToast('Focused search catalog', 'success');
      }
      // Esc: Close invoice modal
      if (e.key === 'Escape') {
        setShowInvoiceModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync / search products client-side for catalog listing
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = 
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Handle barcode search submission (pressing Enter)
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    const barcode = barcodeQuery.trim();
    // Find product in catalog
    const matchedProduct = products.find(p => p.barcode === barcode || p.sku.toUpperCase() === barcode.toUpperCase());

    if (!matchedProduct) {
      addToast(`Product with SKU/Barcode "${barcode}" not found in active catalog.`, 'error');
      setBarcodeQuery('');
      return;
    }

    if (matchedProduct.quantity <= 0) {
      addToast(`Product "${matchedProduct.productName}" is out of stock!`, 'error');
      setBarcodeQuery('');
      return;
    }

    try {
      const res = await addToCart(matchedProduct._id, 1);
      if (res.success) {
        setCartItems(res.data.items || []);
        addToast(`Added "${matchedProduct.productName}" via scan`, 'success');
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to add scanned item.', 'error');
    } finally {
      setBarcodeQuery('');
    }
  };

  // Add to cart handler
  const handleAddToCart = async (product: Product) => {
    if (product.quantity <= 0) {
      addToast('Product is currently out of stock!', 'error');
      return;
    }

    const inCart = cartItems.find(item => item.product._id === product._id);
    if (inCart && inCart.quantity >= product.quantity) {
      addToast(`Cannot add more. Only ${product.quantity} units available in stock.`, 'error');
      return;
    }

    try {
      const res = await addToCart(product._id, 1);
      if (res.success) {
        setCartItems(res.data.items || []);
        addToast(`Added "${product.productName}" to order`);
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Error adding item to cart.', 'error');
    }
  };

  // Update quantity handler
  const handleUpdateQuantity = async (productId: string, currentQty: number, delta: number, maxStock: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      // Remove item
      handleRemoveItem(productId);
      return;
    }

    if (newQty > maxStock) {
      addToast(`Cannot exceed available stock level (${maxStock} units).`, 'error');
      return;
    }

    try {
      const res = await updateCartItem(productId, newQty);
      if (res.success) {
        setCartItems(res.data.items || []);
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update quantity.', 'error');
    }
  };

  // Remove item handler
  const handleRemoveItem = async (productId: string) => {
    try {
      const res = await removeFromCart(productId);
      if (res.success) {
        setCartItems(res.data.items || []);
        addToast('Item removed from order', 'warning');
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to remove item.', 'error');
    }
  };

  // Calculates subtotal, tax, discount, grand total
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const parsedDiscount = Math.max(0, parseFloat(discountInput) || 0);
  const taxableAmount = Math.max(0, subtotal - parsedDiscount);
  const tax = taxableAmount * 0.08; // 8% Tax
  const grandTotal = taxableAmount + tax;

  // Checkout submit handler
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (parsedDiscount > subtotal) {
      addToast('Discount cannot be larger than subtotal amount.', 'error');
      return;
    }

    try {
      setCheckingOut(true);
      const res = await checkoutPOS({
        paymentMethod,
        discount: parsedDiscount,
        tax: parseFloat(tax.toFixed(2))
      });

      if (res.success) {
        // Set receipt data
        setCompletedOrder(res.order);
        setCompletedItems(res.items);
        setShowInvoiceModal(true);

        // Show warnings if any
        if (res.warnings && res.warnings.length > 0) {
          res.warnings.forEach((warn: string) => {
            addToast(warn, 'warning');
          });
        }

        addToast('Transaction checkout completed successfully!', 'success');
        
        // Reset local input & cart state
        setCartItems([]);
        setDiscountInput('0');
        setPaymentMethod('Cash');

        // Refresh catalogs & recent logs
        const updatedProds = await getPOSProducts();
        if (updatedProds.success) {
          setProducts(updatedProds.data);
        }
        fetchRecentOrders();
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to process checkout transaction.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  // Trigger browser print action
  const handlePrint = () => {
    window.print();
  };

  // Trigger reprint of historical order
  const handleReprintOrder = (order: Order) => {
    // Map order fields to match modal structure
    const mappedOrder = {
      _id: order._id,
      store: order.store,
      user: order.user,
      total: order.total,
      paymentMethod: (order as any).paymentMethod || 'Cash',
      subtotal: (order as any).subtotal || order.total,
      discount: (order as any).discount || 0,
      tax: (order as any).tax || 0,
      createdAt: order.createdAt
    };
    
    // Map items
    const mappedItems = (order.items || []).map(item => ({
      product: {
        productName: item.product.productName,
        sku: item.product.sku
      },
      quantity: item.quantity,
      price: item.price
    }));

    setCompletedOrder(mappedOrder);
    setCompletedItems(mappedItems);
    setShowInvoiceModal(true);
    setShowRecentOrders(false);
    addToast('Loaded invoice for reprint', 'success');
  };

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-7rem)] relative text-text-main">
      
      {/* Dynamic Stacking Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`flex items-start gap-2.5 p-3.5 rounded-xl border shadow-md pointer-events-auto transition-all duration-300 transform translate-y-0 animate-slide-in font-medium text-xs text-white ${
              t.type === 'success' 
                ? 'bg-emerald-600 border-emerald-500' 
                : t.type === 'error' 
                ? 'bg-rose-600 border-rose-500' 
                : 'bg-amber-500 border-amber-400'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-100" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-100" />}
            {t.type === 'warning' && <Info className="w-4 h-4 shrink-0 text-amber-100" />}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Side: Product catalog lookup & filters */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-border-main shadow-xs overflow-hidden">
          
          {/* Top Options: Search & Barcode Scan */}
          <div className="p-4 border-b border-border-main bg-bg-sec/10 space-y-3.5 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Barcode scanner emulation field */}
              <form onSubmit={handleBarcodeSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Barcode className="h-4.5 w-4.5 text-text-sec" />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Barcode Scanner (F2 to focus)..."
                  value={barcodeQuery}
                  onChange={(e) => setBarcodeQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-border-main rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-bg-sec/50 text-sm font-mono"
                />
              </form>

              {/* General keyword search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4.5 w-4.5 text-text-sec" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by name, category, SKU (F4)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-border-main rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-bg-sec/50 text-sm"
                />
              </div>

            </div>

            {/* Category selection */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer ${
                    activeCategory === cat 
                      ? 'bg-primary text-white shadow-xs' 
                      : 'bg-bg-sec text-text-sec hover:bg-border-main'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="p-4 flex-1 overflow-y-auto bg-bg-sec/30">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-text-sec font-medium">Loading products catalog...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 max-w-sm mx-auto">
                <AlertCircle className="w-9 h-9 text-rose-500" />
                <p className="text-sm text-text-sec leading-relaxed">{error}</p>
                <button onClick={initPOSData} className="px-4 py-2 bg-white border border-border-main hover:bg-bg-sec rounded-xl text-xs font-bold text-text-main shadow-xs cursor-pointer">
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              /* EMPTY STATE: Catalog contains 0 items */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary border border-emerald-100 shadow-sm mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text-main font-display">No Products Available</h3>
                <p className="text-sm text-text-sec mt-2 leading-relaxed">
                  Please add products before using the POS. Navigate to the Products Module to stock items.
                </p>
                <button
                  onClick={() => navigate('/dashboard/products')}
                  className="mt-5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Go to Products Page
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-sec text-sm font-semibold">
                No active products match "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map(product => {
                  const isOutOfStock = product.quantity <= 0;
                  const isLowStock = !isOutOfStock && product.quantity <= product.minimumStock;
                  
                  // Count items in active cart
                  const cartItem = cartItems.find(item => item.product._id === product._id);
                  const cartQty = cartItem ? cartItem.quantity : 0;

                  return (
                    <div
                      key={product._id}
                      className="bg-white p-3.5 rounded-2xl border border-border-main shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col h-full group relative"
                    >
                      {/* Product Image Wrapper */}
                      <div className="w-full aspect-square bg-bg-sec rounded-xl mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-200 overflow-hidden border border-border-main select-none shrink-0 relative">
                        {product.image ? (
                          <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-text-sec/40" />
                        )}

                        {/* Out of stock overlays */}
                        {isOutOfStock ? (
                          <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-xl">
                            <span className="text-[10px] text-white font-extrabold tracking-wider px-2 py-1 bg-rose-600 rounded-md shadow-sm">OUT OF STOCK</span>
                          </div>
                        ) : isLowStock ? (
                          <div className="absolute top-2 left-2">
                            <span className="text-[9px] text-amber-800 font-extrabold tracking-wide px-1.5 py-0.5 bg-amber-100 border border-amber-200 rounded-md">LOW STOCK</span>
                          </div>
                        ) : null}

                        {/* Active Quantity Badge in Cart */}
                        {cartQty > 0 && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
                            {cartQty}
                          </div>
                        )}
                      </div>

                      {/* Name & Prices */}
                      <h4 className="font-semibold text-text-main text-xs leading-snug mb-1 line-clamp-2 h-8.5 select-none">{product.productName}</h4>
                      <p className="text-[10px] text-text-sec font-mono font-bold mb-2 uppercase">{product.sku}</p>

                      <div className="mt-auto flex items-end justify-between pt-1 select-none">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-sec font-medium leading-none">Price</span>
                          <span className="font-extrabold text-sm text-primary mt-1">₹{product.sellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-semibold text-text-sec leading-none">Stock: {product.quantity}</span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock || cartQty >= product.quantity}
                            className="mt-1 px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sticky Shopping Cart Panel */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-border-main shadow-xs h-[520px] lg:h-auto overflow-hidden shrink-0">
          
          {/* Cart Header */}
          <div className="p-4 border-b border-border-main bg-bg-sec/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-text-main text-base">Current Order</h3>
            </div>
            <span className="bg-primary-light text-primary font-bold text-xs px-2.5 py-0.5 rounded-full">
              {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Items
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-sec/60 space-y-2.5">
                <ShoppingCart className="w-10 h-10 stroke-1 animate-bounce" />
                <p className="text-xs font-semibold">Cart is currently empty</p>
                <p className="text-[10px] text-center max-w-xs px-4">Select items from the catalog or type barcode above to begin order checkout</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.product._id} className="flex flex-col gap-2.5 p-3 bg-bg-sec/30 rounded-xl border border-border-main hover:bg-white transition-all">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-text-main text-xs pr-4 leading-tight">{item.product.productName}</span>
                    <span className="font-bold text-text-main text-xs shrink-0">₹{(item.product.sellingPrice * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-text-sec font-mono">₹{item.product.sellingPrice.toFixed(2)} each</span>
                    
                    <div className="flex items-center gap-3">
                      {/* Plus/minus buttons */}
                      <div className="flex items-center bg-white border border-border-main rounded-lg shadow-2xs">
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity, -1, item.product.quantity)} 
                          className="p-1 hover:bg-bg-sec rounded-l-lg text-text-sec cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-extrabold">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity, 1, item.product.quantity)} 
                          className="p-1 hover:bg-bg-sec rounded-r-lg text-text-sec cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => handleRemoveItem(item.product._id)} 
                        className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Totals & Checkout Panel */}
          <div className="border-t border-border-main bg-white p-4 space-y-3 shrink-0">
            
            {/* Discount Input */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-sec font-medium">Apply Discount (₹)</span>
              <input
                type="number"
                min="0"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="0"
                className="w-24 text-right px-2 py-1 border border-border-main rounded-md focus:outline-none focus:border-primary font-bold text-xs"
              />
            </div>

            {/* Calculations summaries */}
            <div className="space-y-1.5 border-t border-dashed border-border-main pt-2 text-xs text-text-sec">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Discount</span>
                <span className="font-semibold">-₹{parsedDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-semibold">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="border-t border-border-main pt-2 flex justify-between items-baseline mb-2">
              <span className="text-text-main font-bold text-sm">Grand Total</span>
              <span className="text-2xl font-extrabold text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>

            {/* Payment Methods tabs selector */}
            <div className="grid grid-cols-3 gap-1.5 bg-bg-sec p-1 rounded-xl shrink-0">
              {(['Cash', 'Card', 'UPI'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    paymentMethod === method 
                      ? 'bg-white text-primary shadow-xs border border-border-main/50' 
                      : 'text-text-sec hover:bg-white/50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Complete Sale Button */}
            <button 
              disabled={cartItems.length === 0 || checkingOut}
              onClick={handleCheckout}
              className="w-full flex items-center justify-center py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              {checkingOut ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin mr-2" />
                  Processing Checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-4.5 h-4.5 mr-2" />
                  Complete Sale ({paymentMethod})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Area: Keyboard Shortcuts & Toggle Recent Transactions */}
      <div className="flex justify-between items-center text-[11px] text-text-sec bg-white px-4 py-2.5 rounded-xl border border-border-main shrink-0 select-none">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-text-main">Shortcuts:</span>
          </div>
          <span><kbd className="px-1.5 py-0.5 bg-bg-sec rounded border border-border-main font-bold">F2</kbd> Focus Scanner</span>
          <span><kbd className="px-1.5 py-0.5 bg-bg-sec rounded border border-border-main font-bold">F4</kbd> Focus Search</span>
          <span><kbd className="px-1.5 py-0.5 bg-bg-sec rounded border border-border-main font-bold">Esc</kbd> Close Receipt</span>
        </div>
        <button
          onClick={() => {
            setShowRecentOrders(!showRecentOrders);
            if (!showRecentOrders) fetchRecentOrders();
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-bg-sec border border-border-main rounded-lg hover:bg-border-main font-bold text-xs cursor-pointer text-text-main active:scale-95 transition-all"
        >
          <History className="w-3.5 h-3.5 text-primary" />
          {showRecentOrders ? 'Hide Recent Sales' : 'Recent Transactions'}
        </button>
      </div>

      {/* Collapsible Recent Transactions Sheet */}
      {showRecentOrders && (
        <div className="absolute inset-x-0 bottom-12 z-20 bg-white rounded-2xl border border-border-main shadow-lg p-4 animate-slide-in">
          <div className="flex justify-between items-center border-b border-border-main pb-2 mb-3">
            <h4 className="font-display font-bold text-sm text-text-main flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Recent Cashier Transactions (Last 5 Sales)
            </h4>
            <button onClick={() => setShowRecentOrders(false)} className="p-1 hover:bg-bg-sec rounded-full cursor-pointer text-text-sec">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {loadingRecent ? (
            <div className="py-8 flex justify-center items-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center py-6 text-xs text-text-sec font-semibold">No orders recorded in database yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-main text-text-sec">
                    <th className="py-2 font-bold">Order ID</th>
                    <th className="py-2 font-bold">Store</th>
                    <th className="py-2 font-bold">Date & Time</th>
                    <th className="py-2 font-bold">Grand Total</th>
                    <th className="py-2 font-bold">Status</th>
                    <th className="py-2 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {recentOrders.map(order => (
                    <tr key={order._id} className="hover:bg-bg-sec/30 text-text-main">
                      <td className="py-2.5 font-mono text-[10px] font-bold">{order._id}</td>
                      <td className="py-2.5 font-medium">{order.store?.name || 'Main Store'}</td>
                      <td className="py-2.5 text-text-sec">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="py-2.5 font-extrabold text-primary">₹{order.total.toFixed(2)}</td>
                      <td className="py-2.5">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleReprintOrder(order)}
                          className="flex items-center gap-1 ml-auto px-2.5 py-1 bg-white border border-border-main hover:bg-bg-sec text-[10px] font-bold rounded-lg shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-text-sec" />
                          Reprint Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoice Modal for Successful Checkouts or Reprints */}
      {showInvoiceModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border-main shadow-2xl max-w-md w-full overflow-hidden animate-slide-in relative print:shadow-none print:border-none print:bg-white print:rounded-none">
            
            {/* Modal Actions Header - hidden on print */}
            <div className="p-4 border-b border-border-main bg-bg-sec/15 flex justify-between items-center print:hidden">
              <span className="font-display font-extrabold text-sm text-primary flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Invoice Receipt
              </span>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 hover:bg-bg-sec rounded-full cursor-pointer text-text-sec active:scale-90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Receipt Print Area */}
            <div id="receipt-print-area" className="p-6 bg-white overflow-y-auto max-h-[70vh] font-mono text-[11px] leading-relaxed text-black">
              
              {/* Receipt Custom Thermal Printer styles */}
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #receipt-print-area, #receipt-print-area * {
                    visibility: visible;
                  }
                  #receipt-print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 76mm;
                    padding: 4mm;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 10pt;
                    line-height: 1.3;
                    background-color: #fff;
                    color: #000;
                  }
                  .print-hide {
                    display: none !important;
                  }
                }
              `}</style>

              {/* Invoice Layout Header */}
              <div className="text-center space-y-1 mb-4">
                <h2 className="text-sm font-extrabold uppercase tracking-wide">
                  {completedOrder.store?.name || 'RetailOne Store'}
                </h2>
                {completedOrder.store?.address && (
                  <p className="text-[10px] text-gray-700">{completedOrder.store.address}</p>
                )}
                {completedOrder.store?.phone && (
                  <p className="text-[10px] text-gray-700">Tel: {completedOrder.store.phone}</p>
                )}
                <p className="text-[9px] text-gray-500">Code: {completedOrder.store?.code || 'STR-MAIN'}</p>
              </div>

              <div className="border-t border-b border-dashed border-black py-2.5 my-3.5 space-y-1.5">
                <div><span className="font-bold">ORDER ID:</span> {completedOrder._id}</div>
                <div><span className="font-bold">DATE:</span> {new Date(completedOrder.createdAt).toLocaleString()}</div>
                <div><span className="font-bold">CASHIER:</span> {completedOrder.user?.name || 'Cashier User'}</div>
                <div><span className="font-bold">PAYMENT:</span> {completedOrder.paymentMethod}</div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between font-bold border-b border-dashed border-black pb-1.5 mb-1.5">
                  <span className="w-1/2">ITEM</span>
                  <span className="w-1/6 text-center">QTY</span>
                  <span className="w-1/3 text-right">TOTAL</span>
                </div>
                {completedItems.map((item: any, idx: number) => (
                  <div key={item._id || idx} className="space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span className="w-1/2 break-words leading-tight">{item.product?.productName}</span>
                      <span className="w-1/6 text-center">{item.quantity}</span>
                      <span className="w-1/3 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="text-[9px] text-gray-600 pl-2">
                      {item.quantity} x ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-dashed border-black pt-3.5 space-y-1.5 font-bold">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>₹{completedOrder.subtotal?.toFixed(2) || completedOrder.total.toFixed(2)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>DISCOUNT</span>
                    <span>-₹{completedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>TAX (8%)</span>
                  <span>₹{completedOrder.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-black pt-2">
                  <span>GRAND TOTAL</span>
                  <span>₹{completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center mt-6 pt-4 border-t border-dashed border-black text-[9px] text-gray-500 space-y-1">
                <p className="font-bold uppercase tracking-wider">THANK YOU FOR YOUR PURCHASE!</p>
                <p>Please retain receipt for exchanges/returns.</p>
                <p className="font-mono text-[8px]">RetailOne Omni-Channel POS Engine</p>
              </div>

            </div>

            {/* Modal Print & Download Footer - hidden on print */}
            <div className="p-4 border-t border-border-main bg-bg-sec/15 flex gap-3 print-hide">
              <button 
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              
              {/* Download Invoice Placeholder */}
              <button 
                onClick={() => addToast('PDF invoice download successfully generated (local storage demo)!', 'success')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-border-main hover:bg-bg-sec text-text-main text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4 text-text-sec" /> Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default POSPage;
