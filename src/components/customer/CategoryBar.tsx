import React from 'react';
import { Category } from '../../types';
import { LayoutGrid } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory
}) => {
  const activeCategories = categories.filter(c => c.enabled);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 sm:mt-5">
      {/* Horizontal Scroll on Mobile / Wrap Grid on Desktop */}
      <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto pb-1.5 scrollbar-none snap-x">
        {/* All Products Option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer snap-start ${
            selectedCategoryId === null
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-102'
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>All Goods</span>
        </button>

        {activeCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer snap-start ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-102'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl object-cover"
                />
              ) : (
                <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {cat.name.charAt(0)}
                </div>
              )}
              <span className="whitespace-nowrap">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
