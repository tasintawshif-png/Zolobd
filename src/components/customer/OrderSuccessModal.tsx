import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ShoppingBag,
  Download,
  Share2,
  Camera,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  MessageCircle,
  Check,
  Printer
} from 'lucide-react';
import { Order } from '../../types';

interface OrderSuccessModalProps {
  order: Order | null;
  currencySymbol: string;
  isOpen: boolean;
  onClose: () => void;
  contactPhone?: string;
  whatsappNumber?: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  currencySymbol,
  isOpen,
  onClose,
  contactPhone = '+1 (800) 555-0199',
  whatsappNumber = '+18005550199'
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire festive celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#ffffff']
      });
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  // Clean WhatsApp number
  const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');

  // Handle Download Receipt file
  const handleDownload = () => {
    const content = `================================================
ORDER INVOICE / RECEIPT
Order ID: #${order.orderNumber}
Date: ${order.dateString} at ${order.createdAtTime}
================================================
CUSTOMER DETAILS:
Name: ${order.customerName}
Phone: ${order.phone}
Address: ${order.address} ${order.optionalAddress ? `(${order.optionalAddress})` : ''}
${order.notes ? `Notes: ${order.notes}` : ''}
------------------------------------------------
PURCHASED ITEMS:
${order.items
  .map(
    (i, idx) =>
      `${idx + 1}. ${i.name} (x${i.quantity}) - ${currencySymbol}${(i.price * i.quantity).toFixed(2)}${
        i.selectedCombo ? ` [Combo: ${i.selectedCombo}]` : ''
      }${i.selectedColour ? ` [Colour: ${i.selectedColour}]` : ''}${
        i.selectedSize ? ` [Size: ${i.selectedSize}]` : ''
      }${i.selectedKg ? ` [Weight: ${i.selectedKg}]` : ''}`
  )
  .join('\n')}
------------------------------------------------
Subtotal: ${currencySymbol}${order.subtotal.toFixed(2)}
Delivery Charge (${order.deliveryOption?.name || 'Standard'}): ${
      order.deliveryCharge === 0 ? 'FREE' : `${currencySymbol}${order.deliveryCharge.toFixed(2)}`
    }
TOTAL PAYABLE: ${currencySymbol}${order.totalAmount.toFixed(2)}
Payment Method: Cash on Delivery / Safe Checkout
================================================
SUPPORT & CONTACT:
Phone: ${contactPhone}
WhatsApp: ${whatsappNumber}
Thank you for shopping with us!
================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Order_Receipt_${order.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Share Order Information
  const handleShare = async () => {
    const summaryText = `🛒 Order Confirmation #${order.orderNumber}
Customer: ${order.customerName}
Items: ${order.items.length} items
Total: ${currencySymbol}${order.totalAmount.toFixed(2)}
Delivery: ${order.address}
Company Helpline: ${contactPhone}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order #${order.orderNumber}`,
          text: summaryText
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-500/30 my-auto flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prominent Bangla Screenshot Prompt Bar requested by User */}
        <div className="bg-amber-400 text-slate-950 px-4 py-2 text-center flex items-center justify-center gap-2 font-black text-xs sm:text-sm tracking-wide shadow-xs border-b border-amber-500/40">
          <Camera className="w-4 h-4 text-slate-950 animate-pulse" />
          <span>আপনি চাইলে স্ক্রিনশট মেরে রাখতে পারেন</span>
        </div>

        {/* Confetti Header */}
        <div className="p-5 sm:p-7 bg-gradient-to-br from-emerald-600 to-green-600 text-white text-center flex flex-col items-center border-b border-emerald-700/40">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mb-2.5 shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-100 mb-0.5">
            অর্ডার সফল হয়েছে • Order Confirmed!
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            ধন্যবাদ, {order.customerName.split(' ')[0]}!
          </h2>
          <p className="text-xs text-emerald-50 mt-1 max-w-sm">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। দ্রুত ডেলিভারির জন্য প্রস্তুত করা হচ্ছে।
          </p>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 print:p-0">
          
          {/* Order ID & Time Badge */}
          <div className="bg-emerald-50/80 rounded-2xl p-3.5 border-2 border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                Order ID (অর্ডার নম্বর)
              </span>
              <span className="font-mono font-black text-lg sm:text-xl text-slate-900 tracking-wider">
                #{order.orderNumber}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {order.dateString}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {order.createdAtTime}
              </span>
            </div>
          </div>

          {/* Quick Actions: Download, Share & Print */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Download Receipt slip"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>ডাউনলোড মেমো</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Share order details"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>শেয়ার করুন</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>প্রিন্ট</span>
            </button>
          </div>

          {/* Delivery & Customer Details Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Customer Contact
              </span>
              <p className="font-extrabold text-slate-900">{order.customerName}</p>
              <p className="text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-600" />
                {order.phone}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Delivery Address
              </span>
              <p className="text-slate-800 font-medium line-clamp-2">{order.address}</p>
              {order.optionalAddress && (
                <p className="text-slate-500 text-[11px] mt-0.5">{order.optionalAddress}</p>
              )}
            </div>
          </div>

          {/* Items Breakdown Snapshot */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              Purchased Items Snapshot ({order.items.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-2.5 sm:p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <div className="flex flex-wrap gap-1 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">Qty: {item.quantity}</span>
                        {item.selectedCombo && (
                          <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                            Combo: {item.selectedCombo}
                          </span>
                        )}
                        {item.selectedColour && <span>• Colour: {item.selectedColour}</span>}
                        {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                        {item.selectedKg && <span>• {item.selectedKg}</span>}
                      </div>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 flex-shrink-0 ml-2">
                    {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Totals */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">
                {currencySymbol}{order.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery ({order.deliveryOption?.name || 'Standard'})</span>
              <span className="font-bold text-slate-800">
                {order.deliveryCharge === 0 ? 'FREE' : `${currencySymbol}${order.deliveryCharge.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm sm:text-base font-black text-slate-900">
              <span>Total Paid / Due on Delivery</span>
              <span className="text-emerald-700">{currencySymbol}{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Company Contact Section requested by User */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs">
                যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন:
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-emerald-300 shadow-2xs active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>কল করুন ({contactPhone})</span>
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                    `Hello! I placed Order #${order.orderNumber} for ${currencySymbol}${order.totalAmount.toFixed(
                      2
                    )}. Please provide an update.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>হোয়াটসঅ্যাপ মেসেজ</span>
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-1 flex flex-col sm:flex-row gap-2.5 print:hidden">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
