import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Phone,
  Layers,
  Scissors,
  Sun,
  Truck,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { ProductCard } from '../components/ProductCard';
import { WOMEN_EMBROIDERY_BRANDS, WOMEN_PRINTED_BRANDS, MENS_FABRICS } from '../types';

export const HomePage: React.FC = () => {
  const { products } = useShop();
  const { navigateTo } = useNavigation();

  const heroSlides = [
    {
      title: 'Original Pakistani Unstitched Fabrics Since 1970',
      subtitle: "Men's Wash & Wear, Pure Combed Cotton, Kamalia Khaddar, Lelan & Heirloom Boski Silk · Women's Luxury Embroidered & Printed 3-Piece Ensembles.",
      kicker: 'PARIS BAZAAR, RAWALPINDI · EST. 1970',
      ctaText: "Explore Men's Fabrics",
      ctaAction: () => navigateTo('shop', { gender: 'Men' }),
      secondaryText: "Women's Collection",
      secondaryAction: () => navigateTo('shop', { gender: 'Women' }),
      image: '/images/khaadi_editorial_hero_1791657181176.jpg',
    },
    {
      title: "Women's Embroidered & Printed Collections",
      subtitle: 'Featuring renowned fashion houses: Johara, Bin Rashid, Safa Marwa, Sana Noor, Bonanza, Krizma, Tawakkal, Bin Saeed, Zam Zam, H.Z, Safina, Five Star & Designer Classic.',
      kicker: 'WOMEN’S DESIGNER EDIT',
      ctaText: 'Embroidered Collection',
      ctaAction: () => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' }),
      secondaryText: 'Printed Collection',
      secondaryAction: () => navigateTo('shop', { gender: 'Women', craftType: 'Printed' }),
      image: '/images/khaadi_unstitched_palace_1791658025090.jpg',
    },
    {
      title: 'Flagship Cloth House in Rawalpindi',
      subtitle: 'Shop # 166-C / # 170 Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi. Inspect authentic unstitched bolts with guaranteed fabric authenticity.',
      kicker: 'HERITAGE STOREFRONT',
      ctaText: 'Store Location & Live Map',
      ctaAction: () => navigateTo('location'),
      secondaryText: 'Browse All Fabrics',
      secondaryAction: () => navigateTo('shop'),
      image: '/images/hero_niaz_luxury_fabric_1791569218384.jpg',
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
    <div className="w-full bg-[#F8FAFC]">
      {/* 1. Modern Luxury Lifestyle Banner (Cool Slate & Glacier Ice Palette) */}
      <section className="relative w-full overflow-hidden bg-[#0B132B]">
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
                className="w-full h-full object-cover object-center filter brightness-[0.62]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B]/95 via-[#0B132B]/65 to-black/30" />

              {/* Editorial Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                  <div className="max-w-2xl space-y-4 sm:space-y-6">
                    {/* Kicker */}
                    <div className="flex items-center gap-3">
                      <span className="w-8 sm:w-12 h-[2px] bg-[#38BDF8]" />
                      <span className="text-xs font-semibold tracking-[0.25em] text-[#38BDF8] uppercase font-mono">
                        {slide.kicker}
                      </span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-bold tracking-tight leading-[1.12] text-balance">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-lg text-[#E2E8F0] font-sans leading-relaxed max-w-xl">
                      {slide.subtitle}
                    </p>

                    {/* Actions */}
                    <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                      <button
                        onClick={slide.ctaAction}
                        className="px-7 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-sky-950/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={slide.secondaryAction}
                        className="px-7 py-3.5 bg-[#0F172A]/70 hover:bg-[#1E293B] text-white border border-[#334155] hover:border-[#38BDF8] text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 backdrop-blur-xs cursor-pointer"
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
              className="p-3 bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-colors cursor-pointer border border-white/20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
              className="p-3 bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-colors cursor-pointer border border-white/20"
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
                  i === activeSlide ? 'w-8 bg-[#38BDF8]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Heritage Trust Strip */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
            <div className="pt-3 md:pt-0">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums">
                Est. 1970
              </span>
              <p className="text-xs uppercase tracking-wider text-[#64748B] font-sans mt-1">
                Paris Bazaar, Rawalpindi
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums">
                Men's 5 Fabrics
              </span>
              <p className="text-xs uppercase tracking-wider text-[#64748B] font-sans mt-1">
                Wash & Wear · Cotton · Khaddar · Lelan · Boski
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums">
                Women's Brands
              </span>
              <p className="text-xs uppercase tracking-wider text-[#64748B] font-sans mt-1">
                Embroidered & Printed Collections
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums">
                Free Delivery
              </span>
              <p className="text-xs uppercase tracking-wider text-[#64748B] font-sans mt-1">
                Cash On Delivery (COD) Nationwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Men's Fabrics Range Showcase (5 Iconic Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#0284C7]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0284C7] font-mono">
                Men's Collection
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
              Discover Our Range of Men's Fabrics
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-sans mt-1">
              Pure Pakistani yardage tailored for gentlemen's traditional and modern shalwar kameez.
            </p>
          </div>
          <button
            onClick={() => navigateTo('shop', { gender: 'Men' })}
            className="text-xs text-[#0284C7] hover:text-[#0369A1] font-semibold tracking-wider uppercase inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Men's Fabrics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5-Column Responsive Grid for the 5 Men's Fabrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              name: 'Wash & Wear',
              description: 'Wrinkle-resistant poly-viscose with effortless fluid drape.',
              image: '/images/product_mens_latha_cotton_1791569254348.jpg',
              filter: 'Wash & Wear',
            },
            {
              name: 'Cotton',
              description: 'Combed long-staple cotton with crisp mercerized Friday finish.',
              image: '/images/khaadi_unstitched_shelves_1791658816418.jpg',
              filter: 'Cotton',
            },
            {
              name: 'Khaddar',
              description: 'Authentic hand-spun and powerloom winter warmth cotton.',
              image: '/images/khaadi_editorial_hero_1791657181176.jpg',
              filter: 'Khaddar',
            },
            {
              name: 'Lelan',
              description: 'Breathable textured slub-weave for relaxed executive suiting.',
              image: '/images/khaadi_mens_boski_display_1791657195697.jpg',
              filter: 'Lelan',
            },
            {
              name: 'Boski',
              description: 'Authentic 6-pound, 8-pound & 10-pound spun silk bolts.',
              image: '/images/product_mens_pure_boski_1791569243386.jpg',
              filter: 'Boski',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigateTo('shop', { gender: 'Men', fabric: item.filter })}
              className="group relative overflow-hidden bg-[#0F172A] cursor-pointer border border-[#E2E8F0] hover:border-[#38BDF8] aspect-[3/4] flex flex-col justify-end p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <img
                src={item.image}
                alt={`Men's ${item.name} Fabric`}
                width={400}
                height={530}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.70] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/95 via-[#0B132B]/40 to-transparent" />
              
              <div className="relative z-10 space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#38BDF8] font-semibold">
                  Fabric {idx + 1} of 5
                </span>
                <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                  {item.name}
                </h3>
                <p className="text-[11px] text-[#CBD5E1] line-clamp-2 leading-tight">
                  {item.description}
                </p>
                <div className="pt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#38BDF8] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>Explore Cut</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Women's Collection Spotlight (Embroidered vs Printed) */}
      <section className="bg-white border-y border-[#E2E8F0] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#0284C7]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0284C7] font-mono">
                Women's Collection
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0F172A]">
              Explore Our Embroidered & Printed Collections
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-sans mt-2">
              Curated original 3-piece unstitched suits from Pakistan's most celebrated textile houses.
            </p>
          </div>

          {/* Dual Grand Cards: Embroidered vs Printed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Card: Embroidered Collection */}
            <div className="bg-[#0B132B] text-white border border-[#1E293B] overflow-hidden flex flex-col justify-between p-7 sm:p-9 relative group">
              <div className="absolute inset-0 opacity-25 group-hover:opacity-35 transition-opacity">
                <img
                  src="/images/product_womens_lawn_chiffon_1791569231005.jpg"
                  alt="Women's Embroidered Collection"
                  className="w-full h-full object-cover object-center filter brightness-75"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/80 to-transparent" />

              <div className="relative z-10 space-y-4">
                <div className="inline-block px-3 py-1 bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] text-[10px] font-mono uppercase tracking-widest font-bold">
                  ★ LUXURY NEEDLECRAFT
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Embroidered Collection
                </h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  Featuring intricate resham embroidery, fine zari, chiffon dupattas, and handcrafted organza border patches.
                </p>

                {/* Brands List */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-2 font-bold">
                    Featured Mill Brands:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {WOMEN_EMBROIDERY_BRANDS.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery', brand })}
                        className="px-2.5 py-1 bg-white/10 hover:bg-[#0284C7] hover:text-white text-[#E2E8F0] text-[11px] font-medium transition-colors border border-white/10"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Embroidery' })}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <span>Explore Embroidered Suits</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Card: Printed Collection */}
            <div className="bg-[#0F172A] text-white border border-[#1E293B] overflow-hidden flex flex-col justify-between p-7 sm:p-9 relative group">
              <div className="absolute inset-0 opacity-25 group-hover:opacity-35 transition-opacity">
                <img
                  src="/images/khaadi_unstitched_palace_1791658025090.jpg"
                  alt="Women's Printed Collection"
                  className="w-full h-full object-cover object-center filter brightness-75"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />

              <div className="relative z-10 space-y-4">
                <div className="inline-block px-3 py-1 bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] text-[10px] font-mono uppercase tracking-widest font-bold">
                  ★ DIGITAL FLORAL & CLASSIC
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Printed Collection
                </h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  Vibrant, colourfast digital lawns, geometric prints, and airy voile dupattas designed for effortless everyday grace.
                </p>

                {/* Brands List */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-2 font-bold">
                    Featured Mill Brands:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {WOMEN_PRINTED_BRANDS.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Printed', brand })}
                        className="px-2.5 py-1 bg-white/10 hover:bg-[#0284C7] hover:text-white text-[#E2E8F0] text-[11px] font-medium transition-colors border border-white/10"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  onClick={() => navigateTo('shop', { gender: 'Women', craftType: 'Printed' })}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <span>Explore Printed Lawn</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Products Grid (Curated Unstitched Fabrics) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0284C7] font-mono">
              Curated Catalog
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
              Featured Unstitched Fabrics
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-sans mt-0.5">
              Inspected yardage with authenticated GSM, thread count, and genuine selvedge markings.
            </p>
          </div>

          {/* Collection Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] border border-[#E2E8F0] text-xs">
            <button
              onClick={() => setCollectionFilter('all')}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                collectionFilter === 'all'
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Featured
            </button>
            <button
              onClick={() => setCollectionFilter('men')}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                collectionFilter === 'men'
                  ? 'bg-white text-[#0284C7] shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Men's Fabrics
            </button>
            <button
              onClick={() => setCollectionFilter('women')}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                collectionFilter === 'women'
                  ? 'bg-white text-[#0284C7] shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Women's Ensembles
            </button>
          </div>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Catalog CTA Footer */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigateTo('shop')}
            className="px-8 py-3.5 bg-[#0F172A] hover:bg-[#0284C7] text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md inline-flex items-center gap-2 hover:-translate-y-0.5"
          >
            <span>Explore Complete Store Catalog ({products.length} Products)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. Paris Bazaar Heritage Banner */}
      <section className="bg-[#0B132B] text-white py-16 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span className="text-xs uppercase font-mono tracking-widest text-[#38BDF8]">
                  PARIS BAZAAR · RAWALPINDI
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Stewarded by Haji Sh. Niaz Ahmed's Sons (Since 1970)
              </h2>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                Founded in 1970 by <strong>Haji Sh. Niaz Ahmed</strong> at Shop # 166-C / # 170 Paris Bazaar.
                Today, his sons proudly maintain the founding legacy with the shop name unchanged: <strong>Niaz Cloth House</strong>.
                We bring you genuine Pakistani fabrics: Wash & Wear, crisp cotton, Kamalia Khaddar, Lelan, pure Boski silk, and designer unstitched lawn collections.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-[#E2E8F0]">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>100% Genuine Certified Yardage</span>
                </div>
                <div className="flex items-center gap-2 text-[#E2E8F0]">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>Free Cash on Delivery Nationwide</span>
                </div>
                <div className="flex items-center gap-2 text-[#E2E8F0]">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>Direct WhatsApp Video Inspection</span>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => navigateTo('location')}
                  className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Store Directions</span>
                </button>
                <a
                  href="https://wa.me/923346565636?text=Assalam-o-Alaikum%20Niaz%20Cloth%20House%2C%20I%20am%20inquiring%20about%20unstitched%20fabrics."
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 border border-white/20"
                >
                  <Phone className="w-4 h-4 text-[#38BDF8]" />
                  <span>WhatsApp 0334-6565636</span>
                </a>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden border border-[#1E293B] shadow-2xl">
              <img
                src="/images/hero_niaz_luxury_fabric_1791569218384.jpg"
                alt="Niaz Cloth House Paris Bazaar Storefront"
                className="w-full h-full object-cover object-center filter brightness-90 hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
