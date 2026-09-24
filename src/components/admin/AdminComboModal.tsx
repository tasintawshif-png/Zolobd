import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Upload,
  Image as ImageIcon,
  Check,
  Search,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Product, Category, ComboItem } from '../../types';

interface AdminComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCombo: (comboProduct: Product) => void;
  existingProducts: Product[];
  categories: Category[];
  currencySymbol: string;
  editingCombo?: Product | null;
}

export const AdminComboModal: React.FC<AdminComboModalProps> = ({
  isOpen,
  onClose,
  onSaveCombo,
  existingProducts,
  categories,
  currencySymbol,
  editingCombo
}) => {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [comboPrice, setComboPrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>('50');
  const [isFeatured, setIsFeatured] = useState(true);
  const [selectedItems, setSelectedItems] = useState<ComboItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Available standalone products (exclude combos)
  const standaloneProducts = useMemo(() => {
    return existingProducts.filter(p => !p.isCombo);
  }, [existingProducts]);

  // Filtered available products for picker
  const filteredAvailableProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return standaloneProducts;
    return standaloneProducts.filter(
      p => p.name.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q)
    );
  }, [standaloneProducts, productSearch]);

  // Initialize or reset form state
  useEffect(() => {
    if (!isOpen) return;

    if (editingCombo) {
      setName(editingCombo.name || '');
      const primaryImg =
        editingCombo.media?.find(m => m.type === 'image')?.url || editingCombo.media?.[0]?.url || '';
      setImageUrl(primaryImg);
      setCategoryId(editingCombo.categoryId || categories[0]?.id || '');
      setDescription(editingCombo.description || '');
      setComboPrice(editingCombo.price || '');
      setStock(editingCombo.stock ?? 50);
      setIsFeatured(editingCombo.isFeatured ?? true);
      setSelectedItems(editingCombo.comboItems || []);
    } else {
      setName('');
      setImageUrl('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setComboPrice('');
      setStock('50');
      setIsFeatured(true);
      setSelectedItems([]);
    }
    setProductSearch('');
    setErrorMessage('');
  }, [isOpen, editingCombo, categories]);

  if (!isOpen) return null;

  // Auto-calculated Regular Price
  const calculatedRegularPrice = selectedItems.reduce((acc, item) => {
    return acc + (item.price || 0) * (item.quantity || 1);
  }, 0);

  // Auto-calculated Savings & Discount
  const numComboPrice = Number(comboPrice) || 0;
  const savings = Math.max(0, calculatedRegularPrice - numComboPrice);
  const discountPercent =
    calculatedRegularPrice > 0 && numComboPrice > 0 && numComboPrice < calculatedRegularPrice
      ? Math.round(((calculatedRegularPrice - numComboPrice) / calculatedRegularPrice) * 100)
      : 0;

  // Add a product to the combo
  const handleAddProduct = (prod: Product) => {
    const existingIndex = selectedItems.findIndex(i => i.productId === prod.id);
    const prodImg = prod.media?.find(m => m.type === 'image')?.url || prod.media?.[0]?.url || '';

    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      // Add new item
      setSelectedItems(prev => [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          quantity: 1,
          price: prod.price,
          image: prodImg
        }
      ]);
    }

    // If combo image is empty, auto-fill with first selected product image
    if (!imageUrl && prodImg) {
      setImageUrl(prodImg);
    }
    setErrorMessage('');
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedItems(prev =>
      prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as ComboItem[]
    );
  };

  // Remove item
  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(i => i.productId !== productId));
  };

  // Image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Save & Publish
  const handleSaveAndPublish = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Please enter a combo name (e.g. 🔥 Family Combo).');
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMessage('Please select at least one product for this combo.');
      return;
    }

    if (numComboPrice <= 0) {
      setErrorMessage('Please enter a valid combo price greater than 0.');
      return;
    }

    const fallbackImg =
      imageUrl.trim() ||
      selectedItems[0]?.image ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

    const cat = categories.find(c => c.id === categoryId);

    const autoDescription =
      description.trim() ||
      `Includes: ${selectedItems.map(i => `${i.productName} × ${i.quantity}`).join(', ')}`;

    const comboPayload: Product = {
      id: editingCombo?.id || `combo-${Date.now()}`,
      name: name.trim(),
      categoryId: categoryId || categories[0]?.id || 'general',
      categoryName: cat?.name || 'Combos & Offers',
      price: numComboPrice,
      oldPrice: calculatedRegularPrice > numComboPrice ? calculatedRegularPrice : undefined,
      regularPrice: calculatedRegularPrice,
      savingsAmount: savings,
      discount: discountPercent > 0 ? discountPercent : undefined,
      description: autoDescription,
      media: [
        {
          id: `m-combo-${Date.now()}`,
          type: 'image',
          url: fallbackImg
        }
      ],
      isCombo: true,
      comboItems: selectedItems,
      stock: Number(stock) || 50,
      inStock: true,
      isFeatured: Boolean(isFeatured),
      enabled: true,
      createdAt: editingCombo?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveCombo(comboPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {editingCombo ? 'Edit Combo Offer' : 'Create New Combo Offer'}
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Combine existing products into one high-value combo package.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSaveAndPublish} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {errorMessage}
            </div>
          )}

          {/* Section 1: Combo Details */}
          <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-orange-600" />
              1. Combo Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Combo Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. 🔥 Family Combo or Weekly Breakfast Pack"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-orange-500 outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Combo Image */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Combo Image <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {imageUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-white shadow-2xs">
                    <img src={imageUrl} alt="Combo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0 bg-white">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="Enter image URL or select from products below..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500"
                  />
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3 h-3 text-orange-600" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    {selectedItems.length > 0 && !imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const firstImg = selectedItems[0]?.image;
                          if (firstImg) setImageUrl(firstImg);
                        }}
                        className="text-[11px] text-orange-600 hover:text-orange-700 font-bold underline"
                      >
                        Use 1st product photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Product Selection & Quantities */}
          <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                2. Select Included Products & Set Quantities
              </h3>
              <span className="text-xs font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                {selectedItems.length} Products in Combo
              </span>
            </div>

            {/* Selected Products Table / Card List */}
            {selectedItems.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center border border-dashed border-slate-300">
                <p className="text-xs text-slate-500 font-medium">
                  No products added to this combo yet. Click products from the list below to add them.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {selectedItems.map(item => (
                  <div
                    key={item.productId}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Unit: {currencySymbol}{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95 text-xs font-bold shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-extrabold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95 text-xs font-bold shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right w-20 flex-shrink-0">
                      <p className="text-xs font-extrabold text-slate-900">
                        {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove product from combo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Product Quick-Picker List */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase">
                  Click to Add Existing Products:
                </span>
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search product..."
                    className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredAvailableProducts.length === 0 ? (
                  <p className="col-span-2 text-center text-xs text-slate-400 py-4">
                    No products found matching "{productSearch}".
                  </p>
                ) : (
                  filteredAvailableProducts.map(p => {
                    const isSelected = selectedItems.some(i => i.productId === p.id);
                    const pImg = p.media?.find(m => m.type === 'image')?.url || p.media?.[0]?.url;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleAddProduct(p)}
                        className={`text-left p-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                            : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {pImg ? (
                            <img
                              src={pImg}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate leading-tight">{p.name}</p>
                            <span className="text-[10px] text-slate-500">
                              {currencySymbol}{p.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1 ${
                            isSelected
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-100 hover:bg-orange-100 text-slate-700'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Auto-Calculations */}
          <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-orange-200 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              3. Pricing & Auto-Calculated Savings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Regular Price (Auto) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Regular Price (Auto)
                </span>
                <p className="text-base sm:text-lg font-black text-slate-700">
                  {currencySymbol}{calculatedRegularPrice.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-400">Sum of included products</span>
              </div>

              {/* Combo Price (Admin Input) */}
              <div className="bg-white p-3.5 rounded-xl border-2 border-orange-400 shadow-xs">
                <label className="text-[10px] font-extrabold text-orange-700 uppercase block mb-1">
                  Combo Price <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={comboPrice}
                    onChange={e => setComboPrice(e.target.value)}
                    placeholder="e.g. 799"
                    className="w-full pl-6 pr-2 py-1 font-black text-base text-slate-900 outline-none"
                    required
                  />
                </div>
                <span className="text-[10px] text-orange-600 font-semibold">Entered by admin</span>
              </div>

              {/* You Save (Auto) */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">
                  You Save (Auto)
                </span>
                <p className="text-base sm:text-lg font-black text-emerald-700">
                  {currencySymbol}{savings.toFixed(2)}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">Customer savings</span>
              </div>

              {/* Discount % (Auto) */}
              <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                <span className="text-[10px] font-bold text-rose-700 uppercase block mb-1">
                  Discount (Auto)
                </span>
                <p className="text-base sm:text-lg font-black text-rose-600">
                  {discountPercent}% OFF
                </p>
                <span className="text-[10px] text-rose-500 font-medium">Auto calculated</span>
              </div>
            </div>

            {/* Inventory & Featured Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-orange-200/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Combo Available Stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="accent-orange-500 w-4 h-4 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Feature on Storefront (Hot Badge)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Publish Combo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
