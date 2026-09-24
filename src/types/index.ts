export interface StoreSettings {
  storeName: string;
  tagline?: string;
  description?: string;
  contactPhone: string;
  whatsappNumber: string;
  contactEmail?: string;
  enableCallButton: boolean;
  enableWhatsappButton: boolean;
  currencySymbol: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
  order: number;
  enabled: boolean;
  createdAt?: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  linkType: 'category' | 'product' | 'external' | 'none';
  linkTarget?: string;
  targetId?: string;
  order: number;
  enabled: boolean;
  createdAt?: string;
}

export interface ProductMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
}

export interface ProductCombo {
  name: string;
  extraPrice?: number;
  description?: string;
}

export interface ComboItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface CustomVariant {
  name: string;
  options: string[];
}

export interface ProductReview {
  id: string;
  name: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  description?: string;
  media: ProductMediaItem[];
  // Simplified Combo System:
  isCombo?: boolean;
  comboItems?: ComboItem[];
  regularPrice?: number;
  savingsAmount?: number;
  // Flexible optional dynamic variant configurations:
  colours?: string[];
  sizes?: string[];
  kgWeights?: string[];
  combos?: ProductCombo[];
  customVariants?: CustomVariant[];
  stock: number;
  inStock: boolean;
  isFeatured?: boolean;
  enabled: boolean;
  keywords?: string[];
  customReview?: {
    reviewerName?: string;
    rating: number;
    comment: string;
    date?: string;
  };
  reviews?: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryOption {
  id: string;
  name: string;
  description?: string;
  charge: number;
  estimatedDays?: string;
  order: number;
  enabled: boolean;
}

export interface CartItem {
  cartItemId: string; // Unique hash/ID for product + specific variant selections
  productId: string;
  productName: string;
  price: number;
  image: string;
  quantity: number;
  isCombo?: boolean;
  comboSummary?: string;
  selectedColour?: string;
  selectedSize?: string;
  selectedKg?: string;
  selectedCombo?: string;
  customSelections?: Record<string, string>;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  isCombo?: boolean;
  comboSummary?: string;
  selectedColour?: string;
  selectedSize?: string;
  selectedKg?: string;
  selectedCombo?: string;
  customSelections?: Record<string, string>;
}

export type OrderStatus = string;

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  optionalAddress?: string;
  items: OrderItemSnapshot[];
  deliveryOption: {
    id: string;
    name: string;
    charge: number;
  };
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status?: string;
  notes?: string;
  createdAt: string;
  createdAtTime: string;
  dateString: string;
  timestamp?: number;
}

export interface AdminUser {
  role: 'admin';
  name: string;
  email: string;
  token?: string;
}
