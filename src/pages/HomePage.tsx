import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Globe,
  Video,
  ShieldCheck,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Interactive3DStorefronts } from '../components/3d/Interactive3DStorefronts';
import { Product } from '../types';
import { ProductFactory } from '../core';

export const HomePage: React.FC = () => {
  const { products } = useShop();
  const { navigateTo } = useNavigation();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showcaseMode, setShowcaseMode] = useState<'mens' | 'womens'>('womens');
  const [subFilter, setSubFilter] = useState<'all' | 'shahi' | 'embroidery' | 'printed' | 'boski'>('shahi');

  const heroSlides = [
    {
      title: 'THE SHAHI COLLECTION',
      ctaLabel: 'Shop Now',
      action: () => navigateTo('shop', { collection: 'The Shahi Collection' }),
      image: '/images/shahi_hero_banner.jpg',
    },
    {
      title: 'PURE CHINESE BOSKI',
      ctaLabel: 'Explore Mens',
      action: () => navigateTo('shop', { gender: 'Men', fabric: 'Boski' }),
      image: '/images/khaadi_mens_boski_display_1791657195697.jpg',
    },
    {
      title: 'FESTIVE LAWN & CHIFFON',
      ctaLabel: 'Shop Collection',
      action: () => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' }),
      image: '/images/khaadi_editorial_hero_1791657181176.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const domainCollection = useMemo(() => ProductFactory.createCollection(products), [products]);

  const displayedProducts = useMemo(() => {
    const allRaw = domainCollection.map((dp) => dp.toProduct());

    if (showcaseMode === 'mens') {
      const mens = allRaw.filter((p) => p.gender === 'Men');
      if (subFilter === 'boski') {
        return mens.filter((p) => p.fabric.toLowerCase().includes('boski')).slice(0, 8);
      }
      return mens.slice(0, 8);
    }

    const womens = allRaw.filter((p) => p.gender === 'Women');
    if (subFilter === 'embroidery') {
      return womens.filter((p) => p.craftType === 'Embroidery').slice(0, 8);
    }
    if (subFilter === 'printed') {
      return womens.filter((p) => p.craftType === 'Printed').slice(0, 8);
    }
    // Default 'shahi': prioritizes The Shahi Collection + featured women's items
    const shahi = womens.filter((p) => p.collection === 'The Shahi Collection');
    const others = womens.filter((p) => p.collection !== 'The Shahi Collection');
    return [...shahi, ...others].slice(0, 8);
  }, [domainCollection, showcaseMode, subFilter]);

  const sectionHeading =
    showcaseMode === 'mens' ? 'Mens Collection' : 'Womens Collection';

  return (
    <div className="w-full bg-[#060608] text-[#F7F4EE] select-none">
      {/* 1. Editorial Hero Banner (Exact Reference Match: THE SHAHI COLLECTION) */}
      <section className="relative w-full overflow-hidden bg-[#060608] border-b border-[#C5A059]/20">
        <div className="relative h-[380px] sm:h-[460px] lg:h-[540px] w-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                width={1920}
                height={1080}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                }}
              />
              {/* Atmospheric Left Contrast Scrim */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#060608]/95 via-[#060608]/55 to-transparent" />

              {/* Left Editorial Typography */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 w-full">
                  <div className="max-w-lg">
                    <h1
                      className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-normal tracking-[0.06em] uppercase text-[#D4AF37] leading-[1.12] mb-5"
                      style={{ textWrap: 'balance' }}
                    >
                      {slide.title}
                    </h1>

                    <button
                      type="button"
                      onClick={slide.action}
                      className="inline-block text-sm sm:text-base font-sans font-medium text-[#E8D5A7] hover:text-[#D4AF37] border-b border-[#C5A059] hover:border-[#D4AF37] pb-0.5 transition-colors tracking-wide"
                    >
                      {slide.ctaLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Subtle Side Arrows */}
          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-[#E8D5A7]/70 hover:text-[#D4AF37] bg-black/30 hover:bg-black/60 rounded-full transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-[#E8D5A7]/70 hover:text-[#D4AF37] bg-black/30 hover:bg-black/60 rounded-full transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Bottom Centered Pagination Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeSlide
                    ? 'bg-[#F7F4EE] scale-110'
                    : 'bg-[#C5A059]/45 hover:bg-[#D4AF37]/80'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Dual Category Selector Strip (MENS COLLECTION | WOMENS COLLECTION) + Featured 4-Column Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-14 sm:pb-18">
        {/* Two Wide Gold-Bordered Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-9 sm:mb-11">
          <button
            type="button"
            onClick={() => {
              setShowcaseMode('mens');
              setSubFilter('all');
            }}
            className={`py-3.5 sm:py-4 px-4 text-xs sm:text-sm font-sans font-medium tracking-[0.18em] sm:tracking-[0.22em] uppercase border transition-all duration-200 rounded-xs whitespace-nowrap ${
              showcaseMode === 'mens'
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F7F4EE] shadow-[0_0_20px_rgba(212,175,55,0.12)]'
                : 'border-[#C5A059]/45 bg-[#0C0C10] text-[#E8D5A7]/80 hover:border-[#D4AF37] hover:text-[#F7F4EE]'
            }`}
          >
            MENS COLLECTION
          </button>

          <button
            type="button"
            onClick={() => {
              setShowcaseMode('womens');
              setSubFilter('shahi');
            }}
            className={`py-3.5 sm:py-4 px-4 text-xs sm:text-sm font-sans font-medium tracking-[0.18em] sm:tracking-[0.22em] uppercase border transition-all duration-200 rounded-xs whitespace-nowrap ${
              showcaseMode === 'womens'
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F7F4EE] shadow-[0_0_20px_rgba(212,175,55,0.12)]'
                : 'border-[#C5A059]/45 bg-[#0C0C10] text-[#E8D5A7]/80 hover:border-[#D4AF37] hover:text-[#F7F4EE]'
            }`}
          >
            WOMENS COLLECTION
          </button>
        </div>

        {/* Section Heading & Quiet Sub-Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <h2 className="font-sans text-xl sm:text-2xl font-semibold tracking-tight text-[#F7F4EE]">
            {sectionHeading}
          </h2>

          <div className="flex items-center gap-5 text-xs font-medium overflow-x-auto no-scrollbar">
            {showcaseMode === 'womens' ? (
              <>
                <button
                  type="button"
                  onClick={() => setSubFilter('shahi')}
                  className={`whitespace-nowrap shrink-0 pb-1 border-b transition-colors ${
                    subFilter === 'shahi'
                      ? 'text-[#D4AF37] border-[#D4AF37]'
                      : 'text-[#F7F4EE]/60 border-transparent hover:text-[#F7F4EE]'
                  }`}
                >
                  The Shahi Edit
                </button>
                <button
                  type="button"
                  onClick={() => setSubFilter('embroidery')}
                  className={`whitespace-nowrap shrink-0 pb-1 border-b transition-colors ${
                    subFilter === 'embroidery'
                      ? 'text-[#D4AF37] border-[#D4AF37]'
                      : 'text-[#F7F4EE]/60 border-transparent hover:text-[#F7F4EE]'
                  }`}
                >
                  Embroidered
                </button>
                <button
                  type="button"
                  onClick={() => setSubFilter('printed')}
                  className={`whitespace-nowrap shrink-0 pb-1 border-b transition-colors ${
                    subFilter === 'printed'
                      ? 'text-[#D4AF37] border-[#D4AF37]'
                      : 'text-[#F7F4EE]/60 border-transparent hover:text-[#F7F4EE]'
                  }`}
                >
                  Printed Lawn
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSubFilter('all')}
                  className={`whitespace-nowrap shrink-0 pb-1 border-b transition-colors ${
                    subFilter === 'all'
                      ? 'text-[#D4AF37] border-[#D4AF37]'
                      : 'text-[#F7F4EE]/60 border-transparent hover:text-[#F7F4EE]'
                  }`}
                >
                  All Mens Suiting
                </button>
                <button
                  type="button"
                  onClick={() => setSubFilter('boski')}
                  className={`whitespace-nowrap shrink-0 pb-1 border-b transition-colors ${
                    subFilter === 'boski'
                      ? 'text-[#D4AF37] border-[#D4AF37]'
                      : 'text-[#F7F4EE]/60 border-transparent hover:text-[#F7F4EE]'
                  }`}
                >
                  Pure Boski
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() =>
                navigateTo('shop', {
                  gender: showcaseMode === 'mens' ? 'Men' : 'Women',
                })
              }
              className="whitespace-nowrap shrink-0 text-[#D4AF37] hover:text-[#E8D5A7] flex items-center gap-1 pb-1 transition-colors"
            >
              <span>View All ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4-Column Editorial Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 3. Interactive 3D Couture Storefronts */}
      <Interactive3DStorefronts />

      {/* 4. Heritage Flagship & Overseas Concierge */}
      <section className="py-14 sm:py-16 bg-[#09090D] border-t border-[#C5A059]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#D4AF37]">
                Paris Bazaar, Rawalpindi · Established 1970
              </p>
              <h2
                className="font-serif text-2xl sm:text-4xl font-normal text-[#F7F4EE] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Certified Pakistani Textiles, Shipped Worldwide
              </h2>
              <p className="text-sm text-[#F7F4EE]/70 leading-relaxed max-w-2xl">
                Serving distinguished patrons from Shop # 166-C, Paris Bazaar, Committee Chowk, Rawalpindi for over five decades. Every unstitched cut and luxury ensemble is inspected live before nationwide Cash on Delivery or DHL express dispatch to the UK, USA, UAE, and Canada.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs text-[#E8D5A7]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>100% Original Mill Cuts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Live Video Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>3–5 Days Global Shipping</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <a
                href="https://wa.me/923346565636?text=Hello%20Niaz%20Cloth%20House!%20I%20would%20like%20to%20inquire%20about%20your%20collections."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto lg:w-72 py-3.5 px-6 bg-[#D4AF37] hover:bg-[#E5C158] text-[#060608] text-xs font-semibold tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors rounded-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Desk · 0334-6565636</span>
              </a>

              <button
                type="button"
                onClick={() => navigateTo('location')}
                className="w-full sm:w-auto lg:w-72 py-3.5 px-6 bg-transparent border border-[#C5A059]/45 hover:border-[#D4AF37] text-[#E8D5A7] hover:text-[#F7F4EE] text-xs font-medium tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors rounded-xs"
              >
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Visit Paris Bazaar Flagship</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
