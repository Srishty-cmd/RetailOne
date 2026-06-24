import React from 'react';
import { useAuthStore } from '../store/authStore';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import CashierDashboard from '../components/dashboard/CashierDashboard';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  
  const role = (user?.role || 'Admin').toLowerCase();

  switch (role) {
    case 'inventory manager':
    case 'manager':
      return <ManagerDashboard />;
    case 'cashier':
      return <CashierDashboard />;
    case 'admin':
    default:
      return <AdminDashboard />;
  }
};

export default DashboardPage;
