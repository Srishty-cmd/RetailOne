import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import CashierDashboard from '../components/dashboard/CashierDashboard';

const DashboardPage = () => {
  const { user } = useAuth();
  
  // Default to admin for demo purposes if no user role found
  const role = user?.role || 'admin';

  switch (role) {
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
