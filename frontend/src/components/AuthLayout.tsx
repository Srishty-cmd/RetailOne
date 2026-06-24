import { Link } from 'react-router-dom';
import { Store, LayoutDashboard, BarChart3, Users, Settings, ArrowLeft } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-bg-main antialiased selection:bg-primary-light selection:text-primary">
      {/* Left Pane - Branding & Mockup (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-sec flex-col justify-between overflow-hidden relative border-r border-border-main">
        {/* Background Dot Grid */}
        <div className="absolute inset-0 dot-grid opacity-50"></div>
        
        <div className="relative z-10 p-12 lg:p-16 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-[#006e52]">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-semibold tracking-tight text-text-main">
              StoreSync
            </span>
          </div>

          <div className="max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-display font-semibold text-text-main leading-tight mb-6 tracking-tight">
              Manage Your Retail Business Efficiently
            </h1>
            <p className="text-lg text-text-sec leading-relaxed mb-12">
              Track inventory, process sales, and manage stores from one platform. Built for modern retailers looking to scale.
            </p>
          </div>

          {/* Abstract Dashboard Mockup */}
          <div className="mt-8 flex-1 w-full max-h-[400px] bg-white rounded-t-2xl shadow-2xl border border-border-main border-b-0 overflow-hidden flex flex-col transform translate-y-4 hover:translate-y-2 transition-transform duration-500">
            {/* Mockup Header */}
            <div className="h-14 border-b border-border-main flex items-center px-6 gap-4 bg-gray-50 flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="ml-4 h-6 w-48 bg-white border border-border-main rounded-md"></div>
            </div>
            {/* Mockup Body */}
            <div className="flex flex-1 p-6 gap-6">
              {/* Sidebar */}
              <div className="w-16 flex flex-col gap-4 border-r border-border-main pr-6">
                <div className="w-8 h-8 rounded bg-primary-light flex items-center justify-center text-primary"><LayoutDashboard className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400"><BarChart3 className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Users className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 mt-auto"><Settings className="w-4 h-4" /></div>
              </div>
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="h-24 flex-1 bg-primary-light rounded-xl border border-[#cbebe3]"></div>
                  <div className="h-24 flex-1 bg-gray-50 rounded-xl border border-border-main"></div>
                  <div className="h-24 flex-1 bg-gray-50 rounded-xl border border-border-main"></div>
                </div>
                <div className="flex-1 bg-white rounded-xl border border-border-main shadow-sm flex flex-col p-4 gap-3">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-8 w-full bg-gray-50 rounded"></div>
                  <div className="h-8 w-full bg-gray-50 rounded"></div>
                  <div className="h-8 w-full bg-gray-50 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        {/* Mobile Logo Only visible on small screens */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
           <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl font-display font-semibold text-text-main">
            StoreSync
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-text-sec hover:text-text-main transition-colors duration-200 mb-8 lg:mb-12 group">
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-display font-semibold text-text-main mb-2">
              {title}
            </h2>
            <p className="text-text-sec">
              {subtitle}
            </p>
          </div>
          
          {/* Card Wrapper for Form */}
          <div className="bg-white lg:bg-transparent lg:shadow-none lg:border-none shadow-xl border border-border-main rounded-2xl p-6 sm:p-8 lg:p-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
