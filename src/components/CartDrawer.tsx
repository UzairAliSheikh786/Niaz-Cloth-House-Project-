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
    clearCart,
    setIsCheckoutOpen,
    generateWhatsAppOrderUrl,
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

  const freeShippingThreshold = 3000;
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountNeeded = freeShippingThreshold - cartSubtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 id="cart-drawer-title" className="font-sans text-sm font-black tracking-widest uppercase text-black">
                SHOPPING BAG ({cart.reduce((c, i) => c + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-500 hover:text-black transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Limelight Free Shipping Bar */}
          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-neutral-800">
                <Truck className="w-3.5 h-3.5 text-black" />
                {amountNeeded <= 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Congratulations! You unlocked Free Shipping!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-black">{formatPKR(amountNeeded)}</strong> for Free Delivery
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500 font-semibold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-neutral-100 flex items-center justify-center text-black">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-black tracking-widest uppercase text-black">
                    Your Shopping Bag is Empty
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    Explore our unstitched women's embroidered lawn, printed collections, and men's wash & wear.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-6 py-3 bg-black text-white text-xs font-bold tracking-widest uppercase transition-colors hover:bg-neutral-800"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 p-3 bg-white border border-neutral-200 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.primaryImage}
                    alt={`${item.product.title}`}
                    width={80}
                    height={106}
                    className="w-20 h-26 object-cover bg-neutral-100 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
                          {item.product.brand || item.product.gender}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-semibold text-black truncate mt-0.5">
                        {item.product.title}
                      </h4>

                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {item.selectedColor || item.product.color} · {item.selectedDesign || 'Standard Cut'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-neutral-200 bg-white">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-black font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-black text-black">
                        {formatPKR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white space-y-3">
              <div className="flex justify-between items-baseline text-xs pb-1">
                <span className="text-neutral-500 uppercase tracking-wider font-semibold">Subtotal</span>
                <span className="text-base font-black text-black">
                  {formatPKR(cartSubtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-neutral-500">
                <span>Shipping</span>
                <span className="text-neutral-900 font-semibold">
                  {amountNeeded <= 0 ? 'FREE' : 'Calculated at checkout'}
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCodCheckout}
                  className="w-full py-3.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span>PROCEED TO CHECKOUT (COD)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ORDER VIA WHATSAPP IN 1 CLICK</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-neutral-400 pt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span>100% Original Mills Fabric Guarantee · Easy 7-Day Exchange</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
