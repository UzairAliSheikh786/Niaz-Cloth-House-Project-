import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon,
  Layers,
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Sun, 
  Flame, 
  MapPin, 
  Sparkles, 
  MessageCircle
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { currentPage, navigateTo, filterParams } = useNavigation();
  const { cartCount, setIsCartOpen, setIsSearchOpen, orders } = useShop();
  const { user, openAuthModal, logout } = useAuth();
  
  // Mobile / responsive sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Submenu accordions inside sidebar
  const [menExpanded, setMenExpanded] = useState(
    currentPage === 'men-summer' || currentPage === 'men-winter' || filterParams.gender === 'Men'
  );
  const [womenExpanded, setWomenExpanded] = useState(
    currentPage === 'women-summer' || currentPage === 'women-winter' || filterParams.gender === 'Women'
  );
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    setUserDropdownOpen(false);
  }, [currentPage]);

  // Keep men/women accordion expanded when browsing their collections
  useEffect(() => {
    if (currentPage === 'men-summer' || currentPage === 'men-winter' || filterParams.gender === 'Men') {
      setMenExpanded(true);
    }
    if (currentPage === 'women-summer' || currentPage === 'women-winter' || filterParams.gender === 'Women') {
      setWomenExpanded(true);
    }
  }, [currentPage, filterParams.gender]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSidebarOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const userOrdersCount = user
    ? orders.filter((o) => (o as any).userId === user.uid || o.customer.fullName.toLowerCase().includes((user.displayName || '').toLowerCase())).length
    : 0;

  // Sidebar navigation items content
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#141414] text-[#FAF9F6] border-r border-[#262626] select-none">
      {/* 1. Brand Logo / Wordmark Header */}
      <div className="p-6 border-b border-[#262626] bg-[#121212] shrink-0">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('home');
            setMobileSidebarOpen(false);
          }}
          className="block group focus-visible:outline-none"
          aria-label="Niaz Cloth House Home"
        >
          <span className="font-serif text-xl xl:text-2xl font-bold tracking-[0.18em] uppercase text-white group-hover:text-[#D4AF37] transition-colors leading-tight block">
            Niaz Cloth
          </span>
          <span className="font-serif text-lg xl:text-xl font-medium tracking-[0.24em] uppercase text-[#D4AF37] block -mt-0.5">
            House
          </span>
          <div className="w-12 h-[2px] bg-[#D4AF37] mt-2 group-hover:w-20 transition-all duration-300" />
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/50 font-sans block mt-2">
            Paris Bazaar · Est. 1970
          </span>
        </a>
      </div>

      {/* 2. Primary Navigation Links (Navigators) */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 text-xs font-semibold tracking-wider uppercase font-sans">
        <div className="px-3 pb-2 text-[10px] tracking-[0.2em] text-white/40 uppercase font-sans font-bold">
          Navigation
        </div>

        {/* Navigator: Home */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('home');
            setMobileSidebarOpen(false);
          }}
          className={`flex items-center justify-between px-3.5 py-3 transition-all duration-150 rounded-none border-l-2 ${
            currentPage === 'home'
              ? 'border-[#D4AF37] bg-white/[0.07] text-[#D4AF37] font-bold'
              : 'border-transparent text-white/80 hover:text-white hover:bg-white/[0.04] hover:border-[#D4AF37]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <HomeIcon className="w-4 h-4 text-[#D4AF37]" />
            <span>Home</span>
          </div>
          {currentPage === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          )}
        </a>

        {/* Navigator: All Fabrics */}
        <a
          href="/shop"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('shop');
            setMobileSidebarOpen(false);
          }}
          className={`flex items-center justify-between px-3.5 py-3 transition-all duration-150 rounded-none border-l-2 ${
            currentPage === 'shop' && !filterParams.gender && !filterParams.craftType
              ? 'border-[#D4AF37] bg-white/[0.07] text-[#D4AF37] font-bold'
              : 'border-transparent text-white/80 hover:text-white hover:bg-white/[0.04] hover:border-[#D4AF37]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span>All Fabrics</span>
          </div>
          {currentPage === 'shop' && !filterParams.gender && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          )}
        </a>

        {/* Navigator: Men's Suiting (Accordion) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setMenExpanded(!menExpanded)}
            className={`w-full flex items-center justify-between px-3.5 py-3 transition-all duration-150 border-l-2 text-left ${
              currentPage === 'men-summer' || currentPage === 'men-winter' || filterParams.gender === 'Men'
                ? 'border-[#D4AF37] bg-white/[0.07] text-[#D4AF37] font-bold'
                : 'border-transparent text-white/80 hover:text-white hover:bg-white/[0.04] hover:border-[#D4AF37]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-[#D4AF37]" />
              <span>Men's Suiting</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${menExpanded ? 'rotate-180 text-[#D4AF37]' : ''}`} />
          </button>

          {menExpanded && (
            <div className="pl-6 pr-2 py-1.5 space-y-1 bg-black/20 border-l border-[#262626] ml-4 mt-1">
              <a
                href="/collections/men-summer"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('men-summer');
                  setMobileSidebarOpen(false);
                }}
                className={`block px-3 py-2 text-[11px] font-medium tracking-wide normal-case transition-colors ${
                  currentPage === 'men-summer'
                    ? 'text-[#D4AF37] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Summer (Egyptian Latha & Boski)
              </a>
              <a
                href="/collections/men-winter"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('men-winter');
                  setMobileSidebarOpen(false);
                }}
                className={`block px-3 py-2 text-[11px] font-medium tracking-wide normal-case transition-colors ${
                  currentPage === 'men-winter'
                    ? 'text-[#D4AF37] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Winter (Khaddar, Karandi & 10lb)
              </a>
            </div>
          )}
        </div>

        {/* Navigator: Women's Festive (Accordion) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setWomenExpanded(!womenExpanded)}
            className={`w-full flex items-center justify-between px-3.5 py-3 transition-all duration-150 border-l-2 text-left ${
              currentPage === 'women-summer' || currentPage === 'women-winter' || filterParams.gender === 'Women'
                ? 'border-[#D4AF37] bg-white/[0.07] text-[#D4AF37] font-bold'
                : 'border-transparent text-white/80 hover:text-white hover:bg-white/[0.04] hover:border-[#D4AF37]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Women's Festive</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${womenExpanded ? 'rotate-180 text-[#D4AF37]' : ''}`} />
          </button>

          {womenExpanded && (
            <div className="pl-6 pr-2 py-1.5 space-y-1 bg-black/20 border-l border-[#262626] ml-4 mt-1">
              <a
                href="/shop?gender=Women&craft=Embroidery"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' });
                  setMobileSidebarOpen(false);
                }}
                className="block px-3 py-2 text-[11px] font-medium tracking-wide normal-case text-white/70 hover:text-white transition-colors"
              >
                ★ Luxury Embroidered 3-Piece
              </a>
              <a
                href="/shop?gender=Women&craft=Printed"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('shop', { gender: 'Women', craftType: 'Printed' });
                  setMobileSidebarOpen(false);
                }}
                className="block px-3 py-2 text-[11px] font-medium tracking-wide normal-case text-white/70 hover:text-white transition-colors"
              >
                ★ Printed Lawn (Bin Saeed, H.Z)
              </a>
              <a
                href="/collections/women-summer"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('women-summer');
                  setMobileSidebarOpen(false);
                }}
                className={`block px-3 py-2 text-[11px] font-medium tracking-wide normal-case transition-colors ${
                  currentPage === 'women-summer'
                    ? 'text-[#D4AF37] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Summer Lawn & Chiffon
              </a>
              <a
                href="/collections/women-winter"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('women-winter');
                  setMobileSidebarOpen(false);
                }}
                className={`block px-3 py-2 text-[11px] font-medium tracking-wide normal-case transition-colors ${
                  currentPage === 'women-winter'
                    ? 'text-[#D4AF37] font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Winter Banarasi Jacquard
              </a>
            </div>
          )}
        </div>

        {/* Navigator: Store Location & Map */}
        <a
          href="/location"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('location');
            setMobileSidebarOpen(false);
          }}
          className={`flex items-center justify-between px-3.5 py-3 transition-all duration-150 rounded-none border-l-2 ${
            currentPage === 'location'
              ? 'border-[#D4AF37] bg-white/[0.07] text-[#D4AF37] font-bold'
              : 'border-transparent text-white/80 hover:text-white hover:bg-white/[0.04] hover:border-[#D4AF37]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>Store Location</span>
          </div>
          {currentPage === 'location' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          )}
        </a>

        {/* Section Divider */}
        <div className="pt-4 pb-2 px-3 text-[10px] tracking-[0.2em] text-white/40 uppercase font-sans font-bold border-t border-[#262626]">
          Actions & Bag
        </div>

        {/* Action: Search Catalog */}
        <button
          type="button"
          onClick={() => {
            setIsSearchOpen(true);
            setMobileSidebarOpen(false);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/[0.04] transition-colors border-l-2 border-transparent text-left"
        >
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-[#D4AF37]" />
            <span>Search Catalog</span>
          </div>
          <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 font-mono">/</span>
        </button>

        {/* Action: Shopping Bag */}
        <button
          type="button"
          onClick={() => {
            setIsCartOpen(true);
            setMobileSidebarOpen(false);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/[0.04] transition-colors border-l-2 border-transparent text-left"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span>Shopping Bag</span>
          </div>
          <span className="min-w-[20px] h-5 px-1.5 bg-[#D4AF37] text-[#141414] text-[11px] font-bold flex items-center justify-center tabular-nums">
            {cartCount}
          </span>
        </button>

        {/* Action: Customer Account */}
        {user ? (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/[0.04] transition-colors border-l-2 border-transparent text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                <span className="truncate">{user.displayName || 'Customer'}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {userDropdownOpen && (
              <div className="p-3 my-1 bg-black/40 border border-[#262626] text-xs space-y-2">
                <p className="text-[11px] text-white/60 truncate">{user.email}</p>
                <div className="flex justify-between text-[11px] text-white/70">
                  <span>Tracked Orders:</span>
                  <strong className="text-[#D4AF37] font-mono">{userOrdersCount}</strong>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      openAuthModal('profile');
                      setMobileSidebarOpen(false);
                    }}
                    className="text-[11px] text-[#D4AF37] hover:underline uppercase tracking-wider"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="text-[11px] text-red-400 hover:underline uppercase tracking-wider flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              openAuthModal('login');
              setMobileSidebarOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/[0.04] transition-colors border-l-2 border-transparent text-left"
          >
            <div className="flex items-center gap-3">
              <UserIcon className="w-4 h-4 text-[#D4AF37]" />
              <span>Sign In / Register</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </button>
        )}

        {/* Section Divider: Admin Portal */}
        <div className="pt-3">
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('admin');
              setMobileSidebarOpen(false);
            }}
            className={`flex items-center justify-between p-3 border transition-colors ${
              currentPage === 'admin'
                ? 'bg-[#D4AF37] text-[#141414] border-[#D4AF37] font-bold'
                : 'bg-black/50 hover:bg-[#D4AF37] text-white hover:text-[#141414] border-[#333333] hover:border-[#D4AF37]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:text-[#141414]" />
              <span className="text-xs font-bold tracking-wider uppercase">Admin Portal</span>
            </div>
            <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 font-bold font-mono">
              STAFF
            </span>
          </a>
        </div>
      </div>

      {/* 3. Sidebar Footer: Contact, Timings & Free Nationwide COD */}
      <div className="p-4 border-t border-[#262626] bg-[#101010] space-y-2.5 shrink-0 text-xs">
        <a
          href="https://wa.me/923346565636?text=Assalam-o-Alaikum%20Niaz%20Cloth%20House%2C%20I%20am%20inquiring%20about%20unstitched%20fabrics."
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 px-3 bg-[#1A1A1A] hover:bg-[#D4AF37] text-[#FAF9F6] hover:text-[#141414] font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors border border-[#333333]"
        >
          <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>WhatsApp 0334-6565636</span>
        </a>

        <div className="text-[10px] text-white/50 space-y-1 text-center font-sans tracking-wide">
          <div>MON–SUN 10:00 AM – 9:00 PM PKT</div>
          <div className="text-[#D4AF37]/90 font-medium tracking-wider uppercase">FREE COD NATIONWIDE</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* A. Fixed Left Vertical Sidebar on Desktop (lg: and up) */}
      <aside
        aria-label="Sidebar Navigation Menu"
        className="hidden lg:block fixed inset-y-0 left-0 w-64 xl:w-72 z-40 shadow-2xl"
      >
        {sidebarContent}
      </aside>

      {/* B. Sleek Top Navigation Bar on Mobile / Tablet (under lg) */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#141414] text-white border-b border-[#262626] px-4 h-16 flex items-center justify-between">
        {/* Mobile Left: Menu Toggle Button & Wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open navigation sidebar"
            className="p-2 -ml-2 text-white hover:text-[#D4AF37] focus-visible:outline-none flex items-center gap-1.5"
          >
            <Menu className="w-6 h-6" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#D4AF37]">Menu</span>
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
            className="font-serif text-base sm:text-lg font-bold tracking-wider uppercase text-white truncate"
          >
            Niaz Cloth House
          </a>
        </div>

        {/* Mobile Right: Search, Cart, Admin */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-white/80 hover:text-[#D4AF37]"
            aria-label="Search catalog"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white/80 hover:text-[#D4AF37]"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-4.5 px-1 bg-[#D4AF37] text-[#141414] text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigateTo('admin')}
            className="px-2.5 py-1.5 bg-[#D4AF37] text-[#141414] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1"
            title="Open Admin Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </header>

      {/* C. Mobile Slide-Over Drawer using the exact same Vertical Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <div className="relative w-4/5 max-w-xs h-full z-10 animate-in slide-in-from-left duration-250 shadow-2xl flex flex-col">
            {/* Close button overlay */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 text-white/70 hover:text-[#D4AF37] bg-black/60 rounded-full"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
