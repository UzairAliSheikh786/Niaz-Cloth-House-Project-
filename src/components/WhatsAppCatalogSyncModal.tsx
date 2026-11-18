import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Send,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Link as LinkIcon,
  FileSpreadsheet,
} from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../context/ShopContext';
import {
  WhatsAppSyncFormat,
  STORE_WHATSAPP_NUMBER,
  getStoreBaseUrl,
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
  defaultWhatsAppNumber?: string;
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
  defaultWhatsAppNumber,
}) => {
  // Sync view format state
  const [format, setFormat] = useState<WhatsAppSyncFormat>(
    initialSelectedProductId ? 'single-card' : 'meta-csv'
  );

  // Selection filters
  const [filterMode, setFilterMode] = useState<
    'all' | 'in-stock' | 'men' | 'women' | 'women-embroidery' | 'women-printed'
  >('all');
  const [selectedSingleId, setSelectedSingleId] = useState<string>(
    initialSelectedProductId || (products[0]?.id ?? '')
  );

  // Configuration options
  const [targetPhone, setTargetPhone] = useState<string>(
    defaultWhatsAppNumber || STORE_WHATSAPP_NUMBER
  );
  const [includeCare, setIncludeCare] = useState<boolean>(true);
  const [includeWebLinks, setIncludeWebLinks] = useState<boolean>(true);
  const [batchSize, setBatchSize] = useState<number>(4);
  const [activeBatchIndex, setActiveBatchIndex] = useState<number>(0);

  // Copy & Action Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedFeedUrl, setCopiedFeedUrl] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  const liveBaseUrl = useMemo(() => getStoreBaseUrl(), []);
  const liveFeedUrl = `${liveBaseUrl}/api/catalog/whatsapp.csv`;

  // Sync History
  const [syncHistory, setSyncHistory] = useState<SyncHistoryRecord[]>(() => {
    try {
      const stored = localStorage.getItem('nch_whatsapp_sync_history');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Sync props when modal opens or product selection changes
  useEffect(() => {
    if (!isOpen) return;
    if (initialSelectedProductId) {
      setSelectedSingleId(initialSelectedProductId);
      setFormat('single-card');
    } else if (!selectedSingleId && products[0]?.id) {
      setSelectedSingleId(products[0].id);
    }
  }, [isOpen, initialSelectedProductId, products, selectedSingleId]);

  useEffect(() => {
    if (defaultWhatsAppNumber) {
      setTargetPhone(defaultWhatsAppNumber);
    }
  }, [defaultWhatsAppNumber]);

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
    return generateWhatsAppBatches(activeProducts, batchSize, targetPhone, {
      includeCareInstructions: includeCare,
      includeWebLinks,
      baseUrl: liveBaseUrl,
    });
  }, [activeProducts, batchSize, targetPhone, includeCare, includeWebLinks, liveBaseUrl]);

  // Ensure activeBatchIndex is within range
  const safeBatchIndex = Math.min(activeBatchIndex, Math.max(0, batches.length - 1));

  // Current generated text content based on format
  const currentMessageText = useMemo(() => {
    switch (format) {
      case 'full-digest':
        return generateFullCatalogMessage(activeProducts, {
          includeCareInstructions: includeCare,
          includeWebLinks,
          targetPhone,
          baseUrl: liveBaseUrl,
        });
      case 'segmented-batches':
        return batches[safeBatchIndex]?.messageText || '';
      case 'single-card':
        return selectedSingleProduct
          ? formatSingleProductWhatsAppCard(
              selectedSingleProduct,
              1,
              includeCare,
              includeWebLinks,
              liveBaseUrl
            )
          : '';
      case 'meta-csv':
        return generateMetaCommerceCatalogCsv(activeProducts, liveBaseUrl);
      default:
        return '';
    }
  }, [
    format,
    activeProducts,
    includeCare,
    includeWebLinks,
    targetPhone,
    liveBaseUrl,
    batches,
    safeBatchIndex,
    selectedSingleProduct,
  ]);

  // Direct WhatsApp Web/App URL (always text-based so CSV doesn't dump raw commas into chat)
  const whatsappDispatchUrl = useMemo(() => {
    const cleanPhone = sanitizeWhatsAppPhone(targetPhone);
    const textToSend =
      format === 'meta-csv'
        ? generateFullCatalogMessage(activeProducts, {
            includeCareInstructions: includeCare,
            includeWebLinks,
            targetPhone,
            baseUrl: liveBaseUrl,
          })
        : format === 'segmented-batches'
        ? batches[safeBatchIndex]?.messageText || currentMessageText
        : currentMessageText;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
  }, [
    targetPhone,
    format,
    activeProducts,
    includeCare,
    includeWebLinks,
    liveBaseUrl,
    batches,
    safeBatchIndex,
    currentMessageText,
  ]);

  if (!isOpen) return null;

  const logSyncAction = (actionLabel: string, count: number) => {
    const newRecord: SyncHistoryRecord = {
      id: `sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: currentAdminName,
      format: actionLabel,
      itemCount: count,
      targetPhone,
    };
    const updated = [newRecord, ...syncHistory].slice(0, 15);
    setSyncHistory(updated);
    try {
      localStorage.setItem('nch_whatsapp_sync_history', JSON.stringify(updated));
    } catch {}

    try {
      const adminToken =
        sessionStorage.getItem('niaz_admin_token') || localStorage.getItem('niaz_admin_token');

      if (adminToken) {
        fetch('/api/admin/whatsapp-sync/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            adminName: currentAdminName,
            format: actionLabel,
            itemCount: count,
            targetPhone,
            status: 'Dispatched',
          }),
        }).catch(() => {});
      }

      fetch('/api/telemetry/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'whatsapp_catalog_sync',
          properties: {
            admin: currentAdminName,
            itemCount: count,
            format: actionLabel,
          },
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      }).catch(() => {});
    } catch {}
  };

  const setBanner = (msg: string) => {
    setSyncStatusMessage(msg);
    setTimeout(() => {
      setSyncStatusMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentMessageText);
      setCopied(true);
      setBanner(
        format === 'meta-csv'
          ? 'WhatsApp Catalog CSV copied to clipboard!'
          : 'Formatted WhatsApp catalog text copied to clipboard!'
      );
      logSyncAction(format, format === 'single-card' ? 1 : activeProducts.length);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setBanner('Unable to access clipboard — use the Download button instead.');
    }
  };

  const handleCopyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(liveFeedUrl);
      setCopiedFeedUrl(true);
      setBanner('Live Meta Commerce CSV Feed URL copied!');
      setTimeout(() => setCopiedFeedUrl(false), 2500);
    } catch {
      setBanner('Copy the feed URL manually from the input box.');
    }
  };

  const handleDownloadFile = () => {
    const isCsv = format === 'meta-csv';
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = isCsv
      ? `niaz_whatsapp_catalog_meta_feed_${dateStamp}.csv`
      : `niaz_whatsapp_catalog_${format}_${dateStamp}.txt`;
    const mimeType = isCsv ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    const payload = isCsv ? `\uFEFF${currentMessageText}` : currentMessageText;

    const blob = new Blob([payload], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBanner(`Downloaded ${filename} (${isCsv ? activeProducts.length : format === 'single-card' ? 1 : activeProducts.length} items)!`);
    logSyncAction(
      `Exported ${isCsv ? 'Meta CSV Feed' : 'Formatted Catalog Text'}`,
      format === 'single-card' ? 1 : activeProducts.length
    );
  };

  const handleShareNative = async () => {
    const isCsv = format === 'meta-csv';
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = isCsv
      ? `niaz_whatsapp_catalog_${dateStamp}.csv`
      : `niaz_whatsapp_catalog_${dateStamp}.txt`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const file = new File(
          [isCsv ? `\uFEFF${currentMessageText}` : currentMessageText],
          filename,
          { type: isCsv ? 'text/csv' : 'text/plain' }
        );
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Niaz Cloth House — WhatsApp Business Catalog',
            text: `Updated inventory catalog (${activeProducts.length} unstitched articles).`,
            files: [file],
          });
        } else {
          await navigator.share({
            title: 'Niaz Cloth House — WhatsApp Business Catalog',
            text: isCsv ? liveFeedUrl : currentMessageText,
          });
        }
        logSyncAction(
          `Shared ${isCsv ? 'CSV Catalog' : 'Text Catalog'}`,
          format === 'single-card' ? 1 : activeProducts.length
        );
        setBanner('Catalog shared successfully!');
        return;
      } catch {
        // User cancelled or file share unsupported in preview -> fall back cleanly
      }
    }
    await handleCopy();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-sync-title"
    >
      <div className="bg-[#F8FAFC] max-w-4xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden relative my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] min-w-0">
        {/* Header Ribbon */}
        <div className="bg-[#1C1917] text-[#F8FAFC] p-4 sm:p-5 border-b border-[#38332E] flex items-center justify-between gap-3 shrink-0 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 border border-[#25D366]/60 flex items-center justify-center text-[#25D366] shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#25D366] font-bold">
                  WhatsApp Business Catalog Sync
                </span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/70">
                  {products.length} Total Products
                </span>
              </div>
              <h2 id="whatsapp-sync-title" className="font-serif text-base sm:text-lg font-bold text-white mt-0.5 break-words">
                Sync Inventory to WhatsApp Business Catalog
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-sm shrink-0"
            aria-label="Close WhatsApp Catalog Sync"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Alert Banner */}
        {syncStatusMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium break-words">{syncStatusMessage}</span>
          </div>
        )}

        {/* Modal Body: Two-Column Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
          {/* LEFT PANEL: Format & Filters Configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-5 min-w-0">
            {/* 1. Export / Sync Format */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                1. Choose Export / Sync Format
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFormat('meta-csv')}
                  className={`p-2.5 text-left border transition-all min-w-0 ${
                    format === 'meta-csv'
                      ? 'border-[#25D366] bg-emerald-50/60 ring-1 ring-[#25D366]'
                      : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-bold text-[#1C1917] flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1 min-w-0">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                      <span className="truncate">Catalog CSV</span>
                    </span>
                    {format === 'meta-csv' && <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-[#1C1917]/60 mt-1 leading-snug">
                    Bulk CSV import for WhatsApp / Meta Catalog Manager.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('full-digest')}
                  className={`p-2.5 text-left border transition-all min-w-0 ${
                    format === 'full-digest'
                      ? 'border-[#25D366] bg-emerald-50/60 ring-1 ring-[#25D366]'
                      : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-bold text-[#1C1917] flex items-center justify-between gap-1">
                    <span className="truncate">Full Text Catalog</span>
                    {format === 'full-digest' && <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-[#1C1917]/60 mt-1 leading-snug">
                    Shareable formatted WhatsApp catalog message.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('segmented-batches')}
                  className={`p-2.5 text-left border transition-all min-w-0 ${
                    format === 'segmented-batches'
                      ? 'border-[#25D366] bg-emerald-50/60 ring-1 ring-[#25D366]'
                      : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-bold text-[#1C1917] flex items-center justify-between gap-1">
                    <span className="truncate">Batch Chunks</span>
                    {format === 'segmented-batches' && <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-[#1C1917]/60 mt-1 leading-snug">
                    Split messages (3–6 items) avoiding chat limits.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('single-card')}
                  className={`p-2.5 text-left border transition-all min-w-0 ${
                    format === 'single-card'
                      ? 'border-[#25D366] bg-emerald-50/60 ring-1 ring-[#25D366]'
                      : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-bold text-[#1C1917] flex items-center justify-between gap-1">
                    <span className="truncate">Single Fabric</span>
                    {format === 'single-card' && <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-[#1C1917]/60 mt-1 leading-snug">
                    Shareable text card with specs for 1 product.
                  </p>
                </button>
              </div>
            </div>

            {/* Live Feed URL Helper for Meta CSV */}
            {format === 'meta-csv' && (
              <div className="p-3 bg-emerald-50/60 border border-[#25D366]/40 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#1C1917] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <LinkIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                    <span>Scheduled Feed URL (Auto-Sync)</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#1C1917]/75 leading-snug">
                  Download the CSV below or paste this live feed URL into <strong>Meta Commerce Manager → Catalog → Data Sources → Data Feed</strong>:
                </p>
                <div className="flex items-center gap-1.5 min-w-0">
                  <input
                    type="text"
                    readOnly
                    value={liveFeedUrl}
                    aria-label="Live WhatsApp Catalog CSV Feed URL"
                    className="flex-1 min-w-0 text-[11px] py-1.5 px-2 bg-white border border-[#E2E8F0] text-[#1C1917] font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyFeedUrl}
                    className="px-2.5 py-1.5 bg-[#1C1917] hover:bg-black text-white text-[11px] font-semibold shrink-0 flex items-center gap-1"
                  >
                    {copiedFeedUrl ? <Check className="w-3 h-3 text-[#25D366]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFeedUrl ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Inventory Scope Filter */}
            {format !== 'single-card' ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  2. Products Included ({activeProducts.length} items)
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('all');
                      setActiveBatchIndex(0);
                    }}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'all'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#1C1917]/70 border-[#E2E8F0] hover:border-[#1C1917]'
                    }`}
                  >
                    All Products ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('in-stock');
                      setActiveBatchIndex(0);
                    }}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'in-stock'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#1C1917]/70 border-[#E2E8F0] hover:border-[#1C1917]'
                    }`}
                  >
                    In Stock ({products.filter((p) => p.inStock).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('men');
                      setActiveBatchIndex(0);
                    }}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'men'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#1C1917]/70 border-[#E2E8F0] hover:border-[#1C1917]'
                    }`}
                  >
                    Men's ({products.filter((p) => p.gender === 'Men').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('women');
                      setActiveBatchIndex(0);
                    }}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'women'
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-[#1C1917]/70 border-[#E2E8F0] hover:border-[#1C1917]'
                    }`}
                  >
                    Women's ({products.filter((p) => p.gender === 'Women').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('women-embroidery');
                      setActiveBatchIndex(0);
                    }}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'women-embroidery'
                        ? 'bg-[#0284C7] text-white border-[#0284C7]'
                        : 'bg-white text-[#1C1917]/70 border-[#E2E8F0] hover:border-[#0284C7]'
                    }`}
                  >
                    Embroidered ({products.filter((p) => p.gender === 'Women' && p.craftType === 'Embroidery').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('women-printed');
                      setActiveBatchIndex(0);
                    }}
                    className={`px-3 py-1.5 border transition-colors ${
                      filterMode === 'women-printed'
                        ? 'bg-[#0284C7] text-white border-[#0284C7]'
                        : 'bg-white text-[#1C1917]/70 border-[#E2E8F0] hover:border-[#0284C7]'
                    }`}
                  >
                    Printed ({products.filter((p) => p.gender === 'Women' && p.craftType === 'Printed').length})
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
                  className="w-full text-xs py-2 px-3 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#25D366]"
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
              <div className="p-3.5 bg-white border border-[#E2E8F0] space-y-3 text-xs">
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
                    className="p-1.5 border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-30"
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
                            : 'bg-white text-[#1C1917]/70 border-[#E2E8F0] hover:border-[#1C1917]'
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
                    className="p-1.5 border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-30"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#1C1917]/60 pt-1 border-t border-[#E2E8F0]/60">
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

            {/* 4. Target WhatsApp Business Number */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  3. WhatsApp Business Number
                </label>
                <span className="text-[10px] text-[#1C1917]/50 font-mono">
                  Store Desk
                </span>
              </div>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-[#1C1917]/40" />
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="0334-6565636 or 923346565636"
                  className="w-full text-xs py-2 pl-9 pr-3 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#25D366] font-mono"
                />
              </div>
            </div>

            {/* 5. Text Formatting Options */}
            {format !== 'meta-csv' && (
              <div className="p-3 bg-white border border-[#E2E8F0] space-y-2 text-xs">
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
                  <span>Include Pre-Shrinkage (Tarr-Karna) Care</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#1C1917]/80">
                  <input
                    type="checkbox"
                    checked={includeWebLinks}
                    onChange={(e) => setIncludeWebLinks(e.target.checked)}
                    className="accent-[#25D366]"
                  />
                  <span>Include Direct Store Order Links</span>
                </label>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Live CSV / Text Catalog Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  {format === 'meta-csv' ? 'WhatsApp Catalog CSV Preview' : 'WhatsApp Formatted Text Preview'}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold rounded">
                  {format === 'meta-csv'
                    ? `${activeProducts.length} rows · CSV`
                    : `${currentMessageText.length} chars`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#1C1917] flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
                  title={format === 'meta-csv' ? 'Copy CSV data' : 'Copy formatted message'}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : format === 'meta-csv' ? 'Copy CSV' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="px-2.5 py-1 text-xs border border-[#25D366]/50 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 flex items-center gap-1.5 transition-colors font-semibold shadow-2xs"
                  title={format === 'meta-csv' ? 'Download WhatsApp Catalog CSV' : 'Download formatted text catalog'}
                >
                  <Download className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{format === 'meta-csv' ? 'Download .CSV' : 'Download .TXT'}</span>
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div className="flex-1 bg-[#EFEAE2] p-4 border border-[#D1D7DB] rounded overflow-auto max-h-[380px] shadow-inner font-sans text-xs min-w-0">
              <div
                className={`bg-white p-3.5 rounded-lg shadow-sm border border-[#E1E7E9] font-mono text-[11px] leading-relaxed text-[#111B21] ${
                  format === 'meta-csv' ? 'whitespace-pre overflow-x-auto' : 'whitespace-pre-wrap break-words'
                }`}
              >
                {currentMessageText}
              </div>
            </div>

            {/* Primary Action Button Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {format === 'meta-csv' ? (
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="w-full sm:flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-md rounded-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Catalog CSV ({activeProducts.length} Items)</span>
                </button>
              ) : (
                <a
                  href={whatsappDispatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    logSyncAction(
                      `Dispatched via WhatsApp (${format})`,
                      format === 'single-card' ? 1 : activeProducts.length
                    );
                    setBanner('Opening WhatsApp with formatted catalog...');
                  }}
                  className="w-full sm:flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-md rounded-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {format === 'segmented-batches'
                      ? `Send Batch ${safeBatchIndex + 1} on WhatsApp`
                      : 'Send Catalog to WhatsApp'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              )}

              <button
                type="button"
                onClick={handleShareNative}
                className="w-full sm:w-auto py-3 px-4 bg-[#1C1917] hover:bg-black text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs rounded-sm"
              >
                <Share2 className="w-4 h-4 text-[#25D366]" />
                <span>Share {format === 'meta-csv' ? 'CSV' : 'Catalog'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Recent Sync Audit Strip */}
        <div className="bg-[#F5EFEB] p-3 px-4 sm:px-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[#1C1917]/70">
            <Clock className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
            <span>
              {syncHistory[0] ? (
                <>
                  Last Export by <strong>{syncHistory[0].adminName}</strong>:{' '}
                  {new Date(syncHistory[0].timestamp).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  ({syncHistory[0].itemCount} items)
                </>
              ) : (
                <>Ready to export {products.length} catalog products to WhatsApp Business</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#1C1917]/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Meta Commerce &amp; WhatsApp Catalog Schema</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
