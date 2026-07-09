import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getStores, createStore, Store, StoreInput } from '../services/storeService';
import { Store as StoreIcon, Plus, X, Loader2, AlertCircle, RefreshCw, Phone, MapPin, Tag } from 'lucide-react';

interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

const StoresPage: React.FC = () => {
  const { user } = useAuthStore();
  const userRole = user?.role || 'Admin';
  const isAdmin = userRole === 'Admin';

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchStoresList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStores();
      if (res.success) {
        setStores(res.data);
      } else {
        setError('Failed to fetch stores');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while loading stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoresList();
  }, []);

  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setFormName('');
    setFormCode('');
    setFormAddress('');
    setFormPhone('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setModalError('Store Name and Code are required.');
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);
      const input: StoreInput = {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        address: formAddress.trim() || undefined,
        phone: formPhone.trim() || undefined,
      };

      const res = await createStore(input);
      if (res.success) {
        showToast('Store created successfully!');
        setIsModalOpen(false);
        fetchStoresList();
      } else {
        setModalError('Failed to create store');
      }
    } catch (err: any) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to save store branch.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-slide-in duration-300 ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {t.type === 'success' ? <CheckCircleIcon /> : <AlertCircle className="w-4 h-4" />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-border-main rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main">Store Branches</h1>
          <p className="text-sm text-text-sec mt-1">Manage physical retail store outlets and details</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchStoresList}
            className="flex items-center justify-center p-2.5 bg-bg-sec hover:bg-border-main border border-border-main rounded-xl cursor-pointer text-text-main"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl shadow-xs cursor-pointer duration-150 active:scale-95 flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Store
            </button>
          )}
        </div>
      </div>

      {/* Table & State rendering */}
      <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-text-sec">Loading store branches...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <h3 className="font-semibold text-text-main">Error loading stores</h3>
            <p className="text-sm text-text-sec">{error}</p>
            <button
              onClick={fetchStoresList}
              className="px-4 py-2 bg-bg-sec hover:bg-border-main border border-border-main text-sm font-medium rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : stores.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100 shadow-sm">
              <StoreIcon className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-main font-display text-center w-full block">No data available</h3>
              <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
                Add store branch records to register points of sale, manage stock allocations, and track localized revenue.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl shadow-xs cursor-pointer duration-150 active:scale-95 animate-bounce"
              >
                Add Store
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-sec border-b border-border-main text-xs font-semibold text-text-sec uppercase tracking-wider">
                  <th className="px-6 py-4">Store Details</th>
                  <th className="px-6 py-4">Store Code</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-sm text-text-main bg-white">
                {stores.map((store) => (
                  <tr key={store._id} className="hover:bg-bg-sec/40 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl font-bold shrink-0">
                          <StoreIcon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-text-main">{store.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-text-sec bg-bg-sec px-2.5 py-1 rounded border border-border-main font-mono">
                        {store.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-sec">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 shrink-0 text-text-sec/60" />
                        <span>{store.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-sec max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 shrink-0 text-text-sec/60" />
                        <span>{store.address || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        store.isActive
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-gray-100 border-gray-200 text-gray-800'
                      }`}>
                        {store.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Store Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border-main shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-main bg-bg-sec/30 flex justify-between items-center">
              <h2 className="text-lg font-display font-semibold text-text-main">Register New Branch</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-sec hover:text-text-main p-1 hover:bg-bg-sec rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {modalError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{modalError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                      Store Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Downtown POS Outlet"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                      Store Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. STR-DOWNTOWN"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Phone Number
                    <span className="text-[10px] text-text-sec normal-case ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                    Address
                    <span className="text-[10px] text-text-sec normal-case ml-1">(Optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g. 102 Broadway Ave, Suite A"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-border-main focus:border-primary rounded-xl text-sm outline-none text-text-main resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border-main bg-bg-sec/30 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border-main text-text-main rounded-xl hover:bg-bg-sec transition-colors text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default StoresPage;
