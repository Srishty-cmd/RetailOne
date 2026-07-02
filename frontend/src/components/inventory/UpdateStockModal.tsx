import React, { useState, useEffect } from 'react';
import { X, Loader2, Edit3 } from 'lucide-react';
import { InventoryItem, InventoryInput } from '../../services/inventoryService';

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSubmit: (id: string, data: Partial<InventoryInput>) => Promise<void>;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  isOpen,
  onClose,
  item,
  onSubmit,
}) => {
  const [currentStock, setCurrentStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [maximumStock, setMaximumStock] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setCurrentStock(item.currentStock.toString());
      setMinimumStock(item.minimumStock.toString());
      setMaximumStock(item.maximumStock.toString());
      setReorderLevel(item.reorderLevel.toString());
      setWarehouseLocation(item.warehouseLocation || '');
      setError(null);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentStockNum = parseInt(currentStock);
    const minimumStockNum = parseInt(minimumStock);
    const maximumStockNum = parseInt(maximumStock);
    const reorderLevelNum = parseInt(reorderLevel);

    if (isNaN(currentStockNum) || currentStockNum < 0) return setError('Current stock must be a non-negative number');
    if (isNaN(minimumStockNum) || minimumStockNum < 0) return setError('Minimum stock must be a non-negative number');
    if (isNaN(maximumStockNum) || maximumStockNum < 0) return setError('Maximum stock must be a non-negative number');
    if (isNaN(reorderLevelNum) || reorderLevelNum < 0) return setError('Reorder level must be a non-negative number');
    if (maximumStockNum < minimumStockNum) return setError('Maximum stock level cannot be less than minimum stock level');

    try {
      setLoading(true);
      setError(null);
      await onSubmit(item._id, {
        currentStock: currentStockNum,
        minimumStock: minimumStockNum,
        maximumStock: maximumStockNum,
        reorderLevel: reorderLevelNum,
        warehouseLocation: warehouseLocation.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update stock details.');
    } finally {
      setLoading(false);
    }
  };

  const product = item.product || {
    _id: '',
    productName: 'Deleted Product',
    sku: 'N/A',
    category: 'N/A',
    sellingPrice: 0,
    costPrice: 0,
    minimumStock: 0,
    quantity: 0,
    brand: '',
    image: ''
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-border-main overflow-hidden flex flex-col transform transition-all">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-main bg-bg-sec/50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold text-text-main">
              Update Stock Levels
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

          {/* Product and SKU (Read-Only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-sec/30 p-3.5 border border-border-main rounded-xl">
            <div>
              <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Product Name</span>
              <span className="text-sm font-semibold text-text-main block">{product.productName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">SKU</span>
              <span className="text-sm font-mono font-semibold text-text-main block">{product.sku}</span>
            </div>
          </div>

          {/* Current Stock and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                Current Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                Warehouse Location
              </label>
              <input
                type="text"
                placeholder="e.g. Aisle 3, Shelf B"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
          </div>

          {/* Threshold Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-bg-sec/20 border border-border-main rounded-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec block">
                Min Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec block">
                Max Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={maximumStock}
                onChange={(e) => setMaximumStock(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-sec block">
                Reorder Level <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
              />
            </div>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStockModal;
