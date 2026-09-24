import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, X, Upload } from 'lucide-react';
import { Banner, Category, Product } from '../../types';

interface AdminBannersProps {
  banners: Banner[];
  categories: Category[];
  products: Product[];
  onSaveBanner: (banner: Banner) => void;
  onDeleteBanner: (id: string) => void;
  onReorderBanners?: (banners: Banner[]) => void;
}

export const AdminBanners: React.FC<AdminBannersProps> = ({
  banners,
  onSaveBanner,
  onDeleteBanner,
  onReorderBanners
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Simplified state: strictly the image, order, and enabled
  const [image, setImage] = useState('');
  const [order, setOrder] = useState<number | string>(1);
  const [enabled, setEnabled] = useState(true);

  const sortedBanners = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));

  const openCreateModal = () => {
    setEditingBanner(null);
    setImage('');
    setOrder(banners.length + 1);
    setEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setImage(b.image);
    setOrder(b.order);
    setEnabled(b.enabled);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image.trim()) return;

    const payload: Banner = {
      id: editingBanner?.id || `banner-${Date.now()}`,
      image: image.trim(),
      linkType: 'none',
      order: Number(order) || 1,
      enabled: Boolean(enabled)
    };

    onSaveBanner(payload);
    setIsModalOpen(false);
  };

  const handleMoveOrder = (banner: Banner, direction: 'up' | 'down') => {
    const currentIndex = sortedBanners.findIndex(b => b.id === banner.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedBanners.length) return;

    const list = [...sortedBanners];
    const temp = list[currentIndex];
    list[currentIndex] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    if (onReorderBanners) {
      onReorderBanners(reordered);
    } else {
      reordered.forEach(b => onSaveBanner(b));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Store Banners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Upload banner images to display in the customer homepage carousel.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner Image</span>
        </button>
      </div>

      {/* Banner Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedBanners.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No banners uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload a banner image to showcase promotions.</p>
          </div>
        ) : (
          sortedBanners.map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Banner Preview */}
              <div className="relative aspect-[21/9] bg-slate-900 overflow-hidden">
                <img
                  src={banner.image}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="font-bold text-emerald-400">#{index + 1}</span>
                  <span>Slide</span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      banner.enabled
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-500 text-white'
                    }`}
                  >
                    {banner.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Banner Controls */}
              <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(banner, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-20 disabled:pointer-events-none cursor-pointer text-slate-600 transition-opacity"
                    title="Move slide earlier"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(banner, 'down')}
                    disabled={index === sortedBanners.length - 1}
                    className="p-1.5 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-20 disabled:pointer-events-none cursor-pointer text-slate-600 transition-opacity"
                    title="Move slide later"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 ml-2 font-medium">
                    Order: <span className="text-slate-700 font-bold">{banner.order}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Change Image</span>
                  </button>
                  <button
                    onClick={() => onDeleteBanner(banner.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                {editingBanner ? 'Update Banner Image' : 'Upload New Banner Image'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* File Upload / Image Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Banner Image (Landscape recommended 21:9 or 16:9)
                </label>

                {image ? (
                  <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-slate-900 mb-3 group">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all text-center group mb-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Click to upload banner image</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Direct URL input fallback */}
                <div className="mt-2">
                  <span className="text-[11px] text-slate-400">Or paste an image URL directly:</span>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full mt-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Order and Status */}
              <div className="grid grid-cols-2 gap-4 pt-2">
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
                    Carousel Status
                  </label>
                  <select
                    value={enabled ? 'true' : 'false'}
                    onChange={(e) => setEnabled(e.target.value === 'true')}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Disabled (Hidden)</option>
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
                  disabled={!image.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  {editingBanner ? 'Save Banner' : 'Upload Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
