import React, { useState, useEffect } from 'react';
import { X, History, Loader2, Calendar, User, ArrowDownRight, ArrowUpRight, FileText } from 'lucide-react';
import { getInventoryHistory, InventoryLogItem } from '../../services/inventoryService';
import { Product } from '../../services/productService';

interface InventoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const InventoryHistoryModal: React.FC<InventoryHistoryModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [logs, setLogs] = useState<InventoryLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!product?._id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getInventoryHistory(product._id);
        if (res.success) {
          setLogs(res.data);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load inventory transaction logs.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && product) {
      fetchHistory();
    } else {
      setLogs([]);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-border-main overflow-hidden max-h-[85vh] flex flex-col transform transition-all">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-main bg-bg-sec/50 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold text-text-main">
              Stock Transaction History
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Product Info Block */}
          <div className="p-4 bg-bg-sec/30 border border-border-main rounded-xl mb-6">
            <h3 className="font-semibold text-text-main">{product.productName}</h3>
            <div className="flex gap-3 text-xs text-text-sec mt-1 font-mono">
              <span>SKU: {product.sku}</span>
              {product.barcode && <span>Barcode: {product.barcode}</span>}
              <span>Category: {product.category}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-text-sec">Retrieving transaction timeline...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-rose-600 font-medium">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
              <div className="w-12 h-12 bg-bg-sec rounded-full flex items-center justify-center text-text-sec border border-border-main">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-text-main">No Transactions Logged</h4>
                <p className="text-xs text-text-sec mt-1">
                  No stock-in or stock-out activities have been recorded for this product yet.
                </p>
              </div>
            </div>
          ) : (
            /* Timeline Container */
            <div className="relative border-l-2 border-border-main ml-3 pl-6 space-y-6">
              {logs.map((log) => {
                const isStockIn = log.type === 'Stock In';
                return (
                  <div key={log._id} className="relative group">
                    {/* Timeline Node Point Icon */}
                    <span className={`absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full border shadow-sm ${
                      isStockIn 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                        : 'bg-rose-50 border-rose-200 text-rose-600'
                    }`}>
                      {isStockIn ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    </span>

                    {/* Timeline Card */}
                    <div className="bg-white border border-border-main hover:border-text-sec rounded-xl p-4 transition-all shadow-2xs hover:shadow-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        {/* Transaction Type Header */}
                        <div>
                          <span className={`text-sm font-bold ${isStockIn ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isStockIn ? 'Stock In (+)' : 'Stock Out (-)'}
                          </span>
                          <span className="text-sm font-semibold text-text-main ml-2 font-mono">
                            {isStockIn ? `+${log.quantity}` : `-${log.quantity}`} units
                          </span>
                        </div>
                        
                        {/* Timestamp */}
                        <div className="flex items-center text-xs text-text-sec gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(log.date).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Remaining stock */}
                      <span className="text-xs text-text-sec bg-bg-sec px-2 py-0.5 rounded border border-border-main inline-block">
                        Remaining Stock: <strong className="text-text-main font-semibold">{log.remainingStock}</strong> units
                      </span>

                      {/* Supplier/Invoice Details */}
                      {isStockIn && (log.supplier || log.invoiceNumber) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-bg-sec/30 p-2.5 rounded-lg border border-border-main/50">
                          {log.supplier && (
                            <div>
                              <span className="text-text-sec">Supplier:</span>{' '}
                              <strong className="text-text-main font-semibold">{log.supplier}</strong>
                            </div>
                          )}
                          {log.invoiceNumber && (
                            <div>
                              <span className="text-text-sec">Invoice #:</span>{' '}
                              <strong className="text-text-main font-semibold font-mono">{log.invoiceNumber}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reason (Stock Out) */}
                      {!isStockIn && log.reason && (
                        <div className="text-xs bg-bg-sec/30 p-2.5 rounded-lg border border-border-main/50">
                          <span className="text-text-sec">Reason:</span>{' '}
                          <span className="text-text-main font-semibold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-rose-700">
                            {log.reason}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {log.notes && (
                        <p className="text-xs text-text-main leading-relaxed italic bg-bg-sec/20 p-2.5 rounded-lg border border-border-main/30 flex items-start gap-1">
                          <FileText className="w-3.5 h-3.5 text-text-sec shrink-0 mt-0.5" />
                          <span>"{log.notes}"</span>
                        </p>
                      )}

                      {/* Handler Metadata */}
                      <div className="flex items-center gap-1.5 text-[10px] text-text-sec pt-1.5 border-t border-border-main/50">
                        <User className="w-3 h-3 text-text-sec" />
                        <span>Logged by: {log.createdBy?.name || 'System'} ({log.createdBy?.email})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-border-main flex justify-end bg-bg-sec/30 p-6 shrink-0">
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

export default InventoryHistoryModal;
