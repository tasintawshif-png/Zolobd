import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
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

// Default initial settings
export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'LuxeGrocer & Organics',
  tagline: 'Farm Fresh, Organic & Gourmet Essentials',
  description: 'Your premier destination for handpicked organic produce, artisanal delicacies, and kitchen essentials delivered fresh to your door.',
  contactPhone: '+1 (800) 555-0199',
  whatsappNumber: '+18005550199',
  contactEmail: 'contact@luxegrocer.com',
  enableCallButton: true,
  enableWhatsappButton: true,
  currencySymbol: '$',
  updatedAt: new Date().toISOString()
};

// Seed Categories
export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-produce',
    name: 'Fresh Fruits & Berries',
    slug: 'fresh-fruits-berries',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
    icon: 'Apple',
    order: 1,
    enabled: true
  },
  {
    id: 'cat-veggies',
    name: 'Farm Fresh Vegetables',
    slug: 'farm-fresh-vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    icon: 'Carrot',
    order: 2,
    enabled: true
  },
  {
    id: 'cat-bakery',
    name: 'Artisan Bakery & Pantry',
    slug: 'artisan-bakery-pantry',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    icon: 'Wheat',
    order: 3,
    enabled: true
  },
  {
    id: 'cat-dairy',
    name: 'Dairy & Farm Eggs',
    slug: 'dairy-farm-eggs',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
    icon: 'Milk',
    order: 4,
    enabled: true
  },
  {
    id: 'cat-beverages',
    name: 'Cold-Pressed Juices',
    slug: 'cold-pressed-juices',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b7?auto=format&fit=crop&w=600&q=80',
    icon: 'GlassWater',
    order: 5,
    enabled: true
  },
  {
    id: 'cat-gourmet',
    name: 'Gourmet & Delicacies',
    slug: 'gourmet-delicacies',
    image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=600&q=80',
    icon: 'Sparkles',
    order: 6,
    enabled: true
  }
];

// Seed Banners
export const SEED_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'Spring Organic Harvest',
    subtitle: 'Crisp heirloom veggies and sweet picked berries direct from certified local farms',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    linkType: 'category',
    linkTarget: 'cat-produce',
    order: 1,
    enabled: true
  },
  {
    id: 'banner-2',
    title: 'Morning Sourdough & Cultured Butter',
    subtitle: 'Stone-ground sourdough bread baked fresh every 4 hours with farm butter',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=1600&q=80',
    linkType: 'category',
    linkTarget: 'cat-bakery',
    order: 2,
    enabled: true
  },
  {
    id: 'banner-3',
    title: 'Cold-Pressed Vitality Juices',
    subtitle: '100% pure organic juices with ginger, turmeric, greens & fresh citrus',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1600&q=80',
    linkType: 'category',
    linkTarget: 'cat-beverages',
    order: 3,
    enabled: true
  }
];

// Seed Delivery Options
export const SEED_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'del-express',
    name: 'Express Same-Day Delivery',
    description: 'Guaranteed delivery to your doorstep within 3-4 hours or by end of day',
    charge: 4.99,
    estimatedDays: 'Within 1 day (Today)',
    order: 1,
    enabled: true
  },
  {
    id: 'del-standard',
    name: 'Standard Priority Delivery',
    description: 'Chilled insulated delivery vehicle within 24-48 hours',
    charge: 2.49,
    estimatedDays: '1 - 2 business days',
    order: 2,
    enabled: true
  },
  {
    id: 'del-eco',
    name: 'Eco Saver Delivery',
    description: 'Bundled neighborhood route delivery with eco-friendly packaging',
    charge: 0.00,
    estimatedDays: '2 - 3 business days',
    order: 3,
    enabled: true
  }
];

// Seed Products with diverse dynamic attribute setups
export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-avocados',
    name: 'Organic Haas Avocados (Creamy & Ripe)',
    categoryId: 'cat-produce',
    categoryName: 'Fresh Fruits & Berries',
    price: 4.99,
    oldPrice: 6.49,
    discount: 23,
    description: 'Rich, buttery, naturally ripened Mexican Haas avocados. Perfect for silky guacamole, morning toast, or fresh salads. High in heart-healthy monounsaturated fats.',
    media: [
      {
        id: 'm1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
        title: 'Fresh Avocados'
      },
      {
        id: 'm2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=800&q=80',
        title: 'Sliced Ripe Avocado'
      },
      {
        id: 'm3',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
        title: 'Avocado Quality Inspection'
      }
    ],
    kgWeights: ['500g (3-4 pcs)', '1 kg (6-8 pcs)', '2.5 kg Family Basket'],
    combos: [
      { name: 'Guacamole Master Kit (Limes + Cilantro + Jalapeno included)', extraPrice: 3.50 },
      { name: 'Breakfast Trio (+ Sourdough + Organic Eggs)', extraPrice: 8.50 }
    ],
    stock: 45,
    inStock: true,
    isFeatured: true,
    enabled: true,
    customReview: {
      reviewerName: 'Farhana Yasmin (Verified Buyer)',
      rating: 5,
      comment: 'Super fresh and creamy avocados! Ripened just right and perfect for breakfast toast. Highly recommended.',
      date: 'Yesterday'
    },
    keywords: ['avocado', 'produce', 'healthy', 'guacamole', 'organic', 'fruit'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'prod-peppers',
    name: 'Sweet Hydroponic Bell Peppers',
    categoryId: 'cat-veggies',
    categoryName: 'Farm Fresh Vegetables',
    price: 3.49,
    oldPrice: 4.50,
    discount: 22,
    description: 'Crisp, juicy bell peppers grown pesticide-free in state-of-the-art hydroponic greenhouses. Sweet flavor with thick crunchy walls.',
    media: [
      {
        id: 'm4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
        title: 'Colorful Peppers'
      },
      {
        id: 'm5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80',
        title: 'Red Pepper Slice'
      }
    ],
    // Has BOTH Colour and KG variants!
    colours: ['Ruby Red', 'Golden Yellow', 'Emerald Green', 'Tricolor Medley'],
    kgWeights: ['250g', '500g', '1 kg'],
    stock: 60,
    inStock: true,
    isFeatured: true,
    enabled: true,
    customReview: {
      reviewerName: 'Tanvir Chowdhury',
      rating: 5,
      comment: 'Very crunchy and colorful. Excellent hydroponic quality with no blemishes.',
      date: '3 days ago'
    },
    keywords: ['bell pepper', 'capsicum', 'peppers', 'vegetables', 'salad', 'hydroponic'],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'prod-sourdough',
    name: 'Artisan Woodfired Sourdough Boule',
    categoryId: 'cat-bakery',
    categoryName: 'Artisan Bakery & Pantry',
    price: 5.99,
    oldPrice: 7.25,
    discount: 17,
    description: 'Naturally fermented over 36 hours with wild heirloom starter culture. Crisp blistered crust with an airy, chewy crumb.',
    media: [
      {
        id: 'm6',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
        title: 'Artisan Sourdough'
      },
      {
        id: 'm7',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        title: 'Warm Sourdough Slice'
      },
      {
        id: 'm8',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        title: 'Crust Crunch Demonstration'
      }
    ],
    // Has Sizes and Combo!
    sizes: ['Standard Boule (650g)', 'Mega Family Loaf (1.1kg)'],
    combos: [
      { name: 'Pantry Pair (+ French Salted Churned Butter)', extraPrice: 4.25 },
      { name: 'Brunch Box (+ Roasted Garlic Confit)', extraPrice: 5.00 }
    ],
    stock: 25,
    inStock: true,
    isFeatured: true,
    enabled: true,
    keywords: ['sourdough', 'bread', 'bakery', 'artisan', 'carbs'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'prod-berries',
    name: 'Organic Wild Forest Berry Medley',
    categoryId: 'cat-produce',
    categoryName: 'Fresh Fruits & Berries',
    price: 6.99,
    oldPrice: 8.50,
    discount: 18,
    description: 'Freshly harvested blend of sweet blueberries, wild blackberries, and fragrant raspberries. Packed with powerful antioxidants and polyphenols.',
    media: [
      {
        id: 'm9',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80',
        title: 'Wild Berries'
      },
      {
        id: 'm10',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=800&q=80',
        title: 'Blueberries and Raspberries'
      }
    ],
    sizes: ['Pint (250g)', 'Quart (500g)', 'Party Tub (1kg)'],
    combos: [
      { name: 'Smoothie Prep (+ Chia Seeds & Granola)', extraPrice: 3.90 }
    ],
    stock: 35,
    inStock: true,
    isFeatured: true,
    enabled: true,
    keywords: ['berries', 'strawberries', 'blueberries', 'fruit', 'organic', 'antioxidant'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'prod-eggs',
    name: 'Pasture-Raised Golden Yolk Eggs',
    categoryId: 'cat-dairy',
    categoryName: 'Dairy & Farm Eggs',
    price: 4.49,
    oldPrice: 5.50,
    discount: 18,
    description: 'Laid by free-range hens roaming certified green pastures with 108 sq ft of open land per bird. Rich deep amber yolks with exceptional flavor.',
    media: [
      {
        id: 'm11',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
        title: 'Pasture Eggs'
      },
      {
        id: 'm12',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
        title: 'Brown Eggs in Basket'
      }
    ],
    sizes: ['Carton of 6', 'Carton of 12 (Best Value)', 'Flat of 30'],
    stock: 50,
    inStock: true,
    isFeatured: false,
    enabled: true,
    keywords: ['eggs', 'pasture-raised', 'farm', 'dairy', 'breakfast', 'protein'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'prod-juice',
    name: 'Cold-Pressed Citrus Turmeric Elixir',
    categoryId: 'cat-beverages',
    categoryName: 'Cold-Pressed Juices',
    price: 5.25,
    oldPrice: 6.50,
    discount: 19,
    description: 'Raw cold-pressed blend of Valencia oranges, Meyer lemon, organic ginger root, Peruvian turmeric, and a hint of cayenne for metabolic vitality.',
    media: [
      {
        id: 'm13',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b7?auto=format&fit=crop&w=800&q=80',
        title: 'Citrus Juice Bottle'
      },
      {
        id: 'm14',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        title: 'Pouring Fresh Juice'
      }
    ],
    sizes: ['250ml Immunity Shot', '500ml Daily Bottle', '1000ml Family Carafe'],
    combos: [
      { name: 'Weekly Wellness Pack (6 x 500ml)', extraPrice: 22.00 }
    ],
    stock: 40,
    inStock: true,
    isFeatured: true,
    enabled: true,
    keywords: ['juice', 'citrus', 'turmeric', 'ginger', 'wellness', 'drink', 'immunity'],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'prod-honey',
    name: 'Raw Unfiltered Mountain Honeycomb',
    categoryId: 'cat-gourmet',
    categoryName: 'Gourmet & Delicacies',
    price: 14.99,
    oldPrice: 18.00,
    discount: 17,
    description: '100% natural pure honeycomb straight from high-altitude wildflower meadows. Sweet, fragrant, edible beeswax bursting with untouched wild honey nectar.',
    media: [
      {
        id: 'm15',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        title: 'Raw Honeycomb'
      }
    ],
    // Product with NO variants to strictly satisfy: "Product D: No variants"
    stock: 18,
    inStock: true,
    isFeatured: true,
    enabled: true,
    keywords: ['honey', 'honeycomb', 'raw', 'sweet', 'gourmet', 'natural'],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'prod-wagyu',
    name: 'A5 Miyazaki Wagyu Ribeye Steak',
    categoryId: 'cat-gourmet',
    categoryName: 'Gourmet & Delicacies',
    price: 49.99,
    oldPrice: 58.00,
    discount: 14,
    description: 'Genuine certified Japanese Miyazaki Wagyu ribeye steak with exquisite melt-in-your-mouth intramuscular marbling and sublime umami richness.',
    media: [
      {
        id: 'm16',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        title: 'Wagyu Ribeye'
      }
    ],
    kgWeights: ['250g Prime Portion', '400g Gourmet Cut', '800g Tomahawk Rib'],
    customVariants: [
      {
        name: 'Aging Selection',
        options: ['Fresh Wet Aged 21-Days', 'Traditional Dry Aged 35-Days']
      }
    ],
    stock: 12,
    inStock: true,
    isFeatured: false,
    enabled: true,
    keywords: ['wagyu', 'steak', 'meat', 'beef', 'gourmet', 'ribeye'],
    createdAt: new Date().toISOString()
  }
];

// Seed initial orders for immediate analytics and report demo
export const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-20260920-8472',
    customerName: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Apt 4B',
    optionalAddress: 'Leave on porch near green planter',
    items: [
      {
        productId: 'prod-avocados',
        name: 'Organic Haas Avocados (Creamy & Ripe)',
        price: 4.99,
        quantity: 2,
        selectedKg: '1 kg (6-8 pcs)',
        selectedCombo: 'Guacamole Master Kit (Limes + Cilantro + Jalapeno included)',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=80'
      },
      {
        productId: 'prod-sourdough',
        name: 'Artisan Woodfired Sourdough Boule',
        price: 5.99,
        quantity: 1,
        selectedSize: 'Standard Boule (650g)',
        image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=300&q=80'
      }
    ],
    deliveryOption: {
      id: 'del-express',
      name: 'Express Same-Day Delivery',
      charge: 4.99
    },
    subtotal: 19.47,
    deliveryCharge: 4.99,
    totalAmount: 24.46,
    status: 'delivered',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAtTime: '10:15 AM',
    dateString: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    timestamp: Date.now() - 86400000 * 2
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-20260921-9124',
    customerName: 'Marcus Vance',
    phone: '+1 (555) 987-6543',
    address: '120 Ocean Parkway, Suite 12',
    items: [
      {
        productId: 'prod-peppers',
        name: 'Sweet Hydroponic Bell Peppers',
        price: 3.49,
        quantity: 3,
        selectedColour: 'Tricolor Medley',
        selectedKg: '500g',
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=300&q=80'
      },
      {
        productId: 'prod-juice',
        name: 'Cold-Pressed Citrus Turmeric Elixir',
        price: 5.25,
        quantity: 2,
        selectedSize: '500ml Daily Bottle',
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b7?auto=format&fit=crop&w=300&q=80'
      }
    ],
    deliveryOption: {
      id: 'del-standard',
      name: 'Standard Priority Delivery',
      charge: 2.49
    },
    subtotal: 20.97,
    deliveryCharge: 2.49,
    totalAmount: 23.46,
    status: 'processing',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdAtTime: '02:30 PM',
    dateString: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    timestamp: Date.now() - 86400000
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-20260922-3519',
    customerName: 'Elena Rostova',
    phone: '+1 (555) 456-7890',
    address: '48 Pine Needle Way',
    optionalAddress: 'Call on arrival',
    items: [
      {
        productId: 'prod-honey',
        name: 'Raw Unfiltered Mountain Honeycomb',
        price: 14.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80'
      },
      {
        productId: 'prod-berries',
        name: 'Organic Wild Forest Berry Medley',
        price: 6.99,
        quantity: 2,
        selectedSize: 'Quart (500g)',
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=300&q=80'
      }
    ],
    deliveryOption: {
      id: 'del-express',
      name: 'Express Same-Day Delivery',
      charge: 4.99
    },
    subtotal: 28.97,
    deliveryCharge: 4.99,
    totalAmount: 33.96,
    status: 'new',
    createdAt: new Date().toISOString(),
    createdAtTime: '09:40 AM',
    dateString: new Date().toISOString().slice(0, 10),
    timestamp: Date.now()
  }
];

// Helper to seed Firestore if empty or missing any items
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, 'settings', 'global'), DEFAULT_SETTINGS);
    }

    const catSnap = await getDocs(collection(db, 'categories'));
    const existingCatIds = new Set(catSnap.docs.map(d => d.id));
    for (const cat of SEED_CATEGORIES) {
      if (!existingCatIds.has(cat.id)) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    const banSnap = await getDocs(collection(db, 'banners'));
    const existingBanIds = new Set(banSnap.docs.map(d => d.id));
    for (const b of SEED_BANNERS) {
      if (!existingBanIds.has(b.id)) {
        await setDoc(doc(db, 'banners', b.id), b);
      }
    }

    const delSnap = await getDocs(collection(db, 'deliveryOptions'));
    const existingDelIds = new Set(delSnap.docs.map(d => d.id));
    for (const d of SEED_DELIVERY_OPTIONS) {
      if (!existingDelIds.has(d.id)) {
        await setDoc(doc(db, 'deliveryOptions', d.id), d);
      }
    }

    const prodSnap = await getDocs(collection(db, 'products'));
    const existingProdIds = new Set(prodSnap.docs.map(d => d.id));
    for (const p of SEED_PRODUCTS) {
      if (!existingProdIds.has(p.id)) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    }

    const orderSnap = await getDocs(collection(db, 'orders'));
    const existingOrderIds = new Set(orderSnap.docs.map(d => d.id));
    for (const o of SEED_ORDERS) {
      if (!existingOrderIds.has(o.id)) {
        await setDoc(doc(db, 'orders', o.id), o);
      }
    }
  } catch (err) {
    console.warn('Auto-seed encountered non-fatal notice (likely network or offline mode):', err);
  }
}

export const seedDatabaseIfEmpty = seedInitialDataIfEmpty;
