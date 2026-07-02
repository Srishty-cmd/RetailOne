import React, { useState, useEffect } from 'react';
import { X, Loader2, PackageOpen } from 'lucide-react';
import { Product } from '../../services/productService';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (data: {
    product: string;
    quantity: number;
    supplier?: string;
    invoiceNumber?: string;
    notes?: string;
    date?: string;
  }) => Promise<void>;
}

const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  products,
  onSubmit,
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedProductId('');
      setQuantity('');
      setSupplier('');
      setInvoiceNumber('');
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

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        product: selectedProductId,
        quantity: qtyNum,
        supplier: supplier.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        date: date || undefined,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-border-main overflow-hidden flex flex-col transform transition-all">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-main bg-bg-sec/50">
          <div className="flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold text-text-main">
              Stock In (Restock)
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
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                Restock Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main cursor-pointer"
              />
            </div>
          </div>

          {/* Supplier and Invoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                Supplier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Global Tech Distributors"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2026-948"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Provide any additional details or observations..."
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
              className="flex items-center px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-all shadow-xs cursor-pointer disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInModal;
