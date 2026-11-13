import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronRight,
  Phone,
  MapPin,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { WOMEN_EMBROIDERY_BRANDS, WOMEN_PRINTED_BRANDS, MENS_FABRICS } from '../types';
import { PWAInstallPrompt } from './PWAInstallPrompt';

export const Header: React.FC = () => {
  const { cartCount, setIsCartOpen, setIsSearchOpen, wishlist } = useShop();
  const { currentPage, filterParams, navigateTo } = useNavigation();
  const { user, openAuthModal, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'women' | 'men'>('women');
  const [mobileAccordion, setMobileAccordion] = useState<{
    womenEmbroidered: boolean;
    womenPrinted: boolean;
  }>({
    womenEmbroidered: true,
    womenPrinted: false,
  });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isNavActive = (key: string) => {
    if (currentPage !== 'shop') return false;
    switch (key) {
      case 'new-in':
        return Boolean(filterParams.newArrivalsOnly);
      case 'mens':
        return filterParams.gender === 'Men';
      case 'womens':
        return filterParams.gender === 'Women';
      case 'luxury':
        return filterParams.collection === 'The Shahi Collection';
      case 'sale':
        return Boolean(filterParams.saleOnly);
      default:
        return false;
    }
  };

  return (
    <header className="w-full bg-[#060608]/95 backdrop-blur-md border-b border-[#C5A059]/25 sticky top-0 z-40 text-[#F7F4EE]">
      {/* Clean Single-Row 3-Zone Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18 sm:h-20">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
            className="flex flex-col text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] whitespace-nowrap shrink-0"
            aria-label="Niaz Cloth House Home"
          >
            <span className="font-serif text-2xl sm:text-[28px] font-semibold tracking-[0.22em] text-[#D4AF37] group-hover:text-[#E8D5A7] transition-colors leading-none">
              NIAZ
            </span>
            <span className="text-[9px] tracking-[0.34em] font-sans font-medium text-[#C5A059]/85 group-hover:text-[#E8D5A7] uppercase mt-1 leading-none">
              CLOTH HOUSE
            </span>
          </a>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center justify-center gap-7 text-[13px] font-sans font-medium tracking-wide text-[#F7F4EE]/90"
          >
            <button
              type="button"
              onClick={() => navigateTo('shop', { newArrivalsOnly: true })}
              className={`whitespace-nowrap shrink-0 py-1.5 transition-colors border-b-2 ${
                isNavActive('new-in')
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              New In
            </button>
            <button
              type="button"
              onClick={() => navigateTo('shop', { gender: 'Men' })}
              className={`whitespace-nowrap shrink-0 py-1.5 transition-colors border-b-2 ${
                isNavActive('mens')
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              Mens Collection
            </button>
            <button
              type="button"
              onClick={() => navigateTo('shop', { gender: 'Women' })}
              className={`whitespace-nowrap shrink-0 py-1.5 transition-colors border-b-2 ${
                isNavActive('womens')
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              Womens Collection
            </button>
            <button
              type="button"
              onClick={() => navigateTo('shop', { collection: 'The Shahi Collection' })}
              className={`whitespace-nowrap shrink-0 py-1.5 transition-colors border-b-2 ${
                isNavActive('luxury')
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              Luxury
            </button>
            <button
              type="button"
              onClick={() => navigateTo('shop', { saleOnly: true })}
              className={`whitespace-nowrap shrink-0 py-1.5 transition-colors border-b-2 ${
                isNavActive('sale')
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              Sale
            </button>
          </nav>

          {/* Zone 3: Cart Primary Action + Essential Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-[#E8D5A7]/80 hover:text-[#D4AF37] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
              aria-label="Search fabrics"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('shop', { favoritesOnly: true })}
              className="hidden sm:flex p-2.5 text-[#E8D5A7]/80 hover:text-[#D4AF37] relative transition-colors min-w-[40px] min-h-[40px] items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
              aria-label={`Wishlist (${wishlist.length} items)`}
              title="Saved Fabrics"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#D4AF37] text-[#060608] text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setUserDropdownOpen((prev) => !prev);
                  } else {
                    openAuthModal();
                  }
                }}
                className="p-2.5 text-[#E8D5A7]/80 hover:text-[#D4AF37] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                aria-label="Account and store manager login"
                title={user ? user.displayName || 'Account' : 'Sign In'}
              >
                <UserIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>

              {user && userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#111115] border border-[#C5A059]/35 shadow-2xl py-2 z-50 text-xs text-[#F7F4EE]">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-semibold text-[#F7F4EE] truncate">{user.displayName || 'Patron'}</p>
                    <p className="text-[11px] text-[#F7F4EE]/60 truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('admin');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/5 font-medium text-[#D4AF37]"
                  >
                    Store Management Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/5 text-red-400 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Cart Control matching screenshot: Cart 🛒 (2) */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-[#D4AF37] hover:text-[#F7F4EE] transition-colors text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <span>Cart</span>
              <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />
              <span className="tabular-nums">({cartCount})</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#E8D5A7] hover:text-[#D4AF37] lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer (Noir & Gold) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-[#0B0B0E] border-r border-[#C5A059]/30 shadow-2xl flex flex-col z-50 text-[#F7F4EE]">
            <div className="p-4 border-b border-[#C5A059]/25 flex items-center justify-between bg-[#060608]">
              <span className="font-serif tracking-[0.2em] uppercase text-base text-[#D4AF37]">
                NIAZ CLOTH HOUSE
              </span>
              <div className="flex items-center gap-2">
                <PWAInstallPrompt />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#E8D5A7] hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Mobile Links */}
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/10 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  navigateTo('shop', { newArrivalsOnly: true });
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-2 border border-[#C5A059]/30 text-[#E8D5A7] hover:border-[#D4AF37]"
              >
                New In
              </button>
              <button
                type="button"
                onClick={() => {
                  navigateTo('shop', { collection: 'The Shahi Collection' });
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-2 border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
              >
                Luxury
              </button>
              <button
                type="button"
                onClick={() => {
                  navigateTo('shop', { saleOnly: true });
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-2 border border-[#C5A059]/30 text-[#E8D5A7] hover:border-[#D4AF37]"
              >
                Sale
              </button>
            </div>

            {/* Department Tabs */}
            <div className="grid grid-cols-2 border-b border-white/10 text-center font-semibold text-xs uppercase tracking-widest">
              <button
                type="button"
                onClick={() => setMobileActiveTab('women')}
                className={`py-3 transition-colors ${
                  mobileActiveTab === 'women'
                    ? 'border-b-2 border-[#D4AF37] text-[#D4AF37] bg-white/5'
                    : 'text-[#F7F4EE]/60 hover:text-white'
                }`}
              >
                Women's
              </button>
              <button
                type="button"
                onClick={() => setMobileActiveTab('men')}
                className={`py-3 transition-colors ${
                  mobileActiveTab === 'men'
                    ? 'border-b-2 border-[#D4AF37] text-[#D4AF37] bg-white/5'
                    : 'text-[#F7F4EE]/60 hover:text-white'
                }`}
              >
                Men's Suiting
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mobileActiveTab === 'women' ? (
                <>
                  <div className="border border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileAccordion((p) => ({ ...p, womenEmbroidered: !p.womenEmbroidered }))
                      }
                      className="w-full flex items-center justify-between p-3 bg-white/5 text-xs font-semibold tracking-wider uppercase text-[#D4AF37]"
                    >
                      <span>Embroidered Collection</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          mobileAccordion.womenEmbroidered ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {mobileAccordion.womenEmbroidered && (
                      <div className="p-3 grid grid-cols-2 gap-2 text-xs text-[#F7F4EE]/80">
                        {WOMEN_EMBROIDERY_BRANDS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              navigateTo('shop', { gender: 'Women', craftType: 'Embroidery', brand: b });
                              setMobileMenuOpen(false);
                            }}
                            className="text-left py-1 hover:text-[#D4AF37]"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileAccordion((p) => ({ ...p, womenPrinted: !p.womenPrinted }))
                      }
                      className="w-full flex items-center justify-between p-3 bg-white/5 text-xs font-semibold tracking-wider uppercase text-[#D4AF37]"
                    >
                      <span>Printed Collection</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          mobileAccordion.womenPrinted ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {mobileAccordion.womenPrinted && (
                      <div className="p-3 grid grid-cols-2 gap-2 text-xs text-[#F7F4EE]/80">
                        {WOMEN_PRINTED_BRANDS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              navigateTo('shop', { gender: 'Women', craftType: 'Printed', brand: b });
                              setMobileMenuOpen(false);
                            }}
                            className="text-left py-1 hover:text-[#D4AF37]"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('shop', { gender: 'Women' });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-4 border border-[#C5A059]/40 hover:border-[#D4AF37] text-xs font-semibold uppercase tracking-wider text-[#F7F4EE] flex items-center justify-between"
                  >
                    <span>All Women's Fabrics</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                </>
              ) : (
                <>
                  <div className="border border-white/10">
                    <div className="p-3 bg-white/5 text-xs font-semibold tracking-wider uppercase text-[#D4AF37] border-b border-white/10">
                      Men's Signature Cuts
                    </div>
                    <div className="p-3 space-y-2 text-xs text-[#F7F4EE]/85">
                      {MENS_FABRICS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men', fabric: f });
                            setMobileMenuOpen(false);
                          }}
                          className="w-full py-1.5 text-left flex items-center justify-between hover:text-[#D4AF37] border-b border-white/5 last:border-0"
                        >
                          <span>{f} Suiting</span>
                          <span className="text-[10px] text-[#F7F4EE]/50">4.5m Cut</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('shop', { gender: 'Men' });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-4 border border-[#C5A059]/40 hover:border-[#D4AF37] text-xs font-semibold uppercase tracking-wider text-[#F7F4EE] flex items-center justify-between"
                  >
                    <span>All Men's Fabrics</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                </>
              )}

              <div className="pt-4 border-t border-white/10 space-y-3 text-xs text-[#F7F4EE]/80">
                <a
                  href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20want%20to%20order%20fabrics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-black flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-[11px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Concierge (0334-6565636)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigateTo('location');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left flex items-center gap-2 hover:text-[#D4AF37]"
                >
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>Paris Bazaar, Committee Chowk, Rawalpindi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigateTo('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left flex items-center gap-2 hover:text-[#D4AF37] font-semibold"
                >
                  <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                  <span>Store Management Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
