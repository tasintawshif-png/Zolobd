import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Video,
  X,
  Upload,
  Check,
  Star,
  Layers,
  Sparkles,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Product, Category, ProductMediaItem, ProductCombo, CustomVariant } from '../../types';
import { AdminComboModal } from './AdminComboModal';
import { copyProductLinkToClipboard } from '../../services/urlService';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  currencySymbol: string;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  currencySymbol,
  onSaveProduct,
  onDeleteProduct
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'products' | 'combos'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combo Creator Modal State
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Product | null>(null);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  const handleCopyAdLink = async (productId: string) => {
    const success = await copyProductLinkToClipboard(productId);
    if (success) {
      setCopiedProductId(productId);
      setTimeout(() => setCopiedProductId(null), 2000);
    }
  };

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [oldPrice, setOldPrice] = useState<number | string>('');
  const [discount, setDiscount] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState<number | string>('20');
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [media, setMedia] = useState<ProductMediaItem[]>([]);

  // Dynamic Variant Builders
  const [enableColours, setEnableColours] = useState(false);
  const [coloursInput, setColoursInput] = useState('');

  const [enableSizes, setEnableSizes] = useState(false);
  const [sizesInput, setSizesInput] = useState('');

  const [enableKg, setEnableKg] = useState(false);
  const [kgInput, setKgInput] = useState('');

  const [enableCombos, setEnableCombos] = useState(false);
  const [combos, setCombos] = useState<ProductCombo[]>([]);
  const [newComboName, setNewComboName] = useState('');
  const [newComboPrice, setNewComboPrice] = useState<number | string>('');

  const [enableCustom, setEnableCustom] = useState(false);
  const [customVariants, setCustomVariants] = useState<CustomVariant[]>([]);
  const [customName, setCustomName] = useState('');
  const [customOptions, setCustomOptions] = useState('');

  // Product Review & Rating (Custom fake/featured review editable by admin)
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');

  // Media input helper
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setOldPrice('');
    setDiscount('');
    setDescription('');
    setStock('25');
    setInStock(true);
    setIsFeatured(false);
    setEnabled(true);
    setMedia([]);

    setEnableColours(false);
    setColoursInput('');

    setEnableSizes(false);
    setSizesInput('');

    setEnableKg(false);
    setKgInput('');

    setEnableCombos(false);
    setCombos([]);

    setEnableCustom(false);
    setCustomVariants([]);

    setReviewName('');
    setReviewRating(5);
    setReviewComment('');

    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setOldPrice(p.oldPrice || '');
    setDiscount(p.discount || '');
    setDescription(p.description || '');
    setStock(p.stock);
    setInStock(p.inStock);
    setIsFeatured(Boolean(p.isFeatured));
    setEnabled(p.enabled);
    setMedia(p.media || []);

    setReviewName(p.customReview?.reviewerName || '');
    setReviewRating(p.customReview?.rating || 5);
    setReviewComment(p.customReview?.comment || '');

    if (p.colours && p.colours.length > 0) {
      setEnableColours(true);
      setColoursInput(p.colours.join(', '));
    } else {
      setEnableColours(false);
      setColoursInput('');
    }

    if (p.sizes && p.sizes.length > 0) {
      setEnableSizes(true);
      setSizesInput(p.sizes.join(', '));
    } else {
      setEnableSizes(false);
      setSizesInput('');
    }

    if (p.kgWeights && p.kgWeights.length > 0) {
      setEnableKg(true);
      setKgInput(p.kgWeights.join(', '));
    } else {
      setEnableKg(false);
      setKgInput('');
    }

    if (p.combos && p.combos.length > 0) {
      setEnableCombos(true);
      setCombos(p.combos);
    } else {
      setEnableCombos(false);
      setCombos([]);
    }

    if (p.customVariants && p.customVariants.length > 0) {
      setEnableCustom(true);
      setCustomVariants(p.customVariants);
    } else {
      setEnableCustom(false);
      setCustomVariants([]);
    }

    setIsModalOpen(true);
  };

  // Add media URL or local file upload
  const handleAddMediaUrl = () => {
    if (!newMediaUrl.trim()) return;
    setMedia([
      ...media,
      {
        id: `m-${Date.now()}`,
        type: newMediaType,
        url: newMediaUrl.trim()
      }
    ]);
    setNewMediaUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to DataURL for immediate, 100% reliable zero-configuration preview and persistence
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setMedia(prev => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          type,
          url: result
        }
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
  };

  const handleAddCombo = () => {
    if (!newComboName.trim()) return;
    setCombos([
      ...combos,
      {
        name: newComboName.trim(),
        extraPrice: Number(newComboPrice) || 0
      }
    ]);
    setNewComboName('');
    setNewComboPrice('');
  };

  const handleAddCustomVariant = () => {
    if (!customName.trim() || !customOptions.trim()) return;
    const opts = customOptions.split(',').map(s => s.trim()).filter(Boolean);
    setCustomVariants([
      ...customVariants,
      {
        name: customName.trim(),
        options: opts
      }
    ]);
    setCustomName('');
    setCustomOptions('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number(price) <= 0) return;

    const cat = categories.find(c => c.id === categoryId);

    // Parse colours
    const parsedColours = enableColours
      ? coloursInput.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    // Parse sizes
    const parsedSizes = enableSizes
      ? sizesInput.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    // Parse KG
    const parsedKg = enableKg
      ? kgInput.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    // Combos
    const parsedCombos = enableCombos && combos.length > 0 ? combos : undefined;

    // Custom variants
    const parsedCustom = enableCustom && customVariants.length > 0 ? customVariants : undefined;

    const productPayload: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: name.trim(),
      categoryId,
      categoryName: cat?.name || 'General',
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      discount: discount ? Number(discount) : undefined,
      description: description.trim() || undefined,
      media: media.length > 0 ? media : [
        {
          id: 'm-default',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      colours: parsedColours && parsedColours.length > 0 ? parsedColours : undefined,
      sizes: parsedSizes && parsedSizes.length > 0 ? parsedSizes : undefined,
      kgWeights: parsedKg && parsedKg.length > 0 ? parsedKg : undefined,
      combos: parsedCombos,
      customVariants: parsedCustom,
      stock: Number(stock) || 0,
      inStock: Boolean(inStock),
      isFeatured: Boolean(isFeatured),
      enabled: Boolean(enabled),
      customReview: reviewComment.trim() ? {
        reviewerName: reviewName.trim() || 'Verified Customer',
        rating: Number(reviewRating) || 5,
        comment: reviewComment.trim(),
        date: editingProduct?.customReview?.date || new Date().toISOString().slice(0, 10)
      } : undefined,
      updatedAt: new Date().toISOString()
    };

    onSaveProduct(productPayload);
    setIsModalOpen(false);
  };

  const openCreateComboModal = () => {
    setEditingCombo(null);
    setIsComboModalOpen(true);
  };

  const openEditComboModal = (combo: Product) => {
    setEditingCombo(combo);
    setIsComboModalOpen(true);
  };

  // Filter products list
  const filteredProducts = products.filter(p => {
    if (typeFilter === 'combos' && !p.isCombo) return false;
    if (typeFilter === 'products' && p.isCombo) return false;
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const comboCount = products.filter(p => p.isCombo).length;
  const regularCount = products.filter(p => !p.isCombo).length;

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Product Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage single products, dynamic variants, inventory, and special combo packages.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openCreateComboModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Create Combo</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setTypeFilter('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'products'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Products ({regularCount})
          </button>
          <button
            onClick={() => setTypeFilter('combos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              typeFilter === 'combos'
                ? 'bg-orange-500 text-white shadow-2xs'
                : 'text-orange-700 hover:text-orange-900'
            }`}
          >
            <span>🔥 Combos</span>
            <span className="bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded-full text-[10px]">
              {comboCount}
            </span>
          </button>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by product name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 transition-colors"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table & Mobile Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-500">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Configured Attributes / Included Items</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400 font-medium">
                    No products or combos found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const img = p.media?.find(m => m.type === 'image')?.url || p.media?.[0]?.url;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt="" className="w-11 h-11 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                              {p.isCombo && (
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-2xs">
                                  🔥 COMBO
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-800">
                        {p.categoryName || 'N/A'}
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-slate-900">{currencySymbol}{p.price.toFixed(2)}</span>
                        {p.oldPrice && (
                          <span className="text-slate-400 line-through ml-1 text-[11px]">{currencySymbol}{p.oldPrice.toFixed(2)}</span>
                        )}
                        {p.savingsAmount ? (
                          <div className="text-[10px] font-bold text-emerald-700">
                            Save {currencySymbol}{p.savingsAmount.toFixed(2)}
                          </div>
                        ) : null}
                      </td>

                      {/* Configured Attributes Snapshot / Combo Included Items */}
                      <td className="p-4">
                        {p.isCombo && p.comboItems && p.comboItems.length > 0 ? (
                          <div className="space-y-1 max-w-sm">
                            <span className="text-[11px] font-bold text-orange-700 block">
                              📦 Includes {p.comboItems.length} products:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {p.comboItems.map((ci) => (
                                <span
                                  key={ci.productId}
                                  className="text-[10px] bg-orange-50 text-orange-900 border border-orange-200/80 px-2 py-0.5 rounded-md font-medium"
                                >
                                  {ci.productName} × {ci.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.colours?.length ? <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">Colours ({p.colours.length})</span> : null}
                            {p.sizes?.length ? <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px]">Sizes ({p.sizes.length})</span> : null}
                            {p.kgWeights?.length ? <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px]">KG ({p.kgWeights.length})</span> : null}
                            {p.combos?.length ? <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-800 rounded text-[10px]">Combos ({p.combos.length})</span> : null}
                            {p.customVariants?.length ? <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 rounded text-[10px]">Custom</span> : null}
                            {!p.colours?.length && !p.sizes?.length && !p.kgWeights?.length && !p.combos?.length && !p.customVariants?.length && (
                              <span className="text-slate-400 text-[10px]">No variants (Standard)</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`font-bold ${p.stock > 5 ? 'text-slate-800' : 'text-rose-600'}`}>
                          {p.stock} units
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {p.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Link for Facebook Ads */}
                          <button
                            onClick={() => handleCopyAdLink(p.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                              copiedProductId === p.id
                                ? 'bg-emerald-600 text-white'
                                : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-700'
                            }`}
                            title="Copy Direct Link for Facebook Ads"
                          >
                            {copiedProductId === p.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedProductId === p.id && (
                              <span className="absolute -top-7 right-0 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                                Copied!
                              </span>
                            )}
                          </button>

                          {/* View in Store (New Tab) */}
                          <a
                            href={`/?product=${encodeURIComponent(p.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                            title="Open Product in Store (New Tab)"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => p.isCombo ? openEditComboModal(p) : openEditModal(p)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                            title={p.isCombo ? "Edit Combo" : "Edit Product"}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900">
                {editingProduct ? 'Edit Product Configuration' : 'Create New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* Basic Fields */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Basic Information
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Strawberries"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs sm:text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs sm:text-sm outline-none bg-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Price ({currencySymbol}) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs sm:text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Old Price (Optional strikethrough)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs sm:text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Discount % (Optional)
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs sm:text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs sm:text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed description of taste, origin, nutritional facts..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 text-xs sm:text-sm outline-none resize-none"
                  />
                </div>
              </div>

              {/* Product Media Manager (Multiple images + Product Video) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                      Product Media Carousel (Images & Video)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Add multiple images. Videos will appear inside the product carousel with sound controls.
                    </p>
                  </div>
                </div>

                {/* Upload or URL Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as any)}
                    className="px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>

                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="Enter image or video URL..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleAddMediaUrl}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Add URL
                  </button>

                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept={newMediaType === 'image' ? 'image/*' : 'video/*'}
                      onChange={(e) => handleFileUpload(e, newMediaType)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Current Media Items Preview */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {media.map((m) => (
                    <div key={m.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                      {m.type === 'video' ? (
                        <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center text-[9px] font-bold">
                          <Video className="w-4 h-4 text-emerald-400 mb-0.5" />
                          <span>VIDEO</span>
                        </div>
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(m.id)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC VARIANTS SECTION - STRICTLY OPTIONAL! */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    Flexible Dynamic Variants Configuration
                  </h3>
                  <p className="text-[11px] text-emerald-700">
                    Enable ONLY the attributes that apply to this specific product. Products with no variants will show a streamlined view.
                  </p>
                </div>

                {/* Colour Variant Toggle */}
                <div className="border border-slate-200 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableColours}
                        onChange={(e) => setEnableColours(e.target.checked)}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span>Colour Options</span>
                    </label>
                  </div>
                  {enableColours && (
                    <div className="mt-2.5 space-y-2">
                      <input
                        type="text"
                        value={coloursInput}
                        onChange={(e) => setColoursInput(e.target.value)}
                        placeholder="Comma separated: Red, Blue, Green, Yellow, Black, White..."
                        className="w-full px-3 py-2 border rounded-xl text-xs outline-none bg-white"
                      />
                      {/* Quick Add Color Sample Circles */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-slate-500 font-semibold mr-1">Sample Circles:</span>
                        {[
                          { name: 'Red', color: '#ef4444' },
                          { name: 'Blue', color: '#3b82f6' },
                          { name: 'Green', color: '#10b981' },
                          { name: 'Yellow', color: '#eab308' },
                          { name: 'Black', color: '#0f172a' },
                          { name: 'White', color: '#ffffff' },
                          { name: 'Orange', color: '#f97316' },
                          { name: 'Purple', color: '#a855f7' },
                          { name: 'Pink', color: '#ec4899' },
                          { name: 'Brown', color: '#78350f' }
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              const curr = coloursInput.split(',').map(s => s.trim()).filter(Boolean);
                              if (!curr.includes(c.name)) {
                                setColoursInput(curr.length ? `${coloursInput.trim()}, ${c.name}` : c.name);
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 active:scale-95 transition-all cursor-pointer"
                            title={`Add ${c.name}`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full border border-black/15" style={{ background: c.color }} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Size Variant Toggle */}
                <div className="border border-slate-200 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableSizes}
                        onChange={(e) => setEnableSizes(e.target.checked)}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span>Size Options</span>
                    </label>
                  </div>
                  {enableSizes && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={sizesInput}
                        onChange={(e) => setSizesInput(e.target.value)}
                        placeholder="Comma separated: Small, Medium, Large, XL, Family Size"
                        className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* KG / Weight Variant Toggle */}
                <div className="border border-slate-200 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableKg}
                        onChange={(e) => setEnableKg(e.target.checked)}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span>KG / Weight / Unit Options</span>
                    </label>
                  </div>
                  {enableKg && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={kgInput}
                        onChange={(e) => setKgInput(e.target.value)}
                        placeholder="Comma separated: 250g, 500g, 1 kg, 2 kg, 5 kg pack"
                        className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Combo Offers Toggle - Simplified for Admin */}
                <div className="border border-slate-200 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableCombos}
                        onChange={(e) => setEnableCombos(e.target.checked)}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span>Combo Offers (Optional Packs)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Simple add</span>
                  </div>
                  {enableCombos && (
                    <div className="mt-2.5 space-y-2.5">
                      {/* Simple input row */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newComboName}
                          onChange={(e) => setNewComboName(e.target.value)}
                          placeholder="Combo name (e.g. 2 Pack, +Sauce, Family Box)"
                          className="flex-1 px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-600 bg-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={newComboPrice}
                            onChange={(e) => setNewComboPrice(e.target.value)}
                            placeholder={`Extra (${currencySymbol})`}
                            className="w-28 px-3 py-2 border rounded-xl text-xs outline-none focus:border-emerald-600 bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddCombo}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 shadow-xs cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      {/* Quick 1-Click Presets */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold mr-1">Presets:</span>
                        {[
                          { name: 'Buy 2 Get 1 Free', price: 0 },
                          { name: 'Double Pack (2x)', price: 4.99 },
                          { name: 'Family Combo Pack', price: 9.99 },
                          { name: '+ Cold Drink / Sauce', price: 1.50 }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setNewComboName(preset.name);
                              setNewComboPrice(preset.price || '');
                            }}
                            className="px-2 py-0.5 rounded-lg border border-dashed border-slate-300 text-[10px] text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 active:scale-95 transition-all cursor-pointer"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>

                      {/* Active Added Combos */}
                      {combos.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Added Combos ({combos.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {combos.map((c, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 pl-3 pr-2 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
                              >
                                <span>{c.name}</span>
                                <span className="text-emerald-700 font-black text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded">
                                  +{currencySymbol}{(c.extraPrice || 0).toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCombos(combos.filter((_, idx) => idx !== i))}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-white transition-colors cursor-pointer"
                                  title="Remove combo"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No combos added yet. Type a name and price above, or click a preset.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Variants Toggle */}
                <div className="border border-slate-200 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableCustom}
                        onChange={(e) => setEnableCustom(e.target.checked)}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span>Custom Variant (e.g. Marbling Grade, Roast Level)</span>
                    </label>
                  </div>
                  {enableCustom && (
                    <div className="mt-2.5 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Attribute Name (e.g. Grade)"
                          className="w-1/3 px-3 py-1.5 border rounded-xl text-xs"
                        />
                        <input
                          type="text"
                          value={customOptions}
                          onChange={(e) => setCustomOptions(e.target.value)}
                          placeholder="Options: A4, A5, Gold Reserve"
                          className="flex-1 px-3 py-1.5 border rounded-xl text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomVariant}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                        >
                          + Add
                        </button>
                      </div>

                      {customVariants.map((cv, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                          <span>{cv.name}: {cv.options.join(', ')}</span>
                          <button
                            type="button"
                            onClick={() => setCustomVariants(customVariants.filter((_, idx) => idx !== i))}
                            className="text-rose-500 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Product Review & Rating (Customer Feedback / Fake Reviews) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Product Review & Rating (Displayed at Bottom)
                    </h3>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold self-start sm:self-auto">
                    Admin Review & Star Rating
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reviewer Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Verified Customer or Nafis Ahmed"
                      className="w-full px-3.5 py-2 border rounded-xl text-xs outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rating (1 to 5 Stars)
                    </label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value={5}>★★★★★ 5 Stars (Excellent)</option>
                      <option value={4}>★★★★☆ 4 Stars (Very Good)</option>
                      <option value={3}>★★★☆☆ 3 Stars (Good)</option>
                      <option value={2}>★★☆☆☆ 2 Stars (Fair)</option>
                      <option value={1}>★☆☆☆☆ 1 Star (Poor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Review Text / Testimonial
                  </label>
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write a custom positive review/testimonial to display at the bottom of the product..."
                    className="w-full px-3.5 py-2 border rounded-xl text-xs outline-none focus:border-emerald-600 resize-none"
                  />
                </div>
              </div>

              {/* Visibility & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800">Visible in Store</span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800">In Stock</span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800">Featured Badge</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Admin Combo Creator / Editor Modal */}
      <AdminComboModal
        isOpen={isComboModalOpen}
        onClose={() => {
          setIsComboModalOpen(false);
          setEditingCombo(null);
        }}
        onSaveCombo={(comboProd) => {
          onSaveProduct(comboProd);
        }}
        existingProducts={products}
        categories={categories}
        currencySymbol={currencySymbol}
        editingCombo={editingCombo}
      />

    </div>
  );
};
