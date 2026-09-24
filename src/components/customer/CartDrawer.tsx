import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { DeliveryOption } from '../../types';

interface CartDrawerProps {
  currencySymbol: string;
  deliveryOptions: DeliveryOption[];
  onProceedToCheckout: () => void;
  onOpenProductById?: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  currencySymbol,
  deliveryOptions,
  onProceedToCheckout,
  onOpenProductById
}) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal
  } = useCart();

  if (!isCartOpen) return null;

  // Selected or default delivery option preview
  const defaultDelivery = deliveryOptions.find(d => d.enabled) || deliveryOptions[0];
  const deliveryCharge = defaultDelivery ? defaultDelivery.charge : 0;
  const grandTotal = subtotal + deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-extrabold text-slate-900">Your Basket</h2>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {cartItems.length} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-500 font-medium px-2 py-1"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your basket is empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Discover fresh organic fruits, artisan bread, farm dairy and more delicious goods.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-slate-50/70 rounded-2xl p-2.5 sm:p-3.5 border border-slate-100 flex gap-2.5 sm:gap-3 items-center transition-all hover:border-emerald-200"
                >
                  {/* Clickable Area for Full Page Product View */}
                  <div
                    onClick={() => {
                      if (onOpenProductById) {
                        setIsCartOpen(false);
                        onOpenProductById(item.productId);
                      }
                    }}
                    className="flex gap-2.5 sm:gap-3 items-center flex-1 min-w-0 cursor-pointer group/item"
                    title="Click to view product details"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl object-cover bg-white flex-shrink-0 group-hover/item:scale-105 transition-transform"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover/item:text-emerald-700 transition-colors">
                        {item.productName}
                      </h4>

                      {/* Snapshot of chosen variants / Combo info */}
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {item.isCombo && (
                          <div className="w-full space-y-0.5 my-0.5">
                            <span className="text-[9px] font-black text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded inline-block">
                              🔥 Combo Pack
                            </span>
                            {item.comboSummary && (
                              <p className="text-[10px] text-slate-600 font-medium">
                                📦 {item.comboSummary}
                              </p>
                            )}
                          </div>
                        )}
                        {item.selectedColour && (
                          <span className="text-[9px] sm:text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {item.selectedColour}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="text-[9px] sm:text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedKg && (
                          <span className="text-[9px] sm:text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            Weight: {item.selectedKg}
                          </span>
                        )}
                        {item.selectedCombo && (
                          <span className="text-[9px] sm:text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium border border-indigo-100">
                            Combo: {item.selectedCombo}
                          </span>
                        )}
                        {item.customSelections && Object.entries(item.customSelections).map(([k, v]) => (
                          <span key={k} className="text-[9px] sm:text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {k}: {v}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs sm:text-sm font-extrabold text-emerald-700 mt-1">
                        {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white px-1 sm:px-1.5 py-0.5 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="w-5 h-5 rounded-lg text-slate-600 flex items-center justify-center hover:bg-slate-100 active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="w-5 h-5 rounded-lg text-slate-600 flex items-center justify-center hover:bg-slate-100 active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Call-to-Action */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">
                    {currencySymbol}{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery ({defaultDelivery?.name || 'Standard'})</span>
                  <span className="font-bold text-slate-800">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `${currencySymbol}${deliveryCharge.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm sm:text-base font-extrabold text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-emerald-700">
                    {currencySymbol}{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
