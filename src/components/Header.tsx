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
import { CurrencyConverterToggle } from './CurrencyConverterToggle';

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
    <header className="w-full bg-[#060608]/95 backdrop-blur-md border-b border-[#C5A059]/25 sticky top-0 z-40 text-[#F7F4EE] overflow-x-clip">
      {/* Clean Responsive Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-w-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 min-h-[68px] sm:min-h-[76px] py-2 min-w-0 max-w-full">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
            className="flex flex-col text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] shrink-0 min-w-0"
            aria-label="Niaz Cloth House Home"
          >
            <span className="font-serif text-xl sm:text-[26px] font-semibold tracking-[0.15em] sm:tracking-[0.22em] text-[#D4AF37] group-hover:text-[#E8D5A7] transition-colors leading-none">
              NIAZ
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-[0.24em] sm:tracking-[0.34em] font-sans font-medium text-[#C5A059]/85 group-hover:text-[#E8D5A7] uppercase mt-1 leading-none">
              CLOTH HOUSE
            </span>
          </a>

          {/* Zone 2: Responsive Multi-Breakpoint Nav Links (No Hidden/Clipped Options) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex flex-1 items-center justify-center flex-wrap gap-x-3.5 lg:gap-x-5 xl:gap-x-6 gap-y-1 text-[11px] lg:text-[13px] font-sans font-medium tracking-wide text-[#F7F4EE]/90 min-w-0 max-w-full"
          >
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className={`min-w-0 max-w-full whitespace-normal text-center leading-tight break-words py-1 transition-colors border-b-2 ${
                currentPage === 'shop' &&
                !filterParams.newArrivalsOnly &&
                !filterParams.gender &&
                !filterParams.collection &&
                !filterParams.saleOnly &&
                !filterParams.favoritesOnly
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              All Collections
            </button>
            <button
              type="button"
              onClick={() => navigateTo('shop', { newArrivalsOnly: true })}
              className={`min-w-0 max-w-full whitespace-normal text-center leading-tight break-words py-1 transition-colors border-b-2 ${
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
              className={`min-w-0 max-w-full whitespace-normal text-center leading-tight break-words py-1 transition-colors border-b-2 ${
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
              className={`min-w-0 max-w-full whitespace-normal text-center leading-tight break-words py-1 transition-colors border-b-2 ${
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
              className={`min-w-0 max-w-full whitespace-normal text-center leading-tight break-words py-1 transition-colors border-b-2 ${
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
              className={`min-w-0 max-w-full whitespace-normal text-center leading-tight break-words py-1 transition-colors border-b-2 ${
                isNavActive('sale')
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              Sale
            </button>
            <button
              type="button"
              onClick={() => navigateTo('location')}
              className={`min-w-0 max-w-full whitespace-normal text-center leading-tight break-words py-1 transition-colors border-b-2 ${
                currentPage === 'location'
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              Store Location
            </button>
          </nav>

          {/* Zone 3: Cart Primary Action + Essential Utilities */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink min-w-0">
            <div className="hidden md:flex items-center min-w-0">
              <PWAInstallPrompt />
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-2.5 text-[#E8D5A7]/80 hover:text-[#D4AF37] transition-colors min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] shrink-0"
              aria-label="Search fabrics"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('shop', { favoritesOnly: true })}
              className="p-1.5 sm:p-2.5 text-[#E8D5A7]/80 hover:text-[#D4AF37] relative transition-colors min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] shrink-0"
              aria-label={`Wishlist (${wishlist.length} items)`}
              title="Saved Fabrics"
            >
              <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-[#D4AF37] text-[#060608] text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setUserDropdownOpen((prev) => !prev);
                  } else {
                    openAuthModal();
                  }
                }}
                className="p-1.5 sm:p-2.5 text-[#E8D5A7]/80 hover:text-[#D4AF37] transition-colors min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                aria-label="Account and store manager login"
                title={user ? user.displayName || 'Account' : 'Sign In'}
              >
                <UserIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>

              {user && userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-[#111115] border border-[#C5A059]/35 shadow-2xl py-2 z-50 text-xs text-[#F7F4EE] min-w-0">
                  <div className="px-4 py-2 border-b border-white/10 min-w-0">
                    <p className="font-semibold text-[#F7F4EE] truncate">{user.displayName || 'Patron'}</p>
                    <p className="text-[11px] text-[#F7F4EE]/60 truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('admin');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/5 font-medium text-[#D4AF37] break-words"
                  >
                    Store Management Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/5 text-red-400 flex items-center gap-2 min-w-0"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span className="min-w-0 break-words">Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Cart Control */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[#D4AF37] hover:text-[#F7F4EE] transition-colors text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 min-h-[32px] sm:min-h-[40px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <span className="hidden min-[400px]:inline">Cart</span>
              <ShoppingCart className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="tabular-nums">({cartCount})</span>
            </button>

            {/* Mobile / Tablet Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 sm:p-2 text-[#E8D5A7] hover:text-[#D4AF37] md:hidden min-w-[34px] min-h-[34px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Quick Navigation Strip (All primary nav links always visible below header on < md screens) */}
        <nav
          aria-label="Mobile Quick Navigation"
          className="md:hidden w-full min-w-0 flex items-center flex-wrap justify-center gap-x-3 gap-y-1.5 pb-2.5 pt-1 border-t border-[#C5A059]/15 text-[11px] font-sans font-medium text-[#F7F4EE]/90"
        >
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-center leading-tight py-0.5 transition-colors ${
              currentPage === 'shop' &&
              !filterParams.newArrivalsOnly &&
              !filterParams.gender &&
              !filterParams.collection &&
              !filterParams.saleOnly
                ? 'text-[#D4AF37] underline underline-offset-4'
                : 'hover:text-[#D4AF37]'
            }`}
          >
            All Catalog
          </button>
          <button
            type="button"
            onClick={() => navigateTo('shop', { newArrivalsOnly: true })}
            className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-center leading-tight py-0.5 transition-colors ${
              isNavActive('new-in') ? 'text-[#D4AF37] underline underline-offset-4' : 'hover:text-[#D4AF37]'
            }`}
          >
            New In
          </button>
          <button
            type="button"
            onClick={() => navigateTo('shop', { gender: 'Men' })}
            className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-center leading-tight py-0.5 transition-colors ${
              isNavActive('mens') ? 'text-[#D4AF37] underline underline-offset-4' : 'hover:text-[#D4AF37]'
            }`}
          >
            Mens Collection
          </button>
          <button
            type="button"
            onClick={() => navigateTo('shop', { gender: 'Women' })}
            className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-center leading-tight py-0.5 transition-colors ${
              isNavActive('womens') ? 'text-[#D4AF37] underline underline-offset-4' : 'hover:text-[#D4AF37]'
            }`}
          >
            Womens Collection
          </button>
          <button
            type="button"
            onClick={() => navigateTo('shop', { collection: 'The Shahi Collection' })}
            className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-center leading-tight py-0.5 transition-colors ${
              isNavActive('luxury') ? 'text-[#D4AF37] underline underline-offset-4' : 'hover:text-[#D4AF37]'
            }`}
          >
            Luxury
          </button>
          <button
            type="button"
            onClick={() => navigateTo('shop', { saleOnly: true })}
            className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-center leading-tight py-0.5 transition-colors ${
              isNavActive('sale') ? 'text-[#D4AF37] underline underline-offset-4' : 'hover:text-[#D4AF37]'
            }`}
          >
            Sale
          </button>
          <button
            type="button"
            onClick={() => navigateTo('location')}
            className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-center leading-tight py-0.5 transition-colors ${
              currentPage === 'location' ? 'text-[#D4AF37] underline underline-offset-4' : 'hover:text-[#D4AF37]'
            }`}
          >
            Location
          </button>
        </nav>
      </div>

      {/* Mobile Slide-Out Drawer (Noir & Gold) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-full max-w-[min(24rem,100vw)] bg-[#0B0B0E] border-r border-[#C5A059]/30 shadow-2xl flex flex-col z-50 text-[#F7F4EE] overflow-hidden min-w-0">
            <div className="p-4 border-b border-[#C5A059]/25 flex items-center justify-between gap-2 bg-[#060608] min-w-0">
              <span className="font-serif tracking-[0.14em] sm:tracking-[0.16em] uppercase text-sm sm:text-base text-[#D4AF37] min-w-0 flex-1 truncate">
                NIAZ CLOTH HOUSE
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
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

            {/* Mobile Currency Switcher */}
            <div className="px-4 py-3 border-b border-[#C5A059]/20 bg-[#08080B]">
              <CurrencyConverterToggle variant="expanded" />
            </div>

            {/* Quick Mobile Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border-b border-white/10 text-xs font-medium min-w-0">
              <button
                type="button"
                onClick={() => {
                  navigateTo('shop');
                  setMobileMenuOpen(false);
                }}
                className="min-w-0 py-2 px-2 border border-[#C5A059]/30 text-[#E8D5A7] hover:border-[#D4AF37] text-center break-words [overflow-wrap:anywhere]"
              >
                All Catalog
              </button>
              <button
                type="button"
                onClick={() => {
                  navigateTo('shop', { newArrivalsOnly: true });
                  setMobileMenuOpen(false);
                }}
                className="min-w-0 py-2 px-2 border border-[#C5A059]/30 text-[#E8D5A7] hover:border-[#D4AF37] text-center break-words [overflow-wrap:anywhere]"
              >
                New In
              </button>
              <button
                type="button"
                onClick={() => {
                  navigateTo('shop', { collection: 'The Shahi Collection' });
                  setMobileMenuOpen(false);
                }}
                className="min-w-0 py-2 px-2 border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] text-center break-words [overflow-wrap:anywhere]"
              >
                Luxury
              </button>
              <button
                type="button"
                onClick={() => {
                  navigateTo('shop', { saleOnly: true });
                  setMobileMenuOpen(false);
                }}
                className="min-w-0 py-2 px-2 border border-[#C5A059]/30 text-[#E8D5A7] hover:border-[#D4AF37] text-center break-words [overflow-wrap:anywhere]"
              >
                Sale
              </button>
              <button
                type="button"
                onClick={() => {
                  navigateTo('shop', { favoritesOnly: true });
                  setMobileMenuOpen(false);
                }}
                className="min-w-0 py-2 px-2 border border-[#C5A059]/30 text-[#E8D5A7] hover:border-[#D4AF37] text-center break-words [overflow-wrap:anywhere]"
              >
                Wishlist ({wishlist.length})
              </button>
            </div>

            {/* Department Tabs */}
            <div className="grid grid-cols-2 border-b border-white/10 text-center font-semibold text-xs uppercase tracking-widest">
              <button
                type="button"
                onClick={() => setMobileActiveTab('women')}
                className={`min-w-0 px-2 py-3 transition-colors break-words ${
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
                className={`min-w-0 px-2 py-3 transition-colors break-words ${
                  mobileActiveTab === 'men'
                    ? 'border-b-2 border-[#D4AF37] text-[#D4AF37] bg-white/5'
                    : 'text-[#F7F4EE]/60 hover:text-white'
                }`}
              >
                Men's Suiting
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0">
              {mobileActiveTab === 'women' ? (
                <>
                  <div className="border border-white/10 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileAccordion((p) => ({ ...p, womenEmbroidered: !p.womenEmbroidered }))
                      }
                      className="w-full flex items-center justify-between gap-2 p-3 bg-white/5 text-xs font-semibold tracking-wider uppercase text-[#D4AF37] text-left"
                    >
                      <span className="min-w-0 break-words">Embroidered Collection</span>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          mobileAccordion.womenEmbroidered ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {mobileAccordion.womenEmbroidered && (
                      <div className="p-3 grid grid-cols-2 gap-2 text-xs text-[#F7F4EE]/80 min-w-0">
                        {WOMEN_EMBROIDERY_BRANDS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              navigateTo('shop', { gender: 'Women', craftType: 'Embroidery', brand: b });
                              setMobileMenuOpen(false);
                            }}
                            className="w-full min-w-0 text-left py-1 hover:text-[#D4AF37] break-words [overflow-wrap:anywhere] leading-snug"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border border-white/10 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileAccordion((p) => ({ ...p, womenPrinted: !p.womenPrinted }))
                      }
                      className="w-full flex items-center justify-between gap-2 p-3 bg-white/5 text-xs font-semibold tracking-wider uppercase text-[#D4AF37] text-left"
                    >
                      <span className="min-w-0 break-words">Printed Collection</span>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          mobileAccordion.womenPrinted ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {mobileAccordion.womenPrinted && (
                      <div className="p-3 grid grid-cols-2 gap-2 text-xs text-[#F7F4EE]/80 min-w-0">
                        {WOMEN_PRINTED_BRANDS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              navigateTo('shop', { gender: 'Women', craftType: 'Printed', brand: b });
                              setMobileMenuOpen(false);
                            }}
                            className="w-full min-w-0 text-left py-1 hover:text-[#D4AF37] break-words [overflow-wrap:anywhere] leading-snug"
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
                    className="w-full py-3 px-4 border border-[#C5A059]/40 hover:border-[#D4AF37] text-xs font-semibold uppercase tracking-wider text-[#F7F4EE] flex items-center justify-between gap-2 min-w-0"
                  >
                    <span className="min-w-0 break-words text-left">All Women's Fabrics</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  </button>
                </>
              ) : (
                <>
                  <div className="border border-white/10 min-w-0">
                    <div className="p-3 bg-white/5 text-xs font-semibold tracking-wider uppercase text-[#D4AF37] border-b border-white/10">
                      Men's Signature Cuts
                    </div>
                    <div className="p-3 space-y-2 text-xs text-[#F7F4EE]/85 min-w-0">
                      {MENS_FABRICS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men', fabric: f });
                            setMobileMenuOpen(false);
                          }}
                          className="w-full min-w-0 py-1.5 text-left flex items-center justify-between gap-2 hover:text-[#D4AF37] border-b border-white/5 last:border-0"
                        >
                          <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">{f} Suiting</span>
                          <span className="text-[10px] text-[#F7F4EE]/50 shrink-0">4.5m Cut</span>
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
                    className="w-full py-3 px-4 border border-[#C5A059]/40 hover:border-[#D4AF37] text-xs font-semibold uppercase tracking-wider text-[#F7F4EE] flex items-center justify-between gap-2 min-w-0"
                  >
                    <span className="min-w-0 break-words text-left">All Men's Fabrics</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  </button>
                </>
              )}

              <div className="pt-4 border-t border-white/10 space-y-3 text-xs text-[#F7F4EE]/80 min-w-0">
                <a
                  href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20want%20to%20order%20fabrics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-w-0 py-2.5 px-3 bg-[#25D366] hover:bg-[#20BD5A] text-black flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-[11px] text-center break-words"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="min-w-0 break-words">WhatsApp Concierge (0334-6565636)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigateTo('location');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left flex items-center gap-2 hover:text-[#D4AF37] min-w-0"
                >
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">Paris Bazaar, Committee Chowk, Rawalpindi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigateTo('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left flex items-center gap-2 hover:text-[#D4AF37] font-semibold min-w-0"
                >
                  <UserIcon className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">Store Management Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
