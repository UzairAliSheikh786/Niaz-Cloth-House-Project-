export type Gender = 'Men' | 'Women' | 'Unisex';

export type FabricType = 
  | 'Wash & Wear'
  | 'Cotton'
  | 'Khaddar'
  | 'Lelan'
  | 'Boski'
  | 'Boski Silk'
  | 'Luxury Lawn'
  | 'Embroidered Chiffon'
  | 'Swiss Voile'
  | 'Silk Jacquard'
  | 'Handwoven Karandi';

export const MENS_FABRICS = [
  'Wash & Wear',
  'Cotton',
  'Khaddar',
  'Lelan',
  'Boski',
] as const;

export type MensFabric = (typeof MENS_FABRICS)[number];

export interface FabricCare {
  washing: string;
  shrinkage: string;
  ironing: string;
  preservation: string;
}

export interface ProductColorOption {
  name: string;
  hex: string;
  previewLabel?: string;
}

export interface ProductDesignOption {
  id: string;
  name: string;
  description: string;
  additionalPrice?: number;
}

export type FabricWeightCategory = 'Ultra-Lightweight' | 'Lightweight' | 'Medium Weight' | 'Heavy Weight';

export type ThreadCountCategory = 
  | 'Coarse / Traditional (30s-40s)' 
  | 'High Count (60s-80s)' 
  | 'Superfine (100s-120s)' 
  | 'Royal Grade (140s+)';

export type WeaveTypeCategory = 
  | 'Plain Weave' 
  | 'Sateen / Boski Weave' 
  | 'Cambric / Lawn Weave' 
  | 'Chiffon / Crepe Weave' 
  | 'Jacquard Weave' 
  | 'Handloom Textured Weave' 
  | 'Twill Weave';

export type WomenCraftType = 'Embroidery' | 'Printed';

export const WOMEN_EMBROIDERY_BRANDS = [
  'Johara',
  'Bin Rashid',
  'Safa Marwa',
  'Sana Noor',
  'Bonanza',
  'Krizma',
  'Tawakkal',
  'Bin Saeed',
  'Zam Zam',
  'Rana Arts',
  'Ghani Arts',
  'Sobia Waseem',
] as const;

export const WOMEN_PRINTED_BRANDS = [
  'Bin Saeed',
  'H.Z',
  'Safina',
  'Salina',
  'Rawayat',
  'Zam Zam',
  'Five Star',
  'Ajwa',
  'Al-Hamda',
  'Designer Classic',
] as const;

export type WomenEmbroideryBrand = (typeof WOMEN_EMBROIDERY_BRANDS)[number];
export type WomenPrintedBrand = (typeof WOMEN_PRINTED_BRANDS)[number];

export interface Product {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  gender: Gender;
  brand?: string; // Brand / Mill name (e.g. Johara, Bin Saeed, Tawakkal, Niaz Signature)
  craftType?: 'Embroidery' | 'Printed' | 'Plain / Solid' | 'Self-Dobby';
  fabric: FabricType;
  collection: string;
  season?: 'Summer' | 'Winter' | 'All Season';
  price: number;
  originalPrice?: number;
  inStock: boolean;
  featured: boolean;
  newArrival: boolean;
  rating: number;
  reviewsCount: number;
  primaryImage: string;
  galleryImages: string[];
  description: string;
  cutDetails: {
    length: string; // e.g. "4.5 Meters" or "3-Piece Unstitched"
    width: string;  // e.g. "54 inches (Double Width)"
    suitPieces?: string[]; // e.g. ["Embroidered Lawn Shirt (3m)", "Pure Chiffon Dupatta (2.5m)", "Dyed Trouser (2.5m)"]
  };
  weightGrade?: string; // e.g. "6-Pound Authentic", "Super 120s"
  fabricWeight?: string; // e.g. "Heavy Weight (220 GSM)"
  fabricWeightCategory?: FabricWeightCategory;
  threadCount?: string; // e.g. "Super 120s High Count"
  threadCountCategory?: ThreadCountCategory;
  weaveType?: string; // e.g. "Sateen / Boski Weave"
  weaveTypeCategory?: WeaveTypeCategory;
  color: string;
  colorHex: string;
  colorOptions?: ProductColorOption[];
  designOptions?: ProductDesignOption[];
  care: FabricCare;
  heritageNotes: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedColorHex?: string;
  selectedDesign?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered';

export interface CustomerDetails {
  fullName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  province?: string;
  country?: string;
  isInternational?: boolean;
  postalCode?: string;
  notes?: string;
}

export type PaymentMethod = 
  | 'Cash on Delivery' 
  | 'Online Payment Gateway (Debit/Credit Card)'
  | 'EasyPaisa' 
  | 'JazzCash' 
  | 'Direct Bank Transfer' 
  | 'WhatsApp Direct';

export interface OrderPaymentDetails {
  transactionId?: string;
  senderNumber?: string;
  accountTitle?: string;
  paidAt?: string;
  paymentStatus?: 'Pending Verification' | 'Paid' | 'COD';
  gatewayProvider?: 'PayFast 1Link' | 'PayMob' | 'Bank Alfalah' | 'CyberSource';
  cardBrand?: 'Visa' | 'Mastercard' | 'PayPak' | 'UnionPay';
  cardLast4?: string;
  cardholderName?: string;
  authCode?: string;
  gatewayReference?: string;
  receiptNumber?: string;
}

export interface Order {
  id: string;
  date: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentDetails?: OrderPaymentDetails;
}

export interface FilterState {
  gender: string;
  fabric: string;
  collection: string;
  season?: string;
  maxPrice: number;
  searchQuery: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'newest';
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  authorCity?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  createdAt: string; // ISO string
  verifiedBuyer?: boolean;
}

export interface NewsletterSubscriber {
  email: string;
  name?: string;
  subscribedAt: string; // ISO string
  source?: string;
}

export interface StorePromotion {
  id: string;
  title: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  address: string;
  announcementText: string;
  easypaisaNumber: string;
  easypaisaTitle: string;
  jazzcashNumber: string;
  jazzcashTitle: string;
  shippingFee: number;
  freeShippingThreshold: number;
  heroAnnouncement: string;
  promotions: StorePromotion[];
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Niaz Cloth House',
  tagline: 'Haute Couture Unstitched Fabrics · Established 1977',
  phone: '0334-6565636',
  whatsapp: '0334-6565636',
  address: 'Shop #170, Paris Bazaar, Committee Chowk, Rawalpindi, Pakistan',
  announcementText: 'Certified Pure Chinese Boski Silk & Authentic Pakistani Mill Unstitched Fabrics · Worldwide Shipping',
  easypaisaNumber: '0334-6565636',
  easypaisaTitle: 'Haji Niaz Ahmad / Niaz Cloth House',
  jazzcashNumber: '0334-6565636',
  jazzcashTitle: 'Haji Niaz Ahmad / Niaz Cloth House',
  shippingFee: 250,
  freeShippingThreshold: 5000,
  heroAnnouncement: 'Summer & Festive Unstitched Collections 2026',
  promotions: [],
};

