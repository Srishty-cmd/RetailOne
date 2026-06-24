import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const DashboardLayout: React.FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-sec flex">
      <Sidebar isOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300 ease-in-out">
        <TopNavbar setDrawerOpen={setDrawerOpen} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 dot-grid">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
