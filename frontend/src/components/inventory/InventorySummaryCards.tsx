import React from 'react';
import { Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface SummaryCounts {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface InventorySummaryCardsProps {
  counts: SummaryCounts;
}

const InventorySummaryCards: React.FC<InventorySummaryCardsProps> = ({ counts }) => {
  const cards = [
    {
      title: 'Total Products',
      value: counts.total,
      icon: Package,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'In Stock',
      value: counts.inStock,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Low Stock',
      value: counts.lowStock,
      icon: AlertTriangle,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Out of Stock',
      value: counts.outOfStock,
      icon: XCircle,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={index}
            className="bg-white border border-border-main rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-sm transition-all duration-200"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-sec uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-3xl font-display font-bold text-text-main block">
                {card.value}
              </span>
            </div>
            
            <div className={`p-3 rounded-xl border ${card.colorClass}`}>
              <IconComponent className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventorySummaryCards;
