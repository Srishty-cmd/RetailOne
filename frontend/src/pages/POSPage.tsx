import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const DUMMY_PRODUCTS: Product[] = [
  { id: 1, name: 'Premium Wireless Headphones', price: 299.99, category: 'Electronics', image: '🎧' },
  { id: 2, name: 'Ergonomic Desk Chair', price: 199.50, category: 'Furniture', image: '🪑' },
  { id: 3, name: 'Mechanical Keyboard', price: 149.99, category: 'Electronics', image: '⌨️' },
  { id: 4, name: 'Stainless Steel Water Bottle', price: 35.00, category: 'Accessories', image: '🥤' },
  { id: 5, name: 'Cotton Crewneck T-Shirt', price: 25.00, category: 'Apparel', image: '👕' },
  { id: 6, name: 'Running Sneakers', price: 120.00, category: 'Apparel', image: '👟' },
  { id: 7, name: 'LED Desk Lamp', price: 45.00, category: 'Electronics', image: '💡' },
  { id: 8, name: 'Leather Wallet', price: 65.00, category: 'Accessories', image: '👛' },
];

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Accessories', 'Apparel'];

const POSPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = DUMMY_PRODUCTS.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
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
              className="w-full pl-10 pr-4 py-2.5 border border-border-main rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-bg-sec focus:bg-white"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORIES.map(cat => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-2xl border border-border-main hover:border-primary hover:shadow-md transition-all text-left flex flex-col h-full group"
              >
                <div className="w-full aspect-square bg-bg-sec rounded-xl mb-3 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                  {product.image}
                </div>
                <h3 className="font-medium text-text-main text-sm leading-tight mb-1 line-clamp-2 pl-1">{product.name}</h3>
                <p className="font-bold text-primary mt-auto pl-1">${product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="h-full flex items-center justify-center text-text-sec">
              No products found matching your search.
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
              <ShoppingCart className="w-12 h-12 text-border-main" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-bg-sec/50 rounded-xl border border-border-main">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-text-main text-sm pr-2">{item.name}</span>
                  <span className="font-bold text-text-main">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center space-x-2 bg-white border border-border-main rounded-lg max-w-max">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-bg-sec rounded-l-lg text-text-sec"><Minus className="w-4 h-4" /></button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-bg-sec rounded-r-lg text-text-sec"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-sec">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-sec">
            <span>Discount</span>
            <span>$0.00</span>
          </div>
          <div className="border-t border-dashed border-border-main pt-2 flex justify-between items-end mb-4">
            <span className="text-text-main font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
          </div>

          <button 
            disabled={cart.length === 0}
            className="w-full flex items-center justify-center py-3.5 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Complete Sale
          </button>
        </div>
      </div>

    </div>
  );
};

export default POSPage;
