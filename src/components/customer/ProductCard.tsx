import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Eye, Play } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol,
  onOpenDetails,
  onAddToCart,
  onBuyNow
}) => {
  const mediaList = product.media && product.media.length > 0 ? product.media : [];
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide images and videos on the card
  useEffect(() => {
    if (mediaList.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
    }, 3600);

    return () => clearInterval(timer);
  }, [mediaList.length, isHovered]);

  const currentMedia = mediaList[currentMediaIndex] || mediaList[0];
  const hasVideo = mediaList.some((m) => m.type === 'video');

  // Calculate discount percentage if not explicitly provided but oldPrice exists
  const discountPercent =
    product.discount ||
    (product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null);

  return (
    <div
      onClick={() => onOpenDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3.5 border border-slate-100 hover:border-emerald-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.99]"
    >
      <div>
        {/* Top Badges */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {product.isCombo ? (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[8px] sm:text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
              🔥 Combo Offer
            </span>
          ) : (
            <>
              {discountPercent && discountPercent > 0 && (
                <span className="bg-rose-500 text-white font-extrabold text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
                  -{discountPercent}%
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-emerald-600 text-white font-bold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                  Hot
                </span>
              )}
            </>
          )}
        </div>

        {/* Video Indicator Badge */}
        {hasVideo && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-slate-900/75 backdrop-blur-xs text-white p-1 sm:p-1.5 rounded-full shadow-xs pointer-events-none">
            <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
          </div>
        )}

        {/* Product Image / Video Container with Auto-slide */}
        <div className="relative w-full aspect-square bg-slate-50 rounded-lg sm:rounded-xl overflow-hidden mb-2 group-hover:bg-emerald-50/20 transition-colors">
          {mediaList.length > 0 ? (
            mediaList.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentMediaIndex ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {m.type === 'video' ? (
                  <video
                    src={m.url}
                    muted
                    playsInline
                    autoPlay
                    loop
                    className="w-full h-full object-cover object-center bg-black"
                  />
                ) : (
                  <img
                    src={m.url}
                    alt={product.name}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px] sm:text-xs">
              No Image
            </div>
          )}

          {/* Mini Auto-Slide Dots (if multiple media) */}
          {mediaList.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-black/30 backdrop-blur-xs px-1.5 py-0.5 rounded-full pointer-events-none">
              {mediaList.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`rounded-full transition-all ${
                    dotIdx === currentMediaIndex
                      ? 'w-2.5 h-1 bg-emerald-400'
                      : 'w-1 h-1 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Quick View Hover Pill (Desktop) */}
          <div className="hidden sm:flex absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none">
            <span className="bg-white/90 backdrop-blur-xs text-slate-800 font-bold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3 h-3 text-emerald-600" />
              View
            </span>
          </div>
        </div>

        {/* Category Name if present */}
        {product.categoryName && (
          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 tracking-wide uppercase line-clamp-1 mb-0.5">
            {product.categoryName}
          </span>
        )}

        {/* Product Title */}
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>

        {/* Combo Included Items List */}
        {product.isCombo && product.comboItems && product.comboItems.length > 0 && (
          <div className="mt-1.5 p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left">
            <div className="text-[10px] font-extrabold text-amber-900 mb-1 flex items-center gap-1">
              <span>📦 Includes:</span>
            </div>
            <ul className="space-y-0.5 text-[10px] text-slate-700">
              {product.comboItems.map((ci) => (
                <li key={ci.productId} className="flex items-center justify-between gap-1 leading-tight">
                  <span className="truncate">{ci.productName}</span>
                  <span className="font-extrabold text-amber-900 bg-white px-1 py-0.2 rounded border border-amber-200/60 flex-shrink-0">
                    × {ci.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        {/* Pricing Section */}
        {product.isCombo ? (
          <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-slate-500">Regular Price:</span>
              <span className="text-slate-400 line-through font-semibold">
                {currencySymbol}{(product.regularPrice || product.oldPrice || product.price).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-orange-600">Combo Price:</span>
              <span className="text-xs sm:text-base font-black text-slate-900">
                {currencySymbol}{product.price.toFixed(2)}
              </span>
            </div>
            {product.savingsAmount ? (
              <div className="flex items-center justify-between bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60 text-[9px] sm:text-[10px] font-bold text-emerald-800">
                <span>You Save:</span>
                <span>{currencySymbol}{product.savingsAmount.toFixed(2)}</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-baseline gap-1.5">
            <span className="text-xs sm:text-base font-black text-slate-900 tracking-tight">
              {currencySymbol}{product.price.toFixed(2)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                {currencySymbol}{product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Stock status */}
        <div className="mt-0.5">
          {product.inStock && product.stock > 0 ? (
            <span className="text-[8px] sm:text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              In Stock
            </span>
          ) : (
            <span className="text-[8px] sm:text-[9px] text-rose-500 font-semibold">Out of Stock</span>
          )}
        </div>

        {/* Action Buttons: Combo vs Single Product */}
        {product.isCombo ? (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => onAddToCart(product, e)}
              disabled={!product.inStock || product.stock <= 0}
              className="w-full py-2 px-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
              title="Add Combo to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add Combo to Cart</span>
            </button>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => onAddToCart(product, e)}
              disabled={!product.inStock || product.stock <= 0}
              className="w-full py-1.5 px-1 sm:py-2 sm:px-2 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all border border-emerald-200/70 disabled:opacity-50 cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3 h-3 text-emerald-600" />
              <span>Add</span>
            </button>

            <button
              onClick={(e) => onBuyNow(product, e)}
              disabled={!product.inStock || product.stock <= 0}
              className="w-full py-1.5 px-1 sm:py-2 sm:px-2 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-0.5 sm:gap-1 shadow-xs shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
              title="Buy Now"
            >
              <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>Buy Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
