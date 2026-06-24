import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import DashboardPage from '../pages/DashboardPage';
import POSPage from '../pages/POSPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* Dashboard Routes wrapped in Layout and Protected Route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="pos" element={<POSPage />} />
        {/* Placeholder routes for others */}
        <Route path="products" element={<div className="p-8">Products Coming Soon</div>} />
        <Route path="inventory" element={<div className="p-8">Inventory Coming Soon</div>} />
        <Route path="orders" element={<div className="p-8">Orders Coming Soon</div>} />
        <Route path="reports" element={<div className="p-8">Reports Coming Soon</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
