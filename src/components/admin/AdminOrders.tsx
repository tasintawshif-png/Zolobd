import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Phone,
  Truck,
  FileSpreadsheet,
  PackageCheck,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { Order } from '../../types';

interface AdminOrdersProps {
  orders: Order[];
  currencySymbol: string;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onExportExcel: () => void;
  onDeleteOrder?: (orderId: string) => Promise<void> | void;
  onDeleteMultipleOrders?: (orderIds: string[]) => Promise<void> | void;
  onDeleteAllOrders?: () => Promise<void> | void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  currencySymbol,
  onExportExcel,
  onDeleteOrder,
  onDeleteMultipleOrders,
  onDeleteAllOrders
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'selected' | 'all';
    orderId?: string;
    orderNumber?: string;
    count?: number;
  }>({
    isOpen: false,
    type: 'single'
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.phone.includes(q) ||
      order.address.toLowerCase().includes(q)
    );
  });

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  // Perform confirmed deletion
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (confirmModal.type === 'single' && confirmModal.orderId && onDeleteOrder) {
        await onDeleteOrder(confirmModal.orderId);
        setSelectedOrderIds(prev => prev.filter(id => id !== confirmModal.orderId));
        showToast(`Order #${confirmModal.orderNumber || ''} deleted successfully.`);
      } else if (confirmModal.type === 'selected' && onDeleteMultipleOrders && selectedOrderIds.length > 0) {
        await onDeleteMultipleOrders(selectedOrderIds);
        const count = selectedOrderIds.length;
        setSelectedOrderIds([]);
        showToast(`${count} orders deleted successfully.`);
      } else if (confirmModal.type === 'all' && onDeleteAllOrders) {
        await onDeleteAllOrders();
        setSelectedOrderIds([]);
        showToast('All order records permanently erased.');
      }
    } catch (err) {
      console.error('Failed to delete order(s):', err);
      showToast('Error deleting orders. Please try again.');
    } finally {
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, type: 'single' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce border border-slate-700">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time customer checkout records, delivery addresses, and server database management.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {onDeleteAllOrders && orders.length > 0 && (
            <button
              onClick={() => setConfirmModal({
                isOpen: true,
                type: 'all',
                count: orders.length
              })}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Delete all orders to reduce server/database load"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Clear All Orders</span>
            </button>
          )}

          <button
            onClick={onExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar when items selected */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-[11px]">
              {selectedOrderIds.length}
            </span>
            <span>order{selectedOrderIds.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setSelectedOrderIds([])}
              className="px-3 py-1.5 bg-white text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => setConfirmModal({
                isOpen: true,
                type: 'selected',
                count: selectedOrderIds.length
              })}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedOrderIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Input & Select All Toolbar */}
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

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {filteredOrders.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              title="Select all filtered orders"
            >
              {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl whitespace-nowrap">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Total Orders: {orders.length}</span>
          </div>
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
          filteredOrders.map((order) => {
            const isSelected = selectedOrderIds.includes(order.id);
            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl sm:rounded-3xl border transition-all p-4 sm:p-5 flex flex-col gap-4 ${
                  isSelected 
                    ? 'border-rose-300 ring-2 ring-rose-200 bg-rose-50/20' 
                    : 'border-slate-200/90 shadow-xs hover:border-emerald-300'
                }`}
              >
                {/* Order Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Select Checkbox */}
                    <button
                      onClick={() => toggleSelectOrder(order.id)}
                      className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      title={isSelected ? "Deselect order" : "Select order"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>

                    <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Placed on {order.dateString} at {order.createdAtTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Total: {currencySymbol}{order.totalAmount.toFixed(2)}
                    </span>

                    {/* Single Order Delete Button */}
                    {onDeleteOrder && (
                      <button
                        onClick={() => setConfirmModal({
                          isOpen: true,
                          type: 'single',
                          orderId: order.id,
                          orderNumber: order.orderNumber
                        })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-200"
                        title="Delete this order"
                        aria-label="Delete order"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    )}
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
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                {confirmModal.type === 'single' && `Delete Order #${confirmModal.orderNumber}?`}
                {confirmModal.type === 'selected' && `Delete ${confirmModal.count} Selected Orders?`}
                {confirmModal.type === 'all' && `Delete ALL (${confirmModal.count}) Orders?`}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will permanently remove the order record{confirmModal.type !== 'single' ? 's' : ''} from the database and free up server load. This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'single' })}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

