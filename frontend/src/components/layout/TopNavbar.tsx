import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLocation } from 'react-router-dom';

interface TopNavbarProps {
  setDrawerOpen: (open: boolean) => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ setDrawerOpen }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard/pos') return 'POS Terminal';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/inventory')) return 'Inventory';
    if (path.includes('/orders')) return 'Orders';
    return 'Dashboard';
  };

  const role = user?.role || 'Admin';
  const name = user?.name || 'User';

  return (
    <header className="bg-white h-16 border-b border-border-main flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center">
        <button 
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden p-2 -ml-2 mr-2 text-text-sec hover:bg-bg-sec rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-display font-semibold text-text-main hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-4 lg:space-x-6">
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-sec" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 border border-border-main rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 bg-bg-sec focus:bg-white"
          />
        </div>

        <button className="relative p-2 text-text-sec hover:bg-bg-sec rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border-main">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-text-main">Welcome Back, {name}</p>
            <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
              Role: {role}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
