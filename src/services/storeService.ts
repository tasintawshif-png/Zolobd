import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  StoreSettings,
  Category,
  Banner,
  Product,
  DeliveryOption,
  Order,
  OrderStatus
} from '../types';
import {
  DEFAULT_SETTINGS,
  SEED_CATEGORIES,
  SEED_BANNERS,
  SEED_PRODUCTS,
  SEED_DELIVERY_OPTIONS,
  SEED_ORDERS
} from './dbService';

// In-memory fallback caches if offline or initial load
let cachedSettings: StoreSettings = { ...DEFAULT_SETTINGS };
let cachedCategories: Category[] = [...SEED_CATEGORIES];
let cachedBanners: Banner[] = [...SEED_BANNERS];
let cachedProducts: Product[] = [...SEED_PRODUCTS];
let cachedDeliveryOptions: DeliveryOption[] = [...SEED_DELIVERY_OPTIONS];
let cachedOrders: Order[] = [...SEED_ORDERS];

/**
 * Recursively remove any `undefined` values from an object before saving to Firestore,
 * preventing "Unsupported field value: undefined" errors.
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanFirestoreData(item)) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// ================= SETTINGS =================
export function subscribeSettings(callback: (settings: StoreSettings) => void) {
  try {
    return onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as StoreSettings;
        cachedSettings = data;
        callback(data);
      } else {
        callback(cachedSettings);
      }
    }, (error) => {
      console.warn('Settings listener fallback:', error);
      callback(cachedSettings);
    });
  } catch {
    callback(cachedSettings);
    return () => {};
  }
}

export async function updateStoreSettings(settings: StoreSettings): Promise<void> {
  cachedSettings = { ...settings, updatedAt: new Date().toISOString() };
  try {
    await setDoc(doc(db, 'settings', 'global'), cleanFirestoreData(cachedSettings), { merge: true });
  } catch (err) {
    console.error('Error saving settings to firestore:', err);
  }
}

// ================= CATEGORIES =================
export function subscribeCategories(callback: (categories: Category[]) => void) {
  try {
    return onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Category[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as Category);
        });
        // Ensure default seed categories are preserved if not in db
        const idSet = new Set(list.map(c => c.id));
        SEED_CATEGORIES.forEach(sc => {
          if (!idSet.has(sc.id)) {
            list.push(sc);
            setDoc(doc(db, 'categories', sc.id), sc).catch(() => {});
          }
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        cachedCategories = list;
        callback(list);
      } else {
        callback(cachedCategories);
      }
    }, (err) => {
      console.warn('Categories listener error:', err);
      callback(cachedCategories);
    });
  } catch {
    callback(cachedCategories);
    return () => {};
  }
}

export async function saveCategory(category: Category): Promise<void> {
  const id = category.id || `cat-${Date.now()}`;
  const payload = { ...category, id };
  const idx = cachedCategories.findIndex(c => c.id === id);
  if (idx >= 0) {
    cachedCategories[idx] = payload;
  } else {
    cachedCategories.push(payload);
  }
  try {
    await setDoc(doc(db, 'categories', id), cleanFirestoreData(payload));
  } catch (err) {
    console.error('Error saving category to firestore:', err);
  }
}

export async function reorderCategories(newCategories: Category[]): Promise<void> {
  const updated = newCategories.map((c, idx) => ({ ...c, order: idx + 1 }));
  cachedCategories = updated;
  try {
    await Promise.all(
      updated.map(cat => setDoc(doc(db, 'categories', cat.id), cleanFirestoreData(cat)))
    );
  } catch (err) {
    console.error('Error reordering categories:', err);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  cachedCategories = cachedCategories.filter(c => c.id !== id);
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (err) {
    console.error('Error deleting category:', err);
  }
}

// ================= BANNERS =================
export function subscribeBanners(callback: (banners: Banner[]) => void) {
  try {
    return onSnapshot(collection(db, 'banners'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Banner[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as Banner);
        });
        // Ensure default seed banners are preserved if missing
        const idSet = new Set(list.map(b => b.id));
        SEED_BANNERS.forEach(sb => {
          if (!idSet.has(sb.id)) {
            list.push(sb);
            setDoc(doc(db, 'banners', sb.id), cleanFirestoreData(sb)).catch(() => {});
          }
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        cachedBanners = list;
        callback(list);
      } else {
        callback(cachedBanners);
      }
    }, (err) => {
      console.warn('Banners listener error:', err);
      callback(cachedBanners);
    });
  } catch {
    callback(cachedBanners);
    return () => {};
  }
}

export async function saveBanner(banner: Banner): Promise<void> {
  const id = banner.id || `banner-${Date.now()}`;
  const payload = { ...banner, id };
  const idx = cachedBanners.findIndex(b => b.id === id);
  if (idx >= 0) {
    cachedBanners[idx] = payload;
  } else {
    cachedBanners.push(payload);
  }
  try {
    await setDoc(doc(db, 'banners', id), cleanFirestoreData(payload));
  } catch (err) {
    console.error('Error saving banner:', err);
  }
}

export async function reorderBanners(newBanners: Banner[]): Promise<void> {
  const updated = newBanners.map((b, idx) => ({ ...b, order: idx + 1 }));
  cachedBanners = updated;
  try {
    await Promise.all(
      updated.map(banner => setDoc(doc(db, 'banners', banner.id), cleanFirestoreData(banner)))
    );
  } catch (err) {
    console.error('Error reordering banners:', err);
  }
}

export async function deleteBanner(id: string): Promise<void> {
  cachedBanners = cachedBanners.filter(b => b.id !== id);
  try {
    await deleteDoc(doc(db, 'banners', id));
  } catch (err) {
    console.error('Error deleting banner:', err);
  }
}

// ================= PRODUCTS =================
export function subscribeProducts(callback: (products: Product[]) => void) {
  try {
    return onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as Product);
        });
        const idSet = new Set(list.map(p => p.id));
        SEED_PRODUCTS.forEach(sp => {
          if (!idSet.has(sp.id)) {
            list.push(sp);
            setDoc(doc(db, 'products', sp.id), cleanFirestoreData(sp)).catch(() => {});
          }
        });
        cachedProducts = list;
        callback(list);
      } else {
        callback(cachedProducts);
      }
    }, (err) => {
      console.warn('Products listener error:', err);
      callback(cachedProducts);
    });
  } catch {
    callback(cachedProducts);
    return () => {};
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const id = product.id || `prod-${Date.now()}`;
  const payload = { ...product, id, updatedAt: new Date().toISOString() };
  const idx = cachedProducts.findIndex(p => p.id === id);
  if (idx >= 0) {
    cachedProducts[idx] = payload;
  } else {
    cachedProducts.push(payload);
  }
  try {
    await setDoc(doc(db, 'products', id), cleanFirestoreData(payload));
  } catch (err) {
    console.error('Error saving product:', err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  cachedProducts = cachedProducts.filter(p => p.id !== id);
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (err) {
    console.error('Error deleting product:', err);
  }
}

// ================= DELIVERY OPTIONS =================
export function subscribeDeliveryOptions(callback: (options: DeliveryOption[]) => void) {
  try {
    return onSnapshot(collection(db, 'deliveryOptions'), (snapshot) => {
      if (!snapshot.empty) {
        const list: DeliveryOption[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as DeliveryOption);
        });
        const idSet = new Set(list.map(d => d.id));
        SEED_DELIVERY_OPTIONS.forEach(sd => {
          if (!idSet.has(sd.id)) {
            list.push(sd);
            setDoc(doc(db, 'deliveryOptions', sd.id), cleanFirestoreData(sd)).catch(() => {});
          }
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        cachedDeliveryOptions = list;
        callback(list);
      } else {
        callback(cachedDeliveryOptions);
      }
    }, (err) => {
      console.warn('Delivery options listener error:', err);
      callback(cachedDeliveryOptions);
    });
  } catch {
    callback(cachedDeliveryOptions);
    return () => {};
  }
}

export async function saveDeliveryOption(option: DeliveryOption): Promise<void> {
  const id = option.id || `del-${Date.now()}`;
  const payload = { ...option, id };
  const idx = cachedDeliveryOptions.findIndex(d => d.id === id);
  if (idx >= 0) {
    cachedDeliveryOptions[idx] = payload;
  } else {
    cachedDeliveryOptions.push(payload);
  }
  try {
    await setDoc(doc(db, 'deliveryOptions', id), cleanFirestoreData(payload));
  } catch (err) {
    console.error('Error saving delivery option:', err);
  }
}

export async function reorderDeliveryOptions(newOptions: DeliveryOption[]): Promise<void> {
  const updated = newOptions.map((o, idx) => ({ ...o, order: idx + 1 }));
  cachedDeliveryOptions = updated;
  try {
    await Promise.all(
      updated.map(opt => setDoc(doc(db, 'deliveryOptions', opt.id), cleanFirestoreData(opt)))
    );
  } catch (err) {
    console.error('Error reordering delivery options:', err);
  }
}

export async function deleteDeliveryOption(id: string): Promise<void> {
  cachedDeliveryOptions = cachedDeliveryOptions.filter(d => d.id !== id);
  try {
    await deleteDoc(doc(db, 'deliveryOptions', id));
  } catch (err) {
    console.error('Error deleting delivery option:', err);
  }
}

// ================= ORDERS =================
export function subscribeOrders(callback: (orders: Order[]) => void) {
  try {
    return onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as Order);
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        cachedOrders = list;
        callback(list);
      } else {
        callback(cachedOrders);
      }
    }, (err) => {
      console.warn('Orders listener error:', err);
      callback(cachedOrders);
    });
  } catch {
    callback(cachedOrders);
    return () => {};
  }
}

export async function placeOrder(order: Omit<Order, 'id'>): Promise<Order> {
  const id = `ord-${Date.now()}`;
  const fullOrder: Order = {
    ...order,
    id,
    timestamp: Date.now()
  };

  cachedOrders.unshift(fullOrder);

  try {
    await setDoc(doc(db, 'orders', id), cleanFirestoreData(fullOrder));
  } catch (err) {
    console.error('Error saving order to firestore:', err);
  }

  return fullOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const idx = cachedOrders.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    cachedOrders[idx].status = status;
  }
  try {
    await updateDoc(doc(db, 'orders', orderId), { status });
  } catch (err) {
    console.error('Error updating order status:', err);
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  cachedOrders = cachedOrders.filter(o => o.id !== orderId);
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (err) {
    console.error('Error deleting order from firestore:', err);
  }
}

export async function deleteAllOrders(): Promise<void> {
  const toDelete = [...cachedOrders];
  cachedOrders = [];
  try {
    await Promise.all(toDelete.map(o => deleteDoc(doc(db, 'orders', o.id))));
  } catch (err) {
    console.error('Error deleting all orders from firestore:', err);
  }
}

// Convenient Named Aliases
export const subscribeToProducts = subscribeProducts;
export const subscribeToCategories = subscribeCategories;
export const subscribeToBanners = subscribeBanners;
export const subscribeToOrders = subscribeOrders;
export const subscribeToDeliveryOptions = subscribeDeliveryOptions;
export const subscribeToSettings = subscribeSettings;
export const saveStoreSettings = updateStoreSettings;
