import React, { useState, useEffect } from 'react';
import {
  Product,
  Category,
  Banner,
  Order,
  DeliveryOption,
  StoreSettings,
  CartItem,
  AdminUser,
  OrderStatus
} from './types';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToBanners,
  subscribeToOrders,
  subscribeToDeliveryOptions,
  subscribeToSettings,
  saveProduct,
  deleteProduct,
  saveCategory,
  deleteCategory,
  reorderCategories,
  saveBanner,
  deleteBanner,
  reorderBanners,
  updateOrderStatus,
  deleteOrder,
  deleteAllOrders,
  saveDeliveryOption,
  deleteDeliveryOption,
  reorderDeliveryOptions,
  saveStoreSettings
} from './services/storeService';
import { seedDatabaseIfEmpty } from './services/dbService';
import { getAdminSession, logoutAdmin } from './services/authService';
import { exportOrdersToExcel } from './services/exportService';
import { useCart } from './context/CartContext';

// Customer Components
import { Header } from './components/customer/Header';
import { BannerCarousel } from './components/customer/BannerCarousel';
import { CategoryBar } from './components/customer/CategoryBar';
import { ProductCard } from './components/customer/ProductCard';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderSuccessModal } from './components/customer/OrderSuccessModal';
import { FloatingContactButtons } from './components/customer/FloatingContactButtons';
import { ProductSkeleton, BannerSkeleton } from './components/common/SkeletonLoader';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminBanners } from './components/admin/AdminBanners';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminDeliveryOptions } from './components/admin/AdminDeliveryOptions';
import { AdminSalesReport } from './components/admin/AdminSalesReport';
import { AdminSalesAnalytics } from './components/admin/AdminSalesAnalytics';
import { AdminSettings } from './components/admin/AdminSettings';

export function App() {
  // Mode: 'customer' | 'admin'
  const [appMode, setAppMode] = useState<'customer' | 'admin'>('customer');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => getAdminSession());

  // Firestore Real-Time Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'LuxeGrocer & Goods',
    tagline: 'Fresh organic produce, pantry essentials & gourmet delicacies',
    contactPhone: '+1 (800) 555-0199',
    enableCallButton: true,
    whatsappNumber: '+15550199000',
    enableWhatsappButton: true,
    currencySymbol: '$'
  });

  const [isLoading, setIsLoading] = useState(true);

  // Customer UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [detailModalProduct, setDetailModalProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const { cartItems, addToCart, clearPurchasedItems, setIsCartOpen } = useCart();

  // Initialize DB seeding and Real-Time Listeners
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    const initialize = async () => {
      await seedDatabaseIfEmpty();

      const uProducts = subscribeToProducts((data) => {
        setProducts(data);
        setIsLoading(false);
      });
      const uCategories = subscribeToCategories(setCategories);
      const uBanners = subscribeToBanners(setBanners);
      const uOrders = subscribeToOrders(setOrders);
      const uDelivery = subscribeToDeliveryOptions(setDeliveryOptions);
      const uSettings = subscribeToSettings((s) => {
        if (s) setSettings(s);
      });

      unsubs = [uProducts, uCategories, uBanners, uOrders, uDelivery, uSettings];
    };

    initialize();

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, []);

  // Sync page title with store name
  useEffect(() => {
    if (settings.storeName) {
      document.title = `${settings.storeName} - Premium Groceries & Goods`;
    }
  }, [settings.storeName]);

  // Handle banner clicks (e.g. jump to category)
  const handleBannerClick = (banner: Banner) => {
    if (banner.linkType === 'category' && banner.targetId) {
      setSelectedCategoryId(banner.targetId);
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (banner.linkType === 'product' && banner.targetId) {
      const prod = products.find(p => p.id === banner.targetId);
      if (prod) setDetailModalProduct(prod);
    }
  };

  // Direct Card Add To Cart
  const handleCardAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // If it is a combo, add the entire combo as ONE item directly
    if (product.isCombo) {
      const primaryImg = product.media?.find(m => m.type === 'image')?.url || product.media?.[0]?.url || '';
      const comboCartItem: CartItem = {
        cartItemId: `combo_${product.id}`,
        productId: product.id,
        productName: product.name,
        price: product.price,
        image: primaryImg,
        quantity: 1,
        isCombo: true,
        comboSummary: product.comboItems?.map(ci => `${ci.productName} × ${ci.quantity}`).join(', ')
      };
      addToCart(comboCartItem);
      setIsCartOpen(true);
      return;
    }

    // For regular products, navigate customer inside product details page
    setDetailModalProduct(product);
  };

  // Direct Card Buy Now
  const handleCardBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // For regular products, navigate customer inside product details page
    setDetailModalProduct(product);
  };

  // Modal Add To Cart
  const handleModalAddToCart = (item: CartItem) => {
    addToCart(item);
    setDetailModalProduct(null);
    setIsCartOpen(true);
  };

  // Modal Buy Now
  const handleModalBuyNow = (item: CartItem) => {
    setDetailModalProduct(null);
    setCheckoutItems([item]);
    setIsCheckoutOpen(true);
  };

  // Open Checkout from Cart Drawer
  const handleProceedCartCheckout = () => {
    setCheckoutItems([...cartItems]);
    setIsCheckoutOpen(true);
  };

  // Order Confirmed
  const handleOrderPlaced = (placedOrder: Order, purchasedItemIds: string[]) => {
    clearPurchasedItems(purchasedItemIds);
    setIsCheckoutOpen(false);
    setConfirmedOrder(placedOrder);
  };

  // Admin Logout
  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminUser(null);
    setAppMode('customer');
  };

  // Filter storefront products
  const activeProducts = products.filter((p) => {
    if (!p.enabled) return false;
    const matchesCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesName = p.name.toLowerCase().includes(q);
    const matchesCatName = p.categoryName?.toLowerCase().includes(q);
    const matchesDesc = p.description?.toLowerCase().includes(q);
    const matchesColour = p.colours?.some(c => c.toLowerCase().includes(q));
    const matchesSize = p.sizes?.some(s => s.toLowerCase().includes(q));
    const matchesKg = p.kgWeights?.some(k => k.toLowerCase().includes(q));

    return matchesCategory && (matchesName || matchesCatName || matchesDesc || matchesColour || matchesSize || matchesKg);
  });

  // Total orders count
  const totalOrderCount = orders.length;

  // Render Admin View
  if (appMode === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => setAdminUser(user)}
          onBackToStore={() => setAppMode('customer')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => setAdminTab(tab)}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onBackToStore={() => setAppMode('customer')}
        storeName={settings.storeName}
        orderCountNew={totalOrderCount}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            orders={orders}
            products={products}
            currencySymbol={settings.currencySymbol || '$'}
            onNavigateTab={(tab) => setAdminTab(tab)}
          />
        )}

        {adminTab === 'products' && (
          <AdminProducts
            products={products}
            categories={categories}
            currencySymbol={settings.currencySymbol || '$'}
            onSaveProduct={(p) => saveProduct(p)}
            onDeleteProduct={(id) => deleteProduct(id)}
          />
        )}

        {adminTab === 'categories' && (
          <AdminCategories
            categories={categories}
            onSaveCategory={(c) => saveCategory(c)}
            onDeleteCategory={(id) => deleteCategory(id)}
            onReorderCategories={(cats) => reorderCategories(cats)}
          />
        )}

        {adminTab === 'banners' && (
          <AdminBanners
            banners={banners}
            categories={categories}
            products={products}
            onSaveBanner={(b) => saveBanner(b)}
            onDeleteBanner={(id) => deleteBanner(id)}
            onReorderBanners={(b) => reorderBanners(b)}
          />
        )}

        {adminTab === 'orders' && (
          <AdminOrders
            orders={orders}
            currencySymbol={settings.currencySymbol || '$'}
            onExportExcel={() => exportOrdersToExcel(orders, `AllOrders_${Date.now()}.xlsx`, settings.currencySymbol || '$')}
            onDeleteOrder={async (id) => await deleteOrder(id)}
            onDeleteMultipleOrders={async (ids) => {
              await Promise.all(ids.map(id => deleteOrder(id)));
            }}
            onDeleteAllOrders={async () => await deleteAllOrders()}
          />
        )}

        {adminTab === 'delivery' && (
          <AdminDeliveryOptions
            deliveryOptions={deliveryOptions}
            currencySymbol={settings.currencySymbol || '$'}
            onSaveOption={(opt) => saveDeliveryOption(opt)}
            onDeleteOption={(id) => deleteDeliveryOption(id)}
            onReorderOptions={(opts) => reorderDeliveryOptions(opts)}
          />
        )}

        {adminTab === 'reports' && (
          <AdminSalesReport
            orders={orders}
            products={products}
            categories={categories}
            currencySymbol={settings.currencySymbol || '$'}
          />
        )}

        {adminTab === 'analytics' && (
          <AdminSalesAnalytics
            orders={orders}
            products={products}
            categories={categories}
            currencySymbol={settings.currencySymbol || '$'}
          />
        )}

        {adminTab === 'settings' && (
          <AdminSettings
            settings={settings}
            onSaveSettings={(s) => saveStoreSettings(s)}
            onResetCatalog={async () => {
              await seedDatabaseIfEmpty();
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // Render Customer View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Header */}
      <Header
        storeName={settings.storeName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdmin={() => setAppMode('admin')}
      />

      {/* Main Content */}
      <main className="flex-1 pb-24">
        
        {/* Banner Carousel */}
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            <BannerSkeleton />
          </div>
        ) : (
          <BannerCarousel
            banners={banners}
            onBannerClick={handleBannerClick}
          />
        )}

        {/* Categories Bar */}
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => setSelectedCategoryId(id)}
        />

        {/* Products Grid Section */}
        <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
          <div className="flex items-baseline justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedCategoryId
                  ? categories.find(c => c.id === selectedCategoryId)?.name || 'Category Goods'
                  : 'Handcrafted Goods & Harvest'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {searchQuery
                  ? `Showing results for "${searchQuery}" (${activeProducts.length} items)`
                  : 'Freshly harvested daily and delivered to your doorstep'}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
              {activeProducts.length} items
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : activeProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try clearing your search or switching to another category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId(null);
                }}
                className="mt-5 px-5 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                Show All Goods
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {activeProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  currencySymbol={settings.currencySymbol || '$'}
                  onOpenDetails={(p) => setDetailModalProduct(p)}
                  onAddToCart={handleCardAddToCart}
                  onBuyNow={handleCardBuyNow}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Customer Footer */}
      <footer className="bg-slate-900 text-white pt-12 pb-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                  {settings.storeName.charAt(0)}
                </div>
                <h3 className="font-extrabold text-lg text-white">{settings.storeName}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                {settings.description || settings.tagline || 'Experience the finest organic groceries, fresh farm produce, and artisanal pantry provisions.'}
              </p>
              <p className="text-xs text-emerald-400 font-semibold mt-3">
                Direct Delivery Helpline: {settings.contactPhone}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Customer Promise</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>• 100% Certified Fresh</li>
                <li>• Same-Day Local Dispatch</li>
                <li>• Secure Cash or Card on Delivery</li>
                <li>• Hassle-Free Freshness Guarantee</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Staff & Management</h4>
              <p className="text-xs text-slate-400 mb-3">
                Access product catalog and live order tracking.
              </p>
              <button
                onClick={() => setAppMode('admin')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors"
              >
                Open Admin Portal
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
            <p>Crafted with modern mobile-first design and real-time database synchronisation.</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {detailModalProduct && (
        <ProductDetailModal
          product={detailModalProduct}
          currencySymbol={settings.currencySymbol || '$'}
          isOpen={true}
          onClose={() => setDetailModalProduct(null)}
          onAddToCart={handleModalAddToCart}
          onBuyNow={handleModalBuyNow}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        currencySymbol={settings.currencySymbol || '$'}
        deliveryOptions={deliveryOptions}
        onProceedToCheckout={handleProceedCartCheckout}
        onOpenProductById={(id) => {
          const found = products.find(p => p.id === id);
          if (found) setDetailModalProduct(found);
        }}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && checkoutItems.length > 0 && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setIsCheckoutOpen(false)}
          items={checkoutItems}
          deliveryOptions={deliveryOptions}
          currencySymbol={settings.currencySymbol || '$'}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {/* Order Success Modal */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          currencySymbol={settings.currencySymbol || '$'}
          isOpen={true}
          onClose={() => setConfirmedOrder(null)}
        />
      )}

      {/* Floating Call & WhatsApp Contact Buttons */}
      <FloatingContactButtons settings={settings} />

    </div>
  );
}

export default App;
