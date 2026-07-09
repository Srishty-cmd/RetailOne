import React from 'react';
import { BarChart2 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-border-main rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main">Analytics & Reports</h1>
          <p className="text-sm text-text-sec mt-1">View retail sales analytics, performance, and trends</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white p-16 border border-border-main rounded-2xl shadow-xs flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto animate-fade-in animate-once">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-primary border border-emerald-100 shadow-sm">
          <BarChart2 className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-main font-display text-center w-full block">No Report Data</h3>
          <p className="text-sm text-text-sec mt-1.5 leading-relaxed">
            Report generation requires checkout sales transactions to exist. Start checking out sales orders in POS to generate analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
