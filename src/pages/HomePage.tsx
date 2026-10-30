import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Award, Shield, CheckCircle, Sparkles, MapPin, Phone } from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const { products } = useShop();
  const { navigateTo } = useNavigation();

  const heroSlides = [
    {
      title: 'Original Unstitched Fabrics Since 1970',
      subtitle: 'Pure Chinese Boski Silk, Super 120s Egyptian Cotton Latha, & Festive Summer Lawn Ensembles.',
      kicker: 'PARIS BAZAAR, RAWALPINDI · EST. 1970',
      ctaText: "Explore Men's Suiting",
      ctaAction: () => navigateTo('shop', { gender: 'Men' }),
      secondaryText: "Women's Festive Edition",
      secondaryAction: () => navigateTo('women-summer'),
      image: '/src/assets/images/khaadi_editorial_hero_1791657181176.jpg',
    },
    {
      title: 'Festive Summer 2026 Lawn & Chiffon',
      subtitle: '80s Combed Lawn 3-Piece Ensembles with Pure Crinkle Chiffon Dupattas from Top Fabric Houses.',
      kicker: 'WOMEN’S FESTIVE EDIT',
      ctaText: "Women's Summer Edition",
      ctaAction: () => navigateTo('women-summer'),
      secondaryText: "Men's Summer Suiting",
      secondaryAction: () => navigateTo('men-summer'),
      image: '/src/assets/images/khaadi_unstitched_palace_1791658025090.jpg',
    },
    {
      title: 'Pure Unstitched Cloth House in Rawalpindi',
      subtitle: '170 Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi. Hand-inspected original yardage cuts.',
      kicker: 'FLAGSHIP BOUTIQUE',
      ctaText: 'Store Location & Live Map',
      ctaAction: () => navigateTo('location'),
      secondaryText: "Explore All Fabrics",
      secondaryAction: () => navigateTo('shop'),
      image: '/src/assets/images/hero_niaz_luxury_fabric_1791569218384.jpg',
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'men' | 'women'>('all');

  // Auto carousel slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const featuredProducts = products.filter((p) => {
    if (collectionFilter === 'men') return p.gender === 'Men';
    if (collectionFilter === 'women') return p.gender === 'Women';
    return p.featured;
  });

  return (
    <div className="w-full bg-[#FAF9F6]">
      {/* 1. Modern Luxury Lifestyle Banner (Focal Anchor) */}
      <section className="relative w-full overflow-hidden bg-[#141414]">
        <div className="relative min-h-[520px] sm:min-h-[600px] lg:h-[660px] w-full flex items-center">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Cinematic Background with Measured Contrast Scrim */}
              <img
                src={slide.image}
                alt={slide.title}
                width={1920}
                height={1080}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-[0.68]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/25" />

              {/* Editorial Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                  <div className="max-w-2xl space-y-4 sm:space-y-6">
                    {/* Kicker */}
                    <div className="flex items-center gap-3">
                      <span className="w-8 sm:w-12 h-[2px] bg-[#D4AF37]" />
                      <span className="text-xs font-semibold tracking-[0.25em] text-[#D4AF37] uppercase">
                        {slide.kicker}
                      </span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-bold tracking-tight leading-[1.12] text-balance">
                      {slide.title}
                    </h1>

                    <p className="text-sm sm:text-lg text-white/90 font-sans leading-relaxed max-w-xl">
                      {slide.subtitle}
                    </p>

                    {/* Actions */}
                    <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                      <button
                        onClick={slide.ctaAction}
                        className="px-7 py-3.5 bg-[#D4AF37] hover:bg-[#C5A028] text-[#141414] text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 inline-flex items-center gap-2 shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={slide.secondaryAction}
                        className="px-7 py-3.5 bg-black/40 hover:bg-black/60 text-white border border-white/30 hover:border-[#D4AF37] text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 backdrop-blur-xs cursor-pointer"
                      >
                        {slide.secondaryText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Arrows */}
          <div className="absolute bottom-8 right-6 sm:right-12 z-20 flex items-center gap-2">
            <button
              onClick={() =>
                setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
              }
              className="p-3 bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
              className="p-3 bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-colors cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-8 left-6 sm:left-12 z-20 flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-1.5 transition-all cursor-pointer ${
                  i === activeSlide ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Heritage Trust Strip */}
      <section className="border-b border-[#EAE6DF] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#EAE6DF]">
            <div className="pt-3 md:pt-0">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] tabular-nums">
                Est. 1970
              </span>
              <p className="text-xs uppercase tracking-wider text-[#1F1F1F]/60 font-sans mt-1">
                Paris Bazaar, Rawalpindi
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] tabular-nums">
                100% Pure
              </span>
              <p className="text-xs uppercase tracking-wider text-[#1F1F1F]/60 font-sans mt-1">
                Chinese Boski & Giza Cotton
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] tabular-nums">
                Free Nationwide
              </span>
              <p className="text-xs uppercase tracking-wider text-[#1F1F1F]/60 font-sans mt-1">
                Cash On Delivery (COD)
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] tabular-nums">
                22+ Mill Houses
              </span>
              <p className="text-xs uppercase tracking-wider text-[#1F1F1F]/60 font-sans mt-1">
                Authentic 3-Piece Suits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four Seasonal Campaigns (Men & Women: Summer & Winter) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Seasonal Curations
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] mt-1">
              Shop by Season & Craft
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs text-[#141414] hover:text-[#D4AF37] font-semibold tracking-wider uppercase inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Men's Summer */}
          <a 
            href="/collections/men-summer"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('men-summer');
            }}
            className="group relative overflow-hidden bg-[#141414] cursor-pointer border border-[#EAE6DF] aspect-[4/5] flex items-end p-5 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <img
              src="/src/assets/images/product_mens_latha_cotton_1791569254348.jpg"
              alt="Men's Summer Unstitched Collection"
              width={400}
              height={500}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.70] group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative space-y-1.5 z-10">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Gentlemen · Summer
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                Men's Summer
              </h3>
              <p className="text-[11px] text-white/80 font-sans line-clamp-2">
                Egyptian Giza Latha, 6-Pound Feather Boski & Crisp Cotton.
              </p>
              <div className="pt-1 inline-flex items-center gap-1 text-xs text-[#D4AF37] font-semibold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                <span>View Collection</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </a>

          {/* 2. Men's Winter */}
          <a 
            href="/collections/men-winter"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('men-winter');
            }}
            className="group relative overflow-hidden bg-[#141414] cursor-pointer border border-[#EAE6DF] aspect-[4/5] flex items-end p-5 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <img
              src="/src/assets/images/khaadi_mens_boski_display_1791657195697.jpg"
              alt="Men's Winter Unstitched Collection"
              width={400}
              height={500}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.70] group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative space-y-1.5 z-10">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Gentlemen · Winter
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                Men's Winter
              </h3>
              <p className="text-[11px] text-white/80 font-sans line-clamp-2">
                Kamalia Handloom Khaddar, Spun Karandi & 10-Pound Heavy Boski.
              </p>
              <div className="pt-1 inline-flex items-center gap-1 text-xs text-[#D4AF37] font-semibold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                <span>View Collection</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </a>

          {/* 3. Women's Summer */}
          <a 
            href="/collections/women-summer"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('women-summer');
            }}
            className="group relative overflow-hidden bg-[#141414] cursor-pointer border border-[#EAE6DF] aspect-[4/5] flex items-end p-5 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <img
              src="/src/assets/images/khaadi_editorial_hero_1791657181176.jpg"
              alt="Women's Summer Unstitched Collection"
              width={400}
              height={500}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.70] group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative space-y-1.5 z-10">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Festive Ladies · Summer
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                Women's Summer
              </h3>
              <p className="text-[11px] text-white/80 font-sans line-clamp-2">
                80s Combed Luxury Lawn 3-Piece, Chiffon Dupattas & Swiss Voile.
              </p>
              <div className="pt-1 inline-flex items-center gap-1 text-xs text-[#D4AF37] font-semibold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                <span>View Collection</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </a>

          {/* 4. Women's Winter */}
          <a 
            href="/collections/women-winter"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('women-winter');
            }}
            className="group relative overflow-hidden bg-[#141414] cursor-pointer border border-[#EAE6DF] aspect-[4/5] flex items-end p-5 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <img
              src="/src/assets/images/khaadi_unstitched_palace_1791658025090.jpg"
              alt="Women's Winter Unstitched Collection"
              width={400}
              height={500}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.70] group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative space-y-1.5 z-10">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Festive Ladies · Winter
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                Women's Winter
              </h3>
              <p className="text-[11px] text-white/80 font-sans line-clamp-2">
                Banarasi Zari Jacquard, Pashmina Wool Shawls & Winter Khaddar.
              </p>
              <div className="pt-1 inline-flex items-center gap-1 text-xs text-[#D4AF37] font-semibold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                <span>View Collection</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* 4. Featured 4-Column Responsive Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Heading & Filter Segmented Control */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#EAE6DF]">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Curated Unstitched Bolts
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#141414]">
              Featured Unstitched Collections
            </h2>
            <p className="text-sm text-[#1F1F1F]/70 font-sans max-w-xl">
              100% genuine unstitched yardage cuts from pure Chinese Boski silk to embroidered festive lawn.
            </p>
          </div>

          {/* Interactive Filter Tabs (Permitted Segmented Controls) */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F1EA] border border-[#EAE6DF] shrink-0">
            <button
              onClick={() => setCollectionFilter('all')}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                collectionFilter === 'all'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#1F1F1F]/70 hover:text-[#141414]'
              }`}
            >
              All Featured
            </button>
            <button
              onClick={() => setCollectionFilter('men')}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                collectionFilter === 'men'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#1F1F1F]/70 hover:text-[#141414]'
              }`}
            >
              Men’s Boski & Latha
            </button>
            <button
              onClick={() => setCollectionFilter('women')}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                collectionFilter === 'women'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#1F1F1F]/70 hover:text-[#141414]'
              }`}
            >
              Women’s Festive 3-Piece
            </button>
          </div>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 mt-8">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Catalog CTA */}
        <div className="mt-12 text-center">
          <a
            href="/shop"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('shop');
            }}
            className="px-8 py-3.5 bg-[#141414] hover:bg-[#D4AF37] text-white hover:text-[#141414] text-xs font-bold tracking-wider uppercase transition-colors inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>View Full Unstitched Catalog ({products.length} Fabrics)</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* 5. Women's Fabric Mill Partners Directory */}
      <section className="bg-white border-y border-[#EAE6DF] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Authentic Mills Directory
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">
              Women's Unstitched Suit Brands We Stock
            </h3>
            <p className="text-xs sm:text-sm text-[#1F1F1F]/70 font-sans">
              Directly sourced from Pakistan’s top textile mills and fashion houses. 100% complete original 3-piece unstitched suits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Embroidery Brands */}
            <div className="p-6 bg-[#FAF9F6] border border-[#EAE6DF] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                  <h4 className="font-serif text-base font-bold text-[#141414]">
                    ★ Embroidery Brands (12 Houses)
                  </h4>
                </div>
                <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold">
                  Zardozi · Schiffli · Resham
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Johara', 'Bin Rashid', 'Safa Marwa', 'Sana Noor', 'Bonanza', 
                  'Krizma', 'Tawakkal', 'Bin Saeed', 'Zam Zam', 'Rana Arts', 'Ghani Arts', 'Sobia Waseem'
                ].map((brand) => (
                  <button
                    key={`home-emb-${brand}`}
                    onClick={() => navigateTo('shop', { gender: 'Women', brand })}
                    className="px-3 py-1.5 text-xs bg-white hover:bg-[#141414] text-[#141414] hover:text-[#D4AF37] border border-[#EAE6DF] hover:border-[#141414] transition-colors font-semibold cursor-pointer"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Printed Brands */}
            <div className="p-6 bg-[#FAF9F6] border border-[#EAE6DF] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#141414]" />
                  <h4 className="font-serif text-base font-bold text-[#141414]">
                    ★ Printed Brands (10 Houses)
                  </h4>
                </div>
                <span className="text-[10px] font-mono uppercase text-[#141414] font-bold">
                  Digital Swiss Lawn · Voile
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Bin Saeed', 'H.Z', 'Safina', 'Salina', 'Rawayat', 
                  'Zam Zam', 'Five Star', 'Ajwa', 'Al-Hamda', 'Designer Classic'
                ].map((brand) => (
                  <button
                    key={`home-prt-${brand}`}
                    onClick={() => navigateTo('shop', { gender: 'Women', brand })}
                    className="px-3 py-1.5 text-xs bg-white hover:bg-[#141414] text-[#141414] hover:text-[#D4AF37] border border-[#EAE6DF] hover:border-[#141414] transition-colors font-semibold cursor-pointer"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Heritage Story & Rawalpindi Boutique Spotlight */}
      <section className="py-16 sm:py-20 border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Anchor */}
            <div className="lg:col-span-6">
              <div className="relative">
                <img
                  src="/src/assets/images/khaadi_unstitched_boutique_1791657162979.jpg"
                  alt="Niaz Cloth House flagship unstitched boutique at 170 Paris Bazaar, Rawalpindi"
                  width={700}
                  height={525}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover border border-[#EAE6DF] shadow-md"
                />
                <div className="absolute -bottom-4 -right-4 bg-[#141414] text-white p-5 hidden sm:block max-w-xs shadow-xl border border-black">
                  <p className="font-serif text-lg font-bold text-[#D4AF37]">Since 1970</p>
                  <p className="text-xs text-white/80 mt-1 leading-snug">
                    Pure unstitched Boski silk and Giza cotton bolts. 170 Paris Bazaar, Rawalpindi.
                  </p>
                </div>
              </div>
            </div>

            {/* Editorial Heritage Story */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Our Story
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#141414] leading-tight">
                  Over 55 Years of Pure Fabrics in Rawalpindi
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#1F1F1F]/80 font-sans leading-relaxed">
                In 1970, our founder, <strong>Haji Niaz Ahmad</strong>, established our sanctuary at 170 Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi. His rule was uncompromising: <em>always sell 100% pure fabric, never blend polyester into silk, and deliver certified generous cuts</em>.
              </p>

              <p className="text-sm text-[#1F1F1F]/75 font-sans leading-relaxed">
                Today, his sons carry forward the heritage with the exact same commitment. We bring you pure Chinese Boski, genuine Egyptian cotton Latha, winter Kamalia Khaddar, and fine unstitched lawn collections.
              </p>

              {/* Trust Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white border border-[#EAE6DF]">
                  <h4 className="font-serif text-sm font-bold text-[#141414]">
                    100% Pure Guarantee
                  </h4>
                  <p className="text-xs text-[#1F1F1F]/70 mt-1">
                    Genuine Chinese silk with natural lustre and soft drape. No synthetic mixing.
                  </p>
                </div>
                <div className="p-4 bg-white border border-[#EAE6DF]">
                  <h4 className="font-serif text-sm font-bold text-[#141414]">
                    Fast Nationwide Delivery
                  </h4>
                  <p className="text-xs text-[#1F1F1F]/70 mt-1">
                    Free Cash on Delivery across Pakistan, plus express shipping overseas.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigateTo('shop')}
                  className="px-6 py-3.5 bg-[#141414] hover:bg-[#D4AF37] text-white hover:text-[#141414] text-xs font-bold tracking-wider uppercase transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Fabrics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateTo('location')}
                  className="px-6 py-3.5 bg-white hover:bg-[#F4F1EA] text-[#141414] border border-[#EAE6DF] text-xs font-bold tracking-wider uppercase transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>Visit Shop</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
