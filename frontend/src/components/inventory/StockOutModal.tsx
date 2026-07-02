import React, { useState, useEffect } from 'react';
import { X, Loader2, PackageX } from 'lucide-react';
import { Product } from '../../services/productService';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (data: {
    product: string;
    quantity: number;
    reason: 'Sales' | 'Damaged' | 'Lost' | 'Expired' | 'Other';
    notes?: string;
    date?: string;
  }) => Promise<void>;
  maxStockMap?: Record<string, number>; // Maps product ID to currentStock to prevent UI validation overflow
}

const StockOutModal: React.FC<StockOutModalProps> = ({
  isOpen,
  onClose,
  products,
  onSubmit,
  maxStockMap = {},
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<'Sales' | 'Damaged' | 'Lost' | 'Expired' | 'Other'>('Sales');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedProductId('');
      setQuantity('');
      setReason('Sales');
      setNotes('');
      setDate(new Date().toISOString().substring(0, 10));
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return setError('Please select a product');
    
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return setError('Quantity must be a positive number');
    }

    // Client-side stock check
    const currentAvailable = maxStockMap[selectedProductId] ?? 0;
    if (qtyNum > currentAvailable) {
      return setError(`Insufficient stock. Only ${currentAvailable} units are available.`);
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        product: selectedProductId,
        quantity: qtyNum,
        reason,
        notes: notes.trim() || undefined,
        date: date || undefined,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to remove stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAvailableStock = selectedProductId ? (maxStockMap[selectedProductId] ?? 0) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-border-main overflow-hidden flex flex-col transform transition-all">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-main bg-bg-sec/50">
          <div className="flex items-center gap-2">
            <PackageX className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-display font-bold text-text-main">
              Stock Out (Deduct Stock)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-border-main rounded-lg text-text-sec cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Product Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
              Select Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main cursor-pointer"
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => {
                const stock = maxStockMap[p._id] ?? 0;
                return (
                  <option key={p._id} value={p._id}>
                    {p.productName} ({p.sku}) — [Stock: {stock}]
                  </option>
                );
              })}
            </select>
            {selectedAvailableStock !== null && (
              <span className="text-xs text-text-sec block mt-1">
                Available Stock: <strong className="text-text-main font-semibold">{selectedAvailableStock}</strong> units
              </span>
            )}
          </div>

          {/* Quantity and Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                Quantity to Deduct <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                Deduction Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                required
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main cursor-pointer"
              >
                <option value="Sales">Sales</option>
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
                <option value="Expired">Expired</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Adjustment Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
              Adjustment Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main cursor-pointer"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
              Notes / Remarks
            </label>
            <textarea
              rows={3}
              placeholder="Explain why stock is being removed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border-main flex justify-end gap-3 bg-bg-sec/30 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-border-main hover:bg-bg-sec text-text-main text-sm font-medium rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition-all shadow-xs cursor-pointer disabled:bg-rose-600/50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockOutModal;
