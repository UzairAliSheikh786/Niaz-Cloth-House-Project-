import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-full max-w-md bg-[#F8FAFC] shadow-2xl flex flex-col justify-between border-l border-[#E2E8F0] animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F5EFEB]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0284C7]" />
              <h2 id="cart-drawer-title" className="font-serif text-lg font-bold text-[#1C1917]">
                Shopping Bag ({cart.reduce((c, i) => c + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#1C1917]/70 hover:text-[#1C1917] hover:bg-[#E2E8F0]/60 transition-colors rounded-full"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#F0EAE1] flex items-center justify-center text-[#0284C7]">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#1C1917]">
                    Your shopping bag is empty
                  </h3>
                  <p className="text-xs text-[#1C1917]/60 mt-1 max-w-xs mx-auto">
                    Explore our heirloom unstitched Boski, Wash and Wear, and festive embroidered Lawn.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-5 py-2.5 bg-[#0284C7] text-white text-xs font-semibold tracking-wider uppercase transition-colors hover:bg-[#0369A1]"
                >
                  Explore Unstitched Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 bg-white border border-[#E2E8F0]/70 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.primaryImage}
                    alt={`${item.product.title} unstitched suit fabric in ${item.selectedColor || item.product.color}`}
                    width={80}
                    height={80}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover bg-[#F2EDE7] shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            setIsCartOpen(false);
                            navigateTo('product-detail', { id: item.product.id });
                          }}
                          className="font-serif text-sm font-semibold text-[#1C1917] hover:text-[#0284C7] cursor-pointer truncate"
                        >
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#1C1917]/40 hover:text-red-600 transition-colors p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0284C7]"
                          aria-label={`Remove ${item.product.title} from shopping bag`}
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#0284C7] font-sans mt-0.5">
                        {item.product.fabric} · {item.product.cutDetails?.length || 'Unstitched'}
                      </p>
                      {(item.selectedColor || item.selectedDesign) && (
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#1C1917]/70">
                          {item.selectedColor && (
                            <span className="flex items-center gap-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block"
                                style={{ backgroundColor: item.selectedColorHex || '#E2E8F0' }}
                              />
                              <span>{item.selectedColor}</span>
                            </span>
                          )}
                          {item.selectedColor && item.selectedDesign && <span aria-hidden="true">·</span>}
                          {item.selectedDesign && (
                            <span className="truncate max-w-[150px] font-medium text-[#1C1917]/80">
                              {item.selectedDesign}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity controls & item total */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F2ECE5]">
                      <div className="flex items-center border border-[#E2E8F0] bg-[#F8FAFC]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#E2E8F0] text-[#1C1917]/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0284C7]"
                          aria-label={`Decrease quantity of ${item.product.title}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-mono font-medium tabular-nums" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#E2E8F0] text-[#1C1917]/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0284C7]"
                          aria-label={`Increase quantity of ${item.product.title}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-mono text-sm font-semibold text-[#1C1917] tabular-nums">
                        {formatPKR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Gateway */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E2E8F0] bg-[#F5EFEB] space-y-3">
              <div className="space-y-1.5 text-xs text-[#1C1917]/75">
                <div className="flex justify-between items-baseline">
                  <span>Subtotal</span>
                  <span className="font-mono text-base font-bold text-[#1C1917] tabular-nums">
                    {formatPKR(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#4A5D4E]">
                  <span>Nationwide Courier Dispatch</span>
                  <span>Calculated at Checkout</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* Standard Checkout Button */}
                <button
                  onClick={handleCodCheckout}
                  className="w-full py-3.5 px-4 bg-[#D4AF37] hover:bg-[#C5A028] text-[#141414] text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Proceed to Checkout (COD · Cards · JazzCash)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Direct WhatsApp Checkout Gateway */}
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 px-4 bg-[#141414] hover:bg-black text-[#F8FAFC] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border border-black cursor-pointer"
                  title="Auto-formats order into WhatsApp message"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>Instant WhatsApp Checkout</span>
                </button>
              </div>

              {/* Guarantees note */}
              <div className="flex items-center justify-between text-[11px] text-[#1C1917]/60 pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Certified 1977 Heritage Pure Fabric</span>
                </div>
                <button
                  onClick={clearCart}
                  className="text-stone-500 hover:text-red-700 underline"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
