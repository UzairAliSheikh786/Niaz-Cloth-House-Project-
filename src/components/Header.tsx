import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Layers, 
  Sun, 
  Sparkles, 
  MapPin, 
  Search, 
  ShoppingBag, 
  ShieldCheck, 
  User as UserIcon, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  LogOut,
  MessageCircle,
  Scissors,
  Check
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { WOMEN_EMBROIDERY_BRANDS, WOMEN_PRINTED_BRANDS, MENS_FABRICS } from '../types';

export const Header: React.FC = () => {
  const { cartCount, setIsCartOpen, setIsSearchOpen, orders } = useShop();
  const { currentPage, filterParams, navigateTo } = useNavigation();
  const { user, openAuthModal, logout } = useAuth();

  // Accordion state for submenus inside sidebar
  const [menExpanded, setMenExpanded] = useState<boolean>(true);
  const [womenExpanded, setWomenExpanded] = useState<boolean>(true);
  const [embroideryBrandsExpanded, setEmbroideryBrandsExpanded] = useState<boolean>(false);
  const [printedBrandsExpanded, setPrintedBrandsExpanded] = useState<boolean>(false);
  
  // Mobile drawer open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Auto-expand based on active route
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

  // Sidebar navigation items content with Cool Slate & Glacier Ice Blue styling
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B132B] text-[#F8FAFC] border-r border-[#1E293B] select-none">
      {/* 1. Brand Logo / Wordmark Header */}
      <div className="p-6 border-b border-[#1E293B] bg-[#080E1E] shrink-0">
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
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#38BDF8] font-mono font-semibold">
              Authentic Fabrics
            </span>
          </div>
          <span className="font-serif text-xl xl:text-2xl font-bold tracking-[0.16em] uppercase text-white group-hover:text-[#38BDF8] transition-colors leading-tight block">
            Niaz Cloth
          </span>
          <span className="font-serif text-lg xl:text-xl font-medium tracking-[0.24em] uppercase text-[#38BDF8] block -mt-0.5">
            House
          </span>
          <div className="w-12 h-[2px] bg-[#38BDF8] mt-2 group-hover:w-20 transition-all duration-300" />
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#94A3B8] font-sans block mt-2">
            Paris Bazaar · Est. 1970
          </span>
        </a>
      </div>

      {/* 2. Primary Navigation Links (Navigators) */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 text-xs font-semibold tracking-wider uppercase font-sans custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] tracking-[0.2em] text-[#64748B] uppercase font-sans font-bold">
          Store Navigation
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
              ? 'border-[#38BDF8] bg-white/[0.08] text-[#38BDF8] font-bold shadow-xs'
              : 'border-transparent text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] hover:border-[#38BDF8]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <HomeIcon className="w-4 h-4 text-[#38BDF8]" />
            <span>Home</span>
          </div>
          {currentPage === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          )}
        </a>

        {/* Navigator: All Fabrics Catalog */}
        <a
          href="/shop"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('shop');
            setMobileSidebarOpen(false);
          }}
          className={`flex items-center justify-between px-3.5 py-3 transition-all duration-150 rounded-none border-l-2 ${
            currentPage === 'shop' && !filterParams.gender && !filterParams.craftType && !filterParams.fabric
              ? 'border-[#38BDF8] bg-white/[0.08] text-[#38BDF8] font-bold shadow-xs'
              : 'border-transparent text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] hover:border-[#38BDF8]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#38BDF8]" />
            <span>All Fabrics</span>
          </div>
          {currentPage === 'shop' && !filterParams.gender && !filterParams.craftType && !filterParams.fabric && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          )}
        </a>

        {/* Navigator: Men's Collection (Accordion) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setMenExpanded(!menExpanded)}
            className={`w-full flex items-center justify-between px-3.5 py-3 transition-all duration-150 border-l-2 text-left ${
              filterParams.gender === 'Men' || currentPage === 'men-summer' || currentPage === 'men-winter'
                ? 'border-[#38BDF8] bg-white/[0.08] text-[#38BDF8] font-bold'
                : 'border-transparent text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] hover:border-[#38BDF8]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-[#38BDF8]" />
              <span>Men's Collection</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${menExpanded ? 'rotate-180 text-[#38BDF8]' : ''}`} />
          </button>

          {menExpanded && (
            <div className="pl-4 pr-1 py-1.5 space-y-1 bg-[#070B16] border-l border-[#1E293B] ml-4 mt-1">
              <a
                href="/shop?gender=Men"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('shop', { gender: 'Men', fabric: undefined });
                  setMobileSidebarOpen(false);
                }}
                className={`block px-3 py-1.5 text-[11px] font-semibold tracking-wide normal-case transition-colors ${
                  filterParams.gender === 'Men' && !filterParams.fabric
                    ? 'text-[#38BDF8] font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                • All Men's Fabrics
              </a>

              {MENS_FABRICS.map((fabricName) => {
                const isActive = filterParams.gender === 'Men' && filterParams.fabric === fabricName;
                return (
                  <a
                    key={fabricName}
                    href={`/shop?gender=Men&fabric=${encodeURIComponent(fabricName)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('shop', { gender: 'Men', fabric: fabricName });
                      setMobileSidebarOpen(false);
                    }}
                    className={`block px-3 py-1.5 text-[11px] font-medium tracking-wide normal-case transition-colors flex items-center justify-between ${
                      isActive
                        ? 'text-[#38BDF8] font-bold bg-[#38BDF8]/10'
                        : 'text-[#CBD5E1] hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <span>{fabricName}</span>
                    {isActive && <Check className="w-3 h-3 text-[#38BDF8]" />}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigator: Women's Collection (Accordion) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setWomenExpanded(!womenExpanded)}
            className={`w-full flex items-center justify-between px-3.5 py-3 transition-all duration-150 border-l-2 text-left ${
              filterParams.gender === 'Women' || currentPage === 'women-summer' || currentPage === 'women-winter'
                ? 'border-[#38BDF8] bg-white/[0.08] text-[#38BDF8] font-bold'
                : 'border-transparent text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] hover:border-[#38BDF8]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              <span>Women's Collection</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${womenExpanded ? 'rotate-180 text-[#38BDF8]' : ''}`} />
          </button>

          {womenExpanded && (
            <div className="pl-4 pr-1 py-1.5 space-y-1 bg-[#070B16] border-l border-[#1E293B] ml-4 mt-1">
              <a
                href="/shop?gender=Women"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('shop', { gender: 'Women', craftType: undefined, brand: undefined });
                  setMobileSidebarOpen(false);
                }}
                className={`block px-3 py-1.5 text-[11px] font-semibold tracking-wide normal-case transition-colors ${
                  filterParams.gender === 'Women' && !filterParams.craftType && !filterParams.brand
                    ? 'text-[#38BDF8] font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                • All Women's Collection
              </a>

              {/* Embroidered Collection Link + Brands Dropdown */}
              <div className="pt-1">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <a
                    href="/shop?gender=Women&craft=Embroidery"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('shop', { gender: 'Women', craftType: 'Embroidery', brand: undefined });
                      setMobileSidebarOpen(false);
                    }}
                    className={`text-[11px] font-bold tracking-wide normal-case hover:text-white transition-colors ${
                      filterParams.craftType === 'Embroidery' ? 'text-[#38BDF8]' : 'text-[#E2E8F0]'
                    }`}
                  >
                    ★ Embroidered Collection
                  </a>
                  <button
                    type="button"
                    onClick={() => setEmbroideryBrandsExpanded(!embroideryBrandsExpanded)}
                    className="p-1 text-[#94A3B8] hover:text-[#38BDF8]"
                    aria-label="Toggle Embroidered Brands"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${embroideryBrandsExpanded ? 'rotate-180 text-[#38BDF8]' : ''}`} />
                  </button>
                </div>

                {embroideryBrandsExpanded && (
                  <div className="pl-3 pr-1 py-1 space-y-1 bg-black/40 border-l border-[#1E293B] ml-3 text-[10px]">
                    {WOMEN_EMBROIDERY_BRANDS.map((brand) => (
                      <a
                        key={brand}
                        href={`/shop?gender=Women&brand=${encodeURIComponent(brand)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('shop', { gender: 'Women', brand, craftType: 'Embroidery' });
                          setMobileSidebarOpen(false);
                        }}
                        className={`block px-2 py-1 normal-case truncate transition-colors ${
                          filterParams.brand === brand
                            ? 'text-[#38BDF8] font-bold'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {brand}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Printed Collection Link + Brands Dropdown */}
              <div className="pt-1">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <a
                    href="/shop?gender=Women&craft=Printed"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('shop', { gender: 'Women', craftType: 'Printed', brand: undefined });
                      setMobileSidebarOpen(false);
                    }}
                    className={`text-[11px] font-bold tracking-wide normal-case hover:text-white transition-colors ${
                      filterParams.craftType === 'Printed' ? 'text-[#38BDF8]' : 'text-[#E2E8F0]'
                    }`}
                  >
                    ★ Printed Collection
                  </a>
                  <button
                    type="button"
                    onClick={() => setPrintedBrandsExpanded(!printedBrandsExpanded)}
                    className="p-1 text-[#94A3B8] hover:text-[#38BDF8]"
                    aria-label="Toggle Printed Brands"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${printedBrandsExpanded ? 'rotate-180 text-[#38BDF8]' : ''}`} />
                  </button>
                </div>

                {printedBrandsExpanded && (
                  <div className="pl-3 pr-1 py-1 space-y-1 bg-black/40 border-l border-[#1E293B] ml-3 text-[10px]">
                    {WOMEN_PRINTED_BRANDS.map((brand) => (
                      <a
                        key={brand}
                        href={`/shop?gender=Women&brand=${encodeURIComponent(brand)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('shop', { gender: 'Women', brand, craftType: 'Printed' });
                          setMobileSidebarOpen(false);
                        }}
                        className={`block px-2 py-1 normal-case truncate transition-colors ${
                          filterParams.brand === brand
                            ? 'text-[#38BDF8] font-bold'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {brand}
                      </a>
                    ))}
                  </div>
                )}
              </div>
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
              ? 'border-[#38BDF8] bg-white/[0.08] text-[#38BDF8] font-bold'
              : 'border-transparent text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] hover:border-[#38BDF8]/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#38BDF8]" />
            <span>Store Location</span>
          </div>
          {currentPage === 'location' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          )}
        </a>

        {/* Section Divider */}
        <div className="pt-4 pb-2 px-3 text-[10px] tracking-[0.2em] text-[#64748B] uppercase font-sans font-bold border-t border-[#1E293B]">
          Actions & Bag
        </div>

        {/* Action: Search Catalog */}
        <button
          type="button"
          onClick={() => {
            setIsSearchOpen(true);
            setMobileSidebarOpen(false);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors border-l-2 border-transparent text-left"
        >
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-[#38BDF8]" />
            <span>Search Catalog</span>
          </div>
          <span className="text-[10px] bg-white/10 text-[#94A3B8] px-1.5 py-0.5 font-mono">/</span>
        </button>

        {/* Action: Shopping Bag */}
        <button
          type="button"
          onClick={() => {
            setIsCartOpen(true);
            setMobileSidebarOpen(false);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors border-l-2 border-transparent text-left"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-[#38BDF8]" />
            <span>Shopping Bag</span>
          </div>
          <span className="min-w-[20px] h-5 px-1.5 bg-[#0284C7] text-white text-[11px] font-bold flex items-center justify-center tabular-nums shadow-xs">
            {cartCount}
          </span>
        </button>

        {/* Action: Customer Account */}
        {user ? (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors border-l-2 border-transparent text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <UserIcon className="w-4 h-4 text-[#38BDF8]" />
                <span className="truncate">{user.displayName || 'Customer'}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {userDropdownOpen && (
              <div className="p-3 my-1 bg-black/40 border border-[#1E293B] text-xs space-y-2">
                <p className="text-[11px] text-[#94A3B8] truncate">{user.email}</p>
                <div className="flex justify-between text-[11px] text-[#CBD5E1]">
                  <span>Tracked Orders:</span>
                  <strong className="text-[#38BDF8] font-mono">{userOrdersCount}</strong>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      openAuthModal('profile');
                      setMobileSidebarOpen(false);
                    }}
                    className="text-[11px] text-[#38BDF8] hover:underline uppercase tracking-wider"
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
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors border-l-2 border-transparent text-left"
          >
            <div className="flex items-center gap-3">
              <UserIcon className="w-4 h-4 text-[#38BDF8]" />
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
                ? 'bg-[#0284C7] text-white border-[#38BDF8] font-bold shadow-md'
                : 'bg-[#0F172A]/80 hover:bg-[#0284C7] text-[#E2E8F0] hover:text-white border-[#1E293B] hover:border-[#38BDF8]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8] group-hover:text-white" />
              <span className="text-xs font-bold tracking-wider uppercase">Admin Portal</span>
            </div>
            <span className="text-[10px] bg-white/10 text-[#38BDF8] group-hover:text-white px-1.5 py-0.5 font-bold font-mono">
              STAFF
            </span>
          </a>
        </div>
      </div>

      {/* 3. Sidebar Footer: Contact, Timings & Free Nationwide COD */}
      <div className="p-4 border-t border-[#1E293B] bg-[#070B16] space-y-2.5 shrink-0 text-xs">
        <a
          href="https://wa.me/923346565636?text=Assalam-o-Alaikum%20Niaz%20Cloth%20House%2C%20I%20am%20inquiring%20about%20unstitched%20fabrics."
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 px-3 bg-[#1E293B] hover:bg-[#0284C7] text-white font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors border border-[#334155] shadow-xs"
        >
          <MessageCircle className="w-4 h-4 text-[#38BDF8]" />
          <span>WhatsApp 0334-6565636</span>
        </a>

        <div className="text-[10px] text-[#94A3B8] space-y-1 text-center font-sans tracking-wide">
          <div>MON–SUN 10:00 AM – 9:00 PM PKT</div>
          <div className="text-[#38BDF8] font-semibold tracking-wider uppercase">FREE COD NATIONWIDE</div>
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
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#0B132B] text-white border-b border-[#1E293B] px-4 h-16 flex items-center justify-between">
        {/* Mobile Left: Menu Toggle Button & Wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open navigation sidebar"
            className="p-2 -ml-2 text-white hover:text-[#38BDF8] focus-visible:outline-none flex items-center gap-1.5"
          >
            <Menu className="w-6 h-6" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#38BDF8]">Menu</span>
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
            className="p-2 text-[#CBD5E1] hover:text-[#38BDF8]"
            aria-label="Search catalog"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#CBD5E1] hover:text-[#38BDF8]"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-4.5 px-1 bg-[#0284C7] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigateTo('admin')}
            className="px-2.5 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-1"
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
              className="absolute top-4 right-4 z-20 p-2 text-[#CBD5E1] hover:text-[#38BDF8] bg-black/60 rounded-full"
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
