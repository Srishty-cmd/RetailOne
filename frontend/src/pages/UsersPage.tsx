import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  ShieldAlert, 
  Search, 
  Filter, 
  UserPlus, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX, 
  Key, 
  Loader2, 
  X, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Phone
} from 'lucide-react';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  resetUserPassword,
  User as UserType 
} from '../services/userService';
import { getStores, Store } from '../services/storeService';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const UsersPage: React.FC = () => {
  // State for data
  const [users, setUsers] = useState<UserType[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');

  // Summary Metrics
  const [summary, setSummary] = useState({
    total: 0,
    admins: 0,
    managers: 0,
    cashiers: 0
  });

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Selected User for Edit/Delete/Reset
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Cashier' as 'Admin' | 'Inventory Manager' | 'Cashier',
    store: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        store: storeFilter,
        page,
        limit: 10
      });

      if (res.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages);
        setSummary(res.data.summary);
      } else {
        setError('Failed to load users');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error loading users list.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stores for drop-down
  const fetchStores = async () => {
    try {
      const res = await getStores();
      if (res.success) {
        setStores(res.data);
      }
    } catch (err) {
      console.error('Error fetching stores', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, storeFilter]);

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Trigger search on clearing input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value === '') {
      setPage(1);
      setTimeout(() => {
        fetchUsers();
      }, 50);
    }
  };

  // Handle CRUD submissions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return addToast('Please enter name, email and password', 'error');
    }

    try {
      setSubmitting(true);
      const res = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        store: formData.store || null,
        phone: formData.phone,
        status: formData.status
      });

      if (res.success) {
        addToast('Staff member added successfully!', 'success');
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'Cashier',
          store: '',
          phone: '',
          status: 'Active'
        });
        fetchUsers();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const res = await updateUser(selectedUser._id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        store: formData.store || null,
        phone: formData.phone,
        status: formData.status
      });

      if (res.success) {
        addToast('User details updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const res = await deleteUser(selectedUser._id);
      if (res.success) {
        addToast('Staff member deleted successfully', 'success');
        setIsDeleteOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserType) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await toggleUserStatus(user._id, nextStatus);
      if (res.success) {
        addToast(`User account is now ${nextStatus === 'Active' ? 'activated' : 'deactivated'}`, 'success');
        fetchUsers();
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to change status', 'error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPassword.length < 6) {
      return addToast('Password must be at least 6 characters', 'error');
    }

    try {
      setSubmitting(true);
      const res = await resetUserPassword(selectedUser._id, newPassword);
      if (res.success) {
        addToast('Password reset successfully (Placeholder action completed)', 'success');
        setIsResetOpen(false);
        setNewPassword('');
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEdit = (user: UserType) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      store: user.store?._id || '',
      phone: user.phone || '',
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // UI colors helpers
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Inventory Manager':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Cashier':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'Inventory Manager') return 'Manager';
    return role;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-border-main rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main">Staff & User Management</h1>
          <p className="text-sm text-text-sec mt-1">Manage staff roles, store assignments, and statuses</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              password: '',
              role: 'Cashier',
              store: '',
              phone: '',
              status: 'Active'
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-text-sec font-medium">Total Users</span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-main">{summary.total}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-text-sec font-medium">Admins</span>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-main">{summary.admins}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-text-sec font-medium">Managers</span>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-main">{summary.managers}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-text-sec font-medium">Cashiers</span>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-main">{summary.cashiers}</p>
        </div>
      </div>

      {/* Filters & Actions Panel */}
      <div className="bg-white p-5 rounded-2xl border border-border-main shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-text-sec" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Search
          </button>
          <button 
            type="button"
            onClick={() => {
              setSearch('');
              setRoleFilter('');
              setStatusFilter('');
              setStoreFilter('');
              setPage(1);
              setTimeout(() => fetchUsers(), 50);
            }}
            className="px-4 py-2.5 border border-border-main hover:bg-bg-sec text-text-main rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-dashed border-border-main">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-sec">
            <Filter className="w-3.5 h-3.5" />
            FILTERS:
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-bg-sec hover:bg-border-main/40 text-xs font-medium border border-border-main rounded-lg focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Inventory Manager">Manager</option>
            <option value="Cashier">Cashier</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-bg-sec hover:bg-border-main/40 text-xs font-medium border border-border-main rounded-lg focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Store Filter */}
          <select
            value={storeFilter}
            onChange={(e) => { setStoreFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-bg-sec hover:bg-border-main/40 text-xs font-medium border border-border-main rounded-lg focus:outline-none"
          >
            <option value="">All Stores</option>
            {stores.map(store => (
              <option key={store._id} value={store._id}>{store.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-border-main rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          /* Loading Skeletons */
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-100 rounded-sm w-1/4 animate-pulse"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-border-main">
                <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded-sm w-1/3 animate-pulse"></div>
                  <div className="h-3 bg-slate-50 rounded-sm w-1/4 animate-pulse"></div>
                </div>
                <div className="w-20 h-6 bg-slate-100 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 font-medium">
            <ShieldAlert className="w-10 h-10 mx-auto text-rose-400 mb-3" />
            {error}
          </div>
        ) : users.length === 0 ? (
          /* Empty State */
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm animate-bounce">
              <UsersIcon className="w-10 h-10" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-text-main font-display">No Users Found</h3>
              <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
                Create your first staff member to assign stores and handle sales registers or inventory tasks.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-sec border-b border-border-main text-text-sec text-[11px] font-semibold tracking-wider uppercase">
                  <th className="py-4 px-6 w-12 text-center">Profile</th>
                  <th className="py-4 px-6">Full Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Store</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-bg-sec/40 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-700 shadow-2xs group-hover:scale-105 transition-transform">
                        {getInitials(user.name)}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-semibold text-text-main text-sm">{user.name}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-text-sec">
                      {user.email}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-text-sec">
                      {user.phone || (
                        <span className="text-slate-300 italic text-[11px]">Not provided</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs border rounded-full font-semibold ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-text-main font-medium">
                      {user.store ? (
                        <div className="flex flex-col">
                          <span>{user.store.name}</span>
                          <span className="text-[10px] text-text-sec font-mono">{user.store.code}</span>
                        </div>
                      ) : (
                        <span className="text-text-sec italic text-xs">Global (No Store)</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        title="Click to toggle status"
                        className={`px-2.5 py-0.5 inline-flex items-center gap-1 text-[11px] font-semibold border rounded-full cursor-pointer transition-colors duration-200 ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.status}
                      </button>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-text-sec">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewPassword('');
                            setIsResetOpen(true);
                          }}
                          title="Reset Password"
                          className="p-1.5 text-text-sec hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          title="Edit User"
                          className="p-1.5 text-text-sec hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete User"
                          className="p-1.5 text-text-sec hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-border-main bg-bg-sec/30">
                <p className="text-xs text-text-sec">
                  Page <span className="font-semibold text-text-main">{page}</span> of <span className="font-semibold text-text-main">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="p-2 border border-border-main bg-white hover:bg-bg-sec rounded-xl text-text-main disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="p-2 border border-border-main bg-white hover:bg-bg-sec rounded-xl text-text-main disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-lg bg-white w-72 animate-fade-in ${
              toast.type === 'success' ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-border-main animate-slide-up">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
              <h3 className="font-display font-semibold text-text-main text-lg">Add New Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-sec hover:text-text-main p-1 hover:bg-bg-sec rounded-lg transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="E.g. Srishty Singh"
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="srishty@retailone.com"
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Role Assignment *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Inventory Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Store Assignment</label>
                  <select
                    value={formData.store}
                    disabled={formData.role === 'Admin'}
                    onChange={(e) => setFormData({...formData, store: e.target.value})}
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm bg-white focus:outline-none focus:border-primary disabled:bg-bg-sec disabled:text-text-sec"
                  >
                    <option value="">Global / Head Office</option>
                    {stores.map(store => (
                      <option key={store._id} value={store._id}>{store.name}</option>
                    ))}
                  </select>
                  {formData.role === 'Admin' && (
                    <span className="text-[10px] text-text-sec italic block">Admins have global store privileges</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-sec block">Initial Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-text-main cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'Active'}
                      onChange={() => setFormData({...formData, status: 'Active'})}
                      className="accent-primary"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-text-main cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'Inactive'}
                      onChange={() => setFormData({...formData, status: 'Inactive'})}
                      className="accent-primary"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-border-main flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border-main text-text-main rounded-xl text-sm font-semibold hover:bg-bg-sec transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-border-main animate-slide-up">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
              <h3 className="font-display font-semibold text-text-main text-lg">Edit Staff Member</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-text-sec hover:text-text-main p-1 hover:bg-bg-sec rounded-lg transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Role Assignment *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Inventory Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Store Assignment</label>
                  <select
                    value={formData.store}
                    disabled={formData.role === 'Admin'}
                    onChange={(e) => setFormData({...formData, store: e.target.value})}
                    className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm bg-white focus:outline-none focus:border-primary disabled:bg-bg-sec disabled:text-text-sec"
                  >
                    <option value="">Global / Head Office</option>
                    {stores.map(store => (
                      <option key={store._id} value={store._id}>{store.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-text-sec block">Status</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-text-main cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'Active'}
                        onChange={() => setFormData({...formData, status: 'Active'})}
                        className="accent-primary"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-text-main cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'Inactive'}
                        onChange={() => setFormData({...formData, status: 'Inactive'})}
                        className="accent-primary"
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border-main flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border-main text-text-main rounded-xl text-sm font-semibold hover:bg-bg-sec transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border-main p-6 space-y-4 animate-slide-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-main text-lg">Remove Staff Member?</h3>
              <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-text-main">{selectedUser.name}</span>? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 border border-border-main text-text-main rounded-xl text-sm font-semibold hover:bg-bg-sec transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteUser}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL (Placeholder Action) */}
      {isResetOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-border-main animate-slide-up">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
              <h3 className="font-display font-semibold text-text-main text-md flex items-center gap-1.5">
                <Key className="w-4 h-4 text-primary" />
                Reset Staff Password
              </h3>
              <button onClick={() => setIsResetOpen(false)} className="text-text-sec hover:text-text-main p-1 hover:bg-bg-sec rounded-lg transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-text-sec">Account:</p>
                <p className="text-sm font-semibold text-text-main">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-sec block">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="pt-2 border-t border-border-main flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-4 py-2 border border-border-main text-text-main rounded-xl text-sm font-semibold hover:bg-bg-sec transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
