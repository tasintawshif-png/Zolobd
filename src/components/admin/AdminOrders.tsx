import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Phone,
  Truck,
  FileSpreadsheet,
  PackageCheck
} from 'lucide-react';
import { Order } from '../../types';

interface AdminOrdersProps {
  orders: Order[];
  currencySymbol: string;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onExportExcel: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  currencySymbol,
  onExportExcel
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.phone.includes(q) ||
      order.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time customer checkout records, delivery addresses, and purchased items.
          </p>
        </div>
        <button
          onClick={onExportExcel}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Orders to Excel (.xlsx)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, customer name, phone number, address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl whitespace-nowrap">
          <PackageCheck className="w-4 h-4 text-emerald-600" />
          <span>Total Orders: {orders.length}</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all p-4 sm:p-5 flex flex-col gap-4"
            >
              {/* Order Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Placed on {order.dateString} at {order.createdAtTime}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Total: {currencySymbol}{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Customer and Delivery Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Customer</span>
                  <p className="font-bold text-slate-900">{order.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <a href={`tel:${order.phone}`} className="hover:underline text-emerald-700 font-bold">
                      {order.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Delivery Address</span>
                  <p className="text-slate-800 font-medium line-clamp-2">{order.address}</p>
                  {order.optionalAddress && (
                    <p className="text-[11px] text-slate-500">{order.optionalAddress}</p>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Shipping Method</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    {order.deliveryOption?.name || 'Standard'}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Delivery charge: {currencySymbol}{order.deliveryCharge.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-50" />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {item.isCombo && (
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                              🔥 COMBO
                            </span>
                          )}
                        </div>
                        {item.isCombo && item.comboSummary ? (
                          <p className="text-[10px] text-orange-950 bg-orange-50/80 px-1.5 py-0.5 rounded border border-orange-200/60 mt-1">
                            📦 {item.comboSummary} (Qty: {item.quantity})
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">Qty: {item.quantity}</span>
                            {item.selectedColour && <span>• Colour: {item.selectedColour}</span>}
                            {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                            {item.selectedKg && <span>• {item.selectedKg}</span>}
                            {item.selectedCombo && <span className="text-indigo-600">• Combo: {item.selectedCombo}</span>}
                            {item.customSelections && Object.entries(item.customSelections).map(([k, v]) => (
                              <span key={k}>• {k}: {v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 block">
                        {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {currencySymbol}{item.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Notes if present */}
              {order.notes && (
                <div className="text-xs bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-amber-900">
                  <span className="font-bold">Customer Notes:</span> {order.notes}
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};
