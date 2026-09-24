import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Truck, X } from 'lucide-react';
import { DeliveryOption } from '../../types';

interface AdminDeliveryOptionsProps {
  deliveryOptions: DeliveryOption[];
  currencySymbol: string;
  onSaveOption: (option: DeliveryOption) => void;
  onDeleteOption: (id: string) => void;
  onReorderOptions?: (options: DeliveryOption[]) => void;
}

export const AdminDeliveryOptions: React.FC<AdminDeliveryOptionsProps> = ({
  deliveryOptions,
  currencySymbol,
  onSaveOption,
  onDeleteOption,
  onReorderOptions
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null);

  const [name, setName] = useState('');
  const [charge, setCharge] = useState<number | string>(0);
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number | string>(1);
  const [enabled, setEnabled] = useState(true);

  const sortedOptions = [...deliveryOptions].sort((a, b) => (a.order || 0) - (b.order || 0));

  const openCreateModal = () => {
    setEditingOption(null);
    setName('');
    setCharge(0);
    setDescription('');
    setOrder(deliveryOptions.length + 1);
    setEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (opt: DeliveryOption) => {
    setEditingOption(opt);
    setName(opt.name);
    setCharge(opt.charge);
    setDescription(opt.description || '');
    setOrder(opt.order);
    setEnabled(opt.enabled);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: DeliveryOption = {
      id: editingOption?.id || `del-${Date.now()}`,
      name: name.trim(),
      charge: Number(charge) || 0,
      description: description.trim() || undefined,
      order: Number(order) || 1,
      enabled: Boolean(enabled)
    };

    onSaveOption(payload);
    setIsModalOpen(false);
  };

  const handleMoveOrder = (opt: DeliveryOption, direction: 'up' | 'down') => {
    const currentIndex = sortedOptions.findIndex(o => o.id === opt.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedOptions.length) return;

    const list = [...sortedOptions];
    const temp = list[currentIndex];
    list[currentIndex] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    if (onReorderOptions) {
      onReorderOptions(reordered);
    } else {
      reordered.forEach(o => onSaveOption(o));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Delivery Methods & Shipping Rates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure delivery tiers (e.g. Same Day, Standard, Express), charges, and estimated turnaround.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Method</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedOptions.map((opt, index) => (
          <div
            key={opt.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        #{index + 1}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900">{opt.name}</h3>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  opt.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {opt.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              {opt.description && (
                <p className="text-xs text-slate-500 mb-3">{opt.description}</p>
              )}

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-emerald-700">
                  {opt.charge === 0 ? 'FREE' : `${currencySymbol}${opt.charge.toFixed(2)}`}
                </span>
                <span className="text-[11px] text-slate-400">per order</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-4">
              <span>Display sequence: #{opt.order}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveOrder(opt, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-slate-100 disabled:opacity-20 disabled:pointer-events-none text-slate-600 rounded cursor-pointer transition-opacity"
                  title="Move earlier"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveOrder(opt, 'down')}
                  disabled={index === sortedOptions.length - 1}
                  className="p-1 hover:bg-slate-100 disabled:opacity-20 disabled:pointer-events-none text-slate-600 rounded cursor-pointer transition-opacity"
                  title="Move later"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openEditModal(opt)}
                  className="p-1 hover:bg-slate-100 text-emerald-600 rounded cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteOption(opt.id)}
                  className="p-1 hover:bg-rose-50 text-rose-500 rounded cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                {editingOption ? 'Edit Delivery Method' : 'Create Delivery Method'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Method Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Inside City Express Delivery"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shipping Fee ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={charge}
                  onChange={(e) => setCharge(e.target.value)}
                  placeholder="0.00 (Set 0 for Free Delivery)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Set to 0 to provide free shipping with this method.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Timeline / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Delivered safely within 24 to 48 hours"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={enabled ? 'true' : 'false'}
                    onChange={(e) => setEnabled(e.target.value === 'true')}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="true">Active (Enabled)</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  {editingOption ? 'Save Changes' : 'Create Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
