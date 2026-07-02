import React from 'react';
import { Search } from 'lucide-react';

interface InventoryFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  categories: string[];
  onReset: () => void;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  categories,
  onReset,
}) => {
  return (
    <div className="bg-white border border-border-main rounded-2xl shadow-xs p-5 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sec w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search inventory by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main"
          />
        </div>

        {/* Filters and Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto shrink-0">
          {/* Category Dropdown */}
          <div className="min-w-[160px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main cursor-pointer"
            >
              <option value="All">Category Filter</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="min-w-[160px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-sec border border-border-main focus:border-primary focus:bg-white rounded-xl text-sm transition-colors duration-200 outline-none text-text-main cursor-pointer"
            >
              <option value="All">Stock Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="px-4 py-2.5 bg-bg-sec hover:bg-border-main text-text-main text-sm font-medium rounded-xl border border-border-main cursor-pointer transition-colors duration-150"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
