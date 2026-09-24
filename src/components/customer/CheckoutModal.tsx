import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Truck, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { CartItem, DeliveryOption, Order, OrderItemSnapshot } from '../../types';
import { placeOrder } from '../../services/storeService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryOptions: DeliveryOption[];
  currencySymbol: string;
  onOrderPlaced: (order: Order, purchasedItemIds: string[]) => void;
}

const CheckoutModalContent: React.FC<CheckoutModalProps> = ({
  onClose,
  items,
  deliveryOptions,
  currencySymbol,
  onOrderPlaced
}) => {
  const activeDeliveryOptions = deliveryOptions.filter(d => d.enabled);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    activeDeliveryOptions[0]?.id || ''
  );

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [optionalAddress, setOptionalAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Validation & Loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock body scroll while open and restore on unmount
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, []);

  // Selected delivery option calculation
  const selectedDelivery = activeDeliveryOptions.find(d => d.id === selectedDeliveryId) || activeDeliveryOptions[0];
  const deliveryCharge = selectedDelivery ? selectedDelivery.charge : 0;

  // Calculate items subtotal and total
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal + deliveryCharge;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 17) {
      setErrorMessage('Please enter a valid contact phone number.');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('Please enter a complete delivery address.');
      return;
    }

    if (!selectedDelivery) {
      setErrorMessage('Please select a delivery option.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build order snapshot
      const orderItemsSnapshot: OrderItemSnapshot[] = items.map((item) => ({
        productId: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        isCombo: item.isCombo,
        comboSummary: item.comboSummary,
        selectedColour: item.selectedColour,
        selectedSize: item.selectedSize,
        selectedKg: item.selectedKg,
        selectedCombo: item.selectedCombo,
        customSelections: item.customSelections
      }));

      const dateObj = new Date();
      // Short numeric-only Order ID (e.g. 6-digit number)
      const orderNumber = `${Math.floor(100000 + Math.random() * 900000)}`;

      const orderPayload: Omit<Order, 'id'> = {
        orderNumber,
        customerName: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        optionalAddress: optionalAddress.trim() || undefined,
        notes: notes.trim() || undefined,
        items: orderItemsSnapshot,
        deliveryOption: {
          id: selectedDelivery.id,
          name: selectedDelivery.name,
          charge: selectedDelivery.charge
        },
        subtotal: Number(subtotal.toFixed(2)),
        deliveryCharge: Number(deliveryCharge.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        createdAt: dateObj.toISOString(),
        createdAtTime: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateString: dateObj.toISOString().slice(0, 10),
        timestamp: Date.now()
      };

      const placed = await placeOrder(orderPayload);
      const purchasedIds = items.map(i => i.cartItemId);
      setIsSubmitting(false);
      onOrderPlaced(placed, purchasedIds);
    } catch (err) {
      console.error('Failed to submit order:', err);
      setErrorMessage('An unexpected error occurred while creating your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100/90 my-auto flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Quick & Secure Checkout
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Confirm your delivery details to complete your order
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Content */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">1</span>
              Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Johnathan Smith"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-emerald-50/20 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-emerald-50/20 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">2</span>
              Delivery Address
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Street Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Apt number, Street name, Area / City"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-emerald-50/20 text-xs sm:text-sm text-slate-900 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Apartment / Suite / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={optionalAddress}
                  onChange={(e) => setOptionalAddress(e.target.value)}
                  placeholder="e.g. Floor 3, Apt 14B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-emerald-50/20 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Notes / Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave at front door"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:bg-emerald-50/20 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Options (Admin Controlled) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">3</span>
              Delivery Option
            </h3>

            <div className="space-y-2">
              {activeDeliveryOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedDeliveryId === opt.id
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={selectedDeliveryId === opt.id}
                      onChange={() => setSelectedDeliveryId(opt.id)}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        {opt.name}
                      </p>
                      {opt.description && (
                        <p className="text-[11px] text-slate-500">{opt.description}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                    {opt.charge === 0 ? 'FREE' : `${currencySymbol}${opt.charge.toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Order Summary Snapshot */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Order Items ({items.length})
            </h3>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 max-h-40 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between items-center text-xs py-1 border-b border-slate-200/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                        {item.isCombo && (
                          <span className="text-[8px] font-black uppercase text-orange-700 bg-orange-100 px-1 py-0.2 rounded">
                            Combo
                          </span>
                        )}
                      </div>
                      {item.isCombo && item.comboSummary ? (
                        <p className="text-[9px] text-slate-500 font-medium line-clamp-1">
                          📦 {item.comboSummary} (Qty: {item.quantity})
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500">
                          Qty: {item.quantity}
                          {item.selectedColour ? ` | Colour: ${item.selectedColour}` : ''}
                          {item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}
                          {item.selectedKg ? ` | ${item.selectedKg}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div className="pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Charge</span>
                <span className="font-semibold text-slate-800">
                  {deliveryCharge === 0 ? 'FREE' : `${currencySymbol}${deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-emerald-700">{currencySymbol}{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Securing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order • {currencySymbol}{totalAmount.toFixed(2)}</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
              Cash on Delivery / Doorstep Payment Available
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = (props) => {
  if (!props.isOpen || props.items.length === 0) return null;
  return <CheckoutModalContent {...props} />;
};
