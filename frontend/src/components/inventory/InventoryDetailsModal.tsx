import React from 'react';
import { X, Package, Calendar, User, MapPin, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../../services/inventoryService';
import InventoryStatusBadge from './InventoryStatusBadge';

interface InventoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

const InventoryDetailsModal: React.FC<InventoryDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!isOpen || !item) return null;

  const product = item.product;
  const isOutOfStock = item.currentStock === 0;
  const isLowStock = item.currentStock > 0 && item.currentStock <= item.minimumStock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-border-main overflow-hidden flex flex-col transform transition-all">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-main bg-bg-sec/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold text-text-main">
              Inventory Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-border-main rounded-lg text-text-sec cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Product Header */}
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-xl bg-bg-sec border border-border-main flex items-center justify-center shadow-inner overflow-hidden shrink-0 select-none">
              {product.image ? (
                product.image.startsWith('http') || product.image.startsWith('data:image') ? (
                  <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{product.image}</span>
                )
              ) : (
                <Package className="w-8 h-8 text-text-sec" />
              )}
            </div>
            
            <div className="space-y-1 min-w-0">
              <h3 className="text-base font-bold text-text-main truncate">{product.productName}</h3>
              <div className="flex gap-2 flex-wrap text-[11px] font-mono text-text-sec">
                <span>SKU: {product.sku}</span>
                <span>Category: {product.category}</span>
              </div>
              {product.brand && (
                <span className="text-xs text-text-sec block">Brand: {product.brand}</span>
              )}
            </div>
          </div>

          {/* Status Badge Block */}
          <div className="flex justify-between items-center p-3 bg-bg-sec/30 border border-border-main rounded-xl">
            <span className="text-xs font-semibold text-text-sec">Current Stock Status</span>
            <InventoryStatusBadge status={item.status} />
          </div>

          {/* Stock Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-bg-sec/20 border border-border-main rounded-xl">
              <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Current Stock</span>
              <span className={`text-xl font-bold block mt-0.5 ${
                isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-text-main'
              }`}>
                {item.currentStock} units
              </span>
            </div>
            <div className="p-3 bg-bg-sec/20 border border-border-main rounded-xl">
              <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Minimum Level</span>
              <span className="text-xl font-bold text-text-main block mt-0.5">{item.minimumStock} units</span>
            </div>
            <div className="p-3 bg-bg-sec/20 border border-border-main rounded-xl">
              <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Maximum Level</span>
              <span className="text-xl font-bold text-text-main block mt-0.5">{item.maximumStock} units</span>
            </div>
            <div className="p-3 bg-bg-sec/20 border border-border-main rounded-xl">
              <span className="text-[10px] font-bold text-text-sec uppercase tracking-wider block">Reorder Point</span>
              <span className="text-xl font-bold text-text-main block mt-0.5">{item.reorderLevel} units</span>
            </div>
          </div>

          {/* Warnings */}
          {item.currentStock <= item.minimumStock && (
            <div className={`p-3 border rounded-xl flex items-start gap-2.5 text-xs font-medium ${
              isOutOfStock 
                ? 'bg-rose-50 border-rose-100 text-rose-700' 
                : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  {isOutOfStock ? 'Product Out of Stock' : 'Low Stock Warning'}
                </span>
                <span className="block mt-0.5 leading-relaxed">
                  {isOutOfStock 
                    ? 'The stock level is 0. Customers cannot purchase this item. Submit a restock order immediately.' 
                    : `Stock is at or below the safety threshold of ${item.minimumStock} units. Plan to restock soon.`}
                </span>
              </div>
            </div>
          )}

          {/* Details Metadata List */}
          <div className="space-y-2.5 pt-2 border-t border-border-main/50 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-sec flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Warehouse Location:
              </span>
              <span className="font-semibold text-text-main">
                {item.warehouseLocation || <span className="text-text-sec italic font-normal">Not Set</span>}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-sec flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Last Restocked:
              </span>
              <span className="font-semibold text-text-main">
                {item.lastRestocked ? new Date(item.lastRestocked).toLocaleString() : <span className="text-text-sec italic font-normal">Never</span>}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-sec flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Created By:
              </span>
              <span className="font-semibold text-text-main truncate max-w-[200px]" title={item.createdBy?.email}>
                {item.createdBy?.name || 'System'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-sec">Last Updated:</span>
              <span className="font-medium text-text-main">{new Date(item.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-border-main flex justify-end bg-bg-sec/30 p-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border-main hover:bg-bg-sec text-text-main text-sm font-medium rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default InventoryDetailsModal;
