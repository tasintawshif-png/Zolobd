import React from 'react';
import { ShoppingBag, Search, ShieldCheck, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface HeaderProps {
  storeName: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeName,
  searchQuery,
  onSearchChange,
  onOpenAdmin
}) => {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Brand / Store Name */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <span className="font-black text-xl sm:text-2xl tracking-tighter">
                {storeName.charAt(0) || 'L'}
              </span>
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-2xl text-slate-900 tracking-tight leading-tight line-clamp-1">
                {storeName}
              </h1>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Fresh & Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Desktop Search Engine */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search fruits, bakery, weights, sizes, or variants..."
                className="w-full pl-10 pr-10 py-2.5 bg-emerald-50/50 hover:bg-emerald-50/80 focus:bg-white border border-emerald-200/80 focus:border-emerald-600 rounded-full text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions: Admin Portal Link & Shopping Cart */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Admin Panel entry link */}
            <button
              onClick={onOpenAdmin}
              className="px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-full transition-all duration-200 flex items-center gap-1.5 border border-slate-200/60"
              title="Open Admin Control Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full transition-all duration-200 shadow-md shadow-emerald-600/25 flex items-center justify-center cursor-pointer"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 font-extrabold text-[11px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Engine */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, categories, variants..."
              className="w-full pl-10 pr-9 py-2 bg-emerald-50/50 focus:bg-white border border-emerald-200 rounded-full text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
