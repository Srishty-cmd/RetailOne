import React from 'react';

interface InventoryStatusBadgeProps {
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const InventoryStatusBadge: React.FC<InventoryStatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'In Stock':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-500'
        };
      case 'Low Stock':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          dot: 'bg-amber-500'
        };
      case 'Out of Stock':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          dot: 'bg-rose-500'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200 text-gray-700',
          dot: 'bg-gray-500'
        };
    }
  };

  const styles = getStyles();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${styles.dot}`} />
      {status}
    </span>
  );
};

export default InventoryStatusBadge;
