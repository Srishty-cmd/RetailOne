import React from 'react';
import { Package, Eye, Edit3, History, Calendar, MapPin } from 'lucide-react';
import { InventoryItem } from '../../services/inventoryService';
import InventoryStatusBadge from './InventoryStatusBadge';

interface InventoryTableProps {
  items: InventoryItem[];
  canModify: boolean;
  onView: (item: InventoryItem) => void;
  onUpdateStock: (item: InventoryItem) => void;
  onHistory: (item: InventoryItem) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  canModify,
  onView,
  onUpdateStock,
  onHistory,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-bg-sec border-b border-border-main text-xs font-semibold text-text-sec uppercase tracking-wider">
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">SKU</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4 text-center">Current Stock</th>
            <th className="px-6 py-4 text-center">Minimum Stock</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4">Warehouse Location</th>
            <th className="px-6 py-4">Last Restocked</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-main text-sm text-text-main">
          {items.map((item) => {
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
            const isOutOfStock = item.currentStock === 0;
            const isLowStock = item.currentStock > 0 && item.currentStock <= item.minimumStock;

            return (
              <tr 
                key={item._id} 
                className={`hover:bg-bg-sec/40 transition-colors duration-150 group ${
                  isLowStock ? 'bg-amber-50/20' : isOutOfStock ? 'bg-rose-50/25' : ''
                }`}
              >
                {/* Product Name & Image */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-bg-sec border border-border-main flex items-center justify-center shadow-inner overflow-hidden shrink-0 select-none">
                      {product.image ? (
                        product.image.startsWith('http') || product.image.startsWith('data:image') ? (
                          <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{product.image}</span>
                        )
                      ) : (
                        <Package className="w-5 h-5 text-text-sec" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold block truncate text-text-main max-w-xs">
                        {product.productName || 'Deleted Product'}
                      </span>
                      {product.brand && (
                        <span className="text-xs text-text-sec block mt-0.5">
                          {product.brand}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs text-text-sec bg-bg-sec px-2 py-1 rounded border border-border-main font-mono">
                    {product.sku || 'N/A'}
                  </span>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs text-text-sec">
                    {product.category || 'N/A'}
                  </span>
                </td>

                {/* Current Stock */}
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <span className={`font-bold ${
                    isOutOfStock 
                      ? 'text-rose-600' 
                      : isLowStock 
                        ? 'text-amber-600' 
                        : 'text-text-main'
                  }`}>
                    {item.currentStock}
                  </span>
                </td>

                {/* Minimum Stock */}
                <td className="px-6 py-4 text-center whitespace-nowrap text-text-sec">
                  {item.minimumStock}
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <InventoryStatusBadge status={item.status} />
                </td>

                {/* Warehouse Location */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.warehouseLocation ? (
                    <div className="flex items-center gap-1.5 text-xs text-text-main">
                      <MapPin className="w-3.5 h-3.5 text-text-sec" />
                      <span>{item.warehouseLocation}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-sec italic">Not Set</span>
                  )}
                </td>

                {/* Last Restocked */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.lastRestocked ? (
                    <div className="flex items-center gap-1.5 text-xs text-text-main">
                      <Calendar className="w-3.5 h-3.5 text-text-sec" />
                      <span>{new Date(item.lastRestocked).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-sec italic">Never</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1.5">
                    {/* View Details */}
                    <button
                      onClick={() => onView(item)}
                      title="View Details"
                      className="p-2 hover:bg-primary-light hover:text-primary rounded-lg text-text-sec transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Update Stock Settings */}
                    {canModify && (
                      <button
                        onClick={() => onUpdateStock(item)}
                        title="Update Stock Levels"
                        className="p-2 hover:bg-primary-light hover:text-primary rounded-lg text-text-sec transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Transaction History */}
                    <button
                      onClick={() => onHistory(item)}
                      title="Transaction History"
                      className="p-2 hover:bg-primary-light hover:text-primary rounded-lg text-text-sec transition-colors cursor-pointer"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
