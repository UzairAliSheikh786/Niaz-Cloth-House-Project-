import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  Star, 
  Check, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import { Product } from '../types';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart, formatPKR, showToast, recordProductView } = useShop();
  const { navigateTo } = useNavigation();

  const fallbackImage = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedColorHex, setSelectedColorHex] = useState<string>('');
  const [selectedDesignId, setSelectedDesignId] = useState<string>('std');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Sync state when product opens and persist to IndexedDB
  useEffect(() => {
    if (product) {
      recordProductView(product);
      setSelectedImage(product.primaryImage || fallbackImage);
      setQuantity(1);
      setSelectedColor(product.colorOptions?.[0]?.name || product.color || '');
      setSelectedColorHex(product.colorOptions?.[0]?.hex || product.colorHex || '#111111');
      setSelectedDesignId(product.designOptions?.[0]?.id || 'std');
      setAddedAnimation(false);
    }
  }, [product]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const activeDesign = product.designOptions?.find((d) => d.id === selectedDesignId);
  const additionalPrice = activeDesign?.additionalPrice || 0;
  const unitPrice = product.price + additionalPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      selectedColor,
      selectedColorHex,
      selectedDesign: activeDesign?.name || 'Standard Cut',
    });
    setAddedAnimation(true);
    showToast(`Added ${quantity}x ${product.title} to your bag`);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  const handleWhatsAppOrder = () => {
    const waMessage = encodeURIComponent(
      `Hello Niaz Cloth House! I would like to order this suit:\n*${product.title}*\nBrand: ${product.brand || product.gender}\nFabric: ${product.fabric}\nColor: ${selectedColor}\nCut: ${activeDesign?.name || 'Standard'}\nQuantity: ${quantity}\nPrice: ${formatPKR(totalPrice)}\nSKU: ${product.id}\nPlease confirm availability and shipping details.`
    );
    window.open(`https://wa.me/923346565636?text=${waMessage}`, '_blank', 'noopener,noreferrer');
  };

  const handleViewFullDetails = () => {
    onClose();
    navigateTo('product-detail', { id: product.id, slug: product.slug });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-[#0E0E12] text-[#F7F4EE] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl z-10 border border-[#C5A059]/35 animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 bg-[#16161B] hover:bg-[#D4AF37] hover:text-[#060608] rounded-full transition-colors text-[#E8D5A7] border border-[#C5A059]/30 shadow-md focus:outline-none"
          aria-label="Close Quick View"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Visual Gallery (Aspect 3:4) */}
          <div className="md:col-span-6 bg-[#08080A] p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#C5A059]/20">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#141418] border border-white/10">
              <img
                src={selectedImage}
                alt={product.title}
                width={600}
                height={800}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#060608] text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 shadow-sm">
                  SALE
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-18 shrink-0 overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Config & Purchase Options */}
          <div className="md:col-span-6 p-5 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              {/* Brand & Category Kicker */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C5A059]">
                  {product.brand || product.gender}
                </span>
                {product.rating && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#D4AF37]">
                    <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2
                id="quickview-title"
                className="font-serif text-xl sm:text-2xl text-[#F7F4EE] leading-snug"
              >
                {product.title}
              </h2>

              {/* Subtitle / Fabric Grade */}
              <p className="text-xs text-[#F7F4EE]/60 mt-1">
                {product.subtitle || `${product.fabric} · Unstitched Fabric`}
              </p>

              {/* Price Banner */}
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-[#D4AF37] tabular-nums">
                  {formatPKR(unitPrice)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-[#F7F4EE]/40 line-through tabular-nums">
                    {formatPKR(product.originalPrice + additionalPrice)}
                  </span>
                )}
                <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 ml-auto border border-emerald-500/25">
                  In Stock
                </span>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5 mt-4 text-[11px] bg-[#141419] p-3 border border-white/10">
                <div>
                  <span className="text-[#F7F4EE]/55 block">Cut Length</span>
                  <span className="font-semibold text-[#F7F4EE]">{product.cutDetails.length}</span>
                </div>
                <div>
                  <span className="text-[#F7F4EE]/55 block">Width (Arz)</span>
                  <span className="font-semibold text-[#F7F4EE]">{product.cutDetails.width}</span>
                </div>
                <div>
                  <span className="text-[#F7F4EE]/55 block">Fabric Type</span>
                  <span className="font-semibold text-[#F7F4EE]">{product.fabric}</span>
                </div>
                <div>
                  <span className="text-[#F7F4EE]/55 block">Article Code</span>
                  <span className="font-mono font-semibold text-[#D4AF37] uppercase">{product.id}</span>
                </div>
              </div>

              {/* Color Shade Selection */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-[#E8D5A7]">Color / Shade:</span>
                    <span className="font-medium text-[#D4AF37]">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colorOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(opt.name);
                          setSelectedColorHex(opt.hex);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs border transition-all ${
                          selectedColor === opt.name
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F7F4EE] font-semibold'
                            : 'border-white/15 bg-[#141419] text-[#F7F4EE]/80 hover:border-[#C5A059]/60'
                        }`}
                        title={opt.name}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: opt.hex }}
                        />
                        <span>{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Options */}
              {product.designOptions && product.designOptions.length > 1 && (
                <div className="mt-4 space-y-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#E8D5A7]">
                    Cut Option:
                  </span>
                  <div className="space-y-1.5">
                    {product.designOptions.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDesignId(d.id)}
                        className={`w-full text-left p-2.5 border text-xs flex items-center justify-between transition-all ${
                          selectedDesignId === d.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F7F4EE] font-semibold'
                            : 'border-white/15 bg-[#141419] text-[#F7F4EE]/80 hover:border-[#C5A059]/60'
                        }`}
                      >
                        <span>{d.name}</span>
                        {d.additionalPrice ? (
                          <span className="text-[#D4AF37] font-mono">+{formatPKR(d.additionalPrice)}</span>
                        ) : (
                          <span className="text-[10px] text-[#F7F4EE]/50 uppercase">Included</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E8D5A7]">Quantity:</span>
                <div className="flex items-center border border-[#C5A059]/40 bg-[#141419]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white/10 text-[#F7F4EE] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-mono font-bold tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-white/10 text-[#F7F4EE] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedAnimation}
                className="w-full py-3.5 px-6 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37] text-[#E8D5A7] hover:text-[#060608] text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart · {formatPKR(totalPrice)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full py-3 px-6 bg-[#25D366] hover:bg-[#20BD5A] text-black text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant Order on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleViewFullDetails}
                className="w-full py-2 text-center text-xs font-medium uppercase tracking-widest text-[#C5A059] hover:text-[#D4AF37] hover:underline flex items-center justify-center gap-1 transition-colors pt-1"
              >
                <span>View Full Fabric Details &amp; Care Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
