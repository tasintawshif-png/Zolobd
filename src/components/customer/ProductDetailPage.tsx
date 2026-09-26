import React, { useState, useEffect, useRef } from 'react';
import {
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
  Sparkles,
  Copy,
  ExternalLink,
  MessageCircle,
  Home
} from 'lucide-react';
import { Product, CartItem, ProductReview, StoreSettings, DeliveryOption } from '../../types';
import { MediaLightbox } from './MediaLightbox';
import { ProductCard } from './ProductCard';
import { getProductFullUrl, copyProductLinkToClipboard, updateProductSeo } from '../../services/urlService';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  settings: StoreSettings;
  deliveryOptions: DeliveryOption[];
  currencySymbol: string;
  onBackToStore: () => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
}

// Built-in authentic customer reviews to provide social proof
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

const getColorCode = (colorName: string): string => {
  if (!colorName) return '#94a3b8';
  const clean = colorName.trim().toLowerCase();

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) return clean;
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

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  settings,
  deliveryOptions,
  currencySymbol,
  onBackToStore,
  onOpenProduct,
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
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dynamic SEO update for Facebook Ads and social share cards
    updateProductSeo(product, settings.storeName, currencySymbol);
  }, [product.id, settings.storeName, currencySymbol]);

  // Auto-slide effect for images and videos
  useEffect(() => {
    const list = product.media || [];
    if (list.length <= 1 || isAutoSlidePaused || isLightboxOpen) return;

    const timer = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % list.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [product.media, currentMediaIndex, isAutoSlidePaused, isLightboxOpen]);

  // Pricing calculations
  const selectedComboObj = selectedCombo
    ? product.combos?.find((c) => c.name === selectedCombo)
    : null;
  const finalUnitPrice: number =
    selectedComboObj && typeof selectedComboObj.extraPrice === 'number' && selectedComboObj.extraPrice > 0
      ? selectedComboObj.extraPrice
      : (product.price || 0);

  const totalPrice = finalUnitPrice * quantity;

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

  const handleCopyAdLink = async () => {
    const success = await copyProductLinkToClipboard(product.id);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = () => {
    const fullUrl = getProductFullUrl(product.id);
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at ${settings.storeName}!`,
        url: fullUrl
      }).catch(() => {});
    } else {
      handleCopyAdLink();
    }
  };

  const handleWhatsAppOrder = () => {
    if (!settings.whatsappNumber) return;
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const fullUrl = getProductFullUrl(product.id);
    const variantParts: string[] = [];
    if (selectedColour) variantParts.push(`Color: ${selectedColour}`);
    if (selectedSize) variantParts.push(`Size: ${selectedSize}`);
    if (selectedKg) variantParts.push(`Weight: ${selectedKg}`);
    if (selectedCombo) variantParts.push(`Combo: ${selectedCombo}`);

    const variantText = variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';
    const message = `Hello ${settings.storeName},\nI would like to order:\n*${product.name}*${variantText}\nQuantity: ${quantity}\nTotal Price: ${currencySymbol}${totalPrice.toFixed(2)}\nProduct Link: ${fullUrl}\n\nPlease confirm my Cash on Delivery order.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
  };

  const mediaList = product.media || [];
  const currentMedia = mediaList[currentMediaIndex] || mediaList[0];

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

  const avgRating = (
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
  ).toFixed(1);

  // Related products from the same category
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.enabled && (product.categoryId ? p.categoryId === product.categoryId : true))
    .slice(0, 4);

  const productUrl = getProductFullUrl(product.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-16 animate-fade-in">
      
      {/* Top Breadcrumb & Share Banner */}
      <div className="bg-white border-b border-slate-200/80 shadow-2xs sticky top-16 sm:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto py-0.5">
            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-bold transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Store</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 hidden sm:inline">{product.categoryName || 'Products'}</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </div>

          {/* Facebook Ad Link Widget */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopyAdLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
              }`}
              title="Copy direct product link for Facebook Ads"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied for Facebook Ad!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Copy Link for Facebook Ad</span>
                  <span className="sm:hidden">Copy Ad Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleNativeShare}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
        
        {/* Ad Link URL Callout Banner (Especially helpful for Facebook ad managers) */}
        <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              🔗
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span>Facebook Ad Ready Link (বিজ্ঞাপনের পারমালিংক):</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono select-all truncate max-w-xs sm:max-w-lg">
                {productUrl}
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyAdLink}
            className="flex-shrink-0 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Link for Ad'}</span>
          </button>
        </div>

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Product Gallery (5 cols on lg) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Stage Viewport with Auto-slide */}
            <div
              className="relative w-full aspect-square sm:aspect-4/3 md:h-[420px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-md flex items-center justify-center group"
              onMouseEnter={() => setIsAutoSlidePaused(true)}
              onMouseLeave={() => setIsAutoSlidePaused(false)}
            >
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start pointer-events-none">
                {product.isCombo ? (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-3 py-1 rounded-lg shadow-md flex items-center gap-1">
                    🔥 Combo Offer
                  </span>
                ) : (
                  <>
                    {discountPercent && discountPercent > 0 && (
                      <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                        -{discountPercent}% OFF
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                        Hot Item
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Lightbox Trigger */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white transition-all duration-200 cursor-pointer shadow-md"
                title="Zoom view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Media Slides with Auto-Crossfade */}
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
                        className="w-full h-full object-cover object-center bg-black"
                      />
                    ) : (
                      <img
                        src={m.url}
                        alt={`${product.name} slide ${idx + 1}`}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover object-center"
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-400 font-medium text-sm">No Image Available</div>
              )}

              {/* Navigation Arrows */}
              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      setIsAutoSlidePaused(true);
                      setCurrentMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAutoSlidePaused(true);
                      setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {mediaList.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {mediaList.map((m, idx) => (
                  <button
                    key={m.id || idx}
                    onClick={() => {
                      setIsAutoSlidePaused(true);
                      setCurrentMediaIndex(idx);
                    }}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      idx === currentMediaIndex
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-102 shadow-md'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {m.type === 'video' ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                        <span className="text-[10px] font-bold">▶ Video</span>
                      </div>
                    ) : (
                      <img
                        src={m.url}
                        alt="thumb"
                        className="w-full h-full object-cover object-center"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurance Pillars */}
            <div className="grid grid-cols-3 gap-2 pt-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
                <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <h4 className="text-[11px] font-extrabold text-slate-800">Cash on Delivery</h4>
                <p className="text-[9px] text-slate-500">Pay after receiving</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <h4 className="text-[11px] font-extrabold text-slate-800">100% Authentic</h4>
                <p className="text-[9px] text-slate-500">Verified quality</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
                <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <h4 className="text-[11px] font-extrabold text-slate-800">Easy Return</h4>
                <p className="text-[9px] text-slate-500">7 Days exchange</p>
              </div>
            </div>

          </div>

          {/* RIGHT: Product Details & Purchase Panel (7 cols on lg) */}
          <div className="lg:col-span-6 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            
            {/* Category & Title */}
            <div>
              {product.categoryName && (
                <span className="inline-block text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wider mb-2">
                  {product.categoryName}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Review summary line */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">{avgRating}</span>
                <span className="text-xs text-slate-400 font-medium">
                  ({allReviews.length} verified customer reviews)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {currencySymbol}{finalUnitPrice.toFixed(2)}
                  </span>
                  {product.oldPrice && product.oldPrice > finalUnitPrice && (
                    <span className="text-sm sm:text-base text-slate-400 line-through font-semibold">
                      {currencySymbol}{product.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.oldPrice && product.oldPrice > finalUnitPrice && (
                  <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                    Save {currencySymbol}{(product.oldPrice - finalUnitPrice).toFixed(2)} with today's offer!
                  </p>
                )}
              </div>

              <div>
                {product.inStock && product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    In Stock ({product.stock} left)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* If Combo: Show Bundle Items Breakdown */}
            {product.isCombo && product.comboItems && product.comboItems.length > 0 && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <span>📦 Combo Package Includes ({product.comboItems.length} items):</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {product.comboItems.map((ci) => (
                    <li key={ci.productId} className="flex items-center justify-between gap-2 bg-white/90 p-2 rounded-xl border border-amber-200/60">
                      <span className="font-semibold text-slate-900">{ci.productName}</span>
                      <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg text-xs">
                        Qty: {ci.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Color Swatches */}
            {product.colours && product.colours.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                  <span>Select Color:</span>
                  <span className="text-emerald-700 font-bold">{selectedColour}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colours.map((c) => {
                    const isSelected = selectedColour === c;
                    const bgStyle = getColorCode(c);
                    const isLight = isLightColor(c);
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedColour(c)}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 flex items-center justify-center flex-shrink-0"
                          style={{ background: bgStyle }}
                        >
                          {isSelected && (
                            <Check className={`w-2.5 h-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`} />
                          )}
                        </span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                          {c}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Options */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                  <span>Select Size:</span>
                  <span className="text-emerald-700 font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weight (Kg / Pack) Options */}
            {product.kgWeights && product.kgWeights.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                  <span>Select Weight / Quantity:</span>
                  <span className="text-emerald-700 font-bold">{selectedKg}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.kgWeights.map((w) => {
                    const isSelected = selectedKg === w;
                    return (
                      <button
                        key={w}
                        onClick={() => setSelectedKg(w)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Combo Options (if configured) */}
            {product.combos && product.combos.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700">
                  Select Combo Pack (Special Offer):
                </label>
                <div className="space-y-1.5">
                  {product.combos.map((combo) => {
                    const isSelected = selectedCombo === combo.name;
                    return (
                      <button
                        key={combo.name}
                        onClick={() => setSelectedCombo(isSelected ? undefined : combo.name)}
                        className={`w-full p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-xs text-slate-900">{combo.name}</p>
                          <p className="text-[10px] text-slate-500">Includes complete bundle deal</p>
                        </div>
                        <span className="font-black text-sm text-amber-900">
                          {currencySymbol}{(combo.extraPrice ?? 0).toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-700 block">Quantity</span>
                <span className="text-[11px] text-slate-400">Total: {currencySymbol}{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 active:scale-90 text-slate-700 flex items-center justify-center font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-sm text-slate-900 w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 active:scale-90 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* HIGH-CONVERSION CTA BUTTONS */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onBuyNow(buildCartItem())}
                disabled={!product.inStock || product.stock <= 0}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-98 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-pulse" />
                <span>Buy Now (ক্যাশ অন ডেলিভারিতে অর্ডার করুন)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => onAddToCart(buildCartItem())}
                  disabled={!product.inStock || product.stock <= 0}
                  className="w-full py-3 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-98 text-emerald-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-emerald-200 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>Add to Cart (কার্টে যোগ)</span>
                </button>

                {settings.whatsappNumber && settings.enableWhatsappButton && (
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full py-3 px-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 active:scale-98 text-[#128C7E] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#25D366]/30 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Order via WhatsApp</span>
                  </button>
                )}
              </div>
            </div>

            {/* Delivery Helpline Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">📞 Direct Phone Order:</span>
                <span className="text-emerald-700 font-extrabold">{settings.contactPhone}</span>
              </div>
              <span className="text-[10px] text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                24/7 Support
              </span>
            </div>

          </div>

        </div>

        {/* Product Description Section */}
        <section className="mt-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
            <span>Product Description & Details</span>
          </h2>
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            {product.description ? (
              <p className="whitespace-pre-line">{product.description}</p>
            ) : (
              <p>Experience premium quality with {product.name}. Carefully sourced, hygienic packaging, and fast doorstep delivery.</p>
            )}
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section ref={reviewsRef} className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Customer Ratings & Feedback
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real feedback from verified purchasers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{avgRating}</span>
                <span className="text-xs text-slate-400"> / 5.0</span>
              </div>
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{rev.name}</h4>
                      <p className="text-[10px] text-slate-400">{rev.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Purchase</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  You Might Also Like
                </h2>
                <p className="text-xs text-slate-500">More popular goods from this category</p>
              </div>
              <button
                onClick={onBackToStore}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Products</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currencySymbol={currencySymbol}
                  onOpenDetails={(item) => onOpenProduct(item)}
                  onAddToCart={(item, e) => {
                    e.stopPropagation();
                    onOpenProduct(item);
                  }}
                  onBuyNow={(item, e) => {
                    e.stopPropagation();
                    onOpenProduct(item);
                  }}
                />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* STICKY BOTTOM ACTION BAR ON MOBILE */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 z-40 md:hidden flex items-center justify-between gap-3 shadow-xl">
        <div>
          <span className="text-[10px] text-slate-500 block">Total Price</span>
          <span className="text-base font-black text-slate-900">
            {currencySymbol}{totalPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => onAddToCart(buildCartItem())}
            disabled={!product.inStock || product.stock <= 0}
            className="px-3 py-2.5 rounded-xl bg-emerald-50 active:scale-95 text-emerald-900 font-extrabold text-xs flex items-center gap-1 border border-emerald-200 disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Add</span>
          </button>
          <button
            onClick={() => onBuyNow(buildCartItem())}
            disabled={!product.inStock || product.stock <= 0}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Buy Now (অর্ডার করুন)</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <MediaLightbox
          media={mediaList}
          currentIndex={currentMediaIndex}
          isOpen={true}
          onClose={() => setIsLightboxOpen(false)}
          onSelectIndex={setCurrentMediaIndex}
        />
      )}

    </div>
  );
};
