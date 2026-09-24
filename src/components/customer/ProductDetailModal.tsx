import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShoppingBag,
  Zap,
  Plus,
  Minus,
  Maximize2,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Share2,
  Star,
  ThumbsUp,
  CheckCircle2,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';
import { Product, CartItem, ProductReview } from '../../types';
import { MediaLightbox } from './MediaLightbox';

interface ProductDetailModalProps {
  product: Product | null;
  currencySymbol: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
}

interface ProductDetailModalContentProps {
  product: Product;
  currencySymbol: string;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
}

// Built-in authentic customer reviews to provide social proof for all products
const DEFAULT_CUSTOMER_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    name: 'Sabbir Hossain',
    rating: 5,
    comment: 'The quality is fantastic! Arrived fresh, exceptionally well packaged, and delivered on time. Truly impressed with the service.',
    date: '2 days ago',
    verified: true
  },
  {
    id: 'rev-2',
    name: 'Nadia Sultana',
    rating: 5,
    comment: '100% authentic and accurate quantity. The entire ordering process was completely seamless. Ordering my weekly grocery here from now on!',
    date: '5 days ago',
    verified: true
  },
  {
    id: 'rev-3',
    name: 'Arifur Rahman',
    rating: 5,
    comment: 'Super fresh and neat packaging. Great value for money compared to the local stores.',
    date: '1 week ago',
    verified: true
  },
  {
    id: 'rev-4',
    name: 'Tahmina Khan',
    rating: 4,
    comment: 'Very satisfied with the purchase. Customer support via phone/WhatsApp was also polite and responsive.',
    date: '2 weeks ago',
    verified: true
  }
];

// Color matcher helper for circle swatches
const getColorCode = (colorName: string): string => {
  if (!colorName) return '#94a3b8';
  const clean = colorName.trim().toLowerCase();

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) {
    return clean;
  }
  if (clean.includes('tricolor') || clean.includes('multi') || clean.includes('rainbow') || clean.includes('medley')) {
    return 'linear-gradient(135deg, #ef4444 0%, #eab308 50%, #10b981 100%)';
  }
  if (clean.includes('red') || clean.includes('crimson') || clean.includes('ruby')) return '#ef4444';
  if (clean.includes('maroon') || clean.includes('burgundy') || clean.includes('wine')) return '#881337';
  if (clean.includes('blue') || clean.includes('azure')) return '#3b82f6';
  if (clean.includes('navy') || clean.includes('midnight')) return '#1e3a8a';
  if (clean.includes('sky')) return '#38bdf8';
  if (clean.includes('green') || clean.includes('emerald')) return '#10b981';
  if (clean.includes('dark green') || clean.includes('forest')) return '#065f46';
  if (clean.includes('lime') || clean.includes('mint')) return '#84cc16';
  if (clean.includes('yellow') || clean.includes('lemon')) return '#eab308';
  if (clean.includes('gold') || clean.includes('golden') || clean.includes('amber')) return '#f59e0b';
  if (clean.includes('orange') || clean.includes('tangerine') || clean.includes('peach')) return '#f97316';
  if (clean.includes('purple') || clean.includes('violet') || clean.includes('lavender')) return '#a855f7';
  if (clean.includes('pink') || clean.includes('rose') || clean.includes('blush') || clean.includes('magenta')) return '#ec4899';
  if (clean.includes('black') || clean.includes('charcoal') || clean.includes('onyx') || clean.includes('dark')) return '#0f172a';
  if (clean.includes('white') || clean.includes('cream') || clean.includes('ivory')) return '#ffffff';
  if (clean.includes('grey') || clean.includes('gray') || clean.includes('silver')) return '#94a3b8';
  if (clean.includes('brown') || clean.includes('chocolate') || clean.includes('coffee') || clean.includes('tan')) return '#78350f';
  if (clean.includes('teal') || clean.includes('cyan')) return '#14b8a6';
  if (clean.includes('copper') || clean.includes('bronze')) return '#b45309';

  return '#10b981';
};

const isLightColor = (color: string): boolean => {
  if (color.startsWith('linear-gradient')) return false;
  const c = color.toLowerCase();
  return c === '#ffffff' || c === '#eab308' || c === '#f59e0b' || c === '#38bdf8' || c.includes('white') || c.includes('cream');
};

const ProductDetailModalContent: React.FC<ProductDetailModalContentProps> = ({
  product,
  currencySymbol,
  onClose,
  onAddToCart,
  onBuyNow
}) => {
  // Selected variant state
  const [selectedColour, setSelectedColour] = useState<string | undefined>(
    product.colours && product.colours.length > 0 ? product.colours[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedKg, setSelectedKg] = useState<string | undefined>(
    product.kgWeights && product.kgWeights.length > 0 ? product.kgWeights[0] : undefined
  );
  const [selectedCombo, setSelectedCombo] = useState<string | undefined>(undefined);
  const [customSelections, setCustomSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.customVariants) {
      product.customVariants.forEach((v) => {
        if (v.options.length > 0) initial[v.name] = v.options[0];
      });
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isAutoSlidePaused, setIsAutoSlidePaused] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Auto-slide effect for images and videos in product detail modal
  useEffect(() => {
    const list = product.media || [];
    if (list.length <= 1 || isAutoSlidePaused || isLightboxOpen) return;

    const currentItem = list[currentMediaIndex];
    // Snappy auto-slide for both video and image (around 3.2s)
    const slideDuration = 3200;

    const timer = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % list.length);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [product.media, currentMediaIndex, isAutoSlidePaused, isLightboxOpen]);

  // Lock body scroll while modal is active and safely restore on unmount
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, []);

  // Sync state whenever product changes
  useEffect(() => {
    setSelectedColour(product.colours && product.colours.length > 0 ? product.colours[0] : undefined);
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    setSelectedKg(product.kgWeights && product.kgWeights.length > 0 ? product.kgWeights[0] : undefined);
    setSelectedCombo(undefined);

    const initial: Record<string, string> = {};
    if (product.customVariants) {
      product.customVariants.forEach((v) => {
        if (v.options.length > 0) initial[v.name] = v.options[0];
      });
    }
    setCustomSelections(initial);
    setQuantity(1);
    setCurrentMediaIndex(0);
  }, [product.id]);

  // Compute unit price: When a combo is selected, charge only the combo price! (Not added to base price)
  const selectedComboObj = selectedCombo
    ? product.combos?.find((c) => c.name === selectedCombo)
    : null;
  const finalUnitPrice: number = selectedComboObj && typeof selectedComboObj.extraPrice === 'number' && selectedComboObj.extraPrice > 0
    ? selectedComboObj.extraPrice
    : (product.price || 0);

  // Build cart item payload
  const buildCartItem = (): CartItem => {
    if (product.isCombo) {
      return {
        cartItemId: `combo_${product.id}`,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        isCombo: true,
        comboSummary: product.comboItems?.map(ci => `${ci.productName} × ${ci.quantity}`).join(', '),
        image: product.media?.find((m) => m.type === 'image')?.url || product.media?.[0]?.url || ''
      };
    }

    const variantIdComponents = [
      product.id,
      selectedColour || 'nc',
      selectedSize || 'ns',
      selectedKg || 'nkg',
      selectedCombo || 'ncombo',
      ...Object.entries(customSelections).map(([k, v]) => `${k}:${v}`)
    ];

    return {
      cartItemId: variantIdComponents.join('__'),
      productId: product.id,
      productName: product.name,
      price: finalUnitPrice,
      quantity,
      selectedColour,
      selectedSize,
      selectedKg,
      selectedCombo,
      customSelections: Object.keys(customSelections).length > 0 ? customSelections : undefined,
      image: product.media?.find((m) => m.type === 'image')?.url || product.media?.[0]?.url || ''
    };
  };

  const handleAddToCart = () => {
    onAddToCart(buildCartItem());
  };

  const handleBuyNow = () => {
    onBuyNow(buildCartItem());
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} at our store!`,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const mediaList = product.media || [];
  const currentMedia = mediaList[currentMediaIndex] || mediaList[0];

  // Calculate discount percentage
  const discountPercent =
    product.discount ||
    (product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null);

  // Combine admin custom review with default reviews
  const allReviews: ProductReview[] = [];
  if (product.customReview && product.customReview.comment) {
    allReviews.push({
      id: 'admin-review',
      name: product.customReview.reviewerName || 'Store Verified Customer',
      rating: product.customReview.rating || 5,
      comment: product.customReview.comment,
      date: product.customReview.date || 'Recent Verified Buyer',
      verified: true
    });
  }
  allReviews.push(...DEFAULT_CUSTOMER_REVIEWS);

  // Calculate average rating
  const avgRating = (
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
  ).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-fade-in">
      {/* Modal Dialog Card Container */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-4xl lg:max-w-5xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Sticky Top Header Navigation */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
              aria-label="Back to store"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>Back</span>
            </button>

            {product.categoryName && (
              <span className="hidden sm:inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                {product.categoryName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer relative"
              title="Share product"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8">
          
          {/* Top Product Section: Gallery + Purchase Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
            
            {/* LEFT COLUMN: Contained Media Carousel & Thumbnails */}
            <div className="space-y-3">
              {/* Main Viewport Container with Auto-slide */}
              <div
                className="relative w-full h-64 sm:h-80 md:h-[360px] bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center group shadow-xs"
                onMouseEnter={() => setIsAutoSlidePaused(true)}
                onMouseLeave={() => setIsAutoSlidePaused(false)}
              >
                
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
                  {discountPercent && discountPercent > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm uppercase tracking-wider">
                      Featured
                    </span>
                  )}
                </div>

                {/* Media Slides with Auto-Crossfade (Images + Videos) */}
                {mediaList.length > 0 ? (
                  mediaList.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center ${
                        idx === currentMediaIndex
                          ? 'opacity-100 z-1 pointer-events-auto'
                          : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      {m.type === 'video' ? (
                        <video
                          src={m.url}
                          controls
                          playsInline
                          autoPlay={idx === currentMediaIndex}
                          muted
                          onPlay={() => setIsAutoSlidePaused(true)}
                          onPause={() => setIsAutoSlidePaused(false)}
                          onEnded={() => {
                            setIsAutoSlidePaused(false);
                            setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
                          }}
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : (
                        <img
                          src={m.url}
                          alt={product.name}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          className="w-full h-full object-contain p-2 cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
                          onClick={() => setIsLightboxOpen(true)}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs">No media available</div>
                )}

                {/* Prev / Next Slide Arrows (if multiple media) */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1))
                      }
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 backdrop-blur-xs"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 backdrop-blur-xs"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Auto-Slide Indicator Dots */}
                {mediaList.length > 1 && (
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                    {mediaList.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentMediaIndex(dotIdx)}
                        className={`rounded-full transition-all cursor-pointer ${
                          dotIdx === currentMediaIndex
                            ? 'w-5 h-1.5 bg-emerald-400'
                            : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                        }`}
                        aria-label={`Slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Fullscreen Zoom Trigger */}
                {currentMedia && (
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute bottom-2.5 right-2.5 z-20 p-2 bg-black/40 hover:bg-black/70 text-white rounded-xl shadow-xs backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                    title="Expand Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>

              {/* Thumbnails Row */}
              {mediaList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {mediaList.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      onClick={() => setCurrentMediaIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer bg-slate-50 ${
                        idx === currentMediaIndex
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-102'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={m.url}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {m.type === 'video' && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white text-[9px] font-bold">
                          ▶
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Product Details, Pricing, Variants & Purchase */}
            <div className="space-y-4">
              
              {/* Top Meta: Stock Status & Rating Anchor */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {product.inStock && product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      In Stock ({product.stock} units)
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Rating Badge with scroll to reviews */}
                <button
                  onClick={scrollToReviews}
                  className="flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 transition-colors cursor-pointer"
                  title="Click to view verified customer reviews"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{avgRating}</span>
                  <span className="text-slate-400 font-medium">({allReviews.length} Reviews)</span>
                </button>
              </div>

              {/* Product Title */}
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                {product.name}
              </h1>

              {/* Pricing Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                    {currencySymbol}{finalUnitPrice.toFixed(2)}
                  </span>
                  {(product.regularPrice || product.oldPrice) && (product.regularPrice || product.oldPrice)! > product.price && (
                    <span className="text-sm sm:text-base text-slate-400 line-through font-semibold">
                      {currencySymbol}{(product.regularPrice || product.oldPrice)!.toFixed(2)}
                    </span>
                  )}
                </div>

                {product.savingsAmount ? (
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                    You Save {currencySymbol}{product.savingsAmount.toFixed(2)}
                  </span>
                ) : discountPercent && discountPercent > 0 && product.oldPrice ? (
                  <span className="text-xs font-extrabold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-lg border border-rose-200">
                    Save {currencySymbol}{(product.oldPrice - product.price).toFixed(2)} ({discountPercent}% OFF)
                  </span>
                ) : null}
              </div>

              {/* Combo Package Included Products Box */}
              {product.isCombo && product.comboItems && product.comboItems.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <span>📦 Included in this Combo:</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {product.comboItems.length} Products
                    </span>
                  </div>
                  <div className="divide-y divide-amber-200/60 bg-white rounded-xl border border-amber-200/70 overflow-hidden">
                    {product.comboItems.map((ci) => (
                      <div key={ci.productId} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {ci.image && (
                            <img src={ci.image} alt={ci.productName} className="w-9 h-9 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                          )}
                          <span className="font-bold text-slate-900 truncate">{ci.productName}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-slate-500 text-[11px]">{currencySymbol}{ci.price.toFixed(2)}</span>
                          <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg text-xs">
                            × {ci.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Regular Total Price:</span>
                      <span className="line-through text-slate-400 font-semibold">
                        {currencySymbol}{(product.regularPrice || product.oldPrice || product.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-orange-600">
                      <span>Combo Special Price:</span>
                      <span className="text-sm font-black text-slate-900">
                        {currencySymbol}{product.price.toFixed(2)}
                      </span>
                    </div>
                    {product.savingsAmount ? (
                      <div className="flex items-center justify-between font-extrabold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                        <span>You Save:</span>
                        <span>{currencySymbol}{product.savingsAmount.toFixed(2)}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Configurable Variants (Only for non-combo products) */}
              {!product.isCombo && (
              <div className="space-y-3.5 pt-1">
                
                {/* 1. Colours with Circle Sample Swatches */}
                {product.colours && product.colours.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Color: <span className="text-emerald-700 font-extrabold">{selectedColour}</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Select color sample</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colours.map((c) => {
                        const isSelected = selectedColour === c;
                        const colorCode = getColorCode(c);
                        const isLight = isLightColor(colorCode);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSelectedColour(c)}
                            className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-950 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs scale-102'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                            title={c}
                          >
                            {/* Circle sample (red circle, blue circle, etc.) */}
                            <span
                              className={`w-5 h-5 rounded-full shadow-2xs border border-black/15 flex items-center justify-center flex-shrink-0 transition-transform ${
                                isSelected ? 'scale-110 ring-1 ring-emerald-600' : ''
                              }`}
                              style={{ background: colorCode }}
                            >
                              {isSelected && (
                                <Check
                                  className={`w-3 h-3 ${isLight ? 'text-slate-900' : 'text-white'}`}
                                  strokeWidth={3}
                                />
                              )}
                            </span>
                            <span>{c}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Size: <span className="text-emerald-700 font-extrabold">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedSize === s
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Weight / KG */}
                {product.kgWeights && product.kgWeights.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Weight Option: <span className="text-emerald-700 font-extrabold">{selectedKg}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.kgWeights.map((kg) => (
                        <button
                          key={kg}
                          onClick={() => setSelectedKg(kg)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedKg === kg
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          {kg}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Combos - Ultra Simple One-Click Selector */}
                {product.combos && product.combos.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span className="text-xs font-black text-amber-950">Combo Offer (Optional)</span>
                      </div>
                      {selectedCombo ? (
                        <button
                          type="button"
                          onClick={() => setSelectedCombo(undefined)}
                          className="text-[10px] font-bold text-rose-600 hover:underline bg-white px-2 py-0.5 rounded-full border border-rose-200 cursor-pointer"
                        >
                          ✕ Cancel Combo
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Click to add</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {product.combos.map((combo) => {
                        const isSelected = selectedCombo === combo.name;
                        return (
                          <div
                            key={combo.name}
                            onClick={() => setSelectedCombo(isSelected ? undefined : combo.name)}
                            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-white border-emerald-600 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-600/30'
                                : 'bg-white/90 border-amber-100 hover:border-amber-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected ? '✓' : ''}
                              </span>
                              <span>{combo.name}</span>
                            </div>
                            <span className="text-xs font-black text-emerald-700 whitespace-nowrap ml-2">
                              +{currencySymbol}{(combo.extraPrice || 0).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Custom Variants */}
                {product.customVariants && product.customVariants.length > 0 && (
                  <div className="space-y-2">
                    {product.customVariants.map((custom) => (
                      <div key={custom.name}>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {custom.name}: <span className="text-emerald-700 font-extrabold">{customSelections[custom.name]}</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {custom.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setCustomSelections((prev) => ({ ...prev, [custom.name]: opt }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                customSelections[custom.name] === opt
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
              )}

              {/* Quantity Stepper & Desktop Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 active:scale-95 shadow-2xs cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-xs text-slate-900 w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((prev) => Math.min(product.stock || 99, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 active:scale-95 shadow-2xs cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || product.stock <= 0}
                    className={`py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95 ${
                      product.isCombo
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>{product.isCombo ? 'Add Combo to Cart' : 'Add to Basket'}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock || product.stock <= 0}
                    className={`py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-md ${
                      product.isCombo
                        ? 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>{product.isCombo ? 'Buy Combo Now' : 'Buy Now'}</span>
                  </button>
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Safe Checkout</span>
                </div>
              </div>

            </div>

          </div>

          {/* Product Description Section */}
          {product.description && (
            <div className="p-4 sm:p-6 bg-slate-50/70 rounded-2xl sm:rounded-3xl border border-slate-100 space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Product Information & Description</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* REVIEWS & RATINGS SECTION (At the very bottom of product card) */}
          <div ref={reviewsRef} className="pt-6 border-t border-slate-200/80 space-y-5">
            
            {/* Reviews Header & Score Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100/80">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Customer Feedback
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                  Verified Reviews & Ratings
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Authentic feedback from verified shoppers who ordered this product.
                </p>
              </div>

              {/* Big Star Score Pill */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs flex-shrink-0">
                <div className="text-center">
                  <span className="text-2xl font-black text-slate-900 block leading-none">
                    {avgRating}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">out of 5</span>
                </div>
                <div className="border-l border-slate-100 pl-3">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i <= Math.round(Number(avgRating))
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 block mt-0.5">
                    98% Recommended
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Custom Review (If configured for this product) */}
            {product.customReview && product.customReview.comment && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300/80 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {product.customReview.reviewerName ? product.customReview.reviewerName.charAt(0).toUpperCase() : '★'}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <span>{product.customReview.reviewerName || 'Store Verified Review'}</span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {product.customReview.date || 'Verified Buyer'}
                      </span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i <= (product.customReview?.rating || 5)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-10">
                  "{product.customReview.comment}"
                </p>
              </div>
            )}

            {/* Customer Reviews List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DEFAULT_CUSTOMER_REVIEWS.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-200 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center">
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">
                            {rev.name}
                          </span>
                          <span className="text-[9px] font-semibold text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified Buyer
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-snug">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {rev.date}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <ThumbsUp className="w-3 h-3" /> Helpful
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Sticky Mobile Bottom Floating Action Bar */}
        <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 sm:hidden shadow-lg flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">
              Total Price
            </span>
            <span className="text-base font-black text-emerald-700">
              {currencySymbol}{(finalUnitPrice * quantity).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-[240px]">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || product.stock <= 0}
              className={`flex-1 py-2 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 ${
                product.isCombo
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{product.isCombo ? 'Add Combo' : 'Add'}</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock || product.stock <= 0}
              className={`flex-1 py-2 px-2 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 disabled:opacity-50 ${
                product.isCombo ? 'bg-slate-900' : 'bg-emerald-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{product.isCombo ? 'Buy Combo' : 'Buy Now'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox for Zoom */}
      <MediaLightbox
        media={mediaList}
        currentIndex={currentMediaIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelectIndex={(idx) => setCurrentMediaIndex(idx)}
      />
    </div>
  );
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currencySymbol,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow
}) => {
  if (!isOpen || !product) return null;

  return (
    <ProductDetailModalContent
      product={product}
      currencySymbol={currencySymbol}
      onClose={onClose}
      onAddToCart={onAddToCart}
      onBuyNow={onBuyNow}
    />
  );
};
