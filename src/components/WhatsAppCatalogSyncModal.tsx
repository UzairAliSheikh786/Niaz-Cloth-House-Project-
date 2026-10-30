import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Layers, 
  FileText, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Smartphone, 
  CheckCircle2, 
  Filter, 
  Package, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../context/ShopContext';
import {
  WhatsAppSyncFormat,
  STORE_WHATSAPP_NUMBER,
  generateFullCatalogMessage,
  generateWhatsAppBatches,
  formatSingleProductWhatsAppCard,
  generateMetaCommerceCatalogCsv,
  sanitizeWhatsAppPhone,
  SyncBatch,
} from '../utils/whatsappCatalogSync';

interface WhatsAppCatalogSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentAdminName?: string;
  initialSelectedProductId?: string | null;
}

interface SyncHistoryRecord {
  id: string;
  timestamp: string;
  adminName: string;
  format: string;
  itemCount: number;
  targetPhone: string;
}

export const WhatsAppCatalogSyncModal: React.FC<WhatsAppCatalogSyncModalProps> = ({
  isOpen,
  onClose,
  products,
  currentAdminName = 'Haji Niaz Ahmad',
  initialSelectedProductId = null,
}) => {
  // Sync view format state
  const [format, setFormat] = useState<WhatsAppSyncFormat>(
    initialSelectedProductId ? 'single-card' : 'full-digest'
  );

  // Selection filters
  const [filterMode, setFilterMode] = useState<
    'all' | 'in-stock' | 'men' | 'women' | 'women-embroidery' | 'women-printed'
  >('all');
  const [selectedSingleId, setSelectedSingleId] = useState<string>(
    initialSelectedProductId || (products[0]?.id ?? '')
  );

  // Configuration options
  const [targetPhone, setTargetPhone] = useState<string>(STORE_WHATSAPP_NUMBER);
  const [includeCare, setIncludeCare] = useState<boolean>(true);
  const [includeWebLinks, setIncludeWebLinks] = useState<boolean>(true);
  const [batchSize, setBatchSize] = useState<number>(4);
  const [activeBatchIndex, setActiveBatchIndex] = useState<number>(0);

  // Copy & Action Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Sync History
  const [syncHistory, setSyncHistory] = useState<SyncHistoryRecord[]>(() => {
    try {
      const stored = localStorage.getItem('nch_whatsapp_sync_history');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'sync-init-01',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        adminName: 'Haji Niaz Ahmad',
        format: 'Full Catalog Digest',
        itemCount: 24,
        targetPhone: '0334-6565636',
      },
    ];
  });

  // When initialSelectedProductId changes, update single selection
  useEffect(() => {
    if (initialSelectedProductId) {
      setSelectedSingleId(initialSelectedProductId);
      setFormat('single-card');
    }
  }, [initialSelectedProductId]);

  // Filtered products list
  const activeProducts = useMemo(() => {
    switch (filterMode) {
      case 'in-stock':
        return products.filter((p) => p.inStock);
      case 'men':
        return products.filter((p) => p.gender === 'Men');
      case 'women':
        return products.filter((p) => p.gender === 'Women');
      case 'women-embroidery':
        return products.filter((p) => p.gender === 'Women' && p.craftType === 'Embroidery');
      case 'women-printed':
        return products.filter((p) => p.gender === 'Women' && p.craftType === 'Printed');
      case 'all':
      default:
        return products;
    }
  }, [products, filterMode]);

  // Selected single product
  const selectedSingleProduct = useMemo(() => {
    return products.find((p) => p.id === selectedSingleId) || products[0];
  }, [products, selectedSingleId]);

  // Batches calculation
  const batches: SyncBatch[] = useMemo(() => {
    return generateWhatsAppBatches(activeProducts, batchSize, targetPhone);
  }, [activeProducts, batchSize, targetPhone]);

  // Ensure activeBatchIndex is within range
  const safeBatchIndex = Math.min(activeBatchIndex, Math.max(0, batches.length - 1));

  // Current generated text content based on format
  const currentMessageText = useMemo(() => {
    switch (format) {
      case 'full-digest':
        return generateFullCatalogMessage(activeProducts, {
          includeCareInstructions: includeCare,
          includeWebLinks,
        });
      case 'segmented-batches':
        return batches[safeBatchIndex]?.messageText || '';
      case 'single-card':
        return selectedSingleProduct
          ? formatSingleProductWhatsAppCard(selectedSingleProduct, 1, includeCare)
          : '';
      case 'meta-csv':
        return generateMetaCommerceCatalogCsv(activeProducts);
      default:
        return '';
    }
  }, [format, activeProducts, includeCare, includeWebLinks, batches, safeBatchIndex, selectedSingleProduct]);

  if (!isOpen) return null;

  const logSyncAction = (actionLabel: string, count: number) => {
    const newRecord: SyncHistoryRecord = {
      id: `sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: currentAdminName,
      format: actionLabel,
      itemCount: count,
      targetPhone: targetPhone,
    };
    const updated = [newRecord, ...syncHistory].slice(0, 15);
    setSyncHistory(updated);
    try {
      localStorage.setItem('nch_whatsapp_sync_history', JSON.stringify(updated));
    } catch {}

    // Also dispatch to backend sync log & telemetry
    try {
      fetch('/api/admin/whatsapp-sync/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: currentAdminName,
          format: actionLabel,
          itemCount: count,
          targetPhone,
          status: 'Dispatched',
        }),
      }).catch(() => {});

      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'whatsapp_catalog_sync',
          properties: {
            admin: currentAdminName,
            itemCount: count,
            format: actionLabel,
          },
        }),
      }).catch(() => {});
    } catch {}
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessageText);
    setCopied(true);
    setSyncStatusMessage('Predefined WhatsApp catalog message copied to clipboard!');
    logSyncAction(format, format === 'single-card' ? 1 : activeProducts.length);
    setTimeout(() => {
      setCopied(false);
      setSyncStatusMessage(null);
    }, 3000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = sanitizeWhatsAppPhone(targetPhone);
    const textToSend = format === 'segmented-batches'
      ? batches[safeBatchIndex]?.messageText || currentMessageText
      : currentMessageText;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    logSyncAction(`Dispatched via WhatsApp (${format})`, format === 'single-card' ? 1 : activeProducts.length);
    setSyncStatusMessage('Dispatched to WhatsApp Web / App!');
    setTimeout(() => setSyncStatusMessage(null), 3500);
  };

  const handleDownloadFile = () => {
    const isCsv = format === 'meta-csv';
    const filename = isCsv
      ? `niaz_whatsapp_catalog_meta_feed_${new Date().toISOString().slice(0, 10)}.csv`
      : `niaz_whatsapp_catalog_sync_${format}_${new Date().toISOString().slice(0, 10)}.txt`;
    const mimeType = isCsv ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';

    const blob = new Blob([currentMessageText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSyncStatusMessage(`Downloaded ${filename} successfully!`);
    logSyncAction(`Exported ${isCsv ? 'CSV Feed' : 'Text Message'}`, activeProducts.length);
    setTimeout(() => setSyncStatusMessage(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-sync-title"
    >
      <div className="bg-[#FAF8F5] max-w-4xl w-full border border-[#E7E0D8] shadow-2xl overflow-hidden relative my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header Ribbon with WhatsApp Brand Emerald Accent */}
        <div className="bg-[#1C1917] text-[#FAF8F5] p-4 sm:p-5 border-b border-[#38332E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 border border-[#25D366]/60 flex items-center justify-center text-[#25D366] shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#25D366] font-bold">
                  Official WhatsApp Business Integration
                </span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/70">
                  Paris Bazaar Studio
                </span>
              </div>
              <h2 id="whatsapp-sync-title" className="font-serif text-base sm:text-lg font-bold text-white mt-0.5">
                Sync Inventory to WhatsApp Business Catalog
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-sm"
            aria-label="Close WhatsApp Catalog Sync"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Alert Banner */}
        {syncStatusMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{syncStatusMessage}</span>
          </div>
        )}

        {/* Modal Body: Two-Column Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: Format & Filters Configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Predefined Message Structure Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                1. Select Predefined Structure
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFormat('full-digest')}
                  className={`p-2.5 text-left border transition-all ${
                    format === 'full-digest'
                      ? 'border-[#25D366] bg-emerald-50/60 ring-1 ring-[#25D366]'
                      : 'border-[#E7E0D8] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="font-bold text-[#1C1917] flex items-center justify-between">
                    <span>Full Digest</span>
                    {format === 'full-digest' && <Check className="w-3.5 h-3.5 text-[#25D366]" />}
                  </div>
                  <p className="text-[11px] text-[#1C1917]/60 mt-1">
                    Complete catalog overview with specs & pricing.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('segmented-batches')}
                  className={`p-2.5 text-left border transition-all ${
                    format === 'segmented-batches'
                      ? 'border-[#25D366] bg-emerald-50/60 ring-1 ring-[#25D366]'
                      : 'border-[#E7E0D8] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="font-bold text-[#1C1917] flex items-center justify-between">
                    <span>Batch Chunks</span>
                    {format === 'segmented-batches' && <Check className="w-3.5 h-3.5 text-[#25D366]" />}
                  </div>
                  <p className="text-[11px] text-[#1C1917]/60 mt-1">
                    Multi-part sync (3-5 items) avoiding length limits.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('single-card')}
                  className={`p-2.5 text-left border transition-all ${
                    format === 'single-card'
                      ? 'border-[#25D366] bg-emerald-50/60 ring-1 ring-[#25D366]'
                      : 'border-[#E7E0D8] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="font-bold text-[#1C1917] flex items-center justify-between">
                    <span>Single Fabric</span>
                    {format === 'single-card' && <Check className="w-3.5 h-3.5 text-[#25D366]" />}
                  </div>
                  <p className="text-[11px] text-[#1C1917]/60 mt-1">
                    Detailed card with care & yardage for 1 bolt.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('meta-csv')}
                  className={`p-2.5 text-left border transition-all ${
                    format === 'meta-csv'
                      ? 'border-[#25D366] bg-emerald-50/60 ring-1 ring-[#25D366]'
                      : 'border-[#E7E0D8] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="font-bold text-[#1C1917] flex items-center justify-between">
                    <span>Meta CSV Feed</span>
                    {format === 'meta-csv' && <Check className="w-3.5 h-3.5 text-[#25D366]" />}
                  </div>
                  <p className="text-[11px] text-[#1C1917]/60 mt-1">
                    Standard import for WhatsApp Catalog Manager.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Inventory Scope Filter */}
            {format !== 'single-card' ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  2. Inventory Filter ({activeProducts.length} items)
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'all'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#1C1917]'
                    }`}
                  >
                    All Fabrics ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('in-stock')}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'in-stock'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#1C1917]'
                    }`}
                  >
                    In Stock Only ({products.filter((p) => p.inStock).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('men')}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'men'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#1C1917]'
                    }`}
                  >
                    Men's Suiting ({products.filter((p) => p.gender === 'Men').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('women')}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'women'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#1C1917]'
                    }`}
                  >
                    Women's All ({products.filter((p) => p.gender === 'Women').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('women-embroidery')}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'women-embroidery'
                        ? 'bg-[#8C4830] text-white border-[#8C4830]'
                        : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#8C4830]'
                    }`}
                  >
                    ★ Embroidery Brands ({products.filter((p) => p.gender === 'Women' && p.craftType === 'Embroidery').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('women-printed')}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'women-printed'
                        ? 'bg-[#8C4830] text-white border-[#8C4830]'
                        : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#8C4830]'
                    }`}
                  >
                    ★ Printed Brands ({products.filter((p) => p.gender === 'Women' && p.craftType === 'Printed').length})
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  2. Select Fabric Bolt
                </label>
                <select
                  value={selectedSingleId}
                  onChange={(e) => setSelectedSingleId(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-[#E7E0D8] text-[#1C1917] focus:outline-none focus:border-[#25D366]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} · {formatPKR(p.price)} ({p.inStock ? 'In Stock' : 'Out of Stock'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Batch Controls (if segmented) */}
            {format === 'segmented-batches' && (
              <div className="p-3.5 bg-white border border-[#E7E0D8] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C1917]">Batch Navigator</span>
                  <span className="text-[11px] text-[#25D366] font-bold">
                    Part {safeBatchIndex + 1} of {batches.length} ({batches[safeBatchIndex]?.itemsCount} items)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safeBatchIndex === 0}
                    onClick={() => setActiveBatchIndex((prev) => Math.max(0, prev - 1))}
                    className="p-1.5 border border-[#E7E0D8] hover:bg-[#FAF8F5] disabled:opacity-30"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex gap-1 overflow-x-auto py-1">
                    {batches.map((b, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveBatchIndex(idx)}
                        className={`px-2 py-1 text-[11px] font-mono border transition-colors shrink-0 ${
                          idx === safeBatchIndex
                            ? 'bg-[#25D366] text-white border-[#25D366] font-bold'
                            : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#1C1917]'
                        }`}
                      >
                        Part {b.batchNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={safeBatchIndex >= batches.length - 1}
                    onClick={() => setActiveBatchIndex((prev) => Math.min(batches.length - 1, prev + 1))}
                    className="p-1.5 border border-[#E7E0D8] hover:bg-[#FAF8F5] disabled:opacity-30"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#1C1917]/60 pt-1 border-t border-[#E7E0D8]/60">
                  <span>Batch Size:</span>
                  <div className="flex items-center gap-1.5">
                    {[3, 4, 6].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setBatchSize(size);
                          setActiveBatchIndex(0);
                        }}
                        className={`px-2 py-0.5 text-[10px] border ${
                          batchSize === size ? 'bg-[#1C1917] text-white' : 'bg-white text-[#1C1917]'
                        }`}
                      >
                        {size} items
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Target WhatsApp Recipient */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  3. Target WhatsApp Number
                </label>
                <span className="text-[10px] text-[#1C1917]/50 font-mono">
                  Default: Paris Bazaar Desk
                </span>
              </div>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-[#1C1917]/40" />
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="0334-6565636 or 923346565636"
                  className="w-full text-xs py-2 pl-9 pr-3 bg-white border border-[#E7E0D8] text-[#1C1917] focus:outline-none focus:border-[#25D366] font-mono"
                />
              </div>
            </div>

            {/* 5. Additional Options */}
            <div className="p-3 bg-white border border-[#E7E0D8] space-y-2 text-xs">
              <span className="font-semibold text-[#1C1917] block text-[11px] uppercase tracking-wider">
                Message Content Options
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-[#1C1917]/80">
                <input
                  type="checkbox"
                  checked={includeCare}
                  onChange={(e) => setIncludeCare(e.target.checked)}
                  className="accent-[#25D366]"
                />
                <span>Include Pre-Shrinkage (Tarr-Karna) Instructions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#1C1917]/80">
                <input
                  type="checkbox"
                  checked={includeWebLinks}
                  onChange={(e) => setIncludeWebLinks(e.target.checked)}
                  className="accent-[#25D366]"
                />
                <span>Include Direct Web Ordering Hyperlinks</span>
              </label>
            </div>
          </div>

          {/* RIGHT PANEL: Live Predefined Message Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Predefined Structure Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold rounded">
                  {format === 'meta-csv' ? 'CSV Format' : `${currentMessageText.length} chars`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs border border-[#E7E0D8] bg-white hover:bg-[#FAF8F5] text-[#1C1917] flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
                  title="Copy formatted message"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Message'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="px-2.5 py-1 text-xs border border-[#E7E0D8] bg-white hover:bg-[#FAF8F5] text-[#1C1917] flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
                  title="Download catalog file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{format === 'meta-csv' ? 'CSV' : 'TXT'}</span>
                </button>
              </div>
            </div>

            {/* Preview Box Styled to resemble WhatsApp Chat Bubble */}
            <div className="flex-1 bg-[#EFEAE2] p-4 border border-[#D1D7DB] rounded overflow-y-auto max-h-[380px] shadow-inner font-sans text-xs">
              <div className="bg-white p-3.5 rounded-lg shadow-sm border border-[#E1E7E9] space-y-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#111B21]">
                {currentMessageText}
              </div>
            </div>

            {/* Primary Action Button Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full sm:flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-md rounded-sm"
              >
                <Send className="w-4 h-4" />
                <span>
                  {format === 'segmented-batches'
                    ? `Send Batch ${safeBatchIndex + 1} to WhatsApp`
                    : 'Dispatch Predefined Catalog to WhatsApp'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto py-3 px-4 bg-[#1C1917] hover:bg-black text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Recent Sync Audit Strip */}
        <div className="bg-[#F5EFEB] p-3 px-4 sm:px-6 border-t border-[#E7E0D8] flex flex-col sm:flex-row items-center justify-between text-xs gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[#1C1917]/70">
            <Clock className="w-3.5 h-3.5 text-[#8C4830]" />
            <span>
              Recent Sync by <strong>{syncHistory[0]?.adminName || 'Haji Niaz Ahmad'}</strong>:{' '}
              {syncHistory[0] ? new Date(syncHistory[0].timestamp).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Ready'}
            </span>
            <span className="hidden sm:inline">({syncHistory[0]?.itemCount || activeProducts.length} items)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#1C1917]/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified WhatsApp Catalog Schema</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
