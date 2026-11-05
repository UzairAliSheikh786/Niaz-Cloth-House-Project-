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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl z-10 border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-black hover:text-white rounded-full transition-colors text-black shadow-md focus:outline-none"
          aria-label="Close Quick View"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Visual Gallery (Limelight Aspect 3:4) */}
          <div className="md:col-span-6 bg-neutral-100 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-200">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-white shadow-xs">
              <img
                src={selectedImage}
                alt={product.title}
                width={600}
                height={800}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 shadow-sm">
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
                      selectedImage === img ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
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
                <span className="text-[11px] font-black tracking-[0.2em] uppercase text-neutral-500">
                  {product.brand || product.gender}
                </span>
                {product.rating && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2
                id="quickview-title"
                className="font-sans font-black text-lg sm:text-xl text-black leading-snug tracking-wide"
              >
                {product.title}
              </h2>

              {/* Subtitle / Fabric Grade */}
              <p className="text-xs text-neutral-500 mt-1">
                {product.subtitle || `${product.fabric} · Unstitched Fabric`}
              </p>

              {/* Price Banner */}
              <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-baseline gap-3">
                <span className="text-2xl font-black text-black">
                  {formatPKR(unitPrice)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPKR(product.originalPrice + additionalPrice)}
                  </span>
                )}
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 ml-auto border border-emerald-200">
                  In Stock · Ready to Dispatch
                </span>
              </div>

              {/* Specifications Pills */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] bg-neutral-50 p-3 border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block">Cut Length:</span>
                  <span className="font-bold text-black">{product.cutDetails.length}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Width (Arz):</span>
                  <span className="font-bold text-black">{product.cutDetails.width}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Fabric Type:</span>
                  <span className="font-bold text-black">{product.fabric}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Article Code:</span>
                  <span className="font-mono font-bold text-black uppercase">{product.id}</span>
                </div>
              </div>

              {/* Color Shade Selection */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-black">Color / Shade:</span>
                    <span className="font-semibold text-neutral-700">{selectedColor}</span>
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
                            ? 'border-black bg-neutral-100 font-bold'
                            : 'border-neutral-200 hover:border-black'
                        }`}
                        title={opt.name}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: opt.hex }}
                        />
                        <span>{opt.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Options (if any) */}
              {product.designOptions && product.designOptions.length > 1 && (
                <div className="mt-4 space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-black">
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
                            ? 'border-black bg-neutral-50 font-bold'
                            : 'border-neutral-200 hover:border-black'
                        }`}
                      >
                        <span>{d.name}</span>
                        {d.additionalPrice ? (
                          <span className="text-neutral-600 font-mono">+{formatPKR(d.additionalPrice)}</span>
                        ) : (
                          <span className="text-[10px] text-neutral-400 uppercase">Included</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-black">Quantity:</span>
                <div className="flex items-center border border-neutral-300">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-neutral-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-mono font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-neutral-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedAnimation}
                className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag · {formatPKR(totalPrice)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant Order on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleViewFullDetails}
                className="w-full py-2 text-center text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-black hover:underline flex items-center justify-center gap-1 transition-colors pt-1"
              >
                <span>View Full Fabric Details & Care Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
