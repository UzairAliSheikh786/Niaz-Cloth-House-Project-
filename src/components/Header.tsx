import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Phone, 
  MapPin, 
  LogOut, 
  Truck, 
  Check, 
  Flame, 
  ArrowRight,
  Compass,
  Sparkles
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { WOMEN_EMBROIDERY_BRANDS, WOMEN_PRINTED_BRANDS, MENS_FABRICS } from '../types';

export const Header: React.FC = () => {
  const { cartCount, cartTotal, setIsCartOpen, setIsSearchOpen, wishlist, orders } = useShop();
  const { currentPage, filterParams, navigateTo, setIsMapAgentOpen } = useNavigation();
  const { user, openAuthModal, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'women' | 'men' | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'women' | 'men'>('women');
  const [mobileAccordion, setMobileAccordion] = useState<{
    womenEmbroidered: boolean;
    womenPrinted: boolean;
    menFabrics: boolean;
  }>({
    womenEmbroidered: true,
    womenPrinted: false,
    menFabrics: true,
  });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'AED' | 'GBP'>('PKR');

  // Announcement bar rotating ticker
  const tickerMessages = [
    "SUMMER FESTIVE UNSTITCHED '26 IS LIVE · 100% ORIGINAL DESIGNER FABRICS",
    "FREE NATIONWIDE EXPRESS SHIPPING ON ALL ORDERS OVER PKR 5,000",
    "WHATSAPP CONCIERGE & VIDEO SUIT INSPECTION: 0334-6565636",
    "AUTHENTIC PAKISTANI FABRICS · SHOP # 166-C PARIS BAZAAR RAWALPINDI"
  ];
  const [currentTicker, setCurrentTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTicker((prev) => (prev + 1) % tickerMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [tickerMessages.length]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setActiveMegaMenu(null);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const userOrdersCount = user
    ? orders.filter(
        (o) =>
          (o as any).userId === user.uid ||
          o.customer.fullName.toLowerCase().includes((user.displayName || '').toLowerCase())
      ).length
    : 0;

  return (
    <header className="w-full bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E8E0D2] sticky top-0 z-40 transition-all shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
      {/* 1. Luxury Heritage Top Announcement Bar */}
      <div className="bg-[#1F1F1F] text-[#F7F4EE] py-2 px-4 sm:px-6 lg:px-12 text-[11px] font-sans font-medium tracking-wider flex items-center justify-between border-b border-[#D4AF37]/20">
        <div className="flex-1 text-center sm:text-left overflow-hidden">
          <p className="truncate animate-fadeIn text-[#F7F4EE]/90">
            <span className="text-[#D4AF37] mr-2">◈ HERITAGE ATELIER</span>
            {tickerMessages[currentTicker]}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6 shrink-0 text-[#E8E0D2]/80">
          <a
            href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20want%20to%20inquire%20about%20your%20unstitched%20fabrics"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3 h-3 text-[#D4AF37]" />
            <span className="font-sans">0334-6565636</span>
          </a>

          <button
            onClick={() => navigateTo('location')}
            className="hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3 h-3 text-[#D4AF37]" />
            <span>Paris Bazaar, Rawalpindi</span>
          </button>

          <button
            onClick={() => setIsMapAgentOpen(true)}
            className="hover:text-[#D4AF37] text-[#D4AF37] flex items-center gap-1.5 transition-colors font-medium"
            title="Open Interactive Google Maps Route & Places Agent"
          >
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Store Route &amp; Maps</span>
          </button>

          {/* Currency selector */}
          <div className="flex items-center gap-1 text-[10px] text-[#E8E0D2]/60 pl-3 border-l border-white/20">
            {(['PKR', 'USD', 'AED'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-1.5 py-0.5 font-medium transition-colors ${
                  currency === curr ? 'text-[#D4AF37] underline underline-offset-2' : 'hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Brand Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-22">
          {/* Mobile Hamburger & Search Buttons */}
          <div className="flex items-center lg:hidden gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#1F1F1F] hover:text-[#D4AF37] focus:outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#1F1F1F] hover:text-[#D4AF37] min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Search catalog"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between bg-white hover:bg-[#F7F4EE] border border-[#E8E0D2] hover:border-[#D4AF37] text-[#1F1F1F]/60 px-3.5 py-2 text-xs tracking-wide transition-all group cursor-text rounded-xs"
            >
              <span className="truncate">Search unstitched fabrics, silk, lawn...</span>
              <Search className="w-4 h-4 text-[#1F1F1F]/50 group-hover:text-[#D4AF37] shrink-0 ml-2" />
            </button>
          </div>

          {/* Center Brand Identity */}
          <div className="flex-1 lg:flex-initial text-center px-1 sm:px-4 min-w-0 overflow-hidden">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('home');
              }}
              className="inline-block group focus:outline-none max-w-full"
            >
              <span className="block font-serif text-lg sm:text-2xl lg:text-3xl tracking-[0.14em] uppercase text-[#1F1F1F] group-hover:text-[#D4AF37] transition-colors truncate font-light">
                NIAZ CLOTH HOUSE
              </span>
              <span className="block text-[8px] sm:text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-sans font-medium mt-0.5 truncate">
                DRESS TO IMPRESS · ESTABLISHED 1970
              </span>
            </a>
          </div>

          {/* Right Action Icons: User Account, Wishlist, Cart */}
          <div className="flex items-center justify-end shrink-0 lg:flex-1 lg:max-w-xs gap-1 sm:gap-3">
            {/* User Account / Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  if (user) {
                    setUserDropdownOpen(!userDropdownOpen);
                  } else {
                    openAuthModal();
                  }
                }}
                className="p-2 text-[#1F1F1F] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors focus:outline-none"
                aria-label="Account login and profile"
              >
                <UserIcon className="w-5 h-5 text-[#1F1F1F]" />
                <span className="hidden xl:inline text-xs font-medium tracking-wider uppercase text-[#1F1F1F] hover:text-[#D4AF37]">
                  {user ? (user.displayName || 'Patron').split(' ')[0] : 'SIGN IN'}
                </span>
              </button>

              {user && userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E0D2] shadow-xl py-2 z-50 text-xs text-[#1F1F1F]">
                  <div className="px-4 py-2 border-b border-[#E8E0D2]">
                    <p className="font-semibold text-[#1F1F1F] truncate">{user.displayName || 'Distinguished Patron'}</p>
                    <p className="text-[11px] text-[#1F1F1F]/60 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigateTo('admin');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F7F4EE] font-medium text-[#D4AF37]"
                  >
                    Admin Control Centre
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F7F4EE] text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => navigateTo('shop', { favoritesOnly: true })}
              className="p-2 text-[#1F1F1F] hover:text-[#D4AF37] relative transition-colors focus:outline-none hidden sm:flex items-center"
              aria-label={`Wishlist (${wishlist.length} items)`}
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#D4AF37] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag / Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-[#1F1F1F] hover:bg-white border border-[#E8E0D2] hover:border-[#D4AF37] transition-all focus:outline-none rounded-xs"
              aria-label={`View cart (${cartCount} items)`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#1F1F1F]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-wider text-[#1F1F1F]/60 font-medium leading-tight font-sans">Bag</span>
                <span className="text-xs font-semibold text-[#1F1F1F] leading-tight font-sans">
                  {cartTotal > 0 ? formatPKR(cartTotal) : 'PKR 0'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Primary Navigation Bar */}
        <nav className="hidden lg:flex items-center justify-center border-t border-white/10 py-3 gap-8 text-[12px] font-sans font-semibold tracking-[0.16em] uppercase text-neutral-300 select-none">
          {/* WOMEN DROP-DOWN */}
          <div
            className="relative group py-1"
            onMouseEnter={() => setActiveMegaMenu('women')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <button
              onClick={() => navigateTo('shop', { gender: 'Women' })}
              className={`hover:text-black flex items-center gap-1 transition-colors ${
                filterParams.gender === 'Women' ? 'text-black underline underline-offset-8 decoration-2' : ''
              }`}
            >
              <span>WOMEN</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-transform group-hover:rotate-180" />
            </button>

            {/* Mega Menu Dropdown */}
            {activeMegaMenu === 'women' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[920px] bg-white border border-[#E8E0D2] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-8 z-50 animate-fadeIn text-[#1F1F1F]">
                <div className="grid grid-cols-4 gap-8">
                  {/* Col 1: Embroidered Collection */}
                  <div>
                    <h3 className="text-xs font-semibold tracking-widest uppercase text-[#1F1F1F] pb-2 border-b border-[#E8E0D2] mb-3 flex items-center justify-between">
                      <span className="text-[#D4AF37]">Embroidered Collection</span>
                    </h3>
                    <ul className="space-y-2 text-[11px] font-medium text-[#1F1F1F]/70">
                      {WOMEN_EMBROIDERY_BRANDS.map((brand) => (
                        <li key={brand}>
                          <button
                            onClick={() => {
                              navigateTo('shop', { gender: 'Women', craftType: 'Embroidery', brand });
                              setActiveMegaMenu(null);
                            }}
                            className="hover:text-[#D4AF37] hover:translate-x-1 transition-all block text-left"
                          >
                            {brand}
                          </button>
                        </li>
                      ))}
                      <li className="pt-2 border-t border-[#E8E0D2]">
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' });
                            setActiveMegaMenu(null);
                          }}
                          className="text-[#D4AF37] font-semibold flex items-center gap-1 hover:underline"
                        >
                          View All Embroidered →
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Col 2: Printed Collection */}
                  <div>
                    <h3 className="text-xs font-black tracking-widest uppercase text-black pb-2 border-b border-neutral-200 mb-3 flex items-center justify-between">
                      <span>Printed Collection</span>
                    </h3>
                    <ul className="space-y-2 text-[11px] font-medium text-neutral-600">
                      {WOMEN_PRINTED_BRANDS.map((brand) => (
                        <li key={brand}>
                          <button
                            onClick={() => {
                              navigateTo('shop', { gender: 'Women', craftType: 'Printed', brand });
                              setActiveMegaMenu(null);
                            }}
                            className="hover:text-black hover:translate-x-1 transition-all block text-left"
                          >
                            {brand}
                          </button>
                        </li>
                      ))}
                      <li className="pt-2 border-t border-neutral-100">
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Women', craftType: 'Printed' });
                            setActiveMegaMenu(null);
                          }}
                          className="text-black font-bold flex items-center gap-1 hover:underline"
                        >
                          View All Printed →
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Col 3: Shop By Suit Type */}
                  <div>
                    <h3 className="text-xs font-black tracking-widest uppercase text-black pb-2 border-b border-neutral-200 mb-3">
                      Shop By Suit Type
                    </h3>
                    <ul className="space-y-2.5 text-[11px] font-medium text-neutral-600">
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Women' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Unstitched 3-Piece Suits
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Women', fabric: 'Luxury Lawn' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Premium Swiss & Luxury Lawn
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Women', fabric: 'Embroidered Chiffon' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Chiffon & Organza Dupatta Suits
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Women', fabric: 'Silk Jacquard' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Festive Silk & Jacquard
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Col 4: Visual Promo Banner */}
                  <div className="bg-neutral-100 p-4 flex flex-col justify-between border border-neutral-200">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block mb-1">
                        Festive Volume '26
                      </span>
                      <h4 className="text-sm font-black uppercase text-black mb-1">
                        Embroidered Luxury Lawn
                      </h4>
                      <p className="text-[11px] text-neutral-600 normal-case mb-4">
                        Featuring Johara, Tawakkal & Bin Rashid unstitched 3-piece collections.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' });
                        setActiveMegaMenu(null);
                      }}
                      className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 text-center text-[10px] font-bold tracking-widest uppercase transition-colors"
                    >
                      Shop Collection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MEN DROP-DOWN */}
          <div
            className="relative group py-1"
            onMouseEnter={() => setActiveMegaMenu('men')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <button
              onClick={() => navigateTo('shop', { gender: 'Men' })}
              className={`hover:text-black flex items-center gap-1 transition-colors ${
                filterParams.gender === 'Men' ? 'text-black underline underline-offset-8 decoration-2' : ''
              }`}
            >
              <span>MEN</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-transform group-hover:rotate-180" />
            </button>

            {/* Men's Mega Menu Dropdown */}
            {activeMegaMenu === 'men' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[760px] bg-white border border-[#E8E0D2] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-8 z-50 animate-fadeIn text-[#1F1F1F]">
                <div className="grid grid-cols-3 gap-8">
                  {/* Col 1: Fabrics */}
                  <div>
                    <h3 className="text-xs font-semibold tracking-widest uppercase text-[#1F1F1F] pb-2 border-b border-[#E8E0D2] mb-3">
                      <span className="text-[#D4AF37]">Men's Signature Fabrics</span>
                    </h3>
                    <ul className="space-y-2.5 text-[11px] font-medium text-[#1F1F1F]/70">
                      {MENS_FABRICS.map((fabric) => (
                        <li key={fabric}>
                          <button
                            onClick={() => {
                              navigateTo('shop', { gender: 'Men', fabric });
                              setActiveMegaMenu(null);
                            }}
                            className="hover:text-[#D4AF37] hover:translate-x-1 transition-all block text-left font-medium"
                          >
                            {fabric} Suiting
                          </button>
                        </li>
                      ))}
                      <li className="pt-2 border-t border-[#E8E0D2]">
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men' });
                            setActiveMegaMenu(null);
                          }}
                          className="text-[#D4AF37] font-semibold flex items-center gap-1 hover:underline"
                        >
                          View All Men's Fabrics →
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Col 2: Cuts & Occasion */}
                  <div>
                    <h3 className="text-xs font-black tracking-widest uppercase text-black pb-2 border-b border-neutral-200 mb-3">
                      Suiting Cuts & Grades
                    </h3>
                    <ul className="space-y-2.5 text-[11px] font-medium text-neutral-600">
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men', fabric: 'Wash & Wear' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Wash & Wear (Wrinkle-Resistant)
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men', fabric: 'Boski' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Pure Chinese Boski (6 & 8-Pound)
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men', fabric: 'Cotton' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Crisp Finish & Combed Cotton
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men', fabric: 'Khaddar' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Authentic Kamalia Khaddar
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men', fabric: 'Lelan' });
                            setActiveMegaMenu(null);
                          }}
                          className="hover:text-black block text-left"
                        >
                          Textured Lelan Unstitched Cut
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Col 3: Banner */}
                  <div className="bg-neutral-100 p-4 flex flex-col justify-between border border-neutral-200">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-800 block mb-1">
                        Executive Wardrobe
                      </span>
                      <h4 className="text-sm font-black uppercase text-black mb-1">
                        Wash & Wear Suiting
                      </h4>
                      <p className="text-[11px] text-neutral-600 normal-case mb-4">
                        Full 4.5m unstitched cuts in Bara Arz (double width) with certified finish.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigateTo('shop', { gender: 'Men', fabric: 'Wash & Wear' });
                        setActiveMegaMenu(null);
                      }}
                      className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 text-center text-[10px] font-bold tracking-widest uppercase transition-colors"
                    >
                      Shop Wash & Wear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DIRECT CATEGORY LINKS */}
          <button
            onClick={() => navigateTo('shop', { craftType: 'Embroidery', gender: 'Women' })}
            className="hover:text-black transition-colors"
          >
            EMBROIDERED
          </button>

          <button
            onClick={() => navigateTo('shop', { craftType: 'Printed', gender: 'Women' })}
            className="hover:text-black transition-colors"
          >
            PRINTED
          </button>

          <button
            onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Wash & Wear' })}
            className="hover:text-black transition-colors"
          >
            WASH & WEAR
          </button>

          <button
            onClick={() => navigateTo('shop', { gender: 'Men', fabric: 'Boski' })}
            className="hover:text-black transition-colors"
          >
            PURE BOSKI
          </button>

          <button
            onClick={() => navigateTo('shop', { newArrivalsOnly: true })}
            className="hover:text-black transition-colors"
          >
            NEW ARRIVALS
          </button>

          <button
            onClick={() => navigateTo('shop', { saleOnly: true })}
            className="text-red-600 hover:text-red-700 font-bold transition-colors flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 fill-red-600" />
            <span>SPECIAL OFFERS</span>
          </button>
        </nav>
      </div>

      {/* 4. Mobile Limelight Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
              <span className="font-sans font-black tracking-widest uppercase text-base text-black">
                NIAZ CLOTH HOUSE
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-neutral-600 hover:text-black"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department Tabs: Women vs Men */}
            <div className="grid grid-cols-2 border-b border-neutral-200 text-center font-bold text-xs uppercase tracking-widest">
              <button
                onClick={() => setMobileActiveTab('women')}
                className={`py-3 transition-colors ${
                  mobileActiveTab === 'women'
                    ? 'border-b-2 border-black text-black bg-neutral-50'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Women's Collection
              </button>
              <button
                onClick={() => setMobileActiveTab('men')}
                className={`py-3 transition-colors ${
                  mobileActiveTab === 'men'
                    ? 'border-b-2 border-black text-black bg-neutral-50'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Men's Suiting
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mobileActiveTab === 'women' ? (
                <>
                  {/* Embroidered Brands Accordion */}
                  <div className="border border-neutral-200">
                    <button
                      onClick={() =>
                        setMobileAccordion((p) => ({ ...p, womenEmbroidered: !p.womenEmbroidered }))
                      }
                      className="w-full flex items-center justify-between p-3 bg-neutral-50 text-xs font-black tracking-wider uppercase text-black"
                    >
                      <span>Embroidered Collection</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          mobileAccordion.womenEmbroidered ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {mobileAccordion.womenEmbroidered && (
                      <div className="p-3 bg-white grid grid-cols-2 gap-2 text-xs text-neutral-700">
                        {WOMEN_EMBROIDERY_BRANDS.map((b) => (
                          <button
                            key={b}
                            onClick={() => {
                              navigateTo('shop', { gender: 'Women', craftType: 'Embroidery', brand: b });
                              setMobileMenuOpen(false);
                            }}
                            className="text-left py-1 hover:text-black hover:font-bold"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Printed Brands Accordion */}
                  <div className="border border-neutral-200">
                    <button
                      onClick={() =>
                        setMobileAccordion((p) => ({ ...p, womenPrinted: !p.womenPrinted }))
                      }
                      className="w-full flex items-center justify-between p-3 bg-neutral-50 text-xs font-black tracking-wider uppercase text-black"
                    >
                      <span>Printed Collection</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          mobileAccordion.womenPrinted ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {mobileAccordion.womenPrinted && (
                      <div className="p-3 bg-white grid grid-cols-2 gap-2 text-xs text-neutral-700">
                        {WOMEN_PRINTED_BRANDS.map((b) => (
                          <button
                            key={b}
                            onClick={() => {
                              navigateTo('shop', { gender: 'Women', craftType: 'Printed', brand: b });
                              setMobileMenuOpen(false);
                            }}
                            className="text-left py-1 hover:text-black hover:font-bold"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Links */}
                  <div className="pt-2 space-y-2 text-xs font-semibold uppercase tracking-wider text-black">
                    <button
                      onClick={() => {
                        navigateTo('shop', { gender: 'Women' });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-left flex items-center justify-between"
                    >
                      <span>All Women's Unstitched</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Men's Fabrics Accordion */}
                  <div className="border border-neutral-200">
                    <div className="p-3 bg-neutral-50 text-xs font-black tracking-wider uppercase text-black border-b border-neutral-200">
                      Men's Fabrics & Cuts
                    </div>
                    <div className="p-3 bg-white space-y-2 text-xs text-neutral-800">
                      {MENS_FABRICS.map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            navigateTo('shop', { gender: 'Men', fabric: f });
                            setMobileMenuOpen(false);
                          }}
                          className="w-full py-1.5 text-left flex items-center justify-between hover:text-black font-medium border-b border-neutral-100 last:border-0"
                        >
                          <span>{f} Suiting</span>
                          <span className="text-[10px] text-neutral-400">4.5m Cut</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 space-y-2 text-xs font-semibold uppercase tracking-wider text-black">
                    <button
                      onClick={() => {
                        navigateTo('shop', { gender: 'Men' });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-left flex items-center justify-between"
                    >
                      <span>All Men's Fabrics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}

              {/* Utility Links in Mobile Menu */}
              <div className="pt-4 border-t border-neutral-200 space-y-3 text-xs text-neutral-700 font-medium">
                <a
                  href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20want%20to%20order%20unstitched%20fabrics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-[11px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Order (0334-6565636)</span>
                </a>

                <button
                  onClick={() => {
                    navigateTo('location');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left flex items-center gap-2 hover:text-black"
                >
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <span>Visit Shop # 166-C Paris Bazaar Rawalpindi</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left flex items-center gap-2 hover:text-black font-semibold"
                >
                  <UserIcon className="w-4 h-4 text-neutral-500" />
                  <span>Merchant Admin Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
