import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight, ShieldCheck, Truck, Check } from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartTotal,
    setIsCheckoutOpen,
    generateWhatsAppOrderUrl,
    storeSettings,
  } = useShop();

  const { navigateTo } = useNavigation();

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = () => {
    const url = generateWhatsAppOrderUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCodCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 5000;
  const standardShippingFee = storeSettings?.shippingFee ?? 250;
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountNeeded = freeShippingThreshold - cartSubtotal;
  const isFreeShippingUnlocked = amountNeeded <= 0;

  const getItemPrice = (item: any) => {
    let addon = 0;
    if (item.selectedDesign && item.product.designOptions) {
      const opt = item.product.designOptions.find(
        (d: any) => d.name === item.selectedDesign || d.id === item.selectedDesign
      );
      if (opt && opt.additionalPrice) {
        addon = opt.additionalPrice;
      }
    }
    return (item.product.price + addon) * item.quantity;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1F1F1F]/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:max-w-md bg-[#F7F4EE] shadow-2xl flex flex-col justify-between border-l border-[#E8E0D2] animate-in slide-in-from-right duration-300">
          {/* Luxury Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8E0D2] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1F1F1F] text-[#D4AF37] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <h2 id="cart-drawer-title" className="font-serif text-sm font-bold tracking-wider uppercase text-[#1F1F1F]">
                  Shopping Bag
                </h2>
                <p className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">
                  {cart.reduce((c, i) => c + i.quantity, 0)} {cart.reduce((c, i) => c + i.quantity, 0) === 1 ? 'Article' : 'Articles'} Selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#1F1F1F]/60 hover:text-[#1F1F1F] hover:bg-[#F7F4EE] transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Luxury Free Shipping Meter */}
          <div className="bg-[#FAF8F5] px-5 py-3 border-b border-[#E8E0D2] text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1F1F1F]">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                {isFreeShippingUnlocked ? (
                  <span className="text-[#2E7D32] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Free Nationwide Delivery Unlocked!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#1F1F1F] font-mono">{formatPKR(amountNeeded)}</strong> for Free Shipping
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#8C827A] font-mono font-semibold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E8E0D2] overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-500 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-white border border-[#E8E0D2] flex items-center justify-center text-[#D4AF37] shadow-xs">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1F1F1F]">
                    Your Bag is Empty
                  </h3>
                  <p className="text-xs text-[#8C827A] mt-1 max-w-xs mx-auto leading-relaxed">
                    Explore our unstitched women's embroidered lawn, designer prints, and men's 8-pound Boski silk.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-6 py-3 bg-[#1F1F1F] text-[#F7F4EE] hover:bg-[#D4AF37] hover:text-[#1F1F1F] text-xs font-bold tracking-widest uppercase transition-colors shadow-xs"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedDesign}`}
                  className="flex gap-3.5 p-3.5 bg-white border border-[#E8E0D2] shadow-xs relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.primaryImage}
                    alt={item.product.title}
                    width={80}
                    height={106}
                    className="w-20 h-24 object-cover bg-[#F7F4EE] shrink-0 border border-[#E8E0D2]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#D4AF37]">
                          {item.product.brand || item.product.gender}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#8C827A] hover:text-red-700 transition-colors p-1"
                          title="Remove article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-semibold text-[#1F1F1F] truncate mt-0.5" title={item.product.title}>
                        {item.product.title}
                      </h4>

                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#8C827A]">
                        {item.selectedColorHex && (
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0"
                            style={{ backgroundColor: item.selectedColorHex }}
                          />
                        )}
                        <span className="truncate">
                          {item.selectedColor || item.product.color} · {item.selectedDesign || 'Standard Cut'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE1] mt-2">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#E8E0D2] bg-[#FAF8F5]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#E8E0D2] text-[#1F1F1F] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#1F1F1F] font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#E8E0D2] text-[#1F1F1F] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-bold text-[#1F1F1F] font-mono">
                        {formatPKR(getItemPrice(item))}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E8E0D2] bg-white space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-[#8C827A] uppercase tracking-wider font-semibold text-[11px]">Subtotal</span>
                  <span className="text-sm font-bold text-[#1F1F1F] font-mono">
                    {formatPKR(cartSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#8C827A] uppercase tracking-wider font-semibold">Shipping</span>
                  <span className="font-semibold">
                    {isFreeShippingUnlocked ? (
                      <span className="text-[#2E7D32] font-bold">FREE DELIVERY</span>
                    ) : (
                      <span className="text-[#1F1F1F] font-mono">{formatPKR(standardShippingFee)}</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#F0EAE1]">
                  <span className="text-[#1F1F1F] font-serif font-bold text-sm">Estimated Total</span>
                  <span className="text-base font-bold text-[#D4AF37] font-mono">
                    {formatPKR(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCodCheckout}
                  className="w-full py-3.5 px-4 bg-[#1F1F1F] hover:bg-[#D4AF37] text-white hover:text-[#1F1F1F] text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 px-4 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ORDER VIA WHATSAPP (0334-6565636)</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-[#8C827A] pt-1 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>100% Original Mills Fabric Guarantee · Paris Bazaar, Rawalpindi</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
