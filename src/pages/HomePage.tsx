import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  Video, 
  MessageCircle,
  Scissors,
  Check,
  ShoppingBag
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Product, WOMEN_EMBROIDERY_BRANDS, WOMEN_PRINTED_BRANDS, MENS_FABRICS } from '../types';

export const HomePage: React.FC = () => {
  const { products } = useShop();
  const { navigateTo } = useNavigation();

  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Limelight Editorial Hero Carousel Slides
  const heroSlides = [
    {
      title: "WOMEN'S FESTIVE UNSTITCHED '26",
      subtitle: "Exclusive Embroidered Collections from Johara, Bin Rashid, Safa Marwa, Sana Noor, Bonanza & Tawakkal",
      kicker: "NEW IN · FESTIVE LAWN & ORGANZA",
      primaryCta: "Shop Embroidered",
      primaryAction: () => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' }),
      secondaryCta: "Shop Printed",
      secondaryAction: () => navigateTo('shop', { gender: 'Women', craftType: 'Printed' }),
      image: '/images/khaadi_editorial_hero_1791657181176.jpg',
    },
    {
      title: "MEN'S SIGNATURE SUITING",
      subtitle: "Certified Wash & Wear, Pure Combed Cotton, Kamalia Khaddar, Textured Lelan & Chinese Boski Silk",
      kicker: "EXECUTIVE SUITING · 4.5M CUTS",
      primaryCta: "Shop Men's Suiting",
      primaryAction: () => navigateTo('shop', { gender: 'Men' }),
      secondaryCta: "Shop Wash & Wear",
      secondaryAction: () => navigateTo('shop', { gender: 'Men', fabric: 'Wash & Wear' }),
      image: '/images/khaadi_mens_boski_display_1791657195697.jpg',
    },
    {
      title: "SUMMER PRINTED LAWN '26",
      subtitle: "Vibrant Summer Prints from Bin Saeed, Five Star, Safina, Salina, Rawayat & Al-Hamda",
      kicker: "EVERYDAY LUXURY · 3-PIECE ENSEMBLES",
      primaryCta: "Shop Printed Lawn",
      primaryAction: () => navigateTo('shop', { gender: 'Women', craftType: 'Printed' }),
      secondaryCta: "Explore All Suits",
      secondaryAction: () => navigateTo('shop'),
      image: '/images/product_womens_lawn_chiffon_1791569231005.jpg',
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  // Curated Atelier Interactive Tab State
  const [curatedTab, setCuratedTab] = useState<'all' | 'women-embroidery' | 'women-printed' | 'men' | 'best-sellers'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedMensFabric, setSelectedMensFabric] = useState<string>('all');

  // Auto carousel slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Limelight Quick Category Circles Data
  const quickCategories = [
    {
      label: 'Embroidered',
      image: '/images/khaadi_unstitched_palace_1791658025090.jpg',
      action: () => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' }),
    },
    {
      label: 'Printed Lawn',
      image: '/images/product_womens_lawn_chiffon_1791569231005.jpg',
      action: () => navigateTo('shop', { gender: 'Women', craftType: 'Printed' }),
    },
    {
      label: 'Wash & Wear',
      image: '/images/product_mens_latha_cotton_1791569254348.jpg',
      action: () => navigateTo('shop', { gender: 'Men', fabric: 'Wash & Wear' }),
    },
    {
      label: 'Pure Boski',
      image: '/images/product_mens_pure_boski_1791569243386.jpg',
      action: () => navigateTo('shop', { gender: 'Men', fabric: 'Boski' }),
    },
    {
      label: 'Crisp Cotton',
      image: '/images/khaadi_unstitched_shelves_1791658816418.jpg',
      action: () => navigateTo('shop', { gender: 'Men', fabric: 'Cotton' }),
    },
    {
      label: 'Kamalia Khaddar',
      image: '/images/heritage_unstitched_rolls_1791658049901.jpg',
      action: () => navigateTo('shop', { gender: 'Men', fabric: 'Khaddar' }),
    },
    {
      label: 'Textured Lelan',
      image: '/images/khaadi_unstitched_boutique_1791657162979.jpg',
      action: () => navigateTo('shop', { gender: 'Men', fabric: 'Lelan' }),
    },
    {
      label: 'Special Offers',
      image: '/images/hero_niaz_luxury_fabric_1791569218384.jpg',
      badge: 'SALE',
      action: () => navigateTo('shop', { saleOnly: true }),
    },
  ];

  // Reset secondary brand/fabric filter when main tab changes
  const handleTabChange = (tab: 'all' | 'women-embroidery' | 'women-printed' | 'men' | 'best-sellers') => {
    setCuratedTab(tab);
    setSelectedBrand('all');
    setSelectedMensFabric('all');
  };

  // Filtered products calculation based on interactive curation
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      if (curatedTab === 'women-embroidery') {
        if (p.gender !== 'Women' || p.craftType !== 'Embroidery') return false;
        if (selectedBrand !== 'all') {
          return p.brand?.toLowerCase() === selectedBrand.toLowerCase() ||
                 p.title?.toLowerCase().includes(selectedBrand.toLowerCase());
        }
        return true;
      }

      if (curatedTab === 'women-printed') {
        if (p.gender !== 'Women' || p.craftType !== 'Printed') return false;
        if (selectedBrand !== 'all') {
          return p.brand?.toLowerCase() === selectedBrand.toLowerCase() ||
                 p.title?.toLowerCase().includes(selectedBrand.toLowerCase());
        }
        return true;
      }

      if (curatedTab === 'men') {
        if (p.gender !== 'Men') return false;
        if (selectedMensFabric !== 'all') {
          return p.fabric?.toLowerCase().includes(selectedMensFabric.toLowerCase()) ||
                 p.title?.toLowerCase().includes(selectedMensFabric.toLowerCase());
        }
        return true;
      }

      if (curatedTab === 'best-sellers') {
        return (p.rating && p.rating >= 4.8) || p.featured;
      }

      return true;
    }).slice(0, 8);
  }, [products, curatedTab, selectedBrand, selectedMensFabric]);

  return (
    <div className="w-full bg-white select-none">

      {/* 1. Limelight Full-Width Editorial Hero Slider */}
      <section className="relative w-full overflow-hidden bg-black">
        <div className="relative min-h-[500px] sm:min-h-[580px] lg:h-[660px] w-full flex items-center">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with Limelight fashion treatment */}
              <img
                src={slide.image}
                alt={slide.title}
                width={1920}
                height={1080}
                className="w-full h-full object-cover object-center filter brightness-[0.72]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

              {/* Text Content Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full">
                  <div className="max-w-2xl text-white">
                    <span className="inline-block text-[9px] sm:text-[11px] font-sans font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white/90 bg-black/70 px-2.5 sm:px-3 py-1 mb-2.5 sm:mb-4 border border-white/20">
                      {slide.kicker}
                    </span>
                    <h1 className="font-sans font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.05em] sm:tracking-[0.08em] uppercase text-white leading-tight mb-2 sm:mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-xs sm:text-base text-neutral-200 font-normal leading-relaxed mb-5 sm:mb-8 max-w-xl line-clamp-2 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                      <button
                        onClick={slide.primaryAction}
                        className="py-2.5 px-5 sm:py-3.5 sm:px-8 bg-white hover:bg-neutral-200 text-black text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-[0.2em] uppercase transition-all shadow-lg active:scale-95"
                      >
                        {slide.primaryCta}
                      </button>
                      <button
                        onClick={slide.secondaryAction}
                        className="py-2.5 px-5 sm:py-3.5 sm:px-8 bg-transparent hover:bg-white hover:text-black text-white text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-[0.2em] uppercase border border-white transition-all active:scale-95"
                      >
                        {slide.secondaryCta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Arrow Controls */}
          <button
            onClick={() => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/40 hover:bg-black text-white rounded-full transition-colors hidden sm:flex items-center justify-center focus:outline-none"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/40 hover:bg-black text-white rounded-full transition-colors hidden sm:flex items-center justify-center focus:outline-none"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slider Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-1.5 transition-all ${
                  i === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Worldwide Shipping & International Patron Assurance Bar */}
      <section className="bg-[#111111] text-white border-y border-neutral-800 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold uppercase tracking-wider block">Worldwide Delivery</span>
              <span className="text-neutral-400">UK, USA, UAE, Canada & Global</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <Video className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold uppercase tracking-wider block">Live Video Inspection</span>
              <span className="text-neutral-400">Inspect fabric drape before dispatch</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold uppercase tracking-wider block">100% Original Mills</span>
              <span className="text-neutral-400">Certified seals & brand packaging</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold uppercase tracking-wider block">WhatsApp Concierge</span>
              <span className="text-neutral-400">+92 334 6565636 (24/7 Desk)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Limelight Quick Category Circles / Highlights */}
      <section className="py-8 sm:py-12 border-b border-neutral-200 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-black">
              Explore Collections
            </h2>
            <button
              onClick={() => navigateTo('shop')}
              className="text-xs font-bold tracking-wider uppercase text-neutral-600 hover:text-black flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-start gap-3 sm:gap-8 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
            {quickCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={cat.action}
                className="group flex flex-col items-center shrink-0 w-16 sm:w-22 text-center focus:outline-none"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-black p-0.5 transition-all duration-300 shadow-xs bg-white">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                    }}
                  />
                  {cat.badge && (
                    <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[8px] sm:text-[9px] font-black tracking-wider uppercase py-0.5 text-center leading-none">
                      {cat.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-neutral-800 group-hover:text-black mt-1.5 sm:mt-2 tracking-wide leading-tight line-clamp-1">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Interactive Curated Collections Atelier (Clean Limelight Luxury Filtering) */}
      <section className="py-10 sm:py-16 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-neutral-500 block mb-1">
              Curated Unstitched Fabrics
            </span>
            <h2 className="font-sans font-black text-xl sm:text-3xl tracking-[0.14em] uppercase text-black mb-2.5">
              Select By Department & Designer Mill
            </h2>
            <div className="w-14 h-0.5 bg-black mx-auto mb-4" />
            <p className="text-xs text-neutral-500 max-w-xl mx-auto">
              Filter unstitched suits instantly by craft, fabric, and renowned Pakistani textile mills. Shipped worldwide from Paris Bazaar Rawalpindi.
            </p>

            {/* Department Level Tabs */}
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-4 border-b border-neutral-200 pb-3 mt-6 text-xs font-bold tracking-wider sm:tracking-widest uppercase overflow-x-auto scrollbar-none no-scrollbar">
              <button
                onClick={() => handleTabChange('all')}
                className={`py-2 px-3 sm:px-4 whitespace-nowrap shrink-0 transition-colors ${
                  curatedTab === 'all'
                    ? 'border-b-2 border-black text-black'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                All Fabrics
              </button>
              <button
                onClick={() => handleTabChange('women-embroidery')}
                className={`py-2 px-3 sm:px-4 whitespace-nowrap shrink-0 transition-colors ${
                  curatedTab === 'women-embroidery'
                    ? 'border-b-2 border-black text-black'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Women's Embroidered
              </button>
              <button
                onClick={() => handleTabChange('women-printed')}
                className={`py-2 px-3 sm:px-4 whitespace-nowrap shrink-0 transition-colors ${
                  curatedTab === 'women-printed'
                    ? 'border-b-2 border-black text-black'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Women's Printed
              </button>
              <button
                onClick={() => handleTabChange('men')}
                className={`py-2 px-3 sm:px-4 whitespace-nowrap shrink-0 transition-colors ${
                  curatedTab === 'men'
                    ? 'border-b-2 border-black text-black'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Men's Suiting
              </button>
              <button
                onClick={() => handleTabChange('best-sellers')}
                className={`py-2 px-3 sm:px-4 whitespace-nowrap shrink-0 transition-colors ${
                  curatedTab === 'best-sellers'
                    ? 'border-b-2 border-black text-black'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Best Sellers
              </button>
            </div>

            {/* Secondary Filter: Designer Brands for Women's Embroidered */}
            {curatedTab === 'women-embroidery' && (
              <div className="pt-4 flex items-center justify-start sm:justify-center gap-1.5 flex-wrap overflow-x-auto">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                  Brand:
                </span>
                <button
                  onClick={() => setSelectedBrand('all')}
                  className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-sm border transition-all ${
                    selectedBrand === 'all'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  All Brands
                </button>
                {WOMEN_EMBROIDERY_BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-sm border transition-all ${
                      selectedBrand === brand
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}

            {/* Secondary Filter: Designer Brands for Women's Printed */}
            {curatedTab === 'women-printed' && (
              <div className="pt-4 flex items-center justify-start sm:justify-center gap-1.5 flex-wrap overflow-x-auto">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                  Brand:
                </span>
                <button
                  onClick={() => setSelectedBrand('all')}
                  className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-sm border transition-all ${
                    selectedBrand === 'all'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  All Brands
                </button>
                {WOMEN_PRINTED_BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-sm border transition-all ${
                      selectedBrand === brand
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}

            {/* Secondary Filter: Fabric Types for Men's Suiting */}
            {curatedTab === 'men' && (
              <div className="pt-4 flex items-center justify-start sm:justify-center gap-1.5 flex-wrap overflow-x-auto">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                  Fabric:
                </span>
                <button
                  onClick={() => setSelectedMensFabric('all')}
                  className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-sm border transition-all ${
                    selectedMensFabric === 'all'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  All Fabrics
                </button>
                {MENS_FABRICS.map((fabric) => (
                  <button
                    key={fabric}
                    onClick={() => setSelectedMensFabric(fabric)}
                    className={`px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-sm border transition-all ${
                      selectedMensFabric === fabric
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {fabric}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Grid: 4-Column Desktop, 2-Column Mobile */}
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-8 text-center max-w-lg mx-auto">
              <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold uppercase text-black">
                Inquire For Specific Stock
              </h4>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Our Paris Bazaar store stocks over 500+ unstitched suits. Contact our concierge for live photos of this mill volume.
              </p>
              <a
                href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20am%20looking%20for%20suits%20from%20this%20brand."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Video Concierge</span>
              </a>
            </div>
          )}

          <div className="text-center mt-10">
            <button
              onClick={() => navigateTo('shop')}
              className="py-3.5 px-10 bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md active:scale-95"
            >
              View Full Catalog ({products.length} Items)
            </button>
          </div>
        </div>
      </section>

      {/* 5. Limelight Split Visual Banners (Fast-Fashion 3-Column Tiles) */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Banner 1: Women's Embroidered */}
          <div
            onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' })}
            className="group relative h-[320px] sm:h-[400px] lg:h-[440px] overflow-hidden bg-neutral-900 cursor-pointer"
          >
            <img
              src="/images/khaadi_unstitched_palace_1791658025090.jpg"
              alt="Women's Embroidered Collection"
              className="w-full h-full object-cover filter brightness-[0.75] group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-300 mb-1">
                Festive Collection '26
              </span>
              <h3 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-wider mb-1.5 sm:mb-2">
                WOMEN'S EMBROIDERED
              </h3>
              <p className="text-xs text-neutral-300 mb-3 sm:mb-4 line-clamp-2">
                Johara, Bin Rashid, Safa Marwa, Tawakkal & Sobia Waseem luxury unstitched lawn.
              </p>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase border-b-2 border-white pb-1 group-hover:text-neutral-200">
                  Shop Embroidered <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Banner 2: Men's Suiting */}
          <div
            onClick={() => navigateTo('shop', { gender: 'Men' })}
            className="group relative h-[320px] sm:h-[400px] lg:h-[440px] overflow-hidden bg-neutral-900 cursor-pointer"
          >
            <img
              src="/images/khaadi_mens_boski_display_1791657195697.jpg"
              alt="Men's Executive Suiting"
              className="w-full h-full object-cover filter brightness-[0.75] group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-300 mb-1">
                Executive Wardrobe
              </span>
              <h3 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-wider mb-1.5 sm:mb-2">
                MEN'S SIGNATURE SUITING
              </h3>
              <p className="text-xs text-neutral-300 mb-3 sm:mb-4 line-clamp-2">
                Wrinkle-free Wash & Wear, Pure Combed Cotton, Kamalia Khaddar & Pure Chinese Boski.
              </p>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase border-b-2 border-white pb-1 group-hover:text-neutral-200">
                  Shop Men's Suiting <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Banner 3: Printed Lawn */}
          <div
            onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Printed' })}
            className="group relative h-[320px] sm:h-[400px] lg:h-[440px] overflow-hidden bg-neutral-900 cursor-pointer"
          >
            <img
              src="/images/product_womens_lawn_chiffon_1791569231005.jpg"
              alt="Women's Printed Lawn"
              className="w-full h-full object-cover filter brightness-[0.75] group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-300 mb-1">
                Daily Luxury '26
              </span>
              <h3 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-wider mb-1.5 sm:mb-2">
                PRINTED LAWN VOLUME
              </h3>
              <p className="text-xs text-neutral-300 mb-3 sm:mb-4 line-clamp-2">
                Bin Saeed, Five Star, Safina, Salina, Rawayat & Al-Hamda 3-piece unstitched.
              </p>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase border-b-2 border-white pb-1 group-hover:text-neutral-200">
                  Shop Printed <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. International & Overseas Clients Concierge Feature */}
      <section className="bg-neutral-50 py-12 sm:py-16 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-neutral-300 p-6 sm:p-10 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-600">
                  Overseas & Foreign Customer Desk
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mb-3">
                Ordering from the UK, USA, Gulf or Overseas?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                We make international shopping seamless. Receive live WhatsApp video demonstrations of any fabric under natural daylight, verify cut measurements, and receive express tracked delivery via DHL / FedEx straight to your international doorstep.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3-5 Days Express Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Video Color Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official Mill Stamped Cuts</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
              <a
                href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20am%20an%20overseas%20customer%20inquiring%20about%20international%20delivery%20and%20unstitched%20fabrics."
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat with Overseas Desk</span>
              </a>
              <button
                onClick={() => navigateTo('shop')}
                className="py-3 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-widest uppercase transition-colors text-center"
              >
                Browse Unstitched Catalog
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Authentic Brand Directory Strip */}
      <section className="py-12 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 block mb-1">
              Guaranteed Authentic
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-[0.16em] uppercase text-black">
              OUR CERTIFIED MILL & DESIGNER BRANDS
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 max-w-4xl mx-auto">
            {[...WOMEN_EMBROIDERY_BRANDS, ...WOMEN_PRINTED_BRANDS]
              .filter((val, idx, arr) => arr.indexOf(val) === idx)
              .map((brand) => (
                <button
                  key={brand}
                  onClick={() => navigateTo('shop', { brand })}
                  className="px-3.5 py-1.5 bg-neutral-50 border border-neutral-200 hover:border-black text-xs font-bold tracking-wider uppercase text-neutral-800 hover:text-black transition-all shadow-2xs hover:shadow-xs"
                >
                  {brand}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* 8. Limelight Fast-Fashion Service Guarantees */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-neutral-100 text-black mb-3 rounded-full">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-black mb-1">
                FREE NATIONWIDE SHIPPING
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-[200px]">
                Complimentary delivery on all orders over PKR 3,000 across Pakistan.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-3 bg-neutral-100 text-black mb-3 rounded-full">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-black mb-1">
                100% ORIGINAL FABRICS
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-[200px]">
                Direct procurement from certified mills and renowned design houses.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-3 bg-neutral-100 text-black mb-3 rounded-full">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-black mb-1">
                7-DAY EASY EXCHANGE
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-[200px]">
                Simple exchange process if you are not fully satisfied with your suit cut.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-3 bg-neutral-100 text-black mb-3 rounded-full">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-black mb-1">
                WHATSAPP VIDEO CONCIERGE
              </h4>
              <p className="text-[11px] text-neutral-500 max-w-[200px]">
                Live video inspection of unstitched cuts before dispatch: +92 334 6565636.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Flagship Store & Live Order Feature */}
      <section className="bg-neutral-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-neutral-400 block mb-2">
              Heritage Flagship Since 1970
            </span>
            <h2 className="font-sans font-black text-2xl sm:text-3xl tracking-wider uppercase mb-2">
              VISIT NIAZ CLOTH HOUSE IN PARIS BAZAAR
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Shop # 166-C / # 170, Paris Bazaar, Moti Bazaar, Committee Chowk, Rawalpindi. Open daily 10:00 AM – 9:00 PM PKT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <a
              href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20want%20to%20order%20unstitched%20fabrics"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp: +92 334 6565636</span>
            </a>
            <button
              onClick={() => navigateTo('location')}
              className="py-3 px-6 bg-white hover:bg-neutral-200 text-black text-xs font-bold tracking-widest uppercase transition-colors"
            >
              View Store Map
            </button>
          </div>
        </div>
      </section>

      {/* Quick View Modal for Instant Product Preview */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
