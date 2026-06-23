import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  MonitorSmartphone, 
  Package, 
  Archive, 
  ShoppingCart, 
  Store, 
  Users, 
  BarChart2, 
  Settings, 
  UserCircle, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ isOpen, setDrawerOpen }) => {
  const { user, logout } = useAuth();
  
  // Default to admin if no role is provided
  const role = user?.role || 'admin';

  const menuConfig = {
    admin: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'POS Terminal', path: '/dashboard/pos', icon: MonitorSmartphone },
      { name: 'Products', path: '/dashboard/products', icon: Package },
      { name: 'Inventory', path: '/dashboard/inventory', icon: Archive },
      { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Stores', path: '/dashboard/stores', icon: Store },
      { name: 'Users', path: '/dashboard/users', icon: Users },
      { name: 'Reports', path: '/dashboard/reports', icon: BarChart2 },
      { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ],
    manager: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'POS Terminal', path: '/dashboard/pos', icon: MonitorSmartphone },
      { name: 'Products', path: '/dashboard/products', icon: Package },
      { name: 'Inventory', path: '/dashboard/inventory', icon: Archive },
      { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Reports', path: '/dashboard/reports', icon: BarChart2 },
    ],
    cashier: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'POS Terminal', path: '/dashboard/pos', icon: MonitorSmartphone },
      { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Profile', path: '/dashboard/profile', icon: UserCircle },
    ]
  };

  const menus = menuConfig[role] || menuConfig.admin;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" 
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-border-main transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-border-main">
          <span className="text-xl font-display font-bold text-primary">StoreSync</span>
        </div>

        <nav className="p-4 space-y-1 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col">
          <div className="flex-1 space-y-1">
            {menus.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-xl transition-colors duration-200
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-text-sec hover:bg-bg-sec hover:text-text-main'
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-4 border-t border-border-main">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 rounded-xl text-text-sec hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
