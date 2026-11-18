import { Product } from '../types';

export type WhatsAppSyncFormat = 'full-digest' | 'segmented-batches' | 'single-card' | 'meta-csv';

export interface WhatsAppSyncOptions {
  format: WhatsAppSyncFormat;
  filter: 'all' | 'in-stock' | 'men' | 'women' | 'selected';
  selectedIds?: string[];
  targetPhone?: string; // e.g. "923346565636"
  includeCareInstructions?: boolean;
  includeWebLinks?: boolean;
  baseUrl?: string;
  batchIndex?: number;
  batchSize?: number;
}

export interface SyncBatch {
  batchNumber: number;
  totalBatches: number;
  itemsCount: number;
  messageText: string;
  encodedUrl: string;
}

export const STORE_WHATSAPP_NUMBER = '923346565636'; // 0334-6565636
export const STORE_ADDRESS = 'Shop # 166-C / # 170 Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi';
export const STORE_NAME = 'Niaz Cloth House (Since 1970)';
export const STORE_BASE_URL = 'https://nch.com';

export function getStoreBaseUrl(explicitBaseUrl?: string): string {
  if (explicitBaseUrl && explicitBaseUrl.trim()) {
    return explicitBaseUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return STORE_BASE_URL;
}

/**
 * Clean phone numbers to pure international digits without leading + or symbols
 */
export function sanitizeWhatsAppPhone(phone: string): string {
  let cleaned = String(phone || '').replace(/[^0-9]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.slice(1);
  }
  return cleaned || STORE_WHATSAPP_NUMBER;
}

/**
 * Format a single product into WhatsApp's predefined catalog card structure
 */
export function formatSingleProductWhatsAppCard(
  product: Product,
  index?: number,
  includeCare = true,
  includeWebLinks = true,
  baseUrl?: string
): string {
  const stockEmoji = product.inStock ? '✅ *In Stock*' : '⚠️ *Low / Out of Stock*';
  const prefix = index !== undefined ? `${index}. ` : '';
  const priceFormatted = `PKR ${product.price.toLocaleString('en-PK')}`;
  const resolvedBaseUrl = getStoreBaseUrl(baseUrl);
  const cutLength = product.cutDetails?.length || 'Standard Unstitched Cut';
  const cutWidth = product.cutDetails?.width || 'Standard Width';

  const lines = [
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🧵 *${prefix}${product.title.toUpperCase()}*`,
    `• *SKU / Code:* \`${product.id}\``,
    product.brand ? `• *Brand / Mill:* *${product.brand}*` : null,
    product.craftType ? `• *Craft / Technique:* ${product.craftType}` : null,
    `• *Category:* ${product.gender}'s Unstitched ${product.fabric}`,
    `• *Season:* ${product.season || 'All-Season Drape'}`,
    product.originalPrice && product.originalPrice > product.price
      ? `• *Price:* *${priceFormatted}* ~(PKR ${product.originalPrice.toLocaleString('en-PK')})~ (Free Nationwide COD)`
      : `• *Price:* *${priceFormatted}* (Free Nationwide COD)`,
    `• *Yardage / Cut:* ${cutLength} (${cutWidth})`,
    product.weightGrade ? `• *Weight Grade:* ${product.weightGrade}` : null,
    product.fabricWeight ? `• *Fabric Density:* ${product.fabricWeight}` : null,
    product.threadCount ? `• *Thread Count:* ${product.threadCount}` : null,
    product.weaveType ? `• *Weave Structure:* ${product.weaveType}` : null,
    `• *Available Shades:* ${product.color}`,
    `• *Stock Status:* ${stockEmoji}`,
    includeWebLinks && (product.slug || product.id)
      ? `• *Direct Order Link:* ${resolvedBaseUrl}/product/${product.slug || product.id}`
      : null,
  ].filter(Boolean);

  if (includeCare && product.care) {
    lines.push(
      `• *Pre-Shrinkage (Tarr-Karna):* ${product.care.shrinkage || 'Soak in plain cold water for 2 hours before tailoring.'}`
    );
  }

  return lines.join('\n');
}

/**
 * Generate full catalog message for WhatsApp Business
 */
export function generateFullCatalogMessage(products: Product[], options?: Partial<WhatsAppSyncOptions>): string {
  const resolvedBaseUrl = getStoreBaseUrl(options?.baseUrl);
  const includeCare = options?.includeCareInstructions ?? false;
  const includeLinks = options?.includeWebLinks ?? true;
  const displayPhone = options?.targetPhone || '+92 334 6565636';

  const timestamp = new Date().toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = new Date().toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const headerLines = [
    `📦 *${STORE_NAME.toUpperCase()}*`,
    `🏛️ *WHATSAPP BUSINESS CATALOG INVENTORY SYNC*`,
    `📅 *Updated:* ${timestamp} at ${time}`,
    `📍 *Store:* ${STORE_ADDRESS}`,
    `📞 *Customer Desk:* ${displayPhone}`,
    includeLinks ? `🌐 *Web Portal:* ${resolvedBaseUrl}` : null,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📊 *Total Unstitched Bolts Listed:* ${products.length} articles`,
    `🚚 *Delivery:* Cash on Delivery across Pakistan · Dispatch within 24h`,
  ].filter(Boolean);

  const itemsText = products
    .map((p, idx) => formatSingleProductWhatsAppCard(p, idx + 1, includeCare, includeLinks, resolvedBaseUrl))
    .join('\n');

  const footer = [
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💡 *To Order via WhatsApp:*`,
    `Reply with the *SKU / Code* or *Title* along with your City & Delivery Address.`,
    `✨ *Niaz Cloth House — Pure Chinese Boski Silk & Wash and Wear Suiting Since 1970.*`,
  ].join('\n');

  return `${headerLines.join('\n')}\n\n${itemsText}\n\n${footer}`;
}

/**
 * Split products into WhatsApp-friendly batches to avoid message cutoff
 */
export function generateWhatsAppBatches(
  products: Product[],
  batchSize = 4,
  targetPhone = STORE_WHATSAPP_NUMBER,
  options?: { includeCareInstructions?: boolean; includeWebLinks?: boolean; baseUrl?: string }
): SyncBatch[] {
  const resolvedBaseUrl = getStoreBaseUrl(options?.baseUrl);
  const includeCare = options?.includeCareInstructions ?? false;
  const includeLinks = options?.includeWebLinks ?? true;
  const totalBatches = Math.ceil(products.length / batchSize) || 1;
  const batches: SyncBatch[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const chunk = products.slice(i * batchSize, (i + 1) * batchSize);
    const batchNumber = i + 1;

    const header = [
      `📦 *${STORE_NAME} — CATALOG SYNC (PART ${batchNumber}/${totalBatches})*`,
      `📍 Shop # 166-C Paris Bazaar, Rawalpindi · Hotline: ${targetPhone}`,
      `Showing items ${chunk.length > 0 ? i * batchSize + 1 : 0} to ${Math.min((i + 1) * batchSize, products.length)} of ${products.length}`,
    ].join('\n');

    const body = chunk
      .map((p, idx) =>
        formatSingleProductWhatsAppCard(p, i * batchSize + idx + 1, includeCare, includeLinks, resolvedBaseUrl)
      )
      .join('\n');

    const footer = `\n━━━━━━━━━━━━━━━━━━━━━━━━\n📲 *Part ${batchNumber} of ${totalBatches}* · Reply to order any suit cut.`;
    const messageText = `${header}\n\n${body}${footer}`;

    const cleanPhone = sanitizeWhatsAppPhone(targetPhone);
    const encodedUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

    batches.push({
      batchNumber,
      totalBatches,
      itemsCount: chunk.length,
      messageText,
      encodedUrl,
    });
  }

  return batches;
}

/**
 * Generate Meta Commerce / WhatsApp Business Catalog standard CSV feed
 * Spec: id,title,description,availability,condition,price,link,image_link,brand,google_product_category,fb_product_category,quantity_to_sell_on_facebook,sale_price
 */
export function generateMetaCommerceCatalogCsv(products: Product[], baseUrl?: string): string {
  const resolvedBaseUrl = getStoreBaseUrl(baseUrl);
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
    'fb_product_category',
    'quantity_to_sell_on_facebook',
    'sale_price',
  ];

  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '').replace(/\r?\n/g, ' ');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = products.map((p) => {
    const cutLen = p.cutDetails?.length || 'Standard Unstitched Cut';
    const cutWidth = p.cutDetails?.width || 'Standard Width';
    const fullDesc = `${p.subtitle || p.title}. Genuine unstitched ${(p.gender || 'Unisex').toLowerCase()}'s ${p.fabric} bolt (${cutLen}, ${cutWidth}). ${p.weightGrade || ''} ${p.weaveType || ''}. Care: ${p.care?.shrinkage || 'Pre-shrink before tailoring'}. Available at Niaz Cloth House, Paris Bazaar, Rawalpindi.`.replace(/\s+/g, ' ').trim();

    const imagePath = p.primaryImage || '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
    const imageLink = imagePath.startsWith('http') ? imagePath : `${resolvedBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;

    const hasDiscount = Boolean(p.originalPrice && p.originalPrice > p.price);
    const regularPrice = hasDiscount ? `${p.originalPrice} PKR` : `${p.price} PKR`;
    const salePrice = hasDiscount ? `${p.price} PKR` : '';

    const row = [
      escapeCsv(p.id),
      escapeCsv(p.title),
      escapeCsv(fullDesc),
      escapeCsv(p.inStock ? 'in stock' : 'out of stock'),
      escapeCsv('new'),
      escapeCsv(regularPrice),
      escapeCsv(`${resolvedBaseUrl}/product/${p.slug || p.id}`),
      escapeCsv(imageLink),
      escapeCsv(p.brand || 'Niaz Cloth House'),
      escapeCsv('Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing'),
      escapeCsv('clothing'),
      escapeCsv(p.inStock ? 25 : 0),
      escapeCsv(salePrice),
    ];

    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
