import { ArrowRight, Play, TrendingUp, AlertTriangle, Globe, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-16 sm:pb-24 lg:pt-16 lg:pb-32 border-b border-border-main">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 h-full w-full max-w-7xl dot-grid opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-5 text-left flex flex-col items-start">
            {/* Promo Tag */}
            <div className="inline-flex items-center gap-2 bg-primary-light border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold text-primary mb-6 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Omnichannel Retail Platform
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-main leading-tight sm:leading-none">
              Manage Your Retail Business <br className="hidden sm:inline" />
              <span className="text-primary mt-1 inline-block">From One Platform</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-text-sec leading-relaxed max-w-xl">
              Track inventory, process sales, manage stores, and monitor business performance in real time. Built for modern retail brands.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="border border-border-main hover:bg-bg-sec text-text-main px-6 py-3.5 rounded-xl font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer">
                <Play className="h-4 w-4 text-primary fill-primary/25" />
                Watch Demo
              </button>
            </div>

            <div className="mt-8 flex items-center gap-6 border-t border-border-main pt-6 w-full">
              <div>
                <span className="block text-xl font-bold text-text-main">14 Days</span>
                <span className="text-xs text-text-sec">Free Trial Period</span>
              </div>
              <div className="h-8 w-px bg-border-main"></div>
              <div>
                <span className="block text-xl font-bold text-text-main">No Card</span>
                <span className="text-xs text-text-sec">Required to Start</span>
              </div>
              <div className="h-8 w-px bg-border-main"></div>
              <div>
                <span className="block text-xl font-bold text-text-main">Easy Setup</span>
                <span className="text-xs text-text-sec">Import in Minutes</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard Mockup */}
          <div className="lg:col-span-7 w-full">
            <div className="relative mx-auto max-w-2xl lg:max-w-none bg-white rounded-2xl border border-border-main shadow-2xl p-3 sm:p-4 overflow-hidden">
              {/* Mockup Header Toolbar */}
              <div className="flex items-center justify-between border-b border-border-main pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400"></span>
                  <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                  <span className="h-3 w-3 rounded-full bg-green-400"></span>
                  <span className="ml-2 text-xs font-semibold text-text-sec bg-bg-sec px-2 py-0.5 rounded border border-border-main">
                    Main Street Store (POS-01)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success-main animate-ping"></span>
                  <span className="text-xs font-semibold text-success-main">Live Syncing</span>
                </div>
              </div>

              {/* Mockup Dashboard Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Metric 1: Sales Card */}
                <div className="bg-bg-sec p-4 rounded-xl border border-border-main relative overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-sec">Today's Sales</span>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-text-main">$4,850.20</span>
                    <span className="text-xs font-bold text-success-main flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      +12%
                    </span>
                  </div>
                  {/* Miniature spline simulation */}
                  <svg className="w-full h-8 mt-2 text-primary" viewBox="0 0 100 20" fill="none">
                    <path d="M0 15 Q 15 5, 30 12 T 60 4 T 90 10 T 100 2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M0 15 Q 15 5, 30 12 T 60 4 T 90 10 T 100 2 L 100 20 L 0 20 Z" fill="currentColor" fillOpacity="0.05" />
                  </svg>
                </div>

                {/* Metric 2: Orders Card */}
                <div className="bg-bg-sec p-4 rounded-xl border border-border-main group hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-sec">Total Orders</span>
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-text-main">84</span>
                    <span className="text-xs font-bold text-success-main flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      +8.4%
                    </span>
                  </div>
                  <div className="mt-4 flex gap-1 items-end h-6">
                    <div className="w-full bg-blue-100 rounded-t h-4 group-hover:bg-blue-300 transition-colors"></div>
                    <div className="w-full bg-blue-100 rounded-t h-3 group-hover:bg-blue-300 transition-colors"></div>
                    <div className="w-full bg-blue-100 rounded-t h-5 group-hover:bg-blue-300 transition-colors"></div>
                    <div className="w-full bg-blue-100 rounded-t h-2 group-hover:bg-blue-300 transition-colors"></div>
                    <div className="w-full bg-blue-500 rounded-t h-6"></div>
                  </div>
                </div>

                {/* Metric 3: Channel Share */}
                <div className="bg-bg-sec p-4 rounded-xl border border-border-main group hover:border-primary/50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-sec">Active Channels</span>
                      <Globe className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-sec flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                          In-Store POS
                        </span>
                        <span className="font-bold text-text-main">62%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-sec flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          Online Shop
                        </span>
                        <span className="font-bold text-text-main">38%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-border-main rounded-full h-2 mt-3 overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: '62%' }}></div>
                    <div className="bg-purple-500 h-full" style={{ width: '38%' }}></div>
                  </div>
                </div>
              </div>

              {/* Second row: Stock alerts & Product inventory */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4">
                {/* Inventory Alerts (Left) */}
                <div className="sm:col-span-7 bg-bg-sec p-4 rounded-xl border border-border-main">
                  <div className="flex items-center justify-between mb-3 border-b border-border-main pb-2">
                    <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Low Stock Alerts
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      3 Actions Required
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-border-main">
                      <span className="font-semibold text-text-main">Classic Leather Boot (Size 10)</span>
                      <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">1 left</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-border-main">
                      <span className="font-semibold text-text-main">Crewneck Sweatshirt (M, Green)</span>
                      <span className="text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded">4 left</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-border-main">
                      <span className="font-semibold text-text-main">Canvas Backpack (Tan)</span>
                      <span className="text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded">3 left</span>
                    </div>
                  </div>
                </div>

                {/* Live Checkout Activity (Right) */}
                <div className="sm:col-span-5 bg-bg-sec p-4 rounded-xl border border-border-main flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-border-main pb-2">
                      <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-primary" />
                        Channel Stock Sync
                      </span>
                    </div>
                    <div className="text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-text-sec">WooCommerce</span>
                        <span className="text-success-main font-bold bg-success-main/10 px-1.5 py-0.5 rounded">Synced</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-sec">Amazon Merchant</span>
                        <span className="text-success-main font-bold bg-success-main/10 px-1.5 py-0.5 rounded">Synced</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-sec">Shopify Store</span>
                        <span className="text-success-main font-bold bg-success-main/10 px-1.5 py-0.5 rounded">Synced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
