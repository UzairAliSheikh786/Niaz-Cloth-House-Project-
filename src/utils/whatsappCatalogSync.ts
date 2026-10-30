import { Product } from '../types';

export type WhatsAppSyncFormat = 'full-digest' | 'segmented-batches' | 'single-card' | 'meta-csv';

export interface WhatsAppSyncOptions {
  format: WhatsAppSyncFormat;
  filter: 'all' | 'in-stock' | 'men' | 'women' | 'selected';
  selectedIds?: string[];
  targetPhone?: string; // e.g. "923346565636"
  includeCareInstructions?: boolean;
  includeWebLinks?: boolean;
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

/**
 * Clean phone numbers to pure international digits without leading + or symbols
 */
export function sanitizeWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.slice(1);
  }
  return cleaned || STORE_WHATSAPP_NUMBER;
}

/**
 * Format a single product into WhatsApp's predefined catalog card structure
 */
export function formatSingleProductWhatsAppCard(product: Product, index?: number, includeCare = true): string {
  const stockEmoji = product.inStock ? '✅ *In Stock*' : '⚠️ *Low / Out of Stock*';
  const prefix = index !== undefined ? `${index}. ` : '';
  const priceFormatted = `PKR ${product.price.toLocaleString('en-PK')}`;

  const lines = [
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🧵 *${prefix}${product.title.toUpperCase()}*`,
    `• *SKU / Code:* \`${product.id}\``,
    product.brand ? `• *Brand / Mill:* *${product.brand}*` : null,
    product.craftType ? `• *Craft / Technique:* ${product.craftType}` : null,
    `• *Category:* ${product.gender}'s Unstitched ${product.fabric}`,
    `• *Season:* ${product.season || 'All-Season Drape'}`,
    `• *Price:* *${priceFormatted}* (Free Nationwide COD)`,
    `• *Yardage / Cut:* ${product.cutDetails.length} (${product.cutDetails.width})`,
    product.weightGrade ? `• *Weight Grade:* ${product.weightGrade}` : null,
    product.fabricWeight ? `• *Fabric Density:* ${product.fabricWeight}` : null,
    product.threadCount ? `• *Thread Count:* ${product.threadCount}` : null,
    product.weaveType ? `• *Weave Structure:* ${product.weaveType}` : null,
    `• *Available Shades:* ${product.color}`,
    `• *Stock Status:* ${stockEmoji}`,
    product.slug ? `• *Direct Order Link:* ${STORE_BASE_URL}/product/${product.slug}` : null,
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
  const timestamp = new Date().toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = new Date().toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const header = [
    `📦 *${STORE_NAME.toUpperCase()}*`,
    `🏛️ *WHATSAPP BUSINESS CATALOG INVENTORY SYNC*`,
    `📅 *Updated:* ${timestamp} at ${time}`,
    `📍 *Store:* ${STORE_ADDRESS}`,
    `📞 *Customer Desk:* +92 334 6565636`,
    `🌐 *Web Portal:* ${STORE_BASE_URL}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📊 *Total Unstitched Bolts Listed:* ${products.length} articles`,
    `🚚 *Delivery:* Cash on Delivery across Pakistan · Dispatch within 24h`,
  ].join('\n');

  const itemsText = products
    .map((p, idx) => formatSingleProductWhatsAppCard(p, idx + 1, options?.includeCareInstructions ?? false))
    .join('\n');

  const footer = [
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💡 *To Order via WhatsApp:*`,
    `Reply with the *SKU / Code* or *Title* along with your City & Delivery Address.`,
    `✨ *Niaz Cloth House — Pure Chinese Boski Silk & Egyptian Latha Cotton Since 1970.*`,
  ].join('\n');

  return `${header}\n\n${itemsText}\n\n${footer}`;
}

/**
 * Split products into WhatsApp-friendly batches to avoid message cutoff
 */
export function generateWhatsAppBatches(
  products: Product[],
  batchSize = 4,
  targetPhone = STORE_WHATSAPP_NUMBER
): SyncBatch[] {
  const totalBatches = Math.ceil(products.length / batchSize) || 1;
  const batches: SyncBatch[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const chunk = products.slice(i * batchSize, (i + 1) * batchSize);
    const batchNumber = i + 1;

    const header = [
      `📦 *${STORE_NAME} — CATALOG SYNC (PART ${batchNumber}/${totalBatches})*`,
      `📍 Shop # 166-C Paris Bazaar, Rawalpindi · Hotline: 0334-6565636`,
      `Showing items ${i * batchSize + 1} to ${Math.min((i + 1) * batchSize, products.length)} of ${products.length}`,
    ].join('\n');

    const body = chunk
      .map((p, idx) => formatSingleProductWhatsAppCard(p, i * batchSize + idx + 1, false))
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
 */
export function generateMetaCommerceCatalogCsv(products: Product[]): string {
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
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = products.map((p) => {
    const fullDesc = `${p.subtitle}. Genuine unstitched ${p.gender.toLowerCase()}'s ${p.fabric} bolt (${p.cutDetails.length}, ${p.cutDetails.width}). ${p.weightGrade || ''} ${p.weaveType || ''}. Care: ${p.care?.shrinkage || 'Pre-shrink before tailoring'}. Available at Niaz Cloth House, Paris Bazaar, Rawalpindi.`;

    const row = [
      escapeCsv(p.id),
      escapeCsv(p.title),
      escapeCsv(fullDesc),
      escapeCsv(p.inStock ? 'in stock' : 'out of stock'),
      escapeCsv('new'),
      escapeCsv(`${p.price} PKR`),
      escapeCsv(`${STORE_BASE_URL}/product/${p.slug || p.id}`),
      escapeCsv(p.primaryImage.startsWith('http') ? p.primaryImage : `${STORE_BASE_URL}${p.primaryImage}`),
      escapeCsv(p.brand || 'Niaz Cloth House'),
      escapeCsv('Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing'),
      escapeCsv('clothing'),
      escapeCsv(p.inStock ? 25 : 0),
      escapeCsv(p.originalPrice ? `${p.price} PKR` : ''),
    ];

    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
